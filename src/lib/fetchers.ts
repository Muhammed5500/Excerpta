import { Article, Category } from "./types";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  maxRedirects: 3,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Excerpta/1.0)",
    Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
});

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Excerpta/1.0)",
};

function generateId(source: string, title: string, link: string): string {
  let hash = 0;
  const str = title + link;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(36);
  const slug = `${source}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50);
  return `${slug}-${hex}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// ============================================================
// 1. RSS FEED — fetch all items in the feed
// ============================================================
export async function fetchRSS(
  feedUrl: string,
  sourceName: string,
  sourceUrl: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  const articles: Article[] = [];
  try {
    const feed = await parser.parseURL(feedUrl);
    for (const item of feed.items || []) {
      const title = item.title || "Untitled";
      const excerpt =
        item.contentSnippet?.slice(0, 300) ||
        (item.content ? stripHtml(item.content).slice(0, 300) : "");

      articles.push({
        id: generateId(sourceName, title, item.link || ""),
        title,
        url: item.link || sourceUrl,
        source: sourceName,
        sourceUrl,
        category,
        subcategory,
        date: item.isoDate || item.pubDate || new Date().toISOString(),
        excerpt: excerpt.trim(),
        author: item.creator || item.author || undefined,
      });
    }
  } catch {
    // skip
  }
  return articles;
}

// ============================================================
// 2. WORDPRESS REST API — paginate through all posts
// ============================================================
export async function fetchWordPress(
  siteUrl: string,
  sourceName: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  const articles: Article[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const apiUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=id,title,link,excerpt,date,author`;
      const res = await fetch(apiUrl, { headers: FETCH_HEADERS, redirect: "follow" });
      if (!res.ok) break;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("json")) break;
      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) break;

      for (const post of posts) {
        const title = stripHtml(post.title?.rendered || "Untitled");
        const excerpt = stripHtml(post.excerpt?.rendered || "").slice(0, 300);

        articles.push({
          id: generateId(sourceName, title, post.link || ""),
          title,
          url: post.link || siteUrl,
          source: sourceName,
          sourceUrl: siteUrl,
          category,
          subcategory,
          date: post.date || new Date().toISOString(),
          excerpt,
        });
      }

      if (posts.length < perPage) break;
      page++;
    } catch {
      break;
    }
  }
  return articles;
}

// ============================================================
// 3. SUBSTACK ARCHIVE API — paginate all posts
// ============================================================
export async function fetchSubstack(
  substackUrl: string,
  sourceName: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  const articles: Article[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    try {
      const apiUrl = `${substackUrl}/api/v1/archive?sort=new&offset=${offset}&limit=${limit}`;
      const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
      if (!res.ok) break;
      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) break;

      for (const post of posts) {
        const title = post.title || "Untitled";
        const excerpt = (post.subtitle || post.description || "").slice(0, 300);

        articles.push({
          id: generateId(sourceName, title, post.canonical_url || post.slug || ""),
          title,
          url: post.canonical_url || `${substackUrl}/p/${post.slug}`,
          source: sourceName,
          sourceUrl: substackUrl,
          category,
          subcategory,
          date: post.post_date || new Date().toISOString(),
          excerpt,
          author: post.publishedBylines?.[0]?.name || undefined,
        });
      }

      if (posts.length < limit) break;
      offset += limit;
    } catch {
      break;
    }
  }
  return articles;
}

// ============================================================
// 4. MEDIUM — RSS gives ~10-20, try sitemap for full archive
// ============================================================
export async function fetchMedium(
  feedUrl: string,
  siteUrl: string,
  sourceName: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  // Medium RSS actually returns a decent amount, fetch it all
  return fetchRSS(feedUrl, sourceName, siteUrl, category, subcategory);
}

// ============================================================
// 5. DISCOURSE FORUM — paginate via JSON API
// ============================================================
export async function fetchDiscourse(
  forumUrl: string,
  sourceName: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  const articles: Article[] = [];
  let page = 0;
  const maxPages = 20; // Safety limit

  while (page < maxPages) {
    try {
      const apiUrl = `${forumUrl}/latest.json?page=${page}`;
      const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
      if (!res.ok) break;
      const data = await res.json();
      const topics = data.topic_list?.topics;
      if (!Array.isArray(topics) || topics.length === 0) break;

      for (const topic of topics) {
        const title = topic.title || "Untitled";
        const excerpt = (topic.excerpt || topic.blurb || "").slice(0, 300);

        articles.push({
          id: generateId(sourceName, title, `${forumUrl}/t/${topic.slug}/${topic.id}`),
          title,
          url: `${forumUrl}/t/${topic.slug}/${topic.id}`,
          source: sourceName,
          sourceUrl: forumUrl,
          category,
          subcategory,
          date: topic.created_at || new Date().toISOString(),
          excerpt: stripHtml(excerpt),
          author: topic.last_poster_username || undefined,
        });
      }

      if (!data.topic_list?.more_topics_url) break;
      page++;
    } catch {
      break;
    }
  }
  return articles;
}

// ============================================================
// 6. GITHUB — list all files in a directory (for EIPs, SIPs etc)
// ============================================================
export async function fetchGitHubRepo(
  repoPath: string,
  dirPath: string,
  sourceName: string,
  sourceUrl: string,
  category: Category,
  subcategory: string
): Promise<Article[]> {
  const articles: Article[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents/${dirPath}?per_page=${perPage}&page=${page}`;
      const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
      if (!res.ok) break;
      const files = await res.json();
      if (!Array.isArray(files) || files.length === 0) break;

      for (const file of files) {
        if (file.type !== "file") continue;
        const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

        articles.push({
          id: generateId(sourceName, name, file.html_url || ""),
          title: name,
          url: file.html_url || sourceUrl,
          source: sourceName,
          sourceUrl,
          category,
          subcategory,
          date: new Date().toISOString(), // GitHub contents API doesn't return dates
        excerpt: `Proposal: ${file.name}`,
        });
      }

      if (files.length < perPage) break;
      page++;
    } catch {
      break;
    }
  }
  return articles;
}

// ============================================================
// 7. ARXIV API — paginate all results for a query
// ============================================================

/** Build an arXiv date-range suffix: submittedDate:[YYYYMMDD0000 TO YYYYMMDD2359] */
function arxivDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `submittedDate:[${fmt(start)}0000 TO ${fmt(end)}2359]`;
}

export async function fetchArxiv(
  query: string,
  sourceName: string,
  sourceUrl: string,
  category: Category,
  subcategory: string,
  authorFilter?: string,
  maxTotal: number = 500,
  days: number = 0
): Promise<Article[]> {
  const results: Article[] = [];
  const batchSize = 500;
  let start = 0;
  let total = Infinity;

  const fullQuery = days > 0 ? `${query} AND ${arxivDateRange(days)}` : query;

  while (start < total && start < maxTotal) {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(fullQuery)}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${batchSize}`;
      const res = await fetch(url, { headers: FETCH_HEADERS });
      const xml = await res.text();

      const totalMatch = xml.match(/<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/);
      if (totalMatch) total = Math.min(parseInt(totalMatch[1], 10), maxTotal);

      const entries = xml.split("<entry>").slice(1);
      if (entries.length === 0) break;

      for (const entry of entries) {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
        const authorNames: string[] = [];
        const authorMatches = entry.matchAll(/<name>([\s\S]*?)<\/name>/g);
        for (const m of authorMatches) authorNames.push(m[1].trim());

        if (authorFilter) {
          const found = authorNames.some(
            (a) => a.toLowerCase().includes(authorFilter.toLowerCase())
          );
          if (!found) continue;
        }

        const title = (titleMatch?.[1] || "Untitled").replace(/\s+/g, " ").trim();
        const link = (linkMatch?.[1] || "").trim();
        const excerpt = (summaryMatch?.[1] || "").replace(/\s+/g, " ").trim().slice(0, 300);
        const date = (publishedMatch?.[1] || "").trim();

        results.push({
          id: generateId(sourceName, title, link),
          title,
          url: link.replace("http://", "https://"),
          source: sourceName,
          sourceUrl,
          category,
          subcategory,
          date: date || new Date().toISOString(),
          excerpt,
          author: authorNames.slice(0, 3).join(", ") + (authorNames.length > 3 ? " et al." : ""),
        });
      }

      start += batchSize;
      // arXiv rate limit
      if (start < total && start < maxTotal) {
        await new Promise((r) => setTimeout(r, 3200));
      }
    } catch {
      break;
    }
  }

  return results;
}

// ============================================================
// 8. SITEMAP — supports sitemap index + sub-sitemaps + direct URL sitemaps
// ============================================================
async function parseSitemapUrls(sitemapUrl: string, pathFilter?: string): Promise<{ url: string; lastmod?: string }[]> {
  const results: { url: string; lastmod?: string }[] = [];
  try {
    const res = await fetch(sitemapUrl, { headers: FETCH_HEADERS });
    if (!res.ok) return results;
    const xml = await res.text();

    // Check if it's a sitemap index (contains <sitemap> entries)
    const subSitemaps = [...xml.matchAll(/<sitemap>\s*<loc>([\s\S]*?)<\/loc>/g)];
    if (subSitemaps.length > 0) {
      // Recursively fetch sub-sitemaps
      for (const match of subSitemaps) {
        const subUrl = match[1].trim();
        const subResults = await parseSitemapUrls(subUrl, pathFilter);
        results.push(...subResults);
      }
      return results;
    }

    // Regular sitemap with <url> entries
    const urlMatches = xml.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>(?:\s*<lastmod>([\s\S]*?)<\/lastmod>)?/g);
    for (const match of urlMatches) {
      const url = match[1].trim();
      const lastmod = match[2]?.trim();
      if (pathFilter && !url.includes(pathFilter)) continue;
      results.push({ url, lastmod });
    }
  } catch {
    // skip
  }
  return results;
}

export async function fetchSitemap(
  sitemapUrl: string,
  sourceName: string,
  siteUrl: string,
  category: Category,
  subcategory: string,
  pathFilter?: string
): Promise<Article[]> {
  const urls = await parseSitemapUrls(sitemapUrl, pathFilter);
  const articles: Article[] = [];

  for (const { url, lastmod } of urls) {
    if (url === siteUrl || url === `${siteUrl}/`) continue;

    const slug = url.split("/").filter(Boolean).pop() || "untitled";
    const title = decodeURIComponent(slug).replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    articles.push({
      id: generateId(sourceName, title, url),
      title,
      url,
      source: sourceName,
      sourceUrl: siteUrl,
      category,
      subcategory,
      date: lastmod || new Date().toISOString(),
      excerpt: "",
    });
  }
  return articles;
}

// ============================================================
// 9. LESSWRONG — GraphQL API for all posts
// ============================================================
export async function fetchLessWrong(
  sourceName: string,
  category: Category,
  subcategory: string,
  maxPosts: number = 1000
): Promise<Article[]> {
  const articles: Article[] = [];
  let offset = 0;
  const limit = 100;

  while (offset < maxPosts) {
    try {
      const query = {
        query: `{
          posts(input: { terms: { limit: ${limit}, offset: ${offset}, sortedBy: "new" } }) {
            results {
              title
              slug
              postedAt
              author
              plaintextExcerpt
              user { displayName }
            }
          }
        }`,
      };
      const res = await fetch("https://www.lesswrong.com/graphql", {
        method: "POST",
        headers: { ...FETCH_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      if (!res.ok) break;
      const data = await res.json();
      const posts = data?.data?.posts?.results;
      if (!Array.isArray(posts) || posts.length === 0) break;

      for (const post of posts) {
        const title = post.title || "Untitled";
        const excerpt = (post.plaintextExcerpt || "").slice(0, 300);

        articles.push({
          id: generateId(sourceName, title, post.slug || ""),
          title,
          url: `https://www.lesswrong.com/posts/${post.slug}`,
          source: sourceName,
          sourceUrl: "https://www.lesswrong.com",
          category,
          subcategory,
          date: post.postedAt || new Date().toISOString(),
          excerpt,
          author: post.user?.displayName || undefined,
        });
      }

      if (posts.length < limit) break;
      offset += limit;
    } catch {
      break;
    }
  }
  return articles;
}
