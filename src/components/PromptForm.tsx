"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface PromptFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  model: string;
  favorite: boolean;
}

interface PromptFormProps {
  mode: "create" | "edit";
  initialData?: PromptFormData;
  promptId?: string;
  categories?: string[];
}

export default function PromptForm({
  mode,
  initialData,
  promptId,
  categories,
}: PromptFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PromptFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    model: initialData?.model || "",
    favorite: initialData?.favorite || false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contentView, setContentView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        content: initialData.content || "",
        category: initialData.category || "",
        model: initialData.model || "",
        favorite: initialData.favorite || false,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const doSubmit = async () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!formData.content.trim()) {
      setError("Content is required.");
      return;
    }

    setLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/prompts"
          : `/api/prompts/${promptId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const result = await response.json();
      router.push(`/prompts/${result.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20 sm:pb-0">
      {error && (
        <div id="form-error" className="bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div id="form-title">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 min-h-[48px] transition-all"
          placeholder="e.g. Code Review"
          required
        />
      </div>

      {/* Description */}
      <div id="form-description">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 min-h-[48px] transition-all"
          placeholder="Brief description of this prompt"
        />
      </div>

      {/* Category + Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 min-h-[48px] transition-all"
            placeholder="e.g. Code Quality"
            list="categories-list"
          />
          {categories && (
            <datalist id="categories-list">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Model / Provider
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 min-h-[48px] transition-all"
            placeholder="e.g. GPT-4, Claude"
            list="models-list"
          />
          <datalist id="models-list">
            <option value="GPT-4" />
            <option value="GPT-5" />
            <option value="Claude" />
            <option value="Gemini" />
            <option value="Qwen" />
            <option value="DeepSeek" />
            <option value="Local LLM" />
          </datalist>
        </div>
      </div>

      {/* Prompt Content — full width, tall */}
      <div id="form-content">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prompt Content <span className="text-red-500">*</span>
          </label>
          <div id="content-view-toggle" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setContentView("edit")}
              className={`text-sm px-3 py-1 rounded-full transition-colors min-h-[44px] cursor-pointer ${
                contentView === "edit"
                  ? "bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-500/20"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setContentView("preview")}
              className={`text-sm px-3 py-1 rounded-full transition-colors min-h-[44px] cursor-pointer ${
                contentView === "preview"
                  ? "bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-500/20"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        {contentView === "edit" ? (
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={22}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 min-h-[300px] sm:min-h-[650px] transition-all resize-y"
            placeholder="Write your prompt here..."
            required
          />
        ) : (
          <div id="content-preview" className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 min-h-[300px] sm:min-h-[650px] overflow-auto bg-zinc-50 dark:bg-zinc-900">
            <MarkdownRenderer content={formData.content} />
          </div>
        )}
      </div>

      {/* Favorite — mobile only (desktop version is in form-actions below) */}
      <div id="form-favorite-mobile" className="sm:hidden flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          name="favorite"
          id="favorite-mobile"
          checked={formData.favorite}
          onChange={handleChange}
          className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 cursor-pointer"
        />
        <label htmlFor="favorite-mobile" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          Mark as favorite
        </label>
      </div>

      {/* Bottom action row — desktop only */}
      <div id="form-actions" className="hidden sm:flex items-center justify-between gap-4 pt-1 pb-2">
        <div id="form-favorite" className="flex items-center gap-2.5">
          <input
            type="checkbox"
            name="favorite"
            id="favorite"
            checked={formData.favorite}
            onChange={handleChange}
            className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="favorite" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            Mark as favorite
          </label>
        </div>

        <div id="form-submit" className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 px-4 py-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Create Prompt"
                : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Sticky save bar — mobile only */}
      <div id="mobile-save-bar" className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-900 p-3 flex gap-3 z-30">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 px-4 py-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[48px] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={doSubmit}
          disabled={loading}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-3 rounded-full transition-colors min-h-[48px] shadow-sm shadow-indigo-500/20 cursor-pointer"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Prompt"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
