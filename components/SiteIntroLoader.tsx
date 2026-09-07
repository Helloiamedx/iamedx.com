"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SITE_MARK_BOTTOM_D,
  SITE_MARK_TOP_D,
} from "@/lib/siteMark";
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
  /** One full outline draw before reset / next loop (while still waiting) */
  strokeCycleDuration: 3000,
  /** Brief hold at full outline after resources are ready */
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
 * Home intro — plays on **every** homepage load (hard refresh, client nav, bfcache).
 * Fast when hero/fonts are warm; slower on cold network. No localStorage skip.
 * Portaled to `document.body`. Outline loops until home hero is playable (+ fonts),
 * then fill and unveil. Below-fold clips are not gates.
 */
export function SiteIntroLoader({
  preview = false,
  previewReadyAfterMs = 7500,
  onPreviewDone,
}: {
  /** Dev preview: always play (same as production now) */
  preview?: boolean;
  /** Preview only — when to treat resources as ready (then finish current stroke → fill) */
  previewReadyAfterMs?: number;
  onPreviewDone?: () => void;
}) {
  const [active, setActive] = useState(true);
  const [mounted, setMounted] = useState(false);
  /** Bumps to replay after bfcache restore */
  const [playKey, setPlayKey] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const previewRef = useRef(preview);
  previewRef.current = preview;
  const onPreviewDoneRef = useRef(onPreviewDone);
  onPreviewDoneRef.current = onPreviewDone;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.add("edx-loading");
    setActive(true);

    const onPageShow = (event: PageTransitionEvent) => {
      if (previewRef.current) return;
      /* Back/forward cache — remount the animation */
      if (event.persisted) {
        document.documentElement.classList.add("edx-loading");
        setActive(true);
        setPlayKey((key) => key + 1);
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
       * Ready as soon as hero (+ fonts) report — no artificial minimum wait.
       * Snap outline to full and start fill; don’t wait out the current stroke loop.
       */
      const strokeDoneAt = Number.isFinite(readyAt) ? readyAt : Infinity;
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
      const fontsReady = document.fonts
        ? document.fonts.ready
        : Promise.resolve();

      /*
       * Hero-first only. Do NOT wait for window.load or below-fold videos —
       * that made the intro (and the hero) crawl while insight/footer competed.
       */
      Promise.allSettled([
        fontsReady,
        whenHeroFlag(HERO_VIDEO_PLAYABLE_ATTR, { timeoutMs: 20000 }),
      ]).then(() => {
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
      if (window.edxLoader === api) {
        delete window.edxLoader;
      }
    };
  }, [mounted, playKey, previewReadyAfterMs]);

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
