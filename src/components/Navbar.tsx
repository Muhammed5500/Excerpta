"use client";

import { useState } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";

const categories: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "blockchain", label: "Blockchain" },
  { key: "ai-ml", label: "AI / ML" },
  { key: "game-theory", label: "Game Theory" },
  { key: "quantum-crypto", label: "Quantum" },
  { key: "academic", label: "Academic" },
];

export default function Navbar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 nav-bg backdrop-blur-md border-b border-border-light/50">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-terracotta"
              aria-label="Excerpta"
            >
              <line x1="6" y1="8"  x2="26" y2="8"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <line x1="6" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <line x1="6" y1="24" x2="26" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-slate-primary font-semibold text-lg tracking-tight">
              Excerpta
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {categories.map((cat) =>
              cat.key === "all" ? (
                <Link
                  key={cat.key}
                  href="/"
                  className={`px-3.5 py-1.5 rounded-full text-sm transition-all duration-200 ${
                    activeCategory === "all"
                      ? "bg-slate-primary text-ivory font-medium"
                      : "text-slate-medium hover:text-slate-primary hover:bg-ivory-dark"
                  }`}
                >
                  {cat.label}
                </Link>
              ) : (
                <Link
                  key={cat.key}
                  href={`/category/${cat.key}`}
                  className="px-3.5 py-1.5 rounded-full text-sm text-slate-medium hover:text-slate-primary hover:bg-ivory-dark transition-all duration-200"
                >
                  {cat.label}
                </Link>
              )
            )}
          </nav>

          {/* Page links + theme toggle */}
          <div className="hidden md:flex items-center gap-1 ml-2 pl-2 border-l border-border-light">
            <Link href="/bookmarks" className="px-3 py-1.5 rounded-full text-sm text-slate-medium hover:text-slate-primary hover:bg-ivory-dark transition-all">
              Bookmarks
            </Link>
            <button
              onClick={toggle}
              className="ml-1 p-2 rounded-full text-slate-muted hover:text-slate-primary hover:bg-ivory-dark transition-all"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 9.5A6 6 0 0 1 6.5 2 6 6 0 1 0 14 9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 text-slate-muted hover:text-slate-primary"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 9.5A6 6 0 0 1 6.5 2 6 6 0 1 0 14 9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-medium hover:text-slate-primary"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                {mobileOpen ? (
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-wrap gap-2">
            <Link href="/" className="px-3.5 py-1.5 rounded-full text-sm text-slate-medium hover:text-slate-primary hover:bg-ivory-dark transition-all" onClick={() => setMobileOpen(false)}>
              All
            </Link>
            {categories.filter((c) => c.key !== "all").map((cat) => (
              <Link
                key={cat.key}
                href={`/category/${cat.key}`}
                className="px-3.5 py-1.5 rounded-full text-sm text-slate-medium hover:text-slate-primary hover:bg-ivory-dark transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
