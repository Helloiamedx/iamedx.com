"use client";

import { useEffect, useRef } from "react";

const FILL_START = 0.28;
const FILL_END = 1;

type AboutScrollLedeProps = {
  /** Use `\n` for a hard line break (e.g. greeting then loyalty). */
  text: string;
};

/**
 * About lede — gray base, characters fill to white scrubbed to scroll.
 * Progress is mapped from the paragraph’s position in the viewport.
 */
export function AboutScrollLede({ text }: AboutScrollLedeProps) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chars = charRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (chars.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      for (const span of chars) {
        span.style.color = `rgba(255, 255, 255, ${FILL_END})`;
      }
      return;
    }

    let raf = 0;

    const paint = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      /*
       * Scroll map (tune here):
       * - 0 when the lede top sits near the bottom of the viewport
       * - 1 when it has traveled up toward the upper band
       * Distance ≈ 0.77×vh.
       */
      const startY = vh * 0.94;
      const endY = vh * 0.17;
      const range = Math.max(1, startY - endY);
      const progress = Math.min(1, Math.max(0, (startY - rect.top) / range));

      const n = chars.length;
      /* Soft edge: each glyph ramps across a few “slots” of progress */
      const ramp = 4;
      const scaled = progress * (n + ramp);

      for (let i = 0; i < n; i++) {
        const local = Math.min(1, Math.max(0, (scaled - i) / ramp));
        const alpha = FILL_START + (FILL_END - FILL_START) * local;
        chars[i]!.style.color = `rgba(255, 255, 255, ${alpha})`;
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [text]);

  const lines = text.split("\n");
  let charIndex = 0;

  return (
    <p
      ref={rootRef}
      className="about-boua__lede"
      aria-label={text.replace(/\n/g, " ")}
    >
      {lines.map((line, lineIndex) => (
        <span key={`line-${lineIndex}`} className="about-boua__lede-line">
          {Array.from(line).map((ch) => {
            const i = charIndex++;
            return (
              <span
                key={`${i}-${ch}`}
                ref={(node) => {
                  charRefs.current[i] = node;
                }}
                className="about-boua__lede-char"
                aria-hidden="true"
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
