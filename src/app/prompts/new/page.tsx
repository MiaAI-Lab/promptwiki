import { prisma } from "@/lib/prisma";
import PromptForm from "@/components/PromptForm";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    const results = await prisma.prompt.findMany({
      where: { deleted: false },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return results
      .map((r) => r.category)
      .filter((c): c is string => c !== null);
  } catch {
    return [];
  }
}

export default async function NewPromptPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <a
            href="/"
            className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 active:text-indigo-700 inline-flex items-center gap-1 min-h-[44px]"
          >
            ← Back to prompts
          </a>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Create Prompt
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Add a new prompt to your collection
        </p>
      </div>
      <div id="prompt-form" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 pt-5 pb-0 sm:px-6 sm:pt-6 shadow-sm shadow-black/[0.04] dark:shadow-none">
        <PromptForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
