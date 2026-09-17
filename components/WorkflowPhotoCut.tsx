"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** Fast hard-cut stills for workflow media. */
const CUT_MS = 280;

type WorkflowPhotoCutProps = {
  images: readonly string[];
  className?: string;
  /** Interval between frames (ms). */
  intervalMs?: number;
};

export function WorkflowPhotoCut({
  images,
  className,
  intervalMs = CUT_MS,
}: WorkflowPhotoCutProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, reduceMotion]);

  if (images.length === 0) return null;

  const active = reduceMotion ? 0 : index;

  return (
    <div
      className={cn("svc-workflow__photo-cut", className)}
      aria-hidden="true"
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- hard-cut stack
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className={cn(
            "svc-workflow__photo-cut-frame",
            i === active && "is-active",
          )}
        />
      ))}
    </div>
  );
}
