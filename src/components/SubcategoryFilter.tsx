"use client";

import { SUBCATEGORY_LABELS } from "@/lib/types";

export default function SubcategoryFilter({
  subcategories,
  active,
  onChange,
}: {
  subcategories: string[];
  active: string;
  onChange: (sub: string) => void;
}) {
  if (subcategories.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1 rounded-full text-xs transition-all duration-200 border ${
          active === "all"
            ? "border-slate-primary bg-slate-primary text-ivory"
            : "border-border text-slate-muted hover:text-slate-primary hover:border-slate-muted"
        }`}
      >
        All
      </button>
      {subcategories.map((sub) => (
        <button
          key={sub}
          onClick={() => onChange(sub)}
          className={`px-3 py-1 rounded-full text-xs transition-all duration-200 border ${
            active === sub
              ? "border-slate-primary bg-slate-primary text-ivory"
              : "border-border text-slate-muted hover:text-slate-primary hover:border-slate-muted"
          }`}
        >
          {SUBCATEGORY_LABELS[sub] || sub}
        </button>
      ))}
    </div>
  );
}
