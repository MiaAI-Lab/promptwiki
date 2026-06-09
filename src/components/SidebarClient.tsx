"use client";

import { useState, createContext, useContext } from "react";

const SidebarContext = createContext<{
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}>({
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function SidebarClient({
  children,
  sidebar,
  rightSidebar,
  header,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  rightSidebar?: React.ReactNode;
  header?: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, openMobile, closeMobile, toggleMobile }}
    >
      {header}
      <div className="flex flex-1 min-w-0 overflow-x-hidden">
        {/* Desktop left sidebar */}
        <div id="desktop-sidebar" className="hidden lg:block flex-shrink-0">{sidebar}</div>

        {/* Mobile sidebar overlay */}
        <div
          id="mobile-sidebar-overlay"
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeMobile}
        />
        {/* Mobile sidebar drawer */}
        <div
          id="mobile-sidebar"
          className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-900 z-50 overflow-auto lg:hidden transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) closeMobile();
          }}
        >
          {sidebar}
        </div>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">{children}</main>

        {/* Right sidebar with collapse toggle */}
        {rightSidebar && (
          <div id="right-sidebar-wrapper" className="hidden xl:flex flex-shrink-0">
            {/* Toggle tab on the left edge */}
            <div className="sticky top-[57px] h-fit pt-5">
              <button
                id="right-sidebar-toggle"
                onClick={() => setRightSidebarOpen((v) => !v)}
                title={rightSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                className="flex items-center justify-center w-5 h-9 rounded-l-md bg-zinc-100 dark:bg-zinc-900 border border-r-0 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {rightSidebarOpen ? (
                    <polyline points="9 18 15 12 9 6" />
                  ) : (
                    <polyline points="15 18 9 12 15 6" />
                  )}
                </svg>
              </button>
            </div>
            {/* Sidebar content */}
            {rightSidebarOpen && (
              <div id="right-sidebar">{rightSidebar}</div>
            )}
          </div>
        )}
      </div>
    </SidebarContext.Provider>
  );
}
