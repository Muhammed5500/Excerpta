"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Article, SUBCATEGORY_LABELS } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

export default function TimelinePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [readArticles] = useLocalStorage<string[]>("rh-read", []);
  const [groupBy, setGroupBy] = useState<"week" | "month">("week");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        const sorted = (data.articles || []).sort(
          (a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setArticles(sorted);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, { label: string; articles: Article[] }> = {};

    for (const article of articles) {
      let key: string;
      let label: string;

      if (groupBy === "week") {
        key = getWeekKey(article.date);
        label = `Week of ${formatWeekLabel(article.date)}`;
      } else {
        const d = new Date(article.date);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }

      if (!groups[key]) groups[key] = { label, articles: [] };
      groups[key].articles.push(article);
    }

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [articles, groupBy]);

  // Trending: most active sources in last 7 days
  const trending = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = articles.filter((a) => new Date(a.date) >= sevenDaysAgo);

    const sourceCounts: Record<string, number> = {};
    for (const a of recent) {
      sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
    }
    return Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [articles]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 nav-bg backdrop-blur-md border-b border-border-light/50">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-muted hover:text-slate-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="font-serif text-lg font-medium text-slate-primary">Timeline</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGroupBy("week")}
              className={`px-3 py-1 rounded-full text-xs transition-all ${groupBy === "week" ? "bg-slate-primary text-ivory" : "text-slate-muted hover:text-slate-primary"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setGroupBy("month")}
              className={`px-3 py-1 rounded-full text-xs transition-all ${groupBy === "month" ? "bg-slate-primary text-ivory" : "text-slate-muted hover:text-slate-primary"}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Trending bar */}
        {trending.length > 0 && (
          <div className="mb-10 p-5 rounded-xl card-bg border border-border-light">
            <h2 className="text-xs font-medium text-terracotta uppercase tracking-wider mb-3">Trending Sources (7 days)</h2>
            <div className="flex flex-wrap gap-2">
              {trending.map(([source, count]) => (
                <span key={source} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ivory text-xs text-slate-medium border border-border-light">
                  {source}
                  <span className="text-terracotta font-medium">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border-light" />

            {grouped.map(([key, { label, articles: groupArticles }]) => (
              <div key={key} className="mb-10">
                {/* Date header */}
                <div className="flex items-center gap-4 mb-4 relative">
                  <div className="w-6 h-6 rounded-full bg-ivory border-2 border-terracotta flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-terracotta" />
                  </div>
                  <h3 className="font-serif text-base font-medium text-slate-primary">{label}</h3>
                  <span className="text-xs text-slate-muted">{groupArticles.length} articles</span>
                </div>

                {/* Articles */}
                <div className="ml-12 space-y-2">
                  {groupArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${encodeURIComponent(article.id)}`}
                      className={`group flex items-start gap-3 p-3 rounded-lg hover:card-bg transition-all ${
                        readArticles.includes(article.id) ? "opacity-60" : ""
                      }`}
                    >
                      <span className="text-[11px] text-slate-muted min-w-[40px] pt-0.5">
                        {new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-primary group-hover:text-terracotta transition-colors leading-snug truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-muted">{article.source}</span>
                          {article.author && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-slate-muted" />
                              <span className="text-[11px] text-slate-muted">{article.author}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {readArticles.includes(article.id) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-olive mt-1.5 shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
