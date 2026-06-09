"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recently Updated" },
  { value: "createdAt", label: "Date Created" },
  { value: "title", label: "Title A-Z" },
  { value: "category", label: "Category A-Z" },
];

export default function SortBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentSort = searchParams.get("sort") || "updatedAt";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "updatedAt") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div id="sort-bar" className="flex items-center gap-2">
      <label htmlFor="sort" className="text-xs text-zinc-500 dark:text-zinc-500 hidden sm:inline">
        Sort:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all cursor-pointer min-h-[44px]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
