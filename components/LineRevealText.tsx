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
 * Root + split nodes are spans so it can live inside <p> / <h1> / <h2>.
 */
export function LineRevealText({ text, className }: LineRevealTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

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
        tag: "span",
      });

      if (reduceMotion) {
        gsap.set(split.lines, { clearProps: "all" });
        return () => split.revert();
      }

      const fromVars = { yPercent: 110, opacity: 0 };
      const restVars = { yPercent: 0, opacity: 1 };
      gsap.set(split.lines, fromVars);

      const tween = gsap.fromTo(split.lines, fromVars, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        paused: true,
      });

      /** Leave in the resting visible state — never hide while still on screen. */
      const settle = () => {
        tween.pause();
        gsap.set(split.lines, restVars);
      };

      const play = () => {
        gsap.set(split.lines, fromVars);
        tween.play(0);
      };

      /*
       * Services titles: observe the title itself so each one plays when it
       * enters view (and sticky phase labels are not wiped mid-stage).
       */
      const selfTrigger = el.closest(".svc-phase__label, .svc-item__title");
      if (selfTrigger && typeof IntersectionObserver !== "undefined") {
        let visible = false;
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!entry) return;
            if (!entry.isIntersecting) {
              visible = false;
              settle();
              return;
            }
            if (visible) return;
            visible = true;
            play();
          },
          { threshold: 0 },
        );
        io.observe(selfTrigger);
        return () => {
          io.disconnect();
          tween.kill();
          split.revert();
        };
      }

      /* Prefer the hero landmark when nested (LineReveal inside .hero) */
      const section =
        el.closest(".hero, section, footer, .site-footer__stage") ?? el;
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        end: "bottom 22%",
        onEnter: play,
        onEnterBack: play,
        onLeave: settle,
        onLeaveBack: settle,
      });

      /* Late mount (e.g. hero after copy gate) while already in view */
      queueMicrotask(() => {
        if (trigger.isActive) play();
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
    <span ref={textRef} className={cn("line-reveal", className)}>
      {text}
    </span>
  );
}
