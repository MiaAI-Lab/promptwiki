import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CopyButton from "@/components/CopyButton";
import PromptActions from "@/components/PromptActions";
import PromptContentRenderer from "@/components/PromptContentRenderer";
import { PinButton } from "@/components/PinButton";

export const dynamic = "force-dynamic";

async function getPrompt(id: string) {
  return prisma.prompt.findUnique({
    where: { id, deleted: false },
  });
}

export default async function PromptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const paramsObj = await searchParams;
  const category = typeof paramsObj.category === "string" ? paramsObj.category : "";
  const prompt = await getPrompt(id);

  if (!prompt || prompt.deleted) {
    notFound();
  }

  const backHref = category ? `/?category=${encodeURIComponent(category)}` : "/";
  const backLabel = category ? `← Back to ${category}` : "← Back to prompts";

  return (
    <div id="prompt-detail" className="pb-20 sm:pb-0">
      <div id="prompt-header" className="mb-6 sm:mb-8">
        <div id="prompt-back-link" className="flex items-center gap-2 mb-3">
          <Link
            href={backHref}
            className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 active:text-indigo-700 inline-flex items-center gap-1 min-h-[44px]"
          >
            {backLabel}
          </Link>
        </div>
        <div id="prompt-title-row" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div id="prompt-title-group" className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {prompt.title}
            </h1>
            {prompt.favorite && (
              <span className="text-amber-500 flex-shrink-0" title="Favorite">
                ★
              </span>
            )}
          </div>
          {/* Desktop action buttons */}
          <div id="prompt-desktop-actions" className="hidden sm:flex items-center gap-2 flex-wrap">
            <PinButton promptId={prompt.id} pinned={prompt.favorite} showText />
            <CopyButton text={prompt.content} size="md" />
            <PromptActions prompt={prompt} />
            <Link
              href={`/prompts/${id}/edit`}
              className="text-sm bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-full transition-colors min-h-[44px] inline-flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
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
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Edit
            </Link>
          </div>
        </div>
        {prompt.description && (
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-sm sm:text-base">
            {prompt.description}
          </p>
        )}
      </div>

      {/* Mobile action bar */}
      <div id="prompt-mobile-actions" className="flex sm:hidden items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        <PinButton promptId={prompt.id} pinned={prompt.favorite} showText />
        <CopyButton text={prompt.content} size="md" />
        <Link
          href={`/prompts/${id}/edit`}
          className="text-sm bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-full transition-colors min-h-[44px] inline-flex items-center gap-1.5 flex-shrink-0 shadow-sm shadow-indigo-500/20"
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
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          Edit
        </Link>
        <PromptActions prompt={prompt} />
      </div>

      <div id="prompt-content" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 shadow-sm shadow-black/[0.04] dark:shadow-none">
        <h2 className="text-xs font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-4">
          Prompt Content
        </h2>
        <PromptContentRenderer content={prompt.content} />
      </div>

      <div id="prompt-meta-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div id="prompt-details" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm shadow-black/[0.04] dark:shadow-none">
          <h3 className="text-xs font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-4">
            Details
          </h3>
          <dl className="space-y-3">
            {prompt.category && (
              <div>
                <dt className="text-xs text-zinc-500 dark:text-zinc-500">Category</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-200">{prompt.category}</dd>
              </div>
            )}
            {prompt.model && (
              <div>
                <dt className="text-xs text-zinc-500 dark:text-zinc-500">Model</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-200">{prompt.model}</dd>
              </div>
            )}
          </dl>
        </div>

        <div id="prompt-dates" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm shadow-black/[0.04] dark:shadow-none">
          <h3 className="text-xs font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-4">
            Dates
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-500">Created</dt>
              <dd className="text-sm text-zinc-900 dark:text-zinc-200">
                {new Date(prompt.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-500">Updated</dt>
              <dd className="text-sm text-zinc-900 dark:text-zinc-200">
                {new Date(prompt.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>



    </div>
  );
}
