"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Article } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import ArticleCard from "@/components/ArticleCard";

export default function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const authorName = decodeURIComponent(name);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("rh-bookmarks", []);
  const [readArticles] = useLocalStorage<string[]>("rh-read", []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        const all: Article[] = data.articles || [];
        const filtered = all
          .filter((a) => a.author?.toLowerCase().includes(authorName.toLowerCase()) || a.source.toLowerCase().includes(authorName.toLowerCase()))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArticles(filtered);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [authorName]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const sources = [...new Set(articles.map((a) => a.source))];
  const categories = [...new Set(articles.map((a) => a.subcategory))];

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
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        {/* Author header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-slate-primary mb-3">{authorName}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-muted">
            <span><strong className="text-slate-medium font-medium">{articles.length}</strong> articles</span>
            {sources.length > 0 && (
              <span>Sources: {sources.slice(0, 3).join(", ")}{sources.length > 3 ? ` +${sources.length - 3}` : ""}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          </div>
        ) : articles.length > 0 ? (
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
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-muted text-sm">No articles found for this author.</p>
          </div>
        )}
      </div>
    </div>
  );
}
