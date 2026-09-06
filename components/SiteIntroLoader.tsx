"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SITE_MARK_BOTTOM_D,
  SITE_MARK_TOP_D,
} from "@/lib/siteMark";
import {
  setHomeMediaExpected,
  whenHomeMediaReady,
} from "@/lib/homeMediaGate";
import {
  HERO_VIDEO_PLAYABLE_ATTR,
  whenHeroFlag,
} from "@/lib/heroSequence";
import { unlockVideosAfterHero } from "@/lib/videoLoadQueue";

type IntroLanguage = {
  lang: string;
  text: string;
};

const CONFIG = {
  minimumDuration: 3200,
  /** One full outline draw before reset / next loop */
  strokeCycleDuration: 3000,
  /** Brief hold at full outline after a cycle ends once resources are ready */
  beforeFillPause: 80,
  fillDuration: 850,
  completedHold: 400,
  revealDuration: 900,
  /** Hold each greeting longer — language switches read as deliberate */
  englishDuration: 3200,
  otherLanguageDuration: 2600,
  /** Soft crossfade only — no slide */
  textFadeMs: 360,
  /** Greeting starts this many ms after the mark begins */
  textStartDelayMs: 480,
} as const;

const LANGUAGES: IntroLanguage[] = [
  { lang: "en", text: "HEY, I'M EDWARD XU" },
  { lang: "fr", text: "SALUT, MOI C’EST EDWARD XU" },
  { lang: "ko", text: "안녕하세요, EDWARD XU입니다" },
  { lang: "ja", text: "こんにちは、EDWARD XUです。" },
  { lang: "zh-Hans", text: "嗨，我是 EDWARD XU" },
];

/** Persist across visits so return / back navigation skips the wait. */
export const INTRO_SEEN_KEY = "edx-intro-seen-v2";

function hasSeenIntro() {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function ease(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

/** Outline draw 0 → 1 within a cycle. Loop resets instantly and redraws. */
function strokeDrawProgress(localMs: number, cycleMs: number) {
  return ease(clamp(localMs / cycleMs));
}

function languageAt(elapsed: number) {
  const cycleDuration =
    CONFIG.englishDuration +
    (LANGUAGES.length - 1) * CONFIG.otherLanguageDuration;
  const position = elapsed % cycleDuration;

  if (position < CONFIG.englishDuration) {
    return {
      index: 0,
      local: position,
      duration: CONFIG.englishDuration,
    };
  }

  const remaining = position - CONFIG.englishDuration;
  return {
    index: 1 + Math.floor(remaining / CONFIG.otherLanguageDuration),
    local: remaining % CONFIG.otherLanguageDuration,
    duration: CONFIG.otherLanguageDuration,
  };
}

declare global {
  interface Window {
    edxLoader?: {
      complete: () => void;
      destroy: () => void;
    };
    EDX_LOADER_MANUAL?: boolean;
  }
}

/**
 * Home-only first-visit intro (also used by `/dev/intro-test` with `preview`).
 * Portaled to `document.body` so header / footer / blend modes can’t peek through.
 * Opaque veil until fill + reveal — only the mark + greeting are visible.
 * Outline loops until resources are ready, then fill and unveil.
 */
export function SiteIntroLoader({
  preloadVideos = [],
  preview = false,
  previewReadyAfterMs = 7500,
  onPreviewDone,
}: {
  /** Hero + cover / footer video srcs that mount on the home page */
  preloadVideos?: string[];
  /** Dev preview: always play, never read/write localStorage */
  preview?: boolean;
  /** Preview only — when to treat resources as ready (then finish current stroke → fill) */
  previewReadyAfterMs?: number;
  onPreviewDone?: () => void;
}) {
  /* Always true on SSR + first client paint — reading localStorage here
   * caused hydration mismatch when the visit was already marked seen. */
  const [active, setActive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const preloadVideosRef = useRef(preloadVideos);
  preloadVideosRef.current = preloadVideos;
  const previewRef = useRef(preview);
  previewRef.current = preview;
  const onPreviewDoneRef = useRef(onPreviewDone);
  onPreviewDoneRef.current = onPreviewDone;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    /* Back / bfcache / soft return — never replay once seen (skip in preview) */
    const skipIfSeen = () => {
      if (previewRef.current) return false;
      if (!hasSeenIntro()) return false;
      document.documentElement.classList.remove("edx-loading");
      setActive(false);
      return true;
    };

    if (skipIfSeen()) return;

    document.documentElement.classList.add("edx-loading");

    const onPageShow = (event: PageTransitionEvent) => {
      if (previewRef.current) return;
      if (event.persisted || hasSeenIntro()) {
        document.documentElement.classList.remove("edx-loading");
        setActive(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);

    const loader = loaderRef.current;
    const brand = brandRef.current;
    const fill = fillRef.current;
    const greeting = greetingRef.current;
    const outlineGroup = outlineGroupRef.current;
    if (!loader || !brand || !fill || !greeting || !outlineGroup) {
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    /*
     * Do NOT mark localStorage here — React Strict Mode remount would then
     * skip the real play. Mark on finish + pagehide (leave mid-intro).
     */
    const onPageHide = () => {
      if (!previewRef.current) markIntroSeen();
    };
    window.addEventListener("pagehide", onPageHide);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    outlineGroup.replaceChildren();
    const outlines = [SITE_MARK_BOTTOM_D, SITE_MARK_TOP_D].map((d) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      path.setAttribute("pathLength", "1000");
      path.setAttribute("class", "edx-loader__outline");
      outlineGroup.appendChild(path);
      return path;
    });

    loader.style.opacity = "1";
    brand.style.opacity = "1";
    greeting.style.opacity = "0";
    greeting.style.transform = "";

    const startedAt = performance.now();
    let readyAt = Infinity;
    let frameId = 0;
    let safetyId = 0;
    let previewReadyId = 0;
    let aborted = false;
    let finished = false;
    let currentLanguage = -1;

    function finish() {
      if (aborted || finished) return;
      finished = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyId);
      window.clearTimeout(previewReadyId);
      if (!previewRef.current) markIntroSeen();
      document.documentElement.classList.remove("edx-loading");
      unlockVideosAfterHero();
      setActive(false);
      if (previewRef.current) onPreviewDoneRef.current?.();
    }

    function updateGreeting(elapsed: number, revealStart: number) {
      /* Closing: leave text as-is — whole brand fades with the veil */
      if (elapsed >= revealStart || reducedMotion.matches) {
        if (currentLanguage < 0) {
          const language = LANGUAGES[0];
          greeting!.textContent = language.text;
          greeting!.lang = language.lang;
          currentLanguage = 0;
        }
        greeting!.style.opacity = "1";
        greeting!.style.transform = "";
        return;
      }

      /* Mark draws first; greeting waits, then cycles */
      if (elapsed < CONFIG.textStartDelayMs) {
        greeting!.style.opacity = "0";
        greeting!.style.transform = "";
        return;
      }

      const item = languageAt(elapsed - CONFIG.textStartDelayMs);
      const fade = CONFIG.textFadeMs;
      const enter = ease(item.local / fade);
      const exit = ease((item.duration - item.local) / fade);
      const opacity = Math.min(enter, exit);

      if (currentLanguage !== item.index) {
        const language = LANGUAGES[item.index];
        greeting!.textContent = language.text;
        greeting!.lang = language.lang;
        currentLanguage = item.index;
      }

      greeting!.style.opacity = String(opacity);
      greeting!.style.transform = "";
    }

    function tick(now: number) {
      if (aborted || finished) return;

      const elapsed = now - startedAt;
      const reduce = reducedMotion.matches;
      const cycleMs = CONFIG.strokeCycleDuration;

      /*
       * Ready → wait out minimum duration → finish the *current* stroke cycle
       * (never cut mid-draw; never start another loop after that).
       */
      const gateAt = Number.isFinite(readyAt)
        ? Math.max(CONFIG.minimumDuration, readyAt)
        : Infinity;
      const strokeDoneAt = Number.isFinite(gateAt)
        ? Math.ceil(gateAt / cycleMs) * cycleMs
        : Infinity;
      const fillStart = strokeDoneAt + CONFIG.beforeFillPause;
      const fillEnd = fillStart + CONFIG.fillDuration;
      const revealStart = fillEnd + CONFIG.completedHold;
      const revealDuration = reduce ? 180 : CONFIG.revealDuration;
      const reveal = ease((elapsed - revealStart) / revealDuration);
      const fillProgress = ease(
        (elapsed - fillStart) / CONFIG.fillDuration,
      );

      let traceProgress: number;
      if (reduce) {
        traceProgress = 1;
      } else if (elapsed >= strokeDoneAt) {
        /* Hold full outline for the beat before fill */
        traceProgress = 1;
      } else {
        const local = elapsed % cycleMs;
        traceProgress = strokeDrawProgress(local, cycleMs);
      }

      outlines.forEach((path, index) => {
        const stagger = index === 0 ? 0.12 : 0;
        const segment = reduce
          ? 1
          : clamp((traceProgress - stagger) / (1 - stagger));
        path.style.strokeDashoffset = String(1000 * (1 - segment));
        path.style.opacity = String(
          (segment > 0 ? 1 : 0) * (1 - fillProgress),
        );
      });

      fill!.style.opacity = String(fillProgress);
      updateGreeting(elapsed, revealStart);

      const brandExit = ease(
        (elapsed - revealStart) / (reduce ? 150 : 500),
      );
      brand!.style.opacity = String(1 - brandExit);
      loader!.style.opacity = String(1 - reveal);
      loader!.style.pointerEvents = reveal > 0.02 ? "none" : "auto";

      if (elapsed >= revealStart + revealDuration) {
        finish();
        return;
      }

      frameId = requestAnimationFrame(tick);
    }

    const api = {
      complete() {
        if (aborted || finished || Number.isFinite(readyAt)) return;
        readyAt = performance.now() - startedAt;
      },
      destroy() {
        finish();
      },
    };
    window.edxLoader = api;

    tick(performance.now());

    safetyId = window.setTimeout(() => {
      api.complete();
    }, 22000);

    if (previewRef.current) {
      /* Preview: no home media gates — loop for a bit, then fill + unveil */
      previewReadyId = window.setTimeout(() => {
        api.complete();
      }, previewReadyAfterMs);
    } else if (!window.EDX_LOADER_MANUAL) {
      const pageReady =
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              window.addEventListener("load", () => resolve(), { once: true });
            });
      const fontsReady = document.fonts
        ? document.fonts.ready
        : Promise.resolve();

      /* In-page players (hero, insight covers, footer) report here while edx-loading */
      setHomeMediaExpected(preloadVideosRef.current);

      const gates: Promise<unknown>[] = [pageReady, fontsReady];
      gates.push(
        whenHeroFlag(HERO_VIDEO_PLAYABLE_ATTR, { timeoutMs: 20000 }),
      );
      gates.push(whenHomeMediaReady(20000));

      Promise.allSettled(gates).then(() => {
        if (aborted || finished) return;
        api.complete();
      });
    }

    return () => {
      aborted = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyId);
      window.clearTimeout(previewReadyId);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      if (window.edxLoader === api) {
        delete window.edxLoader;
      }
    };
  }, [mounted, previewReadyAfterMs]);

  if (!active || !mounted) return null;

  return createPortal(
    <div
      ref={loaderRef}
      className="edx-loader"
      id="edx-loader"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div ref={brandRef} className="edx-loader__brand">
        <svg
          className="edx-loader__logo"
          viewBox="0 0 500 500"
          aria-hidden="true"
        >
          <g ref={fillRef} className="edx-loader__fill">
            <path d={SITE_MARK_BOTTOM_D} />
            <path d={SITE_MARK_TOP_D} />
          </g>
          <g ref={outlineGroupRef} id="edx-loader-outlines" />
        </svg>
        <div className="edx-loader__greeting" aria-hidden="true">
          <span ref={greetingRef} id="edx-loader-greeting" lang="en">
            HEY, I&apos;M EDWARD XU
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
