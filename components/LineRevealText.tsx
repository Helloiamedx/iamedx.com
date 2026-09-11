"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText, ScrollTrigger);

type LineRevealTextProps = {
  text: string;
  className?: string;
};

/**
 * Section-title entrance — each line slides up inside an overflow mask
 * (no clipPath on the glyphs — that was cropping letter edges).
 */
export function LineRevealText({ text, className }: LineRevealTextProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = textRef.current;
      if (!el) return;

      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const split = new SplitText(el, {
        type: "lines",
        linesClass: "line-reveal__line",
        mask: "lines",
      });

      if (reduceMotion) {
        gsap.set(split.lines, { clearProps: "all" });
        return () => split.revert();
      }

      const tween = gsap.from(split.lines, {
        yPercent: 110,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          once: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
      };
    },
    { scope: textRef, dependencies: [text] },
  );

  return (
    <div ref={textRef} className={cn("line-reveal", className)}>
      {text}
    </div>
  );
}
