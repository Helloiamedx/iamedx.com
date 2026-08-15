"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type AnimSnapshot = Record<string, string | number>;

function buildKeyframes(
  from: AnimSnapshot,
  steps: AnimSnapshot[],
): TargetAndTransition {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    const fallback = from[k] ?? 0;
    keyframes[k] = [fallback, ...steps.map((s) => s[k] ?? fallback)];
  });
  return keyframes as TargetAndTransition;
}

export type BlurTextProps = {
  text?: string;
  delay?: number;
  /** Extra ms before the first segment starts (for chaining lines). */
  startDelay?: number;
  className?: string;
  style?: CSSProperties;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimSnapshot;
  animationTo?: AnimSnapshot[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

export function BlurText({
  text = "",
  delay = 200,
  startDelay = 0,
  className = "",
  style,
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setInView(true);
      onAnimationComplete?.();
      return;
    }
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reduceMotion, onAnimationComplete]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1),
  );

  if (reduceMotion) {
    return (
      <span ref={ref} className={className} style={style}>
        {text}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (startDelay + index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            className="inline-block will-change-[transform,filter,opacity]"
            key={`${segment}-${index}`}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1
              ? "\u00A0"
              : null}
          </motion.span>
        );
      })}
    </span>
  );
}
