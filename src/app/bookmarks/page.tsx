"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import ArticleCard from "@/components/ArticleCard";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("rh-bookmarks", []);
  const [readArticles] = useLocalStorage<string[]>("rh-read", []);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        setArticles(data.articles || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const bookmarkedArticles = articles.filter((a) => bookmarks.includes(a.id));

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 nav-bg backdrop-blur-md border-b border-border-light/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-muted hover:text-slate-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="font-serif text-lg font-medium text-slate-primary">Bookmarks</h1>
          <span className="text-xs text-slate-muted">{bookmarkedArticles.length} saved</span>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          </div>
        ) : bookmarkedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarkedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSaveSummary={() => {}}
                isBookmarked={true}
                isRead={readArticles.includes(article.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg width="48" height="48" viewBox="0 0 18 18" fill="none" className="mx-auto mb-4 text-border">
              <path d="M4 2.5H14V16L9 12.5L4 16V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            <p className="text-slate-muted text-sm mb-1">No bookmarks yet</p>
            <p className="text-xs text-slate-muted/70">Click the bookmark icon on any article to save it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
