import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getFavorites() {
  try {
    return await prisma.prompt.findMany({
      where: { favorite: true, deleted: false },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function FavoritesSidebar() {
  const favorites = await getFavorites();

  return (
    <aside id="favorites-sidebar" className="w-[calc(var(--spacing)_*_90)] bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-900 p-4 overflow-auto flex-shrink-0 h-[calc(100vh-57px)] sticky top-[57px]">
      <Link
        href="/?favorite=true"
        className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3 px-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
      >
        <span className="text-amber-400 dark:text-amber-500">★</span>
        Pinned
        <span className="text-zinc-300 dark:text-zinc-700 font-normal ml-0.5">
          ({favorites.length})
        </span>
      </Link>
      {favorites.length === 0 ? (
        <p id="favorites-empty" className="text-[12px] text-zinc-400 dark:text-zinc-600 px-2 leading-relaxed">
          Pin prompts you use often and they&apos;ll appear here.
        </p>
      ) : (
        <ul id="favorites-list" className="space-y-0.5">
          {favorites.map((prompt) => (
            <li key={prompt.id}>
              <Link
                href={`/prompts/${prompt.id}`}
                className="block text-[13px] text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/70 flex flex-col gap-0.5 transition-colors"
              >
                <span className="font-medium leading-snug line-clamp-2">{prompt.title}</span>
                {prompt.description && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-600 line-clamp-1">
                    {prompt.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
