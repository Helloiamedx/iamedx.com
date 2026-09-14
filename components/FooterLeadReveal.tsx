"use client";

import { useEffect, useRef } from "react";
import { footerLeadLines } from "@/content/nav";

/** Static line boxes keep the footer's layout independent of the animation. */
export function FooterLeadReveal() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".footer-lead-reveal__line"));
    let animations: Animation[] = [];
    let visible = false;

    const finish = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (!entry.isIntersecting) {
        visible = false;
        finish();
        return;
      }
      if (visible) return;
      visible = true;
      if (motion.matches) return;

      finish();
      // Only animate on entry. The resting CSS is always visible, including
      // after cancellation, route changes, reduced motion, or missing APIs.
      animations = lines.map((line, index) => line.animate([
        { transform: "translateY(110%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ], {
        duration: 800,
        delay: index * 150,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      }));
    }, { threshold: 0 });

    if (typeof Element.prototype.animate !== "function") return;
    observer.observe(root);
    motion.addEventListener("change", finish);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", finish);
      finish();
    };
  }, []);

  return (
    <span ref={rootRef} className="footer-lead-reveal">
      {footerLeadLines.map((line, index) => (
        <span className="footer-lead-reveal__mask" key={line}>
          <span className="footer-lead-reveal__line">
            {index > 0 ? " " : ""}{line}
          </span>
        </span>
      ))}
    </span>
  );
}
