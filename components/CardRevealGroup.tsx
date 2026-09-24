"use client";

import { useRef, type ReactNode } from "react";
import { useAppleCardReveal } from "@/lib/appleCardReveal";

type CardRevealGroupProps = {
  /** Cards to reveal, matched inside this wrapper (e.g. `.project-showcase__item`) */
  selector: string;
  children: ReactNode;
};

/**
 * Wraps a card list so its items take the Apple entrance
 * (`lib/appleCardReveal.ts`) — a staggered rise as the group's top crosses 85%
 * of the viewport.
 *
 * A wrapper rather than a call inside the list components: `ProjectMasonry` and
 * `InsightMasonry` are shared with the index and detail pages, and only the
 * home page's cards should rise. The div is layout-transparent — it takes the
 * section's shell width and the list fills it, exactly as before.
 */
export function CardRevealGroup({ selector, children }: CardRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  useAppleCardReveal(ref, selector);

  return <div ref={ref}>{children}</div>;
}
