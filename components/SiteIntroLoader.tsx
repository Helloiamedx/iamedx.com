"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  SITE_MARK_BOTTOM_D,
  SITE_MARK_TOP_D,
} from "@/lib/siteMark";
import {
  HERO_VIDEO_PLAYABLE_ATTR,
  whenHeroFlag,
} from "@/lib/heroSequence";
import { preloadHomeVideos } from "@/lib/preloadHomeVideos";

type IntroLanguage = {
  lang: string;
  text: string;
};

const CONFIG = {
  minimumDuration: 2400,
  traceFinishDuration: 700,
  beforeFillPause: 50,
  fillDuration: 850,
  completedHold: 400,
  revealDuration: 900,
  englishDuration: 1800,
  otherLanguageDuration: 1400,
  /** Soft crossfade only — no slide */
  textFadeMs: 180,
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

/**
 * Waiting curve while resources load — not a real download %.
 * Completion still waits for window load + fonts (and a minimum duration).
 */
function waitingProgress(elapsed: number) {
  return 0.9 * (1 - Math.exp(-Math.max(0, elapsed) / 2600));
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
 * Home-only first-visit intro.
 * Site stays painted under the opaque veil — veil fades out (no solid flash).
 * Once seen (localStorage), back / return visits skip it.
 * Waits for page load + fonts + hero + home/linked cover videos before finish.
 */
export function SiteIntroLoader({
  preloadVideos = [],
}: {
  /** Hero + below-the-fold / linked card videos on the home page */
  preloadVideos?: string[];
}) {
  /* Always true on SSR + first client paint — reading localStorage here
   * caused hydration mismatch when the visit was already marked seen. */
  const [active, setActive] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const preloadVideosRef = useRef(preloadVideos);
  preloadVideosRef.current = preloadVideos;

  useLayoutEffect(() => {
    /* Back / bfcache / soft return — never replay once seen */
    const skipIfSeen = () => {
      if (!hasSeenIntro()) return false;
      document.documentElement.classList.remove("edx-loading");
      setActive(false);
      return true;
    };

    if (skipIfSeen()) return;

    document.documentElement.classList.add("edx-loading");

    const onPageShow = (event: PageTransitionEvent) => {
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
      markIntroSeen();
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
    let aborted = false;
    let finished = false;
    let currentLanguage = -1;

    function finish() {
      if (aborted || finished) return;
      finished = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyId);
      markIntroSeen();
      document.documentElement.classList.remove("edx-loading");
      setActive(false);
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
      const completionStart = Math.max(CONFIG.minimumDuration, readyAt);
      const fillStart =
        completionStart +
        CONFIG.traceFinishDuration +
        CONFIG.beforeFillPause;
      const fillEnd = fillStart + CONFIG.fillDuration;
      const revealStart = fillEnd + CONFIG.completedHold;
      const revealDuration = reduce ? 180 : CONFIG.revealDuration;
      const reveal = ease((elapsed - revealStart) / revealDuration);

      const baseProgress = waitingProgress(
        Math.min(elapsed, completionStart),
      );
      const finishProgress = ease(
        (elapsed - completionStart) / CONFIG.traceFinishDuration,
      );
      const traceProgress =
        baseProgress + (1 - baseProgress) * finishProgress;
      const fillProgress = ease(
        (elapsed - fillStart) / CONFIG.fillDuration,
      );

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
    }, 12000);

    if (!window.EDX_LOADER_MANUAL) {
      const pageReady =
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              window.addEventListener("load", () => resolve(), { once: true });
            });
      const fontsReady = document.fonts
        ? document.fonts.ready
        : Promise.resolve();

      const gates: Promise<unknown>[] = [pageReady, fontsReady];
      /* Wait for hero buffer under the veil */
      gates.push(
        whenHeroFlag(HERO_VIDEO_PLAYABLE_ATTR, { timeoutMs: 12000 }),
      );
      /* Home + linked section videos (covers / footer) — home-only gate */
      gates.push(preloadHomeVideos(preloadVideosRef.current, 14000));

      Promise.allSettled(gates).then(() => {
        if (aborted || finished) return;
        api.complete();
      });
    }

    return () => {
      aborted = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyId);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      if (window.edxLoader === api) {
        delete window.edxLoader;
      }
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={loaderRef}
      className="edx-loader"
      id="edx-loader"
      role="status"
      aria-label="Loading"
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
    </div>
  );
}
