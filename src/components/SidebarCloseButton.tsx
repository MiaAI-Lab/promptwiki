"use client";

import { useSidebar } from "@/components/SidebarClient";

export default function SidebarCloseButton() {
  const { closeMobile } = useSidebar();

  return (
    <button
      onClick={closeMobile}
      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 active:text-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
      aria-label="Close menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
