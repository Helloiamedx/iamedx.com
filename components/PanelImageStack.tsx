"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const STACK_INTERVAL_MS = 1125;

type PanelImageAlign = "center" | "top" | "right";

type PanelImageStackProps = {
  images: readonly string[];
  align?: PanelImageAlign;
  className?: string;
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

/** Image stack — hard cut; dual buffer keeps the previous frame until the next is ready. */
export function PanelImageStack({
  images,
  align,
  className,
}: PanelImageStackProps) {
  const n = images.length;
  const imagesKey = useMemo(() => images.join("\0"), [images]);

  const [ready, setReady] = useState(n <= 1);
  const [stack, setStack] = useState<StackFrame>(() => initialStack(n));

  useEffect(() => {
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
  }, [images, imagesKey, n]);

  useEffect(() => {
    if (!ready || n < 2) return;

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
  }, [ready, n]);

  if (n === 0) return null;

  if (!ready) {
    return (
      <div className={cn("panel-image-stack", className)} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt=""
          className={cn(
            "panel-image-stack__img is-active",
            alignClassFor(align, 0, n),
          )}
          draggable={false}
          decoding="async"
        />
      </div>
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
