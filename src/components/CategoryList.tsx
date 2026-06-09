"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CategoryListProps {
  categories: string[];
  categoryCounts?: Record<string, number>;
}

export default function CategoryList({ categories, categoryCounts = {} }: CategoryListProps) {
  const searchParams = useSearchParams();

  return (
    <ul id="category-list" className="space-y-0.5">
      {categories.map((cat) => {
        const isActive = searchParams.get("category") === cat;
        return (
          <li key={cat}>
            <Link
              href={`/?category=${encodeURIComponent(cat)}`}
              className={`flex-1 min-w-0 flex items-center gap-1.5 text-sm px-2 py-2 rounded-lg min-h-[44px] transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 font-medium"
                  : "text-zinc-700 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/70"
              }`}
            >
              <span className="break-words">{cat}</span>
              {categoryCounts[cat] !== undefined && (
                <span className="ml-auto text-[11px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-full leading-none shrink-0">
                  {categoryCounts[cat]}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
