"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export default function ActiveFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const favorite = searchParams.get("favorite");
  const sort = searchParams.get("sort");

  const hasFilters = q || category || favorite;
  if (!hasFilters) return null;

  // Build a helper to remove one param while keeping others
  const withoutParam = (param: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    // Keep sort if it exists
    if (sort) params.set("sort", sort);
    return `${pathname}?${params.toString()}`;
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div id="active-filters" className="flex flex-wrap items-center gap-2 mb-5">
      <span id="active-filters-label" className="text-sm text-zinc-500 dark:text-zinc-500">Filters:</span>

      {q && (
        <span id="filter-query" className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-3 py-1 rounded-full">
          &quot;{q}&quot;
          <Link
            href={withoutParam("q")}
            className="hover:text-indigo-900 dark:hover:text-indigo-100 min-w-[44px] inline-flex justify-center"
          >
            ×
          </Link>
        </span>
      )}

      {category && (
        <span id="filter-category" className="inline-flex items-center gap-1 text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-3 py-1 rounded-full">
          {category}
          <Link
            href={withoutParam("category")}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 min-w-[44px] inline-flex justify-center"
          >
            ×
          </Link>
        </span>
      )}

      {favorite === "true" && (
        <span id="filter-favorite" className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 px-3 py-1 rounded-full">
          ★ Favorites
          <Link
            href={withoutParam("favorite")}
            className="hover:text-amber-900 dark:hover:text-amber-100 min-w-[44px] inline-flex justify-center"
          >
            ×
          </Link>
        </span>
      )}

      <Link
        href={clearAll()}
        className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 underline underline-offset-2 min-h-[44px] inline-flex items-center"
      >
        Clear all
      </Link>
    </div>
  );
}
