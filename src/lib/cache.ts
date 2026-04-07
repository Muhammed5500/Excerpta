import { Article, Category } from "./types";

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

// ====== FILE-BASED (local dev) ======
async function readFileCache(): Promise<{ articles: Article[]; lastUpdated: string; sourceStats: Record<string, number> } | null> {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  try {
    const data = await readFile(join(process.cwd(), "src/data/articles-cache.json"), "utf-8");
    return JSON.parse(data);
  } catch { return null; }
}

async function writeFileCache(articles: Article[], sourceStats: Record<string, number>) {
  const { writeFile } = await import("fs/promises");
  const { join } = await import("path");
  const lastUpdated = new Date().toISOString();
  await writeFile(join(process.cwd(), "src/data/articles-cache.json"), JSON.stringify({ articles, lastUpdated, sourceStats }));
  // Preview cache
  const cats: Category[] = ["blockchain", "ai-ml", "game-theory", "quantum-crypto", "academic"];
  const { CATEGORY_LABELS } = await import("./types");
  const preview = {
    categories: cats.map((cat) => {
      const catArticles = articles.filter((a) => a.category === cat);
      return {
        category: cat, total: catArticles.length,
        articles: catArticles.slice(0, 3).map((a) => ({
          id: a.id, title: a.title, url: a.url, source: a.source, sourceUrl: a.sourceUrl,
          category: a.category, subcategory: a.subcategory, date: a.date,
          excerpt: (a.excerpt || "").slice(0, 150), author: a.author,
        })),
      };
    }).filter((c) => c.articles.length > 0),
    total: articles.length, totalSources: Object.keys(sourceStats).length, lastUpdated,
  };
  await writeFile(join(process.cwd(), "src/data/preview-cache.json"), JSON.stringify(preview));
}

async function readFilePreview() {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  try {
    const data = await readFile(join(process.cwd(), "src/data/preview-cache.json"), "utf-8");
    return JSON.parse(data);
  } catch { return null; }
}

// ====== VERCEL BLOB (production) ======
async function readBlobCache(): Promise<{ articles: Article[]; lastUpdated: string; sourceStats: Record<string, number> } | null> {
  const { list, head } = await import("@vercel/blob");
  try {
    const { blobs } = await list({ prefix: "articles-cache.json" });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url);
    return res.json();
  } catch { return null; }
}

async function writeBlobCache(articles: Article[], sourceStats: Record<string, number>) {
  const { put } = await import("@vercel/blob");
  const lastUpdated = new Date().toISOString();
  const cache = JSON.stringify({ articles, lastUpdated, sourceStats });
  await put("articles-cache.json", cache, { access: "public", addRandomSuffix: false });

  // Preview
  const cats: Category[] = ["blockchain", "ai-ml", "game-theory", "quantum-crypto", "academic"];
  const preview = {
    categories: cats.map((cat) => {
      const catArticles = articles.filter((a) => a.category === cat);
      return {
        category: cat, total: catArticles.length,
        articles: catArticles.slice(0, 3).map((a) => ({
          id: a.id, title: a.title, url: a.url, source: a.source, sourceUrl: a.sourceUrl,
          category: a.category, subcategory: a.subcategory, date: a.date,
          excerpt: (a.excerpt || "").slice(0, 150), author: a.author,
        })),
      };
    }).filter((c) => c.articles.length > 0),
    total: articles.length, totalSources: Object.keys(sourceStats).length, lastUpdated,
  };
  await put("preview-cache.json", JSON.stringify(preview), { access: "public", addRandomSuffix: false });
}

async function readBlobPreview() {
  const { list } = await import("@vercel/blob");
  try {
    const { blobs } = await list({ prefix: "preview-cache.json" });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url);
    return res.json();
  } catch { return null; }
}

// ====== PUBLIC API ======
export async function readCache() {
  return isVercel ? readBlobCache() : readFileCache();
}

export async function writeCache(articles: Article[], sourceStats: Record<string, number>) {
  return isVercel ? writeBlobCache(articles, sourceStats) : writeFileCache(articles, sourceStats);
}

export async function readPreview() {
  return isVercel ? readBlobPreview() : readFilePreview();
}
