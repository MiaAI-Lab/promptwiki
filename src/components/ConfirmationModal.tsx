"use client";

import { useState, useEffect, useCallback } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    setShow(false);
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    setShow(false);
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  const variantStyles = {
    danger: {
      confirmBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      confirmDisabled: "bg-red-400",
    },
    warning: {
      confirmBg: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
      confirmDisabled: "bg-amber-400",
    },
    info: {
      confirmBg: "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500",
      confirmDisabled: "bg-indigo-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div id="confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
      />
      <div id="confirmation-modal-content" className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
        <div id="confirmation-modal-buttons" className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 active:text-zinc-900 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors disabled:opacity-50 min-h-[48px] cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto text-sm text-white font-medium px-5 py-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 min-h-[48px] cursor-pointer ${styles.confirmBg} ${isLoading ? styles.confirmDisabled : ""}`}
          >
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
