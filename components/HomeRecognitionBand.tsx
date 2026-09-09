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
import { HomeRecognitionProductBox } from "@/components/HomeRecognitionProductBox";
import { homeRecognition } from "@/content/homeCopy";
import { getRecognitionProductBoxSetsForSlide } from "@/content/recognitionProductBox";
import { useSwipeNav } from "@/lib/useSwipeNav";

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
  const [playing, setPlaying] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [offsetPx, setOffsetPx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const pagerRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const canAutoplay = Boolean(
    introReady && playing && !reduceMotion && count > 1,
  );
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
   * Autoplay stays off until the user hits play. */
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

  const swipeTo = useCallback(
    (dir: -1 | 1) => {
      setPlaying(false);
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
    if (!introReady || !reduceMotion || !playing || count < 2) return;
    const timer = window.setTimeout(() => goTo(index + 1), slideDurationMs);
    return () => window.clearTimeout(timer);
  }, [introReady, reduceMotion, playing, count, goTo, index, slideDurationMs]);

  return (
    <section
      className="home-recognition"
      id={id}
      aria-labelledby={`${id}-title`}
      style={
        {
          "--home-recognition-autoplay-ms": `${slideDurationMs}ms`,
        } as CSSProperties
      }
    >
      <div className="home-recognition__shell">
        <header className="home-section-intro home-recognition__intro">
          <h2 id={`${id}-title`} className="home-section-intro__title">
            {headline}
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
                className={`home-recognition__card${active ? " is-active" : ""}${isProductBox ? " home-recognition__card--product-box" : ""}`}
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
                  ) : slide.video || slide.videoMobile ? (
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
                    />
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
                <div className="home-recognition__copy">
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
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  className={`home-recognition__dot${active ? " is-active" : ""}`}
                  onClick={() => goTo(slideIndex)}
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
                    <span
                      key={progressKey}
                      className={`home-recognition__dot-progress${canAutoplay ? "" : " is-paused"}`}
                      onAnimationEnd={() => {
                        if (canAutoplayRef.current) goTo(index + 1);
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="home-recognition__playback"
            aria-label={playing ? "Pause autoplay" : "Play autoplay"}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? (
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
