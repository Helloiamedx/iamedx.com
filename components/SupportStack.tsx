"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  supportBentoSection,
  supportKnowCards,
  type SupportKnowCard,
} from "@/content/supportBento";
import { cn } from "@/lib/utils";

const CARDS = supportKnowCards;

/** Lock axis after this much dominant movement (px). */
const LOCK_THRESHOLD = 6;
const WHEEL_IDLE_MS = 120;
const MOMENTUM_FRICTION = 0.945;
const MOMENTUM_MIN_V = 0.08;
const WHEEL_GAIN = 1;
const BUTTON_LERP = 0.18;

type Axis = "x" | "y" | null;

const STACK_INTERVAL_MS = 1500;

/** Images stack one over another — each new frame slides up from below and covers. */
function SupportPanelStack({
  images,
  align,
}: {
  images: string[];
  align?: SupportKnowCard["panelImageAlign"];
}) {
  const n = images.length;
  const [index, setIndex] = useState(0);
  const [hasCycled, setHasCycled] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => {
      setHasCycled(true);
      setIndex((i) => (i + 1) % n);
    }, STACK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [n]);

  const under = (index - 1 + n) % n;
  const underIsLast = (hasCycled ? under : index) === n - 1;
  const coverIsLast = index === n - 1;
  const alignClass =
    align === "right"
      ? "is-right-aligned"
      : align === "top"
        ? "is-top-aligned"
        : undefined;
  /** Supplier stack: last frame tops; skip when an explicit align is set */
  const lastTopFallback = !align;

  return (
    <div
      className="support-know__panel support-know__panel--stack"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[hasCycled ? under : index]}
        alt=""
        className={cn(
          "support-know__stack-img support-know__stack-img--under",
          lastTopFallback && underIsLast && "is-top-aligned",
          alignClass,
        )}
        draggable={false}
      />
      {hasCycled ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={images[index]}
          alt=""
          className={cn(
            "support-know__stack-img support-know__stack-img--cover",
            lastTopFallback && coverIsLast && "is-top-aligned",
            alignClass,
            reducedRef.current && "is-instant",
          )}
          draggable={false}
        />
      ) : null}
    </div>
  );
}

function SupportPanelVideo({
  src,
  playbackRate = 1,
}: {
  src: string;
  playbackRate?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, src]);

  return (
    <div
      className="support-know__panel support-know__panel--video"
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="support-know__panel-video"
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = playbackRate;
        }}
        onPlay={(event) => {
          event.currentTarget.playbackRate = playbackRate;
        }}
      />
    </div>
  );
}

function SupportPanel({ card }: { card: SupportKnowCard }) {
  if (card.panelVideo) {
    return (
      <SupportPanelVideo
        src={card.panelVideo}
        playbackRate={card.panelVideoPlaybackRate ?? 1}
      />
    );
  }

  const images = card.panelImages;
  if (!images?.length) {
    return <div className="support-know__panel" aria-hidden="true" />;
  }
  return <SupportPanelStack images={images} align={card.panelImageAlign} />;
}

/**
 * Apple-style horizontal frosted panels — transform rail + trackpad direction lock,
 * momentum damping, and one-card button steps. Variable card widths, uniform panel height.
 */
export function SupportStack() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const xRef = useRef(0);
  const vRef = useRef(0);
  const maxXRef = useRef(0);
  const axisRef = useRef<Axis>(null);
  const wheelIdleRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const pointerLastXRef = useRef(0);
  const pointerLastYRef = useRef(0);
  const pointerLastTRef = useRef(0);
  const reducedRef = useRef(false);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const applyTransform = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.style.transform = `translate3d(${xRef.current}px, 0, 0)`;

    const prev = xRef.current < -1;
    const next = xRef.current > -maxXRef.current + 1;
    setCanPrev((was) => (was === prev ? was : prev));
    setCanNext((was) => (was === next ? was : next));
  }, []);

  const clampX = useCallback((value: number) => {
    const max = maxXRef.current;
    if (value > 0) return 0;
    if (value < -max) return -max;
    return value;
  }, []);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!viewport || !rail) return;

    maxXRef.current = Math.max(0, rail.scrollWidth - viewport.clientWidth);
    xRef.current = clampX(xRef.current);
    applyTransform();
  }, [applyTransform, clampX]);

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const tickMomentum = useCallback(() => {
    rafRef.current = 0;
    const now = performance.now();
    const dt = Math.min(32, now - (lastTsRef.current || now));
    lastTsRef.current = now;

    const steps = dt / 16.67;
    vRef.current *= MOMENTUM_FRICTION ** steps;

    if (Math.abs(vRef.current) < MOMENTUM_MIN_V) {
      vRef.current = 0;
      xRef.current = clampX(xRef.current);
      applyTransform();
      return;
    }

    xRef.current = clampX(xRef.current + vRef.current * steps);
    if (xRef.current === 0 || xRef.current === -maxXRef.current) {
      vRef.current = 0;
    }
    applyTransform();
    rafRef.current = requestAnimationFrame(tickMomentum);
  }, [applyTransform, clampX]);

  const startMomentum = useCallback(() => {
    if (reducedRef.current) {
      vRef.current = 0;
      return;
    }
    if (Math.abs(vRef.current) < MOMENTUM_MIN_V) {
      vRef.current = 0;
      return;
    }
    stopRaf();
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tickMomentum);
  }, [stopRaf, tickMomentum]);

  const animateTo = useCallback(
    (target: number) => {
      stopRaf();
      vRef.current = 0;
      const goal = clampX(target);

      if (reducedRef.current) {
        xRef.current = goal;
        applyTransform();
        return;
      }

      const step = () => {
        rafRef.current = 0;
        const next = xRef.current + (goal - xRef.current) * BUTTON_LERP;
        if (Math.abs(goal - next) < 0.5) {
          xRef.current = goal;
          applyTransform();
          return;
        }
        xRef.current = next;
        applyTransform();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [applyTransform, clampX, stopRaf],
  );

  const cardTargets = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return [0];
    const cards = [
      ...rail.querySelectorAll<HTMLElement>(".support-know__card"),
    ];
    const styles = getComputedStyle(rail);
    const gap =
      Number.parseFloat(styles.columnGap || styles.gap || "20") || 20;
    let acc = 0;
    return cards.map((card, index) => {
      const x = -acc;
      acc +=
        card.getBoundingClientRect().width +
        (index < cards.length - 1 ? gap : 0);
      return x;
    });
  }, []);

  const currentIndex = useCallback(() => {
    const targets = cardTargets();
    let best = 0;
    let bestDist = Infinity;
    targets.forEach((target, index) => {
      const dist = Math.abs(target - xRef.current);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  }, [cardTargets]);

  const scrollByCard = useCallback(
    (direction: -1 | 1) => {
      const targets = cardTargets();
      if (!targets.length) return;
      const next = Math.max(
        0,
        Math.min(targets.length - 1, currentIndex() + direction),
      );
      animateTo(targets[next] ?? 0);
    },
    [animateTo, cardTargets, currentIndex],
  );

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    measure();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(viewport);
    if (railRef.current) ro.observe(railRef.current);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      stopRaf();
      window.clearTimeout(wheelIdleRef.current);
    };
  }, [measure, stopRaf]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const isOnSlideArea = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      /* Copy must not drag — but panels, card chrome, and gaps (hit the rail) do */
      if (target.closest(".support-know__copy")) return false;
      return Boolean(target.closest(".support-know__rail"));
    };

    const endWheelGesture = () => {
      axisRef.current = null;
      startMomentum();
    };

    const onWheel = (event: WheelEvent) => {
      /* Horizontal drag on panels + inter-card gaps; not on copy */
      if (!isOnSlideArea(event.target)) {
        axisRef.current = null;
        return;
      }

      const dx = event.deltaX * WHEEL_GAIN;
      const dy = event.deltaY * WHEEL_GAIN;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absY > absX + 1 && absY >= LOCK_THRESHOLD) {
        axisRef.current = "y";
        window.clearTimeout(wheelIdleRef.current);
        wheelIdleRef.current = window.setTimeout(() => {
          axisRef.current = null;
        }, WHEEL_IDLE_MS);
        return;
      }

      window.clearTimeout(wheelIdleRef.current);
      wheelIdleRef.current = window.setTimeout(endWheelGesture, WHEEL_IDLE_MS);

      if (!axisRef.current) {
        if (absX < 0.5 && absY < 0.5 && !event.shiftKey) return;
        if (event.shiftKey || absX >= absY) {
          if (event.shiftKey || absX >= LOCK_THRESHOLD || absX > absY + 1) {
            axisRef.current = "x";
          } else if (absY >= LOCK_THRESHOLD) {
            axisRef.current = "y";
          } else {
            return;
          }
        } else if (absY >= LOCK_THRESHOLD) {
          axisRef.current = "y";
        } else {
          return;
        }
      }

      if (axisRef.current === "y") {
        return;
      }

      const delta = event.shiftKey ? dy : dx;
      const nextX = clampX(xRef.current - delta);
      const atEdge = nextX === xRef.current;

      if (atEdge) {
        axisRef.current = null;
        vRef.current = 0;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      stopRaf();
      xRef.current = nextX;
      vRef.current = -delta;
      applyTransform();
    };

    viewport.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    return () => {
      viewport.removeEventListener("wheel", onWheel, true);
      window.clearTimeout(wheelIdleRef.current);
    };
  }, [applyTransform, clampX, startMomentum, stopRaf]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const isOnSlideArea = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (target.closest(".support-know__copy")) return false;
      return Boolean(target.closest(".support-know__rail"));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (!isOnSlideArea(event.target)) return;
      pointerIdRef.current = event.pointerId;
      pointerLastXRef.current = event.clientX;
      pointerLastYRef.current = event.clientY;
      pointerLastTRef.current = performance.now();
      axisRef.current = null;
      vRef.current = 0;
      stopRaf();
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;

      const now = performance.now();
      const dt = Math.max(1, now - pointerLastTRef.current);
      const mx = event.clientX - pointerLastXRef.current;
      const my = event.clientY - pointerLastYRef.current;
      pointerLastXRef.current = event.clientX;
      pointerLastYRef.current = event.clientY;
      pointerLastTRef.current = now;

      if (!axisRef.current) {
        const absX = Math.abs(mx);
        const absY = Math.abs(my);
        if (absX < 1 && absY < 1) return;
        if (absX + absY < LOCK_THRESHOLD) return;
        axisRef.current = absX >= absY ? "x" : "y";
      }

      if (axisRef.current !== "x") return;

      event.preventDefault();
      xRef.current = clampX(xRef.current + mx);
      vRef.current = (mx / dt) * 16.67;
      applyTransform();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      pointerIdRef.current = null;
      const wasX = axisRef.current === "x";
      axisRef.current = null;
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      if (wasX) startMomentum();
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, [applyTransform, clampX, startMomentum, stopRaf]);

  return (
    <section className="support-know" aria-labelledby="support-know-title">
      <div
        className="support-know__bg"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${supportBentoSection.backgroundImage}")`,
        }}
      />
      <div className="support-know__frost" aria-hidden="true" />

      <div className="support-know__intro">
        <h2 id="support-know-title">{supportBentoSection.title}</h2>
        <p>{supportBentoSection.subtitle}</p>
      </div>

      <div className="support-know__shell">
        <div
          ref={viewportRef}
          className="support-know__viewport"
          tabIndex={0}
          role="region"
          aria-label="Support services"
          data-lenis-prevent-horizontal
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollByCard(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollByCard(-1);
            }
          }}
        >
          <div ref={railRef} className="support-know__rail" role="list">
            {CARDS.map((card) => (
              <article
                key={card.id}
                className={cn(
                  "support-know__card",
                  `support-know__card--${card.size}`,
                )}
                role="listitem"
              >
                <SupportPanel card={card} />
                <p className="support-know__copy">
                  <strong className="support-know__headline">
                    {card.headline}.{" "}
                  </strong>
                  <span className="support-know__desc">{card.description}</span>
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="support-know__controls">
          <button
            type="button"
            className="support-know__nav"
            aria-label="Previous cards"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="support-know__nav"
            aria-label="Next cards"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
