"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Article, SUBCATEGORY_LABELS } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("rh-bookmarks", []);
  const [readArticles, setReadArticles] = useLocalStorage<string[]>("rh-read", []);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  const isBookmarked = bookmarks.includes(id);
  const isRead = readArticles.includes(id);

  // Load article from cache
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        const articles: Article[] = data.articles || [];
        const found = articles.find((a: Article) => a.id === id);
        if (found) {
          setArticle(found);
          // Related: same subcategory, different article
          const related = articles
            .filter((a: Article) => a.id !== id && (a.subcategory === found.subcategory || a.source === found.source))
            .slice(0, 6);
          setRelatedArticles(related);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, [id]);

  // Mark as read
  useEffect(() => {
    if (article && !isRead) {
      setReadArticles((prev) => [...prev, id]);
    }
  }, [article]);

  // Fetch content
  useEffect(() => {
    if (!article) return;
    setContentLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/content?url=${encodeURIComponent(article.url)}`);
        const data = await res.json();
        if (data.content) setContent(data.content);
      } catch {
        // ignore
      }
      setContentLoading(false);
    })();
  }, [article]);

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-muted">Article not found</p>
        <Link href="/" className="text-sm text-terracotta hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-bg backdrop-blur-md border-b border-border-light/50">
        <div className="max-w-[800px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-muted hover:text-slate-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition-colors ${isBookmarked ? "text-terracotta" : "text-slate-muted hover:text-slate-primary"}`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill={isBookmarked ? "currentColor" : "none"}>
                <path d="M4 2.5H14V16L9 12.5L4 16V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-muted hover:text-terracotta transition-colors flex items-center gap-1"
            >
              Original
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5H9.5V7.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-[800px] mx-auto px-6 pt-12 pb-20">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta">
            {SUBCATEGORY_LABELS[article.subcategory] || article.subcategory}
          </span>
          <span className="text-xs text-slate-muted">
            {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-slate-primary leading-tight mb-4">
          {article.title}
        </h1>

        {/* Author & Source */}
        <div className="flex items-center gap-3 text-sm text-slate-light mb-8 pb-8 border-b border-border-light">
          {article.author && (
            <Link
              href={`/author/${encodeURIComponent(article.author)}`}
              className="hover:text-terracotta transition-colors"
            >
              {article.author}
            </Link>
          )}
          {article.author && <span className="w-1 h-1 rounded-full bg-slate-muted" />}
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">
            {article.source}
          </a>
        </div>

        {/* Summary */}
        {article.summary && (
          <div className="mb-8 p-5 rounded-xl bg-terracotta/5 border border-terracotta/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-terracotta" />
              <span className="text-xs font-medium text-terracotta uppercase tracking-wider">Summary</span>
            </div>
            <p className="text-sm text-slate-medium leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Content */}
        {contentLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-ivory-dark rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        ) : content ? (
          <div
            className="prose prose-slate max-w-none
              [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:mt-10 [&_h1]:mb-4
              [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-medium [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:text-[15px] [&_p]:leading-[1.8] [&_p]:text-slate-medium [&_p]:mb-4
              [&_a]:text-terracotta [&_a]:no-underline hover:[&_a]:underline
              [&_blockquote]:border-l-2 [&_blockquote]:border-terracotta/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-light
              [&_pre]:bg-ivory-dark [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm
              [&_code]:bg-ivory-dark [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm
              [&_img]:rounded-lg [&_img]:my-6
              [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
              [&_li]:text-[15px] [&_li]:leading-[1.8] [&_li]:text-slate-medium"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-muted text-sm mb-3">Content could not be loaded in reader view.</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-primary text-ivory text-sm rounded-full hover:bg-slate-medium transition-colors"
            >
              Read on original site
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5H9.5V7.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}

        {/* Excerpt fallback */}
        {!content && !contentLoading && article.excerpt && (
          <div className="mt-6 p-5 rounded-xl card-bg border border-border-light">
            <p className="text-sm text-slate-medium leading-relaxed">{article.excerpt}</p>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border-light">
            <h2 className="font-serif text-xl font-medium text-slate-primary mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((r) => (
                <Link
                  key={r.id}
                  href={`/article/${encodeURIComponent(r.id)}`}
                  className="group p-4 rounded-lg card-bg border border-border-light hover:border-border hover:opacity-90 transition-all"
                >
                  <span className="text-[10px] text-slate-muted uppercase tracking-wider">{r.source}</span>
                  <h3 className="font-serif text-sm font-medium text-slate-primary mt-1 group-hover:text-terracotta transition-colors leading-snug">
                    {r.title}
                  </h3>
                  <span className="text-[11px] text-slate-muted mt-2 block">
                    {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
