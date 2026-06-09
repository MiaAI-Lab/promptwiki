"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface PromptContentRendererProps {
  content: string;
}

export default function PromptContentRenderer({
  content,
}: PromptContentRendererProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");

  return (
    <div id="prompt-content-renderer">
      <div id="content-view-mode" className="flex items-center gap-1 mb-4">
        <button
          type="button"
          onClick={() => setViewMode("rendered")}
          className={`text-sm px-3.5 py-1.5 rounded-full transition-colors min-h-[44px] cursor-pointer ${
            viewMode === "rendered"
              ? "bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-500/20"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          Rendered
        </button>
        <button
          type="button"
          onClick={() => setViewMode("raw")}
          className={`text-sm px-3.5 py-1.5 rounded-full transition-colors min-h-[44px] cursor-pointer ${
            viewMode === "raw"
              ? "bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-500/20"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          Raw
        </button>
      </div>
      {viewMode === "rendered" ? (
        <MarkdownRenderer content={content} />
      ) : (
        <pre id="content-raw" className="whitespace-pre-wrap overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 text-sm font-mono text-zinc-800 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 max-h-[600px] overflow-auto break-words">
          {content}
        </pre>
      )}
    </div>
  );
}
