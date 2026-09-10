"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PanelImageStack } from "@/components/PanelImageStack";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  supportBentoSection,
  supportKnowCards,
  type SupportKnowCard,
} from "@/content/supportBento";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import { useSwipeNav } from "@/lib/useSwipeNav";

const CARDS = supportKnowCards;

/**
 * Stage clips bypass the global video load queue.
 * Queue concurrency (2) + slow moov-at-end files (e.g. Prototype) was
 * blocking the active switch and starving every clip after it.
 *
 * Play only while this card is active. Leaving resets to t=0 (paused) so
 * returning always restarts from the start — never background-play.
 */
function SupportPanelVideo({
  src,
  playbackRate = 1,
  fullscreen = true,
  active,
}: {
  src: string;
  playbackRate?: number;
  fullscreen?: boolean;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek before metadata */
      }
    }
  }, [active]);

  useDriveVideoPlayback(videoRef, active, () => {}, src);

  return (
    <div
      className={`support-know__panel support-know__panel--video${fullscreen ? "" : " is-fit-contain"}`}
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="support-know__panel-video"
        src={src}
        muted
        loop
        playsInline
        autoPlay={active}
        preload={active ? "auto" : "metadata"}
      />
    </div>
  );
}

/**
 * Cost Optimization stage — `$` left, amount eases from → to while active.
 * Leave resets to `from`; return restarts. Loops with a short hold at the floor.
 */
function SupportCostCountdown({
  from,
  to,
  durationMs = 5600,
  active,
}: {
  from: number;
  to: number;
  durationMs?: number;
  active: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(from);
  const rafRef = useRef(0);
  const holdRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(holdRef.current);

    if (!active) {
      setValue(from);
      return;
    }

    if (reduceMotion) {
      setValue(to);
      return;
    }

    let cancelled = false;
    const holdMs = 1600;
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const runCycle = () => {
      if (cancelled) return;
      const started = performance.now();
      setValue(from);

      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - started) / durationMs);
        setValue(from + (to - from) * easeOutCubic(t));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        holdRef.current = window.setTimeout(runCycle, holdMs);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    runCycle();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(holdRef.current);
    };
  }, [active, from, to, durationMs, reduceMotion]);

  return (
    <div
      className="support-know__panel support-know__panel--price"
      aria-hidden="true"
    >
      <p className="support-know__price">
        <span className="support-know__price-currency">$</span>
        <span className="support-know__price-amount">{value.toFixed(2)}</span>
      </p>
    </div>
  );
}

function SupportPanel({
  card,
  active,
  compact,
}: {
  card: SupportKnowCard;
  active: boolean;
  compact: boolean;
}) {
  const fullscreen = card.panelFullscreen !== false;

  if (card.panelPriceCountdown) {
    return (
      <SupportCostCountdown
        from={card.panelPriceCountdown.from}
        to={card.panelPriceCountdown.to}
        durationMs={card.panelPriceCountdown.durationMs}
        active={active}
      />
    );
  }

  const videoSrc =
    compact && card.panelVideoMobile
      ? card.panelVideoMobile
      : card.panelVideo;

  if (videoSrc) {
    return (
      <SupportPanelVideo
        key={videoSrc}
        src={videoSrc}
        playbackRate={card.panelVideoPlaybackRate ?? 1}
        fullscreen={fullscreen}
        active={active}
      />
    );
  }

  const images = card.panelImages;
  if (!images?.length) {
    return <div className="support-know__panel" aria-hidden="true" />;
  }

  return (
    <div
      className={`support-know__panel support-know__panel--stack${fullscreen ? "" : " is-fit-contain"}`}
    >
      <PanelImageStack
        images={images}
        align={card.panelImageAlign}
        className="panel-image-stack"
      />
    </div>
  );
}

function navDirection(from: number, to: number, total: number) {
  if (from === total - 1 && to === 0) return 1;
  if (from === 0 && to === total - 1) return -1;
  return to > from ? 1 : -1;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isLayerPaintReady(layer: HTMLElement | null | undefined): boolean {
  if (!layer) return false;

  const video = layer.querySelector("video");
  if (video) {
    if (video.error) return false;
    return (
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.videoWidth > 0
    );
  }

  const images = [...layer.querySelectorAll("img")];
  if (images.length) {
    return images.every((img) => img.complete && img.naturalWidth > 0);
  }

  // Empty / still panels count as ready so we never hang forever.
  return !layer.querySelector(".support-know__panel--video");
}

/** Poll until incoming can paint, errors out, or timeout — never play(). */
async function waitForLayerMedia(
  layer: HTMLElement,
  timeoutMs: number,
): Promise<"ready" | "error" | "timeout"> {
  const deadline = performance.now() + timeoutMs;
  const video = layer.querySelector("video");
  if (video) {
    video.preload = "auto";
  }

  while (performance.now() < deadline) {
    if (video?.error) return "error";
    if (isLayerPaintReady(layer)) return "ready";
    await sleep(32);
  }

  if (video?.error) return "error";
  return isLayerPaintReady(layer) ? "ready" : "timeout";
}

/**
 * Media switch — progress-driven corner grow (ChatGPT diagonal draw).
 * Outgoing stays covering until incoming can paint — no black reveal.
 */
function SupportMediaStage({
  cards,
  activeIndex,
  navDir,
  reduceMotion,
  compact,
}: {
  cards: readonly SupportKnowCard[];
  activeIndex: number;
  navDir: number;
  reduceMotion: boolean | null;
  compact: boolean;
}) {
  const currentRef = useRef(activeIndex);
  const busyRef = useRef(false);
  const rafRef = useRef(0);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(activeIndex);
  const [target, setTarget] = useState<number | null>(null);
  /** Keep visited clips mounted so pause preserves currentTime for resume. */
  const [visited, setVisited] = useState(() => new Set<number>([activeIndex]));

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(activeIndex)) return prev;
      const next = new Set(prev);
      next.add(activeIndex);
      return next;
    });
  }, [activeIndex]);

  const resetLayers = (active: number) => {
    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      const on = index === active;
      layer.style.visibility = on ? "visible" : "hidden";
      layer.style.transform = "none";
      layer.style.transformOrigin = "center";
      layer.style.opacity = on ? "1" : "0";
      layer.style.zIndex = on ? "2" : "0";
    });
  };

  const draw = (
    from: number,
    to: number,
    direction: number,
    p: number,
    preferReduced: boolean,
  ) => {
    const outgoing = layerRefs.current[from];
    const incoming = layerRefs.current[to];
    if (!outgoing || !incoming) return;

    // Mobile: gesture-aligned (right swipe from left-bottom).
    // Desktop: original mapping (unchanged).
    const fromLeft = compact ? direction < 0 : direction > 0;
    const sign = fromLeft ? 1 : -1;

    outgoing.style.visibility = "visible";
    incoming.style.visibility = "visible";
    outgoing.style.zIndex = p < 0.72 ? "2" : "1";
    incoming.style.zIndex = p < 0.72 ? "1" : "2";

    if (preferReduced) {
      outgoing.style.transform = "none";
      incoming.style.transform = "none";
      outgoing.style.transformOrigin = "center";
      incoming.style.transformOrigin = "center";
      outgoing.style.opacity = String(1 - p);
      incoming.style.opacity = String(p);
      return;
    }

    outgoing.style.transformOrigin = fromLeft ? "100% 100%" : "0% 100%";
    outgoing.style.transform = `
      translate3d(${10 * sign * p}%, ${5 * p}%, 0)
      scale(${1 - 0.96 * p})
    `;
    outgoing.style.opacity = String(1 - p);

    incoming.style.transformOrigin = fromLeft ? "0% 100%" : "100% 100%";
    incoming.style.transform = `
      translate3d(${-8 * sign * (1 - p)}%, ${4 * (1 - p)}%, 0)
      scale(${0.04 + 0.96 * p})
    `;
    incoming.style.opacity = String(p);
  };

  useEffect(() => {
    resetLayers(currentRef.current);
  }, []);

  useEffect(() => {
    if (activeIndex === currentRef.current) return;

    const from = currentRef.current;
    const to = activeIndex;
    const direction = navDir;
    const preferReduced = Boolean(reduceMotion);
    let cancelled = false;

    if (busyRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    busyRef.current = true;
    setTarget(to);

    const finish = (settledTo: number) => {
      if (cancelled) return;
      currentRef.current = settledTo;
      setCurrent(settledTo);
      setTarget(null);
      resetLayers(settledTo);
      const settled = layerRefs.current[settledTo];
      const video = settled?.querySelector("video");
      /* Active card’s own effect drives play — don’t force neighbors. */
      if (video && settledTo === activeIndex) {
        void video.play().catch(() => {});
      }
      busyRef.current = false;
    };

    const run = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (cancelled) return;

      const outgoing = layerRefs.current[from];
      const incoming = layerRefs.current[to];
      if (outgoing) {
        outgoing.style.visibility = "visible";
        outgoing.style.opacity = "1";
        outgoing.style.zIndex = "3";
        outgoing.style.transform = "none";
      }
      if (incoming) {
        incoming.style.visibility = "visible";
        incoming.style.opacity = "0";
        incoming.style.zIndex = "1";
      }

      /*
       * Hold the current frame until the next clip can paint, then draw.
       * Hard cap so a slow / broken file (Prototype moov-at-end) cannot
       * freeze the stepper and poison later switches.
       */
      const status = incoming
        ? await waitForLayerMedia(incoming, 6000)
        : "ready";
      if (cancelled) return;

      if (status !== "ready") {
        /*
         * Do not reveal an empty layer. Advance the stage index so later
         * chips/arrows still work, keep the outgoing frame up, and cut over
         * once the clip finally paints.
         */
        currentRef.current = to;
        setCurrent(to);
        setTarget(null);
        busyRef.current = false;

        if (incoming) {
          void (async () => {
            const later = await waitForLayerMedia(incoming, 20000);
            if (cancelled || currentRef.current !== to) return;
            if (later === "ready") {
              resetLayers(to);
              const video = incoming.querySelector("video");
              if (video && currentRef.current === to) {
                void video.play().catch(() => {});
              }
            }
          })();
        }
        return;
      }

      draw(from, to, direction, 0, preferReduced);

      const started = performance.now();
      const duration = preferReduced ? 100 : 480;

      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        draw(from, to, direction, eased, preferReduced);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        finish(to);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      busyRef.current = false;
    };
  }, [activeIndex, navDir, reduceMotion, compact]);

  const mounted = new Set<number>(visited);
  mounted.add(current);
  mounted.add(activeIndex);
  if (target != null) mounted.add(target);
  /* Prefetch neighbors into the tree (paused) for instant next switch */
  if (activeIndex > 0) mounted.add(activeIndex - 1);
  if (activeIndex < cards.length - 1) mounted.add(activeIndex + 1);

  return (
    <div className="support-know__media" aria-hidden="true">
      {cards.map((card, index) => {
        if (!mounted.has(index)) return null;
        return (
          <div
            key={card.id}
            className="support-know__media-layer"
            ref={(node) => {
              layerRefs.current[index] = node;
            }}
          >
            <SupportPanel
              card={card}
              active={index === activeIndex}
              compact={compact}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main service — media fills the whole stage; chips + ↑↓ overlay on the left.
 * One chip expands on scroll-in; stepper / chip click switches the active card.
 */
export function SupportStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const [compact, setCompact] = useState(false);
  const [navDir, setNavDir] = useState(1);
  const activeCard = CARDS[activeIndex] ?? CARDS[0];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || entered) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setEntered(true);
        io.disconnect();
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [entered]);

  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const };

  const selectAt = (index: number) => {
    // Clamp at ends — no wrap; end buttons disable instead.
    const next = Math.max(0, Math.min(CARDS.length - 1, index));
    if (next === activeIndex) return;
    setNavDir(navDirection(activeIndex, next, CARDS.length));
    setActiveIndex(next);
    setEntered(true);
  };

  const step = (delta: number) => {
    selectAt(activeIndex + delta);
  };

  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= CARDS.length - 1;

  const closeToFirst = () => {
    if (compact || activeIndex === 0) return;
    selectAt(0);
  };

  useSwipeNav(stageRef, (dir) => step(dir), CARDS.length > 1);

  return (
    <section
      ref={sectionRef}
      className="support-know"
      aria-labelledby="support-know-title"
    >
      <div className="support-know__shell">
        <header className="home-section-intro support-know__intro">
          <h2 id="support-know-title" className="home-section-intro__title">
            {supportBentoSection.title}
          </h2>
        </header>

        <div ref={stageRef} className="support-know__stage">
          <SupportMediaStage
            cards={CARDS}
            activeIndex={activeIndex}
            navDir={navDir}
            reduceMotion={reduceMotion}
            compact={compact}
          />

          {!compact && activeIndex > 0 ? (
            <button
              type="button"
              className="support-know__close"
              aria-label="Back to first service"
              onClick={closeToFirst}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}

          <div className="support-know__menu">
            <div className="support-know__stepper" aria-label="Browse services">
              <button
                type="button"
                className="support-know__step support-know__step--prev"
                aria-label="Previous service"
                disabled={atStart}
                onClick={() => step(-1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14 5.5 8.5 12 14 18.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="support-know__step support-know__step--next"
                aria-label="Next service"
                disabled={atEnd}
                onClick={() => step(1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M10 5.5 15.5 12 10 18.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {compact ? (
              <ul className="support-know__chips">
                <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
                  {entered && activeCard ? (
                    <motion.li
                      key={activeCard.id}
                      className="support-know__item is-expanded is-active"
                      custom={navDir}
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              // Mobile only: right swipe from left-bottom.
                              // (Desktop uses the list morph — this branch is compact.)
                              x: navDir < 0 ? -22 : 22,
                              y: 18,
                              scale: 0.72,
                              transformOrigin:
                                navDir < 0 ? "left bottom" : "right bottom",
                            }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        transformOrigin:
                          navDir < 0 ? "left bottom" : "right bottom",
                      }}
                      exit={
                        reduceMotion
                          ? undefined
                          : {
                              opacity: 0,
                              x: navDir < 0 ? 18 : -18,
                              y: 14,
                              scale: 0.72,
                              transformOrigin:
                                navDir < 0 ? "right bottom" : "left bottom",
                            }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                              mass: 0.8,
                            }
                      }
                    >
                      <div className="support-know__tile is-expanded">
                        <motion.div
                          className="support-know__detail-inner"
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  // Same corner as chip: right swipe from left-bottom
                                  x: navDir < 0 ? -16 : 16,
                                  y: 12,
                                  filter: "blur(5px)",
                                }
                          }
                          animate={{
                            opacity: 1,
                            x: 0,
                            y: 0,
                            filter: "blur(0px)",
                          }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : {
                                  opacity: { duration: 0.32, delay: 0.2 },
                                  x: { duration: 0.36, delay: 0.2 },
                                  y: { duration: 0.36, delay: 0.2 },
                                  filter: { duration: 0.32, delay: 0.2 },
                                }
                          }
                        >
                          <p className="support-know__detail-copy">
                            <strong className="support-know__detail-title">
                              {activeCard.headline}.
                            </strong>{" "}
                            {activeCard.description}
                          </p>
                        </motion.div>
                      </div>
                    </motion.li>
                  ) : null}
                </AnimatePresence>
              </ul>
            ) : (
              <ul className="support-know__chips">
                {CARDS.map((card, index) => {
                  const expanded = entered && activeIndex === index;
                  return (
                    <motion.li
                      key={card.id}
                      layout={reduceMotion ? false : "position"}
                      className={`support-know__item${expanded ? " is-expanded" : ""}`}
                      transition={{ layout: layoutTransition }}
                    >
                      <motion.div
                        layout={!reduceMotion}
                        className={`support-know__tile${expanded ? " is-expanded" : ""}`}
                        // Finite radii interpolate immediately; 9999px stays clamped
                        // to a pill for almost the entire transition.
                        initial={false}
                        animate={{ borderRadius: expanded ? 16 : 40 }}
                        style={{ borderRadius: 40, position: "relative" }}
                        transition={{
                          layout: layoutTransition,
                          borderRadius: layoutTransition,
                        }}
                        role={expanded ? undefined : "button"}
                        tabIndex={expanded ? undefined : 0}
                        aria-current={expanded ? "true" : undefined}
                        onClick={
                          expanded
                            ? undefined
                            : () => {
                                selectAt(index);
                              }
                        }
                        onKeyDown={
                          expanded
                            ? undefined
                            : (event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  selectAt(index);
                                }
                              }
                        }
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          {expanded ? (
                            <motion.div
                              key="detail"
                              layout={reduceMotion ? false : "position"}
                              className="support-know__detail-inner"
                              initial={
                                reduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      y: 6,
                                    }
                              }
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              exit={
                                reduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      y: 0,
                                      transition: { duration: 0.1, delay: 0 },
                                    }
                              }
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : {
                                      layout: layoutTransition,
                                      opacity: { duration: 0.22, delay: 0.14 },
                                      y: { duration: 0.3, delay: 0.14 },
                                    }
                              }
                            >
                              <p className="support-know__detail-copy">
                                <strong className="support-know__detail-title">
                                  {card.headline}.
                                </strong>{" "}
                                {card.description}
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="chip"
                              layout={reduceMotion ? false : "position"}
                              className="support-know__chip-inner"
                              initial={
                                reduceMotion ? false : { opacity: 0 }
                              }
                              animate={{ opacity: 1 }}
                              exit={
                                reduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      transition: { duration: 0.1 },
                                    }
                              }
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : {
                                      layout: layoutTransition,
                                      opacity: { duration: 0.18, delay: 0.12 },
                                    }
                              }
                            >
                              <span
                                className="support-know__chip-icon"
                                aria-hidden="true"
                              >
                                +
                              </span>
                              <span className="support-know__chip-label">
                                {card.headline}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
