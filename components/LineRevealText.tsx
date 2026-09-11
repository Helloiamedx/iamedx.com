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
 * Section-title entrance — each line slides up inside an overflow mask.
 * Replays every time the parent section enters the viewport.
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

      const fromVars = { yPercent: 110, opacity: 0 };
      gsap.set(split.lines, fromVars);

      const tween = gsap.fromTo(split.lines, fromVars, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        paused: true,
      });

      const reset = () => {
        tween.pause(0);
        gsap.set(split.lines, fromVars);
      };

      const play = () => {
        reset();
        tween.play(0);
      };

      /* Section or footer stage — re-enter from above/below replays */
      const section =
        el.closest("section, footer, .site-footer__stage") ?? el;
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        end: "bottom 22%",
        onEnter: play,
        onEnterBack: play,
        onLeave: reset,
        onLeaveBack: reset,
      });

      return () => {
        trigger.kill();
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
