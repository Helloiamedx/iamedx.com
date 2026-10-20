"use client";

import { useRef, type ReactNode } from "react";
import { useAppleCardReveal } from "@/lib/appleCardReveal";

type CardRevealGroupProps = {
  /** Cards to reveal, matched inside this wrapper (e.g. `.project-showcase__item`) */
  selector: string;
  /**
   * Share of the viewport height a card's top must cross to fire (0–1).
   * Defaults to the engine's authored `0.85`. Raise it for lists that sit
   * below a tall lead, where 85% leaves a visible blank band before the
   * first row triggers.
   */
  trigger?: number;
  children: ReactNode;
};

/**
 * Wraps a card list so its items take the Apple entrance
 * (`lib/appleCardReveal.ts`) — a staggered rise as each card crosses 85% of
 * the viewport (or the `trigger` override).
 *
 * A wrapper rather than a call inside the list components: `ProjectMasonry` and
 * `InsightMasonry` are shared with the index and detail pages, and only the
 * home page's cards should rise. The div is layout-transparent — it takes the
 * section's shell width and the list fills it, exactly as before.
 */
export function CardRevealGroup({
  selector,
  trigger,
  children,
}: CardRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  useAppleCardReveal(ref, selector, { trigger });

  return <div ref={ref}>{children}</div>;
}
