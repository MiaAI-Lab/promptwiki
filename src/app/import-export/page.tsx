"use client";

import { useState, useRef, useEffect } from "react";

interface MdFile {
  originalName: string;
  title: string;
  content: string;
}

export default function ImportExportPage() {
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string>("");
  const [updateDuplicates, setUpdateDuplicates] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MD batch import state
  const [mdFiles, setMdFiles] = useState<MdFile[]>([]);
  const [mdCategory, setMdCategory] = useState<string>("");
  const [mdCustomCategory, setMdCustomCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [mdImportStatus, setMdImportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [mdImportResult, setMdImportResult] = useState<any>(null);
  const [mdImportError, setMdImportError] = useState<string>("");
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    window.location.href = "/api/export";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setImportStatus("error");
      setImportError("Please select a file to import.");
      return;
    }

    setImportStatus("loading");
    setImportError("");
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          updateDuplicates,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setImportStatus("error");
        setImportError(result.error || "Import failed");
        return;
      }

      setImportStatus("success");
      setImportResult(result);
    } catch (err: any) {
      setImportStatus("error");
      setImportError(err.message || "Failed to parse or import file");
    }
  };

  const handleMdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loaded: MdFile[] = [];
    for (const file of Array.from(files)) {
      const content = await file.text();
      const nameWithoutExt = file.name.replace(/\.md$/i, "");
      loaded.push({
        originalName: file.name,
        title: nameWithoutExt,
        content,
      });
    }
    loaded.sort((a, b) => a.title.localeCompare(b.title));
    setMdFiles(loaded);
    setMdImportStatus("idle");
    setMdImportResult(null);
    setMdImportError("");
  };

  const handleMdTitleChange = (index: number, newTitle: string) => {
    setMdFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, title: newTitle } : f))
    );
  };

  const handleMdRemove = (index: number) => {
    setMdFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMdImport = async () => {
    if (mdFiles.length === 0) {
      setMdImportStatus("error");
      setMdImportError("No files selected.");
      return;
    }

    const resolvedCategory =
      mdCategory === "__new__" ? mdCustomCategory.trim() : mdCategory || null;

    const hasEmptyTitle = mdFiles.some((f) => !f.title.trim());
    if (hasEmptyTitle) {
      setMdImportStatus("error");
      setMdImportError("All prompts must have a name.");
      return;
    }

    setMdImportStatus("loading");
    setMdImportError("");
    setMdImportResult(null);

    try {
      const prompts = mdFiles.map((f) => ({
        title: f.title.trim(),
        content: f.content,
        category: resolvedCategory || null,
      }));

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { prompts },
          updateDuplicates: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMdImportStatus("error");
        setMdImportError(result.error || "Import failed");
        return;
      }

      setMdImportStatus("success");
      setMdImportResult(result);
      setMdFiles([]);
      if (mdFileInputRef.current) mdFileInputRef.current.value = "";

      if (resolvedCategory && !categories.includes(resolvedCategory)) {
        setCategories((prev) => [...prev, resolvedCategory].sort());
      }
    } catch (err: any) {
      setMdImportStatus("error");
      setMdImportError(err.message || "Failed to import markdown files");
    }
  };

  return (
    <div id="import-export-page" className="max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6 sm:mb-8">
        Import / Export
      </h1>

      {/* Export Section */}
      <section id="export-section" className="mb-8 sm:mb-10">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Export
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Download all prompts as a JSON file. Use this to
          back up your data or migrate to another instance.
        </p>
        <button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-emerald-600/20 cursor-pointer"
        >
          Download Export (JSON)
        </button>
      </section>

      {/* Import Section */}
      <section id="import-section">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Import
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Upload a previously exported JSON file to restore prompts.
        </p>

        <div id="import-form" className="space-y-4">
          <div id="import-file-select">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-100 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-950 file:min-h-[44px]"
            />
            {fileName && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1.5">
                Selected: {fileName}
              </p>
            )}
          </div>

          <div id="import-duplicates-option" className="flex items-center gap-2.5 min-h-[44px]">
            <input
              type="checkbox"
              id="updateDuplicates"
              checked={updateDuplicates}
              onChange={(e) => setUpdateDuplicates(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500/40 w-4 h-4"
            />
            <label
              htmlFor="updateDuplicates"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Update existing prompts with matching titles
            </label>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            When unchecked, prompts with titles that already exist will be
            skipped. When checked, matching prompts will be updated with the
            imported data.
          </p>

          <button
            onClick={handleImport}
            disabled={importStatus === "loading"}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            {importStatus === "loading" ? "Importing..." : "Import"}
          </button>
        </div>

        {/* Import Results */}
        {importStatus === "error" && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">Import failed</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{importError}</p>
          </div>
        )}

        {importStatus === "success" && importResult && (
          <div className="mt-4 p-4 bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800 rounded-xl">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              Import complete
            </p>
            <ul className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 space-y-1">
              {importResult.imported > 0 && (
                <li>
                  <strong>{importResult.imported}</strong> prompt
                  {importResult.imported !== 1 ? "s" : ""} imported
                </li>
              )}
              {importResult.updated > 0 && (
                <li>
                  <strong>{importResult.updated}</strong> prompt
                  {importResult.updated !== 1 ? "s" : ""} updated
                </li>
              )}
              {importResult.skipped > 0 && (
                <li>
                  <strong>{importResult.skipped}</strong> prompt
                  {importResult.skipped !== 1 ? "s" : ""} skipped (duplicate)
                </li>
              )}
            </ul>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">Errors:</p>
                <ul className="text-xs text-red-600 dark:text-red-500 mt-1 list-disc list-inside">
                  {importResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Batch MD Import Section */}
      <section id="md-import-section" className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Import Markdown Files
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Select multiple .md files to import as prompts. Each file becomes one prompt,
          with the filename (without extension) as the default name.
        </p>

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select .md files
            </label>
            <input
              ref={mdFileInputRef}
              type="file"
              accept=".md,text/markdown"
              multiple
              onChange={handleMdFileChange}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-100 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-950 file:min-h-[44px]"
            />
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <select
              value={mdCategory}
              onChange={(e) => {
                setMdCategory(e.target.value);
                if (e.target.value !== "__new__") setMdCustomCategory("");
              }}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 min-h-[44px] cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new__">+ New category...</option>
            </select>
            {mdCategory === "__new__" && (
              <input
                type="text"
                value={mdCustomCategory}
                onChange={(e) => setMdCustomCategory(e.target.value)}
                placeholder="Enter new category name"
                className="mt-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            )}
          </div>

          {/* File list with editable names */}
          {mdFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Prompt names ({mdFiles.length} file{mdFiles.length !== 1 ? "s" : ""})
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                {mdFiles.map((file, i) => (
                  <div key={`${file.originalName}-${i}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={file.title}
                      onChange={(e) => handleMdTitleChange(i, e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleMdRemove(i)}
                      className="shrink-0 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleMdImport}
            disabled={mdImportStatus === "loading" || mdFiles.length === 0}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors min-h-[44px] shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            {mdImportStatus === "loading"
              ? "Importing..."
              : `Import ${mdFiles.length} file${mdFiles.length !== 1 ? "s" : ""}`}
          </button>
        </div>

        {/* MD Import Results */}
        {mdImportStatus === "error" && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">Import failed</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{mdImportError}</p>
          </div>
        )}

        {mdImportStatus === "success" && mdImportResult && (
          <div className="mt-4 p-4 bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800 rounded-xl">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              Import complete
            </p>
            <ul className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 space-y-1">
              {mdImportResult.imported > 0 && (
                <li>
                  <strong>{mdImportResult.imported}</strong> prompt
                  {mdImportResult.imported !== 1 ? "s" : ""} imported
                </li>
              )}
              {mdImportResult.skipped > 0 && (
                <li>
                  <strong>{mdImportResult.skipped}</strong> prompt
                  {mdImportResult.skipped !== 1 ? "s" : ""} skipped (duplicate)
                </li>
              )}
            </ul>
            {mdImportResult.errors && mdImportResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">Errors:</p>
                <ul className="text-xs text-red-600 dark:text-red-500 mt-1 list-disc list-inside">
                  {mdImportResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
