"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface PromptActionsProps {
  prompt: {
    id: string;
    title: string;
    favorite: boolean;
  };
}

export default function PromptActions({ prompt }: PromptActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: string;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: "",
    variant: "danger",
  });

  const handleAction = async (action: string, url: string) => {
    setLoading(action);
    setError(null);
    try {
      const response = await fetch(url, {
        method: action === "delete" ? "DELETE" : "POST",
      });
      if (!response.ok) throw new Error("Action failed");
      router.refresh();
    } catch {
      setError("Action failed. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(null);
    }
  };

  const openModal = (
    action: string,
    title: string,
    message: string,
    variant: "danger" | "warning" | "info" = "danger"
  ) => {
    setModal({ isOpen: true, title, message, action, variant });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const confirmModal = async () => {
    const { action } = modal;
    setModal((prev) => ({ ...prev, isOpen: false }));

    if (action === "delete") {
      await handleAction("delete", `/api/prompts/${prompt.id}`);
    } else if (action === "duplicate") {
      await handleAction("duplicate", `/api/prompts/${prompt.id}/duplicate`);
    }
  };

  const isDisabled = loading !== null;

  return (
    <>
      <div id="prompt-actions" className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() =>
            openModal(
              "duplicate",
              "Duplicate Prompt",
              `Create a copy of "${prompt.title}"?`,
              "info"
            )
          }
          disabled={isDisabled}
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 active:text-indigo-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
          title="Duplicate"
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
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span className="hidden sm:inline">
            {loading === "duplicate" ? "..." : "Duplicate"}
          </span>
        </button>

        <button
          onClick={() =>
            openModal(
              "delete",
              "Delete Prompt",
              `Permanently delete "${prompt.title}"? This cannot be undone.`
            )
          }
          disabled={isDisabled}
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 active:text-red-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
          title="Delete"
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
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          <span className="hidden sm:inline">
            {loading === "delete" ? "..." : "Delete"}
          </span>
        </button>
      </div>

      {error && (
        <div id="prompt-actions-error" className="text-xs text-red-600 mt-1">{error}</div>
      )}

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.action === "delete" ? "Delete" : "Duplicate"}
        variant={modal.variant}
        onConfirm={confirmModal}
        onCancel={closeModal}
        isLoading={loading === modal.action}
      />
    </>
  );
}
