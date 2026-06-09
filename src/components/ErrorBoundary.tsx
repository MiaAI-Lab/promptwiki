"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div id="error-boundary" className="min-h-screen bg-background flex items-center justify-center p-6">
      <div id="error-content" className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center shadow-xl shadow-black/[0.06] dark:shadow-none">
        <div id="error-icon" className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors shadow-sm shadow-indigo-500/20 cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
