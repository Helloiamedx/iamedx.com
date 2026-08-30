import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** FNV-1a 32-bit — stable seed from a string. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 — deterministic 0…1 from a numeric seed. */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates copy — used for filter-result card order (including “all”). */
export function shuffleArray<T>(items: readonly T[]): T[] {
  return shuffleArrayWithSeed(items, Math.floor(Math.random() * 0xffffffff));
}

/**
 * Deterministic Fisher–Yates — same seed → same order.
 * Projects index: seed from visitor IP (stable forever for that IP).
 */
export function shuffleArrayWithSeed<T>(
  items: readonly T[],
  seed: number,
): T[] {
  const next = [...items];
  const random = mulberry32(seed >>> 0);
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/**
 * Seed for projects-index shuffle from visitor IP only.
 * Same IP → same order every visit; no DB / cookie / hour window needed.
 */
export function projectsOrderSeed(visitorIp: string): number {
  return hashString(`projects-order|${visitorIp}`);
}
