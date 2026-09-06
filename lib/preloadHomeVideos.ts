/**
 * Prefetch video bytes for the home intro gate.
 * Marks each src in tab memory so in-page players can skip stroke after unveil.
 */

"use client";

import { markVideoLoaded } from "@/lib/videoLoadMemory";

function preloadOne(src: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    video.setAttribute("playsinline", "");

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(safetyId);
      video.removeEventListener("canplaythrough", finish);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadeddata", onCanPlay);
      video.removeEventListener("error", finish);
      try {
        video.removeAttribute("src");
        video.load();
      } catch {
        /* ignore */
      }
      markVideoLoaded(src);
      resolve();
    };

    const onCanPlay = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        finish();
      }
    };

    video.addEventListener("canplaythrough", finish);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadeddata", onCanPlay);
    video.addEventListener("error", finish);

    const safetyId = window.setTimeout(finish, timeoutMs);

    try {
      video.src = src;
      video.load();
    } catch {
      finish();
    }
  });
}

/** Prefetch unique video URLs; always settles (errors / timeout count as done). */
export function preloadHomeVideos(
  srcs: string[],
  timeoutMs = 14000,
): Promise<void> {
  const unique = [...new Set(srcs.filter(Boolean))];
  if (unique.length === 0) return Promise.resolve();
  return Promise.all(unique.map((src) => preloadOne(src, timeoutMs))).then(
    () => undefined,
  );
}
