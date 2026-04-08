"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { Article, Category, CATEGORY_LABELS } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface CategoryPreview {
  category: Category;
  total: number;
  articles: Article[];
}

// Static fallback hero (no Three.js) — shown while HeroScene lazy-loads
function FallbackHero() {
  return (
    <section className="h-[100vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full card-bg backdrop-blur-sm border border-border-light">
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
          <span className="text-xs text-slate-medium font-medium tracking-wide">Live from 34+ sources</span>
        </div>
      </div>
      <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-slate-primary leading-[1.05] tracking-tight max-w-4xl">
        Research,<br /><span className="text-terracotta">distilled.</span>
      </h1>
      <p className="mt-6 text-base md:text-lg text-slate-medium max-w-lg leading-relaxed">
        Curated research and articles on blockchain, AI, game theory, and more — all in one place.
      </p>
    </section>
  );
}

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => <FallbackHero />,
});
const SceneBackground = dynamic(
  () => import("@/components/HeroScene").then((mod) => ({ default: mod.SceneBackground })),
  { ssr: false }
);

export default function Home() {
  const [categories, setCategories] = useState<CategoryPreview[]>([]);
  const [total, setTotal] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("rh-bookmarks", []);
  const [readArticles] = useLocalStorage<string[]>("rh-read", []);

  // Load data first, Three.js later
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/preview");
        const data = await res.json();
        setCategories(data.categories || []);
        setTotal(data.total || 0);
        setTotalSources(data.totalSources || 0);
        setLastUpdated(data.lastUpdated || null);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col min-h-full relative">
      {/* 3D background — lazy loaded, no SSR */}
      <SceneBackground />

      <Navbar activeCategory="all" onCategoryChange={() => {}} />

      <main className="flex-1 relative z-10">
        {/* Hero — FallbackHero shown while Three.js lazy-loads */}
        <HeroScene />

        {/* Stats */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-12">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs text-slate-muted">
            <span><strong className="text-slate-medium font-medium">{total}</strong> articles</span>
            <span><strong className="text-slate-medium font-medium">{totalSources}</strong> sources</span>
            {lastUpdated && (
              <span>
                Updated {new Date(lastUpdated).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {loading && (
              <span className="inline-flex items-center gap-1.5 text-terracotta">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                Loading...
              </span>
            )}
          </div>
        </div>

        {/* Category previews */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 space-y-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-bg backdrop-blur-sm rounded-xl border border-border-light p-6 animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-5 w-20 bg-ivory-dark rounded-full" />
                    <div className="h-4 w-16 bg-ivory-dark rounded" />
                  </div>
                  <div className="h-5 w-full bg-ivory-dark rounded mb-2" />
                  <div className="h-5 w-3/4 bg-ivory-dark rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-ivory-dark rounded" />
                    <div className="h-3 w-5/6 bg-ivory-dark rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            categories.map(({ category, total: catTotal, articles }) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-medium text-slate-primary">{CATEGORY_LABELS[category]}</h2>
                    <p className="text-xs text-slate-muted mt-1">{catTotal} articles</p>
                  </div>
                  <Link
                    href={`/category/${category}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-medium text-slate-medium hover:text-terracotta hover:border-terracotta/30 transition-colors"
                  >
                    View all
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSaveSummary={() => {}}
                      isBookmarked={bookmarks.includes(article.id)}
                      isRead={readArticles.includes(article.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
