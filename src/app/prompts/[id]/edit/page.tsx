import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PromptForm from "@/components/PromptForm";

export const dynamic = "force-dynamic";

async function getPrompt(id: string) {
  return prisma.prompt.findUnique({
    where: { id, deleted: false },
  });
}

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prompt = await getPrompt(id);

  if (!prompt) {
    notFound();
  }

  const initialData = {
    title: prompt.title,
    description: prompt.description || "",
    content: prompt.content,
    category: prompt.category || "",
    model: prompt.model || "",
    favorite: prompt.favorite,
  };

  const categories = await prisma.prompt.findMany({
    where: { deleted: false },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categoryList = categories
    .map((r) => r.category)
    .filter((c): c is string => c !== null);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/prompts/${id}`}
            className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 active:text-indigo-700 inline-flex items-center gap-1 min-h-[44px]"
          >
            ← Back to prompt
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Edit Prompt
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{prompt.title}</p>
      </div>
      <div id="prompt-form" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 pt-5 pb-0 sm:px-6 sm:pt-6 shadow-sm shadow-black/[0.04] dark:shadow-none">
        <PromptForm mode="edit" initialData={initialData} promptId={id} categories={categoryList} />
      </div>
    </div>
  );
}
