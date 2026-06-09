import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPromptQuery } from "@/lib/queries";
import CopyButton from "@/components/CopyButton";
import PromptActions from "@/components/PromptActions";
import SortBar from "@/components/SortBar";
import ActiveFilters from "@/components/ActiveFilters";
import { PinButton } from "@/components/PinButton";

export const dynamic = "force-dynamic";

interface PromptList {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  favorite: boolean;
  updatedAt: Date;
}

async function getPrompts({
  query,
  category,
  favorite,
  sort,
}: {
  query?: string;
  category?: string;
  favorite?: string;
  sort?: string;
}): Promise<PromptList[]> {
  const { where, orderBy } = buildPromptQuery({
    deleted: false,
    favorite: favorite === "true" ? "true" : undefined,
    category,
    query,
    sort,
  });

  try {
    return await prisma.prompt.findMany({
      where,
      orderBy,
      take: 200,
    });
  } catch (err) {
    console.error("Failed to fetch prompts:", err);
    throw err;
  }
}

function EmptyState({
  hasFilters,
  query,
  category,
  favorite,
}: {
  hasFilters: boolean;
  query: string;
  category: string;
  favorite: string;
}) {
  if (hasFilters) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-zinc-400 dark:text-zinc-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
          No prompts found
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
          {query && (
            <span>
              No results for &ldquo;{query}&rdquo;. Try different keywords.
            </span>
          )}
          {category && !query && (
            <span>No prompts in category &ldquo;{category}&rdquo;.</span>
          )}
          {favorite === "true" && !query && (
            <span>You haven&apos;t favorited any prompts yet.</span>
          )}
        </p>
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
        >
          ← Clear filters
        </Link>
      </div>
    );
  }

  if (favorite === "true") {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
          <span className="text-2xl">☆</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
          No favorite prompts yet
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Favorite prompts you use often and they will appear here.
        </p>
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
        >
          ← Browse all prompts
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-16 sm:py-24">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-indigo-500 dark:text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
        No prompts yet
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Start building your prompt collection.
      </p>
      <Link
        href="/prompts/new"
        className="inline-flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-indigo-500/20"
      >
        + Create your first prompt
      </Link>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const favorite = typeof params.favorite === "string" ? params.favorite : "";
  const sort = typeof params.sort === "string" ? params.sort : "";

  const prompts = await getPrompts({ query, category, favorite, sort });

  const hasFilters = !!(query || category || favorite);

  const pageTitle = category
    ? category
    : favorite === "true"
      ? "Favorite Prompts"
      : "Prompts";
  const totalCount = prompts.length;

  function renderPromptCard(prompt: PromptList) {

    return (
      <div
        key={prompt.id}
        id={`prompt-card-${prompt.id}`}
        className="group relative bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-indigo-200/80 dark:hover:border-indigo-900/80 hover:shadow-lg hover:shadow-zinc-900/[0.07] dark:hover:shadow-none transition-all duration-200 min-w-0 w-full"
      >
        {/* Pinned amber accent stripe */}
        {prompt.favorite && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-transparent dark:from-amber-500 dark:via-amber-400" />
        )}

        <div className="p-4 sm:p-5">
          {/* Title + actions row */}
          <div id={`prompt-card-title-${prompt.id}`} className="flex items-start gap-2 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href={`/prompts/${prompt.id}${prompt.category ? `?category=${encodeURIComponent(prompt.category)}` : ""}`}
                  className="text-[16px] sm:text-[18px] font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 active:text-indigo-700 truncate transition-colors leading-snug after:absolute after:inset-0 after:z-0"
                >
                  {prompt.title}
                </Link>
                {prompt.favorite && (
                  <span className="text-amber-400 text-xs flex-shrink-0 leading-none" title="Favorited">
                    ★
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {new Date(prompt.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-[11px] text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {new Date(prompt.updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                {prompt.category && (
                  <>
                    <span className="text-[11px] text-zinc-300 dark:text-zinc-600">·</span>
                    <a
                      href={`/?category=${encodeURIComponent(prompt.category)}`}
                      className="text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 px-2 py-0.5 rounded-full transition-colors border border-indigo-100/80 dark:border-indigo-900/50 flex-shrink-0 relative z-10"
                    >
                      {prompt.category}
                    </a>
                  </>
                )}
              </div>
            </div>
            <div id={`prompt-card-actions-${prompt.id}`} className="flex items-center gap-0.5 flex-shrink-0 relative z-10">
              <CopyButton text={prompt.content} />
              <PromptActions
                prompt={{
                  id: prompt.id,
                  title: prompt.title,
                  favorite: prompt.favorite,
                }}
              />
              <Link
                href={`/prompts/${prompt.id}/edit`}
                className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 active:text-zinc-900 px-2 sm:px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors min-h-[44px] cursor-pointer"
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
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </div>
          </div>

          {/* Description */}
          {prompt.description && (
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="prompts-page">
      <div id="prompts-header" className="mb-6 sm:mb-8">
        <div id="prompts-header-row" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div id="prompts-title">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              {totalCount} prompt{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div id="prompts-actions" className="flex items-center gap-2 sm:gap-3">
            <SortBar />
            <Link
              href="/prompts/new"
              className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-[13px] font-medium px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-indigo-500/25"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Prompt
            </Link>
          </div>
        </div>
      </div>

      {(query || favorite) && <ActiveFilters />}

      {prompts.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          query={query}
          category={category}
          favorite={favorite}
        />
      ) : (
        <div id="prompts-list" className="grid gap-2 w-full min-w-0">
          {prompts.map(renderPromptCard)}
        </div>
      )}
    </div>
  );
}
