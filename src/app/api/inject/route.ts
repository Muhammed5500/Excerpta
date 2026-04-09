import { NextResponse } from "next/server";
import { Article } from "@/lib/types";
import { readCache, writeCache } from "@/lib/cache";

export async function GET() {
  const article: Article = {
    id: "arxiv-2604.00234",
    title: "Blockspace Under Pressure: An Analysis of Spam MEV on High-Throughput Blockchains",
    url: "https://arxiv.org/abs/2604.00234",
    source: "arXiv: Game Theory",
    sourceUrl: "https://arxiv.org/list/cs.GT/recent",
    category: "academic",
    subcategory: "arxiv",
    date: "2026-03-31T00:00:00.000Z",
    excerpt: "We analyze spam MEV on high-throughput blockchains, examining how validators and searchers exploit blockspace under pressure.",
    author: "Wenhao Wang, Aditya Saraf, Lioba Heimbach, Kushal Babel, Fan Zhang",
  };

  const cache = await readCache();
  if (!cache) return NextResponse.json({ error: "no cache found" }, { status: 500 });

  // Check if already exists
  if (cache.articles.some((a) => a.id === article.id)) {
    return NextResponse.json({ message: "already exists", total: cache.articles.length });
  }

  cache.articles.unshift(article);
  cache.articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = cache.sourceStats;
  stats[article.source] = (stats[article.source] || 0) + 1;

  await writeCache(cache.articles, stats);

  return NextResponse.json({ message: "injected", total: cache.articles.length });
}
