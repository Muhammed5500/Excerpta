import { NextResponse } from "next/server";
export const maxDuration = 300;
import { sources } from "@/lib/sources";
import { Article, Category } from "@/lib/types";
import { readCache, writeCache } from "@/lib/cache";
import {
  fetchRSS,
  fetchWordPress,
  fetchSubstack,
  fetchDiscourse,
  fetchGitHubRepo,
  fetchArxiv,
  fetchSitemap,
  fetchLessWrong,
} from "@/lib/fetchers";

interface FetchJob {
  sourceName: string;
  fetcher: () => Promise<Article[]>;
}

function shouldInclude(cat: Category, sub: string, filterCat?: string | null, filterSub?: string | null) {
  if (filterCat && cat !== filterCat) return false;
  if (filterSub && sub !== filterSub) return false;
  return true;
}

function buildFullFetchJobs(category?: string | null, subcategory?: string | null): FetchJob[] {
  const jobs: FetchJob[] = [];
  const inc = (cat: Category, sub: string) => shouldInclude(cat, sub, category, subcategory);

  // ========== DISCOURSE (full paginated) ==========
  if (inc("blockchain", "ethereum"))
    jobs.push({ sourceName: "ethresear.ch", fetcher: () => fetchDiscourse("https://ethresear.ch", "ethresear.ch", "blockchain", "ethereum") });
  if (inc("blockchain", "starknet"))
    jobs.push({ sourceName: "StarkNet Community", fetcher: () => fetchDiscourse("https://community.starknet.io", "StarkNet Community", "blockchain", "starknet") });

  // ========== GITHUB (all proposals) ==========
  if (inc("blockchain", "ethereum"))
    jobs.push({ sourceName: "EIPs GitHub", fetcher: () => fetchGitHubRepo("ethereum/EIPs", "EIPS", "EIPs GitHub", "https://github.com/ethereum/EIPs", "blockchain", "ethereum") });

  // ========== SUBSTACK (full archive API) ==========
  if (inc("blockchain", "consensus-researchers")) {
    jobs.push({ sourceName: "Barnabé Monnot", fetcher: () => fetchSubstack("https://barnabe.substack.com", "Barnabé Monnot", "blockchain", "consensus-researchers") });
    jobs.push({ sourceName: "Jon Charbonneau", fetcher: () => fetchSubstack("https://joncharbonneau.substack.com", "Jon Charbonneau", "blockchain", "consensus-researchers") });
  }
  if (inc("ai-ml", "ai-researchers"))
    jobs.push({ sourceName: "Import AI (Jack Clark)", fetcher: () => fetchSubstack("https://importai.substack.com", "Import AI (Jack Clark)", "ai-ml", "ai-researchers") });

  // ========== QUANTUM RESEARCHERS (WP REST API disabled on both, use RSS) ==========
  if (inc("quantum-crypto", "quantum-researchers")) {
    jobs.push({ sourceName: "Scott Aaronson", fetcher: () => fetchRSS("https://scottaaronson.blog/?feed=rss2", "Scott Aaronson", "https://scottaaronson.blog", "quantum-crypto", "quantum-researchers") });
    jobs.push({ sourceName: "Matthew Green", fetcher: () => fetchRSS("https://blog.cryptographyengineering.com/feed", "Matthew Green", "https://blog.cryptographyengineering.com", "quantum-crypto", "quantum-researchers") });
  }
  if (inc("game-theory", "math-decision"))
    jobs.push({ sourceName: "Terence Tao", fetcher: () => fetchWordPress("https://terrytao.wordpress.com", "Terence Tao", "game-theory", "math-decision") });

  // ========== SITEMAP (full article list) ==========
  if (inc("blockchain", "defi-mev")) {
    jobs.push({ sourceName: "Hasu (Uncommon Core)", fetcher: () => fetchSitemap("https://uncommoncore.co/sitemap.xml", "Hasu (Uncommon Core)", "https://uncommoncore.co", "blockchain", "defi-mev") });
    jobs.push({ sourceName: "Flashbots Research", fetcher: () => fetchSitemap("https://writings.flashbots.net/sitemap.xml", "Flashbots Research", "https://writings.flashbots.net", "blockchain", "defi-mev", "/") });
  }
  if (inc("ai-ml", "ai-labs")) {
    jobs.push({ sourceName: "OpenAI Blog", fetcher: () => fetchSitemap("https://openai.com/sitemap.xml", "OpenAI Blog", "https://openai.com", "ai-ml", "ai-labs", "/research") });
    jobs.push({ sourceName: "DeepMind Blog", fetcher: () => fetchSitemap("https://deepmind.google/sitemap.xml", "DeepMind Blog", "https://deepmind.google", "ai-ml", "ai-labs", "/blog/") });
    jobs.push({ sourceName: "Hugging Face Blog", fetcher: () => fetchSitemap("https://huggingface.co/sitemap-blog.xml", "Hugging Face Blog", "https://huggingface.co", "ai-ml", "ai-labs", "/blog/") });
  }
  if (inc("ai-ml", "ai-researchers"))
    jobs.push({ sourceName: "Lilian Weng", fetcher: () => fetchSitemap("https://lilianweng.github.io/sitemap.xml", "Lilian Weng", "https://lilianweng.github.io", "ai-ml", "ai-researchers", "/posts/") });
  if (inc("game-theory", "math-decision"))
    jobs.push({ sourceName: "Quanta Magazine", fetcher: () => fetchSitemap("https://www.quantamagazine.org/sitemap.xml", "Quanta Magazine", "https://www.quantamagazine.org", "game-theory", "math-decision") });
  if (inc("ai-ml", "ai-researchers"))
    jobs.push({ sourceName: "The Gradient", fetcher: () => fetchSitemap("https://thegradient.pub/sitemap-posts.xml", "The Gradient", "https://thegradient.pub", "ai-ml", "ai-researchers") });
  if (inc("blockchain", "ethereum"))
    jobs.push({ sourceName: "EF Blog", fetcher: () => fetchSitemap("https://blog.ethereum.org/sitemap.xml", "EF Blog", "https://blog.ethereum.org", "blockchain", "ethereum") });
  if (inc("blockchain", "solana"))
    jobs.push({ sourceName: "Solana News", fetcher: () => fetchSitemap("https://solana.com/sitemap.xml", "Solana News", "https://solana.com", "blockchain", "solana", "/news/") });
  if (inc("blockchain", "monad"))
    jobs.push({ sourceName: "Monad Blog", fetcher: () => fetchSitemap("https://blog.monad.xyz/sitemap.xml", "Monad Blog", "https://blog.monad.xyz", "blockchain", "monad") });
  if (inc("blockchain", "eigenlayer"))
    jobs.push({ sourceName: "EigenCloud Blog", fetcher: () => fetchSitemap("https://blog.eigencloud.xyz/sitemap-posts.xml", "EigenCloud Blog", "https://blog.eigencloud.xyz", "blockchain", "eigenlayer") });

  // ========== LESSWRONG (GraphQL API) ==========
  if (inc("game-theory", "math-decision"))
    jobs.push({ sourceName: "LessWrong", fetcher: () => fetchLessWrong("LessWrong", "game-theory", "math-decision", 1000) });

  // ========== ARXIV API (paginated, full) ==========
  const ARXIV_DAYS = 30;   // last 30 days — wide enough to never miss a paper
  const ARXIV_MAX  = 2000; // per-category cap (date filter keeps volume manageable)

  const arxivCats: { code: string; name: string; cat: Category }[] = [
    { code: "cs.CR", name: "arXiv: Cryptography", cat: "academic" },
    { code: "cs.GT", name: "arXiv: Game Theory", cat: "academic" },
    { code: "cs.AI", name: "arXiv: AI", cat: "academic" },
    { code: "cs.LG", name: "arXiv: Machine Learning", cat: "academic" },
    { code: "cs.MA", name: "arXiv: Multi-Agent", cat: "academic" },
    { code: "quant-ph", name: "arXiv: Quantum Physics", cat: "academic" },
  ];
  for (const ac of arxivCats) {
    if (inc(ac.cat, "arxiv"))
      jobs.push({ sourceName: ac.name, fetcher: () => fetchArxiv(`cat:${ac.code}`, ac.name, `https://arxiv.org/list/${ac.code}/recent`, ac.cat, "arxiv", undefined, ARXIV_MAX, ARXIV_DAYS) });
  }

  return jobs;
}

// Sources handled by full-fetch — skip RSS for these
const FULL_FETCH_SOURCES = new Set([
  "ethresear.ch", "StarkNet Community", "EIPs GitHub",
  "Barnabé Monnot", "Jon Charbonneau", "Import AI (Jack Clark)",
  "Scott Aaronson", "Matthew Green", "Terence Tao",
  "Hasu (Uncommon Core)", "Flashbots Research",
  "OpenAI Blog", "DeepMind Blog", "Hugging Face Blog",
  "Lilian Weng", "Quanta Magazine", "The Gradient",
  "EF Blog", "Solana News", "Monad Blog", "EigenCloud Blog",
  "LessWrong",
  "arXiv: Cryptography", "arXiv: Game Theory", "arXiv: AI",
  "arXiv: Machine Learning", "arXiv: Multi-Agent", "arXiv: Quantum Physics",
]);

function deduplicate(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as Category | null;
  const subcategory = searchParams.get("subcategory");
  const refresh = searchParams.get("refresh") === "true";

  // Try cache first
  if (!refresh) {
    const cache = await readCache();
    if (cache && cache.articles.length > 0) {
      let articles = cache.articles;
      if (category) articles = articles.filter((a) => a.category === category);
      if (subcategory) articles = articles.filter((a) => a.subcategory === subcategory);
      return NextResponse.json({
        articles,
        lastUpdated: cache.lastUpdated,
        sourceStats: cache.sourceStats,
        fromCache: true,
      });
    }
  }

  // --- Full fetch ---
  const articles: Article[] = [];
  const sourceStats: Record<string, number> = {};

  // 1. RSS feeds only for sources NOT covered by full-fetch
  const rssSources = sources.filter((s) => s.type === "rss" && !FULL_FETCH_SOURCES.has(s.name));
  const rssPromises = rssSources.map(async (source) => {
    const result = await fetchRSS(source.feedUrl, source.name, source.url, source.category, source.subcategory);
    sourceStats[source.name] = result.length;
    articles.push(...result);
  });
  await Promise.allSettled(rssPromises);

  // 2. Full-fetch jobs in batches of 6
  const fullJobs = buildFullFetchJobs(category, subcategory);
  for (let i = 0; i < fullJobs.length; i += 6) {
    const batch = fullJobs.slice(i, i + 6);
    await Promise.allSettled(
      batch.map(async (job) => {
        const result = await job.fetcher();
        sourceStats[job.sourceName] = result.length;
        articles.push(...result);
      })
    );
  }

  const unique = deduplicate(articles);
  unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write full (unfiltered) cache
  await writeCache(unique, sourceStats);

  // Apply filters for response
  let filtered = unique;
  if (category) filtered = filtered.filter((a) => a.category === category);
  if (subcategory) filtered = filtered.filter((a) => a.subcategory === subcategory);

  return NextResponse.json({
    articles: filtered,
    lastUpdated: new Date().toISOString(),
    sourceStats,
    fromCache: false,
  });
}
