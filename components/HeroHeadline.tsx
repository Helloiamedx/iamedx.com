"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { HeroActions } from "@/components/HeroActions";
import {
  HERO_COPY_ATTR,
  whenHeroFlag,
} from "@/lib/heroSequence";
import "./FoldText.css";

/** Remaining hero line — approach keywords live in a later section. */
const HEADLINE =
  "ESTABLISH A SUPPLY CHAIN FROM SCRATCH TAILORED TO YOUR BUSINESS";
const HEADLINE_WORDS = HEADLINE.split(" ");

/* Half of previous + 20px */
const FONT_SIZE =
  "clamp(calc((2.2rem - 2px) * 0.5 + 20px), calc((6.2vw - 2px) * 0.5 + 20px), calc((5.25rem - 2px) * 0.5 + 20px))";
const FONT_WEIGHT = 600;
const TEXT_COLOR = "#ffffff";

export function HeroHeadline() {
  const [complete, setComplete] = useState(false);
  const [copyGate, setCopyGate] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  /* Copy gate — set early by HeroBackgroundVideo (not tied to video buffer). */
  useEffect(() => {
    let cancelled = false;
    void whenHeroFlag(HERO_COPY_ATTR).then(() => {
      if (!cancelled) setCopyGate(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Fold-in entrance — only after copy gate. */
  useLayoutEffect(() => {
    if (!copyGate) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>("[data-hero-fold]"),
    );
    if (!pieces.length) return undefined;

    let cancelled = false;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(pieces, { opacity: 1, rotateX: 0 });
      setComplete(true);
      return undefined;
    }

    gsap.set(pieces, {
      opacity: 0,
      rotateX: -92,
      transformOrigin: "50% 0%",
      transformPerspective: 700,
    });

    const tween = gsap.to(pieces, {
      opacity: 1,
      rotateX: 0,
      duration: 0.55,
      stagger: 0.035,
      ease: "power3.out",
      onComplete: () => {
        if (!cancelled) setComplete(true);
      },
    });

    /* Floor if GSAP stalls — keep short so the hero never sits empty */
    const safety = window.setTimeout(() => {
      if (cancelled) return;
      tween.kill();
      gsap.set(pieces, { opacity: 1, rotateX: 0 });
      setComplete(true);
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      tween.kill();
      gsap.killTweensOf(pieces);
    };
  }, [copyGate]);

  const rootStyle = {
    "--fold-text-font-size": FONT_SIZE,
    "--fold-text-font-weight": FONT_WEIGHT,
    "--fold-text-color": TEXT_COLOR,
  } as CSSProperties;

  return (
    <>
      <h1 className="hero__title">
        <div className="hero-headline">
          <span
            ref={rootRef}
            className="fold-text hero-headline__fold-text hero-headline__line"
            style={rootStyle}
          >
            <span className="fold-text-sr-only">{HEADLINE}</span>

            <span className="fold-text-visual" aria-hidden="true">
              {HEADLINE_WORDS.map((word, i) => (
                <span key={`p-${word}-${i}`}>
                  {i > 0 ? (
                    <span className="fold-text-whitespace">{"\u00A0"}</span>
                  ) : null}
                  <span className="fold-text-segment" data-fold-split="word">
                    <span className="fold-text-piece" data-hero-fold="">
                      {word}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </span>
        </div>
      </h1>
      <HeroActions revealed={complete} />
    </>
  );
}
