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
import "./FoldText.css";

const PREFIX =
  "Help You Establish a Supply Chain in China Tailored to Your Business with a";
const SUFFIX = "Approach";

const KEYWORDS = [
  { word: "Transparent", color: "#00E5FF" },
  { word: "Collaborative", color: "#FF4D9A" },
  { word: "Dedicated", color: "#FFE566" },
  { word: "Practical", color: "#5CFF6A" },
  { word: "Result-Driven", color: "#FF8A3C" },
  { word: "Accountable", color: "#B794FF" },
] as const;

/* ~2px smaller than the previous clamp */
const FONT_SIZE = "clamp(calc(2.2rem - 2px), calc(6.2vw - 2px), calc(5.25rem - 2px))";
const FONT_WEIGHT = 700;
const TEXT_COLOR = "#ffffff";
const HOLD_MS = 2200;
const SWAP_MS = 0.45;

const PREFIX_WORDS = PREFIX.split(" ");

export function HeroHeadline() {
  const [complete, setComplete] = useState(false);
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const swappingRef = useRef(false);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    slot.style.setProperty("--hero-keyword-color", KEYWORDS[index].color);
  }, [index]);

  /* Fold-in entrance (mirrors FoldText word hinge), no shine. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>("[data-hero-fold]"),
    );
    if (!pieces.length) return undefined;

    let cancelled = false;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const play = () => {
      if (cancelled) return;
      if (reduceMotion) {
        gsap.set(pieces, { opacity: 1, rotateX: 0 });
        setComplete(true);
        return;
      }

      gsap.set(pieces, {
        opacity: 0,
        rotateX: -92,
        transformOrigin: "50% 0%",
        transformPerspective: 700,
      });

      gsap.to(pieces, {
        opacity: 1,
        rotateX: 0,
        duration: 0.55,
        stagger: 0.035,
        ease: "power3.out",
        onComplete: () => setComplete(true),
      });
    };

    const wait = async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* ignore */
        }
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      play();
    };

    void wait();
    return () => {
      cancelled = true;
      gsap.killTweensOf(pieces);
    };
  }, []);

  /* Rotate keywords — slot width follows the word so Approach stays tight. */
  useEffect(() => {
    if (!complete) return undefined;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let timeoutId = 0;
    let cancelled = false;

    const schedule = () => {
      timeoutId = window.setTimeout(swap, HOLD_MS);
    };

    const swap = () => {
      if (cancelled || swappingRef.current) return;
      const el = currentRef.current;
      const slot = slotRef.current;
      if (!el || !slot) return;

      const next = (indexRef.current + 1) % KEYWORDS.length;
      const nextItem = KEYWORDS[next];

      if (reduceMotion) {
        indexRef.current = next;
        el.textContent = nextItem.word;
        slot.style.width = "";
        slot.style.setProperty("--hero-keyword-color", nextItem.color);
        setIndex(next);
        schedule();
        return;
      }

      swappingRef.current = true;
      const fromW = slot.getBoundingClientRect().width;

      const tl = gsap.timeline({
        onComplete: () => {
          swappingRef.current = false;
          slot.style.width = "";
          setIndex(next);
          if (!cancelled) schedule();
        },
      });

      tl.to(el, {
        yPercent: -110,
        opacity: 0,
        duration: SWAP_MS,
        ease: "power2.in",
      });
      tl.add(() => {
        indexRef.current = next;
        el.textContent = nextItem.word;
        slot.style.setProperty("--hero-keyword-color", nextItem.color);
        slot.style.width = "auto";
        const toW = slot.getBoundingClientRect().width;
        gsap.set(slot, { width: fromW });
        gsap.set(el, { yPercent: 110, opacity: 0 });
        gsap.to(slot, {
          width: toW,
          duration: SWAP_MS,
          ease: "power2.out",
        });
      });
      tl.to(
        el,
        {
          yPercent: 0,
          opacity: 1,
          duration: SWAP_MS,
          ease: "power2.out",
        },
        "<",
      );
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      const el = currentRef.current;
      const slot = slotRef.current;
      if (el) gsap.killTweensOf(el);
      if (slot) gsap.killTweensOf(slot);
      swappingRef.current = false;
    };
  }, [complete]);

  const active = KEYWORDS[index];
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
            <span className="fold-text-sr-only">
              {PREFIX} Transparent {SUFFIX}
            </span>

            <span className="fold-text-visual" aria-hidden="true">
              {PREFIX_WORDS.map((word, i) => (
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

              <span className="fold-text-whitespace">{"\u00A0"}</span>

              <span ref={slotRef} className="hero-keyword">
                <span className="fold-text-segment" data-fold-split="word">
                  <span
                    className="fold-text-piece hero-keyword__viewport"
                    data-hero-fold=""
                  >
                    <span ref={currentRef} className="hero-keyword__word">
                      {active.word}
                    </span>
                  </span>
                </span>
              </span>

              <span className="fold-text-whitespace">{"\u00A0"}</span>

              <span className="fold-text-segment" data-fold-split="word">
                <span className="fold-text-piece" data-hero-fold="">
                  {SUFFIX}
                </span>
              </span>
            </span>
          </span>
        </div>
      </h1>
      <HeroActions revealed={complete} />
    </>
  );
}
