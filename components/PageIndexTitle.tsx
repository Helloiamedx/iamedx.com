"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Delay before index-page titles fade in after navigation */
export const PAGE_INDEX_TITLE_DELAY_MS = 1200;

type PageIndexTitleProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

/**
 * Shared Services / Projects / Thoughts index title —
 * reserved in layout immediately, revealed after 1.2s.
 */
export function PageIndexTitle({
  children,
  id,
  className,
}: PageIndexTitleProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setRevealed(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, PAGE_INDEX_TITLE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <h1
      id={id}
      className={cn(
        "svc-demo__hero-title",
        !revealed && "is-pending",
        className,
      )}
    >
      {children}
    </h1>
  );
}
