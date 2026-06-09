import Link from "next/link";

export default function NotFound() {
  return (
    <div id="not-found" className="min-h-[60vh] flex items-center justify-center">
      <div id="not-found-content" className="text-center">
        <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
        >
          ← Back to prompts
        </Link>
      </div>
    </div>
  );
}
