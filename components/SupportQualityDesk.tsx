"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

import { useAfterHeroGate } from "@/lib/videoLoadQueue";
import { cn } from "@/lib/utils";

const DEAL_GAP_MS = 320;
const HOLD_FULL_MS = 2200;
const CLEAR_MS = 420;

/** Settled desk poses — portrait sheets spread to fill the panel. */
const DESK_POSES = [
  { x: 12, y: 26, r: -11 },
  { x: 36, y: 22, r: 8 },
  { x: 60, y: 28, r: -6 },
  { x: 86, y: 24, r: 11 },
  { x: 18, y: 48, r: 5 },
  { x: 46, y: 44, r: -9 },
  { x: 74, y: 50, r: 7 },
  { x: 10, y: 72, r: -7 },
  { x: 34, y: 70, r: 10 },
  { x: 62, y: 74, r: -5 },
  { x: 88, y: 68, r: 8 },
] as const;

type SupportQualityDeskProps = {
  images: readonly string[];
  active?: boolean;
  playing?: boolean;
  className?: string;
};

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    img.decoding = "async";
    img.src = src;
    if (img.complete) resolve();
  });
}

/**
 * Quality Management panel — inspection reports dealt onto a desk one by one.
 * Leave resets; pause freezes mid-deal; resume continues; full desk holds then loops.
 */
export function SupportQualityDesk({
  images,
  active = true,
  playing = true,
  className,
}: SupportQualityDeskProps) {
  const reduceMotion = useReducedMotion();
  const heroReady = useAfterHeroGate();
  const imagesKey = useMemo(() => images.join("\0"), [images]);
  const n = images.length;

  const [ready, setReady] = useState(false);
  /** How many sheets have landed (0…n). */
  const [dealt, setDealt] = useState(0);
  const [clearing, setClearing] = useState(false);

  const dealtRef = useRef(0);
  const timerRef = useRef(0);
  dealtRef.current = dealt;

  useEffect(() => {
    if (!heroReady || n === 0) return;
    let cancelled = false;
    setReady(false);
    setDealt(0);
    setClearing(false);
    void Promise.all(images.map((src) => preloadImage(src))).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [heroReady, images, imagesKey, n]);

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = 0;

    if (!active) {
      setDealt(0);
      setClearing(false);
      return;
    }

    if (!ready) return;

    if (reduceMotion) {
      setDealt(n);
      setClearing(false);
      return;
    }

    if (!playing) return;

    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      timerRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const loop = () => {
      if (cancelled) return;
      const count = dealtRef.current;

      if (count >= n) {
        schedule(() => {
          if (cancelled) return;
          setClearing(true);
          schedule(() => {
            if (cancelled) return;
            setClearing(false);
            setDealt(0);
            schedule(loop, DEAL_GAP_MS);
          }, CLEAR_MS);
        }, HOLD_FULL_MS);
        return;
      }

      setDealt(count + 1);
      schedule(loop, DEAL_GAP_MS);
    };

    schedule(loop, dealtRef.current === 0 ? DEAL_GAP_MS : DEAL_GAP_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [active, playing, ready, reduceMotion, n]);

  if (n === 0) return null;

  return (
    <div
      className={cn(
        "support-know__panel support-know__panel--desk support-know-desk",
        clearing && "is-clearing",
        className,
      )}
      aria-label="Quality inspection reports on a desk"
    >
      <div className="support-know-desk__surface" aria-hidden="true">
        {(!heroReady || !ready) && <div className="support-know-desk__plate" />}
        {heroReady &&
          ready &&
          images.map((src, index) => {
            const pose = DESK_POSES[index % DESK_POSES.length]!;
            const visible = index < dealt;
            const style = {
              "--desk-x": `${pose.x}%`,
              "--desk-y": `${pose.y}%`,
              "--desk-r": `${pose.r}deg`,
              zIndex: index + 1,
            } as CSSProperties;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${index}`}
                src={src}
                alt=""
                className={cn(
                  "support-know-desk__sheet",
                  visible && "is-dealt",
                )}
                style={style}
                draggable={false}
                decoding="async"
              />
            );
          })}
      </div>
    </div>
  );
}
