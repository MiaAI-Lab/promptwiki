import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import SidebarCloseButton from "@/components/SidebarCloseButton";
import CategoryList from "@/components/CategoryList";

interface SidebarData {
  categories: string[];
  categoryCounts: Record<string, number>;
  pinnedCount: number;
}

async function getSidebarData(): Promise<SidebarData> {
  try {
    const [categoryGroups, pinnedCount] = await Promise.all([
      prisma.prompt.groupBy({
        by: ["category"],
        where: { deleted: false, category: { not: null } },
        _count: { id: true },
        orderBy: { category: "asc" },
      }),
      prisma.prompt.count({
        where: {
          favorite: true,
          deleted: false,
        },
      }),
    ]);

    const categoryCounts: Record<string, number> = {};
    const categories: string[] = [];
    for (const g of categoryGroups) {
      if (g.category) {
        categories.push(g.category);
        categoryCounts[g.category] = g._count.id;
      }
    }

    return { categories, categoryCounts, pinnedCount };
  } catch {
    return {
      categories: [],
      categoryCounts: {},
      pinnedCount: 0,
    };
  }
}

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto text-[11px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-full leading-none">
      {count}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1.5 px-2 select-none">
      {children}
    </h3>
  );
}

const navItemBase =
  "flex items-center gap-2.5 text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 px-2 py-[7px] rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/70 transition-colors w-full";

export default async function Sidebar() {
  const data = await getSidebarData();

  return (
    <aside
      id="sidebar"
      className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-900 p-4 overflow-auto flex-shrink-0 h-[calc(100vh-57px)] sticky top-[57px]"
    >
      {/* Mobile-only header row with close button */}
      <div className="lg:hidden flex items-center justify-between h-[57px] -mx-4 px-3 mb-4 border-b border-zinc-200 dark:border-zinc-900">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 px-1">Menu</span>
        <SidebarCloseButton />
      </div>

      <div id="sidebar-search" className="mb-5">
        <Suspense
          fallback={
            <input
              placeholder="Search prompts..."
              className="w-full text-sm border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 rounded-lg px-3 py-2.5"
              disabled
            />
          }
        >
          <SearchBar />
        </Suspense>
      </div>

      <nav id="sidebar-nav" className="space-y-5">
        {/* Views */}
        <div id="sidebar-views">
          <SectionLabel>Views</SectionLabel>
          <ul id="sidebar-views-list" className="space-y-0.5">
            <li>
              <Link href="/" className={navItemBase}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-zinc-400 dark:text-zinc-500"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="12" y2="17" />
                </svg>
                All Prompts
              </Link>
            </li>
            <li>
              <Link href="/?favorite=true" className={navItemBase}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-amber-400 dark:text-amber-500"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Pinned
                <NavBadge count={data.pinnedCount} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        {data.categories.length > 0 && (
          <div id="sidebar-categories">
            <SectionLabel>Categories</SectionLabel>
            <CategoryList categories={data.categories} categoryCounts={data.categoryCounts} />
          </div>
        )}

        {/* Tools */}
        <div id="sidebar-tools">
          <SectionLabel>Tools</SectionLabel>
          <ul className="space-y-0.5">
            <li>
              <Link href="/import-export" className={navItemBase}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-zinc-400 dark:text-zinc-500"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import / Export
              </Link>
            </li>
            <li>
              <Link href="/find-replace" className={navItemBase}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-zinc-400 dark:text-zinc-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Find &amp; Replace
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
