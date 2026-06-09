"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  className = "",
  size = "sm",
}: {
  text: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts (HTTP)
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.warn("Copy failed — clipboard API unavailable:", fallbackErr);
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "text-xs px-1.5 py-1"
      : "text-sm px-3 py-1.5";

  if (copied) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium ${sizeClasses} ${className}`}
      >
        ✓ Copied!
      </span>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 active:text-indigo-700 transition-colors rounded-lg cursor-pointer ${
        size === "md"
          ? "px-3 py-2 text-sm font-medium min-h-[44px]"
          : "px-2 py-2 text-sm min-h-[44px]"
      } ${className}`}
      title="Copy to clipboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
      <span className="hidden sm:inline">Copy</span>
    </button>
  );
}
