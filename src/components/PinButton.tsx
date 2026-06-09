"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PinButtonProps = {
  promptId: string;
  pinned: boolean;
  size?: "sm" | "md";
  showText?: boolean;
  className?: string;
};

export function PinButton({
  promptId,
  pinned,
  size = "md",
  showText = false,
  className = "",
}: PinButtonProps) {
  const router = useRouter();
  const [isPinned, setIsPinned] = useState(pinned);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (isLoading) return;

    const nextPinned = !isPinned;
    const previousPinned = isPinned;

    setIsPinned(nextPinned);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/prompts/${promptId}/${nextPinned ? "pin" : "unpin"}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update pinned state");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setIsPinned(previousPinned);
      setError("Could not update favorite state.");
    } finally {
      setIsLoading(false);
    }
  }

  const label = isPinned ? "Unfavorite prompt" : "Favorite prompt";

  return (
    <>
      <button
      type="button"
      onClick={() => {
        setError(null);
        handleToggle();
      }}
      disabled={isLoading}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-lg border transition min-h-[44px] cursor-pointer",
        "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
        "disabled:pointer-events-none disabled:opacity-60",
        size === "sm" ? "w-[44px] px-2 text-sm" : "px-3 text-sm",
        isPinned ? "text-amber-500 dark:text-amber-400" : "",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">{isPinned ? "★" : "☆"}</span>
      {showText ? <span>{isPinned ? "Favorited" : "Favorite"}</span> : null}
      </button>
      {error && <span id={`pin-error-${promptId}`} className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</span>}
    </>);
}
