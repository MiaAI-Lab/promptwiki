"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";

interface CategoryInfo {
  name: string;
  count: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    categoryName: string;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    categoryName: "",
    variant: "danger",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const [namesRes, promptsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/prompts"),
      ]);
      const names: string[] = await namesRes.json();
      const prompts: any[] = await promptsRes.json();

      const counts: Record<string, number> = {};
      for (const p of prompts) {
        if (p.category) {
          counts[p.category] = (counts[p.category] || 0) + 1;
        }
      }

      setCategories(
        names.map((name) => ({
          name,
          count: counts[name] || 0,
        }))
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const startEditing = (name: string) => {
    setEditingId(name);
    setEditValue(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleRename = async (oldName: string) => {
    const newName = editValue.trim();
    if (!newName || newName === oldName) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", oldName, newName }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.name === oldName ? { ...c, name: newName } : c))
        );
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to rename");
      }
    } catch {
      // ignore
    }
    setSaving(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    const deletedName = modal.categoryName;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", name: deletedName }),
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.name !== deletedName));
        router.refresh();
      }
    } catch {
      // ignore
    }
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div id="settings-page" className="max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6 sm:mb-8">
        Settings
      </h1>

      <section id="settings-categories">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Categories
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Rename or delete categories. Deleting a category removes it from all
          prompts (they become uncategorized).
        </p>

        {loading ? (
          <div className="text-sm text-zinc-400 dark:text-zinc-600 py-4">
            Loading...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-zinc-400 dark:text-zinc-600 py-4">
            No categories yet. Create one by adding a category when creating or
            editing a prompt.
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {categories.map((cat) => (
                <li
                  key={cat.name}
                  id={`settings-category-${cat.name}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {editingId === cat.name ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.name);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        onBlur={() => handleRename(cat.name)}
                        className="flex-1 text-sm border border-indigo-400 dark:border-indigo-700 dark:bg-zinc-900 dark:text-zinc-200 rounded-lg px-2 py-1.5 outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-zinc-800 dark:text-zinc-200">
                          {cat.name}
                        </span>
                        <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-600">
                          {cat.count} prompt{cat.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(cat.name)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                          title="Rename"
                          aria-label={`Rename "${cat.name}"`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setModal({
                              isOpen: true,
                              title: "Delete Category",
                              message: `Remove "${cat.name}" from all ${cat.count} prompt${cat.count !== 1 ? "s" : ""}? This cannot be undone.`,
                              categoryName: cat.name,
                              variant: "danger",
                            })
                          }
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                          title="Delete"
                          aria-label={`Delete "${cat.name}"`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel="Delete"
        variant={modal.variant}
        onConfirm={handleDelete}
        onCancel={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
