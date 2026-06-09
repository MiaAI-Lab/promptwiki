"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [value, setValue] = useState(searchParams.get("q")?.toString() || "");
  const [userTyped, setUserTyped] = useState(false);

  useEffect(() => {
    if (!userTyped) {
      setValue(searchParams.get("q")?.toString() || "");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userTyped) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");
      replace(`${pathname}?${params.toString()}`);
      setUserTyped(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, userTyped, pathname, replace, searchParams]);

  return (
    <div id="search-bar">
      <input
        id="search-input"
        type="text"
        placeholder="Search prompts..."
        value={value}
        onChange={(e) => { setUserTyped(true); setValue(e.target.value); }}
        className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 min-h-[44px] transition-all"
      />
    </div>
  );
}
