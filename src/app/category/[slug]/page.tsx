"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { Article, Category, CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import ArticleCard from "@/components/ArticleCard";
import SubcategoryFilter from "@/components/SubcategoryFilter";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = slug as Category;
  const label = CATEGORY_LABELS[category] || slug;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("rh-bookmarks", []);
  const [readArticles] = useLocalStorage<string[]>("rh-read", []);
  const [tags, setTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        const all: Article[] = data.articles || [];
        setArticles(all.filter((a) => a.category === category));
      } catch { /* ignore */ }
      setLoading(false);
    })();
    fetch("/api/tags").then((r) => r.json()).then(setTags).catch(() => {});
  }, [category]);

  const subcategories = useMemo(() => {
    const subs = new Set(articles.map((a) => a.subcategory));
    return Array.from(subs).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (activeSubcategory !== "all") result = result.filter((a) => a.subcategory === activeSubcategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [articles, activeSubcategory, searchQuery]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const handleSaveSummary = async (articleId: string, summary: string) => {
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, summary } : a)));
    try {
      await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, summary }) });
    } catch { /* ignore */ }
  };

  const handleSaveTags = async (articleId: string, newTags: string[]) => {
    setTags((prev) => ({ ...prev, [articleId]: newTags }));
    try {
      await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, tags: newTags }) });
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 nav-bg backdrop-blur-md border-b border-border-light/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-muted hover:text-slate-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="font-serif text-lg font-medium text-slate-primary">{label}</h1>
            <span className="text-xs text-slate-muted">{articles.length} articles</span>
          </div>

          {/* Search */}
          <div className="hidden md:block relative w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full card-bg border border-border-light rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-primary placeholder:text-slate-muted/50 focus:outline-none focus:border-terracotta/40 transition-all"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
        {/* Subcategory filter */}
        <SubcategoryFilter
          subcategories={subcategories}
          active={activeSubcategory}
          onChange={setActiveSubcategory}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSaveSummary={handleSaveSummary}
                isBookmarked={bookmarks.includes(article.id)}
                isRead={readArticles.includes(article.id)}
                onToggleBookmark={toggleBookmark}
                tags={tags[article.id]}
                onSaveTags={handleSaveTags}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-muted text-sm">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
