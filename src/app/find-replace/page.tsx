"use client";

import { useState, useEffect, useRef } from "react";

interface Prompt {
  id: string;
  title: string;
}

interface Match {
  id: string;
  title: string;
  fields: string[];
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  content: "Content",
  description: "Description",
};

export default function FindReplacePage() {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [fields, setFields] = useState<string[]>(["content"]);
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Category + prompt scope
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryPrompts, setCategoryPrompts] = useState<Prompt[]>([]);
  const [categoryPromptsLoading, setCategoryPromptsLoading] = useState(false);
  // null = all prompts in scope; Set = specific subset
  const [scopedIds, setScopedIds] = useState<Set<string> | null>(null);

  // Preview
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [previewError, setPreviewError] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Apply
  const [applyStatus, setApplyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applyError, setApplyError] = useState("");
  const [applyResult, setApplyResult] = useState<{ updated: number; errors: string[] } | null>(null);

  // Refs for indeterminate checkboxes
  const scopeAllRef = useRef<HTMLInputElement>(null);
  const matchAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  // Fetch prompts when category changes
  useEffect(() => {
    if (!category) {
      setCategoryPrompts([]);
      setScopedIds(null);
      resetPreview();
      return;
    }
    setCategoryPromptsLoading(true);
    setScopedIds(null);
    resetPreview();
    fetch(`/api/prompts?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoryPrompts(data.map((p: any) => ({ id: p.id, title: p.title })));
        }
      })
      .catch(() => {})
      .finally(() => setCategoryPromptsLoading(false));
  }, [category]);

  // Sync indeterminate state for scope checkbox
  useEffect(() => {
    if (!scopeAllRef.current || !category) return;
    const total = categoryPrompts.length;
    const selected = scopedIds?.size ?? total;
    scopeAllRef.current.indeterminate = selected > 0 && selected < total;
  }, [scopedIds, categoryPrompts, category]);

  // Sync indeterminate state for match checkbox
  useEffect(() => {
    if (!matchAllRef.current) return;
    matchAllRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < matches.length;
  }, [selectedIds, matches]);

  const toggleField = (f: string) => {
    setFields((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
    resetPreview();
  };

  const resetPreview = () => {
    setPreviewStatus("idle");
    setMatches([]);
    setSelectedIds(new Set());
    setApplyStatus("idle");
    setApplyResult(null);
  };

  // Scope (pre-filter) selection
  const allScopeSelected = !category || scopedIds === null || scopedIds.size === categoryPrompts.length;

  const toggleScopeAll = () => {
    resetPreview();
    if (allScopeSelected) {
      setScopedIds(new Set()); // deselect all
    } else {
      setScopedIds(null); // select all
    }
  };

  const toggleScopeId = (id: string) => {
    resetPreview();
    setScopedIds((prev) => {
      const base = prev ?? new Set(categoryPrompts.map((p) => p.id));
      const next = new Set(base);
      next.has(id) ? next.delete(id) : next.add(id);
      return next.size === categoryPrompts.length ? null : next;
    });
  };

  const isScopeSelected = (id: string) =>
    scopedIds === null || scopedIds.has(id);

  const scopeCount = scopedIds === null ? categoryPrompts.length : scopedIds.size;

  // Build promptIds for API calls (only when a specific subset is chosen)
  const getPromptIds = (): string[] | undefined => {
    if (!category) return undefined;
    if (scopedIds === null) return undefined; // all in category — API uses category filter
    return [...scopedIds];
  };

  const handlePreview = async () => {
    if (!find.trim()) return;
    const promptIds = getPromptIds();
    // If a category is chosen but user deselected everything, nothing to search
    if (category && scopeCount === 0) {
      setPreviewStatus("done");
      setMatches([]);
      return;
    }

    setPreviewStatus("loading");
    setPreviewError("");
    setMatches([]);
    setSelectedIds(new Set());
    setApplyStatus("idle");
    setApplyResult(null);

    try {
      const res = await fetch("/api/prompts/find-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          find,
          replace,
          fields,
          caseSensitive,
          category: category || undefined,
          promptIds,
          dryRun: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewStatus("error");
        setPreviewError(data.error || "Preview failed");
        return;
      }
      setMatches(data.matches);
      setSelectedIds(new Set(data.matches.map((m: Match) => m.id)));
      setPreviewStatus("done");
    } catch (err: any) {
      setPreviewStatus("error");
      setPreviewError(err.message || "Preview failed");
    }
  };

  // Match list selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map((m) => m.id)));
    }
  };

  const handleApply = async () => {
    if (selectedIds.size === 0) return;
    setApplyStatus("loading");
    setApplyError("");
    setApplyResult(null);

    try {
      const res = await fetch("/api/prompts/find-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          find,
          replace,
          fields,
          caseSensitive,
          promptIds: [...selectedIds],
          dryRun: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApplyStatus("error");
        setApplyError(data.error || "Apply failed");
        return;
      }
      setApplyStatus("success");
      setApplyResult(data);
      setMatches([]);
      setSelectedIds(new Set());
      setPreviewStatus("idle");
    } catch (err: any) {
      setApplyStatus("error");
      setApplyError(err.message || "Apply failed");
    }
  };

  const canPreview = find.trim().length > 0 && fields.length > 0 && (!category || scopeCount > 0);
  const canApply = previewStatus === "done" && selectedIds.size > 0 && applyStatus !== "loading";

  return (
    <div id="find-replace-page" className="max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6 sm:mb-8">
        Find &amp; Replace
      </h1>

      {/* Find / Replace inputs */}
      <section className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Find</label>
            <textarea
              value={find}
              onChange={(e) => { setFind(e.target.value); resetPreview(); }}
              placeholder="Text to find..."
              rows={10}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Replace with</label>
            <textarea
              value={replace}
              onChange={(e) => { setReplace(e.target.value); resetPreview(); }}
              placeholder="Replacement text (leave empty to delete)..."
              rows={10}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y font-mono"
            />
          </div>
        </div>

        {/* Category + prompt scope */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Limit to category
            </label>
            <div className="relative w-full sm:w-64">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 pl-3 pr-9 py-2.5 min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Prompt picker — only shown when a category is selected */}
          {category && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Prompts
                {!categoryPromptsLoading && categoryPrompts.length > 0 && (
                  <span className="ml-1.5 font-normal text-zinc-400 dark:text-zinc-600">
                    ({scopeCount} of {categoryPrompts.length} selected)
                  </span>
                )}
              </label>

              {categoryPromptsLoading ? (
                <div className="text-sm text-zinc-400 dark:text-zinc-600 py-2">Loading prompts...</div>
              ) : categoryPrompts.length === 0 ? (
                <div className="text-sm text-zinc-400 dark:text-zinc-600 py-2">No prompts in this category.</div>
              ) : (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden w-full">
                  {/* Select all row */}
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                    <input
                      ref={scopeAllRef}
                      type="checkbox"
                      checked={allScopeSelected}
                      onChange={toggleScopeAll}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 shrink-0 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">All prompts</span>
                  </div>
                  {/* Prompt rows */}
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-96 overflow-y-auto">
                    {categoryPrompts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isScopeSelected(p.id)}
                          onChange={() => toggleScopeId(p.id)}
                          className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 shrink-0"
                        />
                        <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{p.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Field + case options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search in:</span>
          {["title", "content", "description"].map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={fields.includes(f)}
                onChange={() => toggleField(f)}
                className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{FIELD_LABELS[f]}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px] ml-auto">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => { setCaseSensitive(e.target.checked); resetPreview(); }}
              className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Case sensitive</span>
          </label>
        </div>

        <button
          onClick={handlePreview}
          disabled={!canPreview || previewStatus === "loading"}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-indigo-500/20 cursor-pointer"
        >
          {previewStatus === "loading" ? "Searching..." : "Preview matches"}
        </button>
      </section>

      {/* Preview error */}
      {previewStatus === "error" && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">Preview failed</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{previewError}</p>
        </div>
      )}

      {/* No matches */}
      {previewStatus === "done" && matches.length === 0 && (
        <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No prompts match the search text.</p>
        </div>
      )}

      {/* Match list */}
      {previewStatus === "done" && matches.length > 0 && (
        <section className="mb-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
              <input
                ref={matchAllRef}
                type="checkbox"
                checked={selectedIds.size === matches.length}
                onChange={toggleSelectAll}
                className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 shrink-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {selectedIds.size} of {matches.length} matching prompt{matches.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-72 overflow-y-auto">
              {matches.map((match) => (
                <label
                  key={match.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(match.id)}
                    onChange={() => toggleSelect(match.id)}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 shrink-0"
                  />
                  <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">{match.title}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                    {match.fields.map((f) => FIELD_LABELS[f]).join(", ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={!canApply}
            className="mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            {applyStatus === "loading"
              ? "Applying..."
              : `Apply to ${selectedIds.size} prompt${selectedIds.size !== 1 ? "s" : ""}`}
          </button>
        </section>
      )}

      {/* Apply error */}
      {applyStatus === "error" && (
        <div className="p-4 bg-red-100 border border-red-300 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">Apply failed</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{applyError}</p>
        </div>
      )}

      {/* Apply success */}
      {applyStatus === "success" && applyResult && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800 rounded-xl">
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Done</p>
          <ul className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 space-y-1">
            <li><strong>{applyResult.updated}</strong> prompt{applyResult.updated !== 1 ? "s" : ""} updated</li>
          </ul>
          {applyResult.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">Errors:</p>
              <ul className="text-xs text-red-600 dark:text-red-500 mt-1 list-disc list-inside">
                {applyResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
