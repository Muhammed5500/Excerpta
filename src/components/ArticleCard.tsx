"use client";

import { useState } from "react";
import Link from "next/link";
import { Article, SUBCATEGORY_LABELS } from "@/lib/types";

const subcategoryColors: Record<string, string> = {
  ethereum: "bg-sky/15 text-sky",
  solana: "bg-fig/15 text-fig",
  monad: "bg-olive/15 text-olive",
  avalanche: "bg-terracotta/15 text-terracotta",
  sui: "bg-sky/15 text-sky",
  aptos: "bg-olive/15 text-olive",
  cosmos: "bg-kraft/15 text-kraft",
  starknet: "bg-fig/15 text-fig",
  polygon: "bg-fig/15 text-fig",
  arbitrum: "bg-sky/15 text-sky",
  optimism: "bg-terracotta/15 text-terracotta",
  zksync: "bg-olive/15 text-olive",
  eigenlayer: "bg-kraft/15 text-kraft",
  "ai-labs": "bg-terracotta/15 text-terracotta",
  "ai-researchers": "bg-terracotta-light/15 text-terracotta",
  "consensus-researchers": "bg-sky/15 text-sky",
  "defi-mev": "bg-fig/15 text-fig",
  "quantum-researchers": "bg-olive/15 text-olive",
  "math-decision": "bg-kraft/15 text-kraft",
  arxiv: "bg-slate-muted/15 text-slate-medium",
  "vc-research": "bg-kraft/15 text-kraft",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ArticleCard({
  article,
  onSaveSummary,
  isBookmarked,
  isRead,
  onToggleBookmark,
  tags,
  onSaveTags,
}: {
  article: Article;
  onSaveSummary: (id: string, summary: string) => void;
  isBookmarked?: boolean;
  isRead?: boolean;
  onToggleBookmark?: (id: string) => void;
  tags?: string[];
  onSaveTags?: (id: string, tags: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(article.summary || "");
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const badgeColor = subcategoryColors[article.subcategory] || "bg-oat text-slate-medium";

  return (
    <article
      className={`group card-bg backdrop-blur-sm rounded-xl border border-border-light hover:border-border
        transition-all duration-300 hover:shadow-[0_2px_20px_rgba(0,0,0,0.06)]
        ${isRead ? "opacity-75" : ""}`}
    >
      <div className="p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
              {SUBCATEGORY_LABELS[article.subcategory] || article.subcategory}
            </span>
            {isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-olive" title="Read" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-muted">{formatDate(article.date)}</span>
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.preventDefault(); onToggleBookmark(article.id); }}
                className={`p-1 rounded transition-colors ${isBookmarked ? "text-terracotta" : "text-border hover:text-slate-muted"}`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill={isBookmarked ? "currentColor" : "none"}>
                  <path d="M4 2.5H14V16L9 12.5L4 16V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Title — links to reader view */}
        <h3 className="font-serif text-lg font-medium text-slate-primary leading-snug mb-2 group-hover:text-terracotta transition-colors duration-200">
          <Link href={`/article/${encodeURIComponent(article.id)}`}>
            {article.title}
          </Link>
        </h3>

        {/* Source & Author */}
        <div className="flex items-center gap-2 text-xs text-slate-muted mb-3">
          <span>{article.source}</span>
          {article.author && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-muted" />
              <Link
                href={`/author/${encodeURIComponent(article.author)}`}
                className="hover:text-terracotta transition-colors"
              >
                {article.author}
              </Link>
            </>
          )}
        </div>

        {/* Excerpt */}
        <p className="text-sm text-slate-light leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>

        {/* Summary */}
        {article.summary && !editing && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-terracotta" />
              <span className="text-xs font-medium text-terracotta uppercase tracking-wider">Summary</span>
            </div>
            <p className="text-sm text-slate-medium leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Tags */}
        {(tags && tags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-ivory-dark text-[10px] text-slate-medium font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {showTagInput && onSaveTags && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  const newTags = [...(tags || []), ...tagInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)];
                  onSaveTags(article.id, [...new Set(newTags)]);
                  setTagInput("");
                  setShowTagInput(false);
                }
              }}
              placeholder="Add tags (comma-separated, Enter to save)"
              className="flex-1 px-3 py-1 bg-ivory rounded-full border border-border-light text-xs text-slate-primary placeholder:text-slate-muted/50 focus:outline-none focus:border-terracotta/40"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/article/${encodeURIComponent(article.id)}`}
            className="text-xs font-medium text-slate-muted hover:text-terracotta transition-colors"
          >
            Read
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-muted hover:text-terracotta transition-colors inline-flex items-center gap-1"
          >
            Original
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5H9.5V7.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button
            onClick={() => { setEditing(!editing); setSummaryDraft(article.summary || ""); }}
            className="text-xs font-medium text-slate-muted hover:text-terracotta transition-colors"
          >
            {editing ? "Cancel" : article.summary ? "Edit summary" : "+ Summary"}
          </button>
          {onSaveTags && (
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="text-xs font-medium text-slate-muted hover:text-terracotta transition-colors"
            >
              {showTagInput ? "Cancel" : "+ Tag"}
            </button>
          )}
        </div>

        {/* Editor */}
        {editing && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              placeholder="Write your summary here..."
              rows={3}
              className="w-full bg-ivory rounded-lg border border-border-light px-4 py-3 text-sm text-slate-primary placeholder:text-slate-muted/60 focus:outline-none focus:border-terracotta/40 focus:ring-1 focus:ring-terracotta/20 resize-none transition-all"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => { onSaveSummary(article.id, summaryDraft); setEditing(false); }}
                className="px-4 py-1.5 bg-slate-primary text-ivory text-xs font-medium rounded-full hover:bg-slate-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
