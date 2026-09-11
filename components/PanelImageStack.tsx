"use client";

import { useEffect, useMemo, useState } from "react";

import { useAfterHeroGate } from "@/lib/videoLoadQueue";
import { cn } from "@/lib/utils";

const STACK_INTERVAL_MS = 1125;

type PanelImageAlign = "center" | "top" | "right";

type PanelImageStackProps = {
  images: readonly string[];
  align?: PanelImageAlign;
  className?: string;
  /** When false, stay paused. When true again, restart from image 0. Default true. */
  active?: boolean;
  /** Stage play/pause — freezes without resetting. Default true. */
  playing?: boolean;
};

type StackFrame = {
  activeLayer: 0 | 1;
  layers: [number, number];
};

function alignClassFor(
  align: PanelImageAlign | undefined,
  imageIndex: number,
  total: number,
) {
  if (align === "right") return "is-right-aligned";
  if (align === "top") return "is-top-aligned";
  if (!align && imageIndex === total - 1) return "is-top-aligned";
  return undefined;
}

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

function initialStack(total: number): StackFrame {
  return {
    activeLayer: 0,
    layers: [0, 0],
  };
}

/** Image stack — waits for page hero unlock so preloads don’t fight the hero. */
export function PanelImageStack({
  images,
  align,
  className,
  active = true,
  playing = true,
}: PanelImageStackProps) {
  const n = images.length;
  const imagesKey = useMemo(() => images.join("\0"), [images]);
  const heroReady = useAfterHeroGate();

  const [ready, setReady] = useState(n <= 1);
  const [stack, setStack] = useState<StackFrame>(() => initialStack(n));

  useEffect(() => {
    if (!heroReady) return;
    if (n <= 1) {
      setReady(true);
      setStack(initialStack(n));
      return;
    }

    let cancelled = false;
    setReady(false);
    setStack(initialStack(n));

    void Promise.all(images.map((src) => preloadImage(src))).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [images, imagesKey, n, heroReady]);

  /* Re-entering a card always starts at image 0; stay paused while inactive. */
  useEffect(() => {
    if (!active) return;
    setStack(initialStack(n));
  }, [active, n]);

  useEffect(() => {
    if (!active || !playing || !ready || n < 2) return;

    let cancelled = false;
    let timeoutId = 0;

    const tick = () => {
      if (cancelled) return;

      setStack((prev) => {
        const back = (prev.activeLayer === 0 ? 1 : 0) as 0 | 1;
        const nextIndex = (prev.layers[prev.activeLayer] + 1) % n;
        const layers: [number, number] = [prev.layers[0], prev.layers[1]];
        layers[back] = nextIndex;
        return { activeLayer: back, layers };
      });

      timeoutId = window.setTimeout(tick, STACK_INTERVAL_MS);
    };

    timeoutId = window.setTimeout(tick, STACK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, playing, ready, n]);

  if (n === 0) return null;

  if (!heroReady || !ready) {
    return (
      <div className={cn("panel-image-stack", className)} aria-hidden="true" />
    );
  }

  return (
    <div className={cn("panel-image-stack", className)} aria-hidden="true">
      {([0, 1] as const).map((slot) => {
        if (n === 1 && slot === 1) return null;
        const imageIndex = stack.layers[slot];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slot}
            src={images[imageIndex]}
            alt=""
            className={cn(
              "panel-image-stack__img",
              stack.activeLayer === slot && "is-active",
              alignClassFor(align, imageIndex, n),
            )}
            draggable={false}
            decoding="async"
          />
        );
      })}
    </div>
  );
}
