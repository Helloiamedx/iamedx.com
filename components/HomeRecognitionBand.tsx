"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "motion/react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { HomeRecognitionPhotoAccordion } from "@/components/HomeRecognitionPhotoAccordion";
import { HomeRecognitionProductBox } from "@/components/HomeRecognitionProductBox";
import { homeRecognition } from "@/content/homeCopy";
import { getRecognitionProductBoxSetsForSlide } from "@/content/recognitionProductBox";
import { useSwipeNav } from "@/lib/useSwipeNav";
import { LineRevealText } from "@/components/LineRevealText";

/**
 * Home recognition — Apple-style highlights carousel demo.
 * Square cards, autoplay + progress dots, portrait cards on mobile.
 */
export function HomeRecognitionBand() {
  const { id, headlineBefore, headlineAfter, slides, slideDurationMs } =
    homeRecognition;
  const headline = `${headlineBefore} ${headlineAfter}`.trim();
  const reduceMotionMq = useReducedMotion();
  /** Defer MQ to after mount so SSR + first client paint match */
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Match recognition mobile card breakpoint (3:4 / single pack) */
  const [isMobileCard, setIsMobileCard] = useState(false);
  const [index, setIndex] = useState(0);
  /*
   * Always start locked — SSR has no `document`, but the boot script adds
   * `edx-loading` before hydrate. Reading the class in useState caused
   * pause/play SVG + progress-dot mismatches.
   */
  const [introReady, setIntroReady] = useState(false);
  /** ≥2/3 of section visible (or ≥2/3 viewport covered if section is taller). */
  const [inViewTwoThirds, setInViewTwoThirds] = useState(false);
  /** Manual pause stays latched until play click or page refresh. */
  const [userPaused, setUserPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [offsetPx, setOffsetPx] = useState(0);
  /** Runtime refine from <video> metadata (optional). */
  const [durationOverrideMs, setDurationOverrideMs] = useState<number | null>(
    null,
  );
  /** Bump to collapse Reorder accordion / reset mobile slideshow. */
  const [photoResetKey, setPhotoResetKey] = useState(0);
  /** 0–1 playhead for video slides (scrubber) — DOM-updated, no React thrash. */
  const videoProgressRef = useRef(0);
  const scrubFillRef = useRef<HTMLSpanElement | null>(null);
  /** True while the customer is dragging the video scrubber — hold pause until release. */
  const [isScrubbing, setIsScrubbing] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const scrubbingRef = useRef(false);
  /** Ignore `ended` caused by seeking (esp. scrubbing to the last frame). */
  const ignoreEndedRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  const advancingRef = useRef(false);

  const count = slides.length;
  const activeSlide = slides[index];
  const activeIsVideo = Boolean(
    activeSlide?.video || activeSlide?.videoMobile,
  );
  const baseDwellMs = (() => {
    if (!activeSlide) return slideDurationMs;
    if (isMobileCard && activeSlide.durationMsMobile != null) {
      return activeSlide.durationMsMobile;
    }
    if (activeSlide.durationMs != null) return activeSlide.durationMs;
    /* Mobile photo hard-cut: wait for one full pass before advancing */
    if (isMobileCard && activeSlide.photoAccordion?.length) {
      return activeSlide.photoAccordion.length * 2000;
    }
    return slideDurationMs;
  })();
  /* Never let a prior video’s override leak onto still / accordion slides */
  const dwellMs =
    activeIsVideo && durationOverrideMs != null
      ? durationOverrideMs
      : baseDwellMs;
  const mediaPlaybackOk = Boolean(
    introReady && !userPaused && inViewTwoThirds,
  );
  const autoplayArmed = Boolean(mediaPlaybackOk && count > 1);
  const canAutoplay = Boolean(autoplayArmed && !reduceMotion);
  /** Icon follows real motion — scroll-gate off shows play, not a fake “still playing” pause. */
  const playbackActive = mediaPlaybackOk;
  const canAutoplayRef = useRef(canAutoplay);
  canAutoplayRef.current = canAutoplay;

  useEffect(() => {
    setReduceMotion(Boolean(reduceMotionMq));
  }, [reduceMotionMq]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const sync = () => setIsMobileCard(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Hold on slide 1 until SiteIntroLoader drops `edx-loading`.
   * Autoplay starts when the section hits the 2/3 visibility gate. */
  useEffect(() => {
    if (introReady) return;
    const root = document.documentElement;
    const release = () => {
      if (root.classList.contains("edx-loading")) return;
      setIndex(0);
      setProgressKey((key) => key + 1);
      setIntroReady(true);
    };
    release();
    if (!root.classList.contains("edx-loading")) return;
    const mo = new MutationObserver(release);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [introReady]);

  /*
   * Scroll gate (desktop + mobile): play when ≥2/3 of the section is visible;
   * pause below that — unless the user hit pause (stays off until play or refresh).
   * Progress bar keeps its width (CSS paused) so resume continues from the same spot.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    if (!thresholds.includes(2 / 3)) thresholds.push(2 / 3);
    thresholds.sort((a, b) => a - b);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const ratio = entry.intersectionRatio;
        if (ratio >= 2 / 3) {
          setInViewTwoThirds(true);
          return;
        }
        /* Tall section (common on phone): never reaches ratio 2/3 — use
         * how much of the viewport the section covers instead. */
        const viewportH = entry.rootBounds?.height ?? window.innerHeight;
        const sectionH = entry.boundingClientRect.height;
        const visibleH = entry.intersectionRect.height;
        const tallEnough =
          entry.isIntersecting &&
          sectionH > viewportH &&
          visibleH / viewportH >= 2 / 3;
        setInViewTwoThirds(tallEnough);
      },
      { threshold: thresholds },
    );

    io.observe(section);
    return () => io.disconnect();
  }, []);

  const bumpPagerEdge = useCallback((side: "start" | "end") => {
    const pager = pagerRef.current;
    if (!pager || reduceMotion) return;
    const activeDot = pager.querySelector(
      ".home-recognition__dot.is-active",
    ) as HTMLElement | null;
    if (!activeDot) return;
    activeDot.classList.remove("is-compress-start", "is-compress-end");
    void activeDot.offsetWidth;
    activeDot.classList.add(
      side === "start" ? "is-compress-start" : "is-compress-end",
    );
  }, [reduceMotion]);

  const goTo = useCallback(
    (next: number) => {
      const safe = ((next % count) + count) % count;
      setIndex(safe);
      setProgressKey((key) => key + 1);
    },
    [count],
  );

  const advanceFromAutoplay = useCallback(() => {
    if (
      !canAutoplayRef.current ||
      advancingRef.current ||
      scrubbingRef.current
    ) {
      return;
    }
    advancingRef.current = true;
    goTo(indexRef.current + 1);
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 400);
  }, [goTo]);

  const onVideoEnded = useCallback(() => {
    /* Seek / scrub to last frame fires `ended` — stay on this card */
    if (scrubbingRef.current || ignoreEndedRef.current) {
      ignoreEndedRef.current = false;
      return;
    }
    advanceFromAutoplay();
  }, [advanceFromAutoplay]);

  /* Drop runtime override when the slide (or mobile/desktop source) changes. */
  useEffect(() => {
    setDurationOverrideMs(null);
    ignoreEndedRef.current = false;
  }, [index, isMobileCard]);

  const onVideoDurationMs = useCallback(
    (ms: number) => {
      if (!Number.isFinite(ms) || ms < 500) return;
      /* Ignore metadata from clips once we’ve already left a video slide */
      const slide = slides[indexRef.current];
      if (!slide?.video && !slide?.videoMobile) return;
      setDurationOverrideMs((prev) => {
        if (prev !== null && Math.abs(prev - ms) < 120) return prev;
        return ms;
      });
    },
    [slides],
  );

  /* Sync scrubber fill to the active video playhead (ref only — no setState). */
  useEffect(() => {
    if (!activeIsVideo) {
      videoProgressRef.current = 0;
      if (scrubFillRef.current) scrubFillRef.current.style.width = "0%";
      return;
    }
    let raf = 0;
    const tick = () => {
      if (!scrubbingRef.current) {
        const el = activeVideoRef.current;
        if (el && Number.isFinite(el.duration) && el.duration > 0) {
          const ratio = Math.max(
            0,
            Math.min(1, el.currentTime / el.duration),
          );
          videoProgressRef.current = ratio;
          if (scrubFillRef.current) {
            scrubFillRef.current.style.width = `${ratio * 100}%`;
          }
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [activeIsVideo, index]);

  const seekActiveVideo = useCallback((clientX: number, track: HTMLElement) => {
    const el = activeVideoRef.current;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );
    /* Seeking (esp. to the end) can fire `ended` — ignore that for this card */
    ignoreEndedRef.current = true;
    try {
      el.currentTime = ratio * el.duration;
    } catch {
      /* ignore */
    }
    videoProgressRef.current = ratio;
    if (scrubFillRef.current) {
      scrubFillRef.current.style.width = `${ratio * 100}%`;
    }
  }, []);

  const swipeTo = useCallback(
    (dir: -1 | 1) => {
      const next = index + dir;
      if (next < 0) {
        bumpPagerEdge("end");
        return;
      }
      if (next >= count) {
        bumpPagerEdge("start");
        return;
      }
      goTo(next);
    },
    [goTo, index, count, bumpPagerEdge],
  );

  useSwipeNav(viewportRef, swipeTo, count > 1);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const card = cardRef.current;
    if (!viewport || !card) return;
    const track = viewport.querySelector(".home-recognition__track");
    const cards = track?.children;
    let gapPx = 16;
    if (cards && cards.length >= 2) {
      const first = cards[0] as HTMLElement;
      const second = cards[1] as HTMLElement;
      gapPx =
        second.getBoundingClientRect().left -
        first.getBoundingClientRect().right;
    }
    const cardW = card.getBoundingClientRect().width;
    const viewportW = viewport.getBoundingClientRect().width;
    setOffsetPx(index * (cardW + gapPx) - (viewportW - cardW) / 2);
  }, [index]);

  useLayoutEffect(() => {
    measure();
  }, [measure, slides]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(viewport);
    if (cardRef.current) ro.observe(cardRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /* Reduced-motion fallback: timed advance without progress fill */
  useEffect(() => {
    if (!autoplayArmed || !reduceMotion) return;
    const timer = window.setTimeout(() => advanceFromAutoplay(), dwellMs);
    return () => window.clearTimeout(timer);
  }, [autoplayArmed, reduceMotion, advanceFromAutoplay, index, dwellMs]);

  return (
    <section
      ref={sectionRef}
      className="home-recognition"
      id={id}
      aria-labelledby={`${id}-title`}
      style={
        {
          "--home-recognition-autoplay-ms": `${dwellMs}ms`,
        } as CSSProperties
      }
    >
      <div className="home-recognition__shell">
        <header className="home-section-intro home-recognition__intro">
          <h2 id={`${id}-title`} className="home-section-intro__title">
            <LineRevealText text={headline} />
          </h2>
        </header>
      </div>

      <div
        ref={viewportRef}
        className="home-recognition__viewport"
        aria-roledescription="carousel"
        aria-label="Recognition highlights"
      >
        <div
          className="home-recognition__track"
          style={{ transform: `translate3d(${-offsetPx}px, 0, 0)` }}
        >
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === index;
            const productBoxSetIds = getRecognitionProductBoxSetsForSlide(
              slide.id,
            );
            const isProductBox = productBoxSetIds.length > 0;
            const isDuo = productBoxSetIds.length > 1;
            const hasPhotoAccordion = Boolean(
              slide.photoAccordion && slide.photoAccordion.length > 0,
            );
            return (
              <article
                key={slide.id}
                ref={
                  active
                    ? (node) => {
                        cardRef.current = node;
                      }
                    : undefined
                }
                className={`home-recognition__card${active ? " is-active" : ""}${isProductBox ? " home-recognition__card--product-box" : ""}${hasPhotoAccordion ? " home-recognition__card--photo-accordion" : ""}`}
                aria-hidden={!active}
                onClick={() => {
                  if (!active) goTo(slideIndex);
                }}
              >
                <div
                  className={`home-recognition__media${isProductBox ? " home-recognition__media--product-box" : ""}${isDuo ? " home-recognition__media--product-box-multi" : ""}`}
                >
                  {isProductBox ? (
                    productBoxSetIds.map((setId) => (
                      <HomeRecognitionProductBox key={setId} setId={setId} />
                    ))
                  ) : slide.photoAccordion &&
                    slide.photoAccordion.length > 0 ? (
                    <HomeRecognitionPhotoAccordion
                      images={slide.photoAccordion}
                      active={active}
                      slideshow={isMobileCard}
                      playing={active && autoplayArmed}
                      resetKey={photoResetKey}
                    />
                  ) : slide.video || slide.videoMobile ? (
                    <>
                      {/* Still under the clip so copy has contrast before frames paint */}
                      <Image
                        src={
                          isMobileCard && slide.imageMobile
                            ? slide.imageMobile
                            : slide.image
                        }
                        alt=""
                        fill
                        sizes="(max-width: 700px) 78vw, min(86vw, 1100px)"
                        className="home-recognition__image home-recognition__image--video-still"
                      />
                      <CoverLoopVideo
                        key={
                          isMobileCard && slide.videoMobile
                            ? slide.videoMobile
                            : (slide.video ?? slide.videoMobile)
                        }
                        src={
                          isMobileCard && slide.videoMobile
                            ? slide.videoMobile
                            : (slide.video ?? slide.videoMobile!)
                        }
                        className="home-recognition__image"
                        active={active}
                        playbackEnabled={mediaPlaybackOk && !isScrubbing}
                        loop={false}
                        mediaRef={active ? activeVideoRef : undefined}
                        onDurationMs={active ? onVideoDurationMs : undefined}
                        onEnded={active ? onVideoEnded : undefined}
                      />
                    </>
                  ) : (
                    <Image
                      src={
                        isMobileCard && slide.imageMobile
                          ? slide.imageMobile
                          : slide.image
                      }
                      alt=""
                      fill
                      sizes="(max-width: 700px) 78vw, min(86vw, 1100px)"
                      className="home-recognition__image"
                      priority={slideIndex === 0}
                    />
                  )}
                </div>
                <div
                  className="home-recognition__copy"
                  onClick={(event) => {
                    if (!active || !hasPhotoAccordion) return;
                    event.stopPropagation();
                    setPhotoResetKey((key) => key + 1);
                  }}
                >
                  <h3 className="home-recognition__card-title">{slide.title}</h3>
                  <p className="home-recognition__card-body">{slide.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="home-recognition__controls">
          <div
            ref={pagerRef}
            className="home-recognition__pager"
            role="tablist"
            aria-label="Slides"
          >
            {slides.map((slide, slideIndex) => {
              const active = slideIndex === index;
              const slideIsVideo = Boolean(slide.video || slide.videoMobile);
              const scrubbable = active && slideIsVideo && !reduceMotion;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={
                    scrubbable
                      ? "Seek video"
                      : `Go to slide ${slideIndex + 1}`
                  }
                  className={`home-recognition__dot${active ? " is-active" : ""}${scrubbable ? " is-scrubbable" : ""}`}
                  onClick={(event) => {
                    if (scrubbable) {
                      event.preventDefault();
                      return;
                    }
                    goTo(slideIndex);
                  }}
                  onPointerDown={(event) => {
                    if (!scrubbable) return;
                    event.preventDefault();
                    event.stopPropagation();
                    scrubbingRef.current = true;
                    setIsScrubbing(true);
                    activeVideoRef.current?.pause();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    seekActiveVideo(event.clientX, event.currentTarget);
                  }}
                  onPointerMove={(event) => {
                    if (!scrubbable || !scrubbingRef.current) return;
                    seekActiveVideo(event.clientX, event.currentTarget);
                  }}
                  onPointerUp={(event) => {
                    if (!scrubbingRef.current) return;
                    scrubbingRef.current = false;
                    setIsScrubbing(false);
                    try {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    } catch {
                      /* ignore */
                    }
                    const el = activeVideoRef.current;
                    const atEnd =
                      el &&
                      Number.isFinite(el.duration) &&
                      el.duration > 0 &&
                      el.currentTime >= el.duration - 0.05;
                    if (atEnd) {
                      /* Stay on last frame — don’t play into ended → next card */
                      ignoreEndedRef.current = true;
                      return;
                    }
                    if (mediaPlaybackOk) {
                      ignoreEndedRef.current = false;
                      void el?.play().catch(() => {});
                    }
                  }}
                  onPointerCancel={() => {
                    scrubbingRef.current = false;
                    setIsScrubbing(false);
                    const el = activeVideoRef.current;
                    const atEnd =
                      el &&
                      Number.isFinite(el.duration) &&
                      el.duration > 0 &&
                      el.currentTime >= el.duration - 0.05;
                    if (atEnd) {
                      ignoreEndedRef.current = true;
                      return;
                    }
                    if (mediaPlaybackOk) {
                      ignoreEndedRef.current = false;
                      void el?.play().catch(() => {});
                    }
                  }}
                  onAnimationEnd={(event) => {
                    if (!active) return;
                    if (event.target !== event.currentTarget) return;
                    event.currentTarget.classList.remove(
                      "is-compress-start",
                      "is-compress-end",
                    );
                  }}
                >
                  {active && !reduceMotion ? (
                    scrubbable ? (
                      <span
                        ref={scrubFillRef}
                        className="home-recognition__dot-progress is-scrub"
                        style={{
                          width: `${videoProgressRef.current * 100}%`,
                        }}
                      />
                    ) : (
                      <span
                        key={`${progressKey}-${dwellMs}`}
                        className={`home-recognition__dot-progress${canAutoplay ? "" : " is-paused"}`}
                        style={
                          {
                            animationDuration: `${dwellMs}ms`,
                          } as CSSProperties
                        }
                        onAnimationEnd={() => {
                          advanceFromAutoplay();
                        }}
                      />
                    )
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="home-recognition__playback"
            aria-label={playbackActive ? "Pause autoplay" : "Play autoplay"}
            onClick={() => {
              if (playbackActive) setUserPaused(true);
              else setUserPaused(false);
            }}
          >
            {playbackActive ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="home-recognition__playback-icon"
              >
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="home-recognition__playback-icon"
              >
                <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
