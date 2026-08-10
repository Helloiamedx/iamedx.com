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
  { word: "Proactive", color: "#4D9FFF" },
] as const;

/* ~2px smaller than the original clamp */
const FONT_SIZE =
  "clamp(calc(2.2rem - 2px), calc(6.2vw - 2px), calc(5.25rem - 2px))";
const FONT_WEIGHT = 700;
const TEXT_COLOR = "#ffffff";
/** Pause after buttons appear before the first keyword change */
const FIRST_HOLD_MS = 2000;
/** Pause after each subsequent keyword settles */
const HOLD_MS = 2200;

const PREFIX_WORDS = PREFIX.split(" ");

type Phase = "idle" | "entering";

function pickKeywordIndex() {
  return Math.floor(Math.random() * KEYWORDS.length);
}

export function HeroHeadline() {
  const [complete, setComplete] = useState(false);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const swappingRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const fromWidthRef = useRef(0);
  const scheduleRef = useRef<(delay?: number) => void>(() => {});

  /* Pick the opening keyword on the client so each visit can start differently. */
  useLayoutEffect(() => {
    const start = pickKeywordIndex();
    indexRef.current = start;
    setIndex(start);
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    slot.style.setProperty("--hero-keyword-color", KEYWORDS[index].color);
  }, [index]);

  /* After React commits a new word, cascade letters in (no imperative DOM edits). */
  useLayoutEffect(() => {
    if (phaseRef.current !== "entering") return;

    const word = wordRef.current;
    const slot = slotRef.current;
    if (!word || !slot) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const incoming = Array.from(
      word.querySelectorAll<HTMLElement>(".hero-keyword__letter"),
    );

    if (reduceMotion || !incoming.length) {
      phaseRef.current = "idle";
      swappingRef.current = false;
      slot.style.width = "";
      scheduleRef.current(HOLD_MS);
      return;
    }

    slot.style.width = "auto";
    const toW = slot.getBoundingClientRect().width;
    gsap.set(slot, { width: fromWidthRef.current });
    gsap.set(incoming, {
      y: 22,
      rotateX: 62,
      opacity: 0,
      filter: "blur(9px)",
      transformOrigin: "50% 100%",
    });
    gsap.set(word, { scale: 0.985 });

    const tl = gsap.timeline({
      onComplete: () => {
        phaseRef.current = "idle";
        swappingRef.current = false;
        slot.style.width = "";
        gsap.set(word, { clearProps: "transform" });
        scheduleRef.current(HOLD_MS);
      },
    });

    tl.to(slot, { width: toW, duration: 0.58, ease: "power3.inOut" }, 0);
    tl.to(
      incoming,
      {
        y: 0,
        rotateX: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.62,
        stagger: { each: 0.024, from: "start" },
        ease: "power3.out",
      },
      0,
    );
    tl.to(word, { scale: 1, duration: 0.5, ease: "power2.out" }, 0.12);

    return () => {
      tl.kill();
    };
  }, [index]);

  /* Fold-in entrance — start immediately; never stall on fonts/CDN. */
  useLayoutEffect(() => {
    if (!ready) return undefined;

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
  }, [ready]);

  /*
   * Keyword rotate — wait after CTAs appear, then peel/cascade to the NEXT word.
   * Opening keyword is random; the first swap always advances to a different word.
   */
  useEffect(() => {
    if (!complete) return undefined;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let timeoutId = 0;
    let cancelled = false;

    const schedule = (delay = HOLD_MS) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(swap, delay);
    };
    scheduleRef.current = schedule;

    const swap = () => {
      if (cancelled || swappingRef.current) return;
      const word = wordRef.current;
      const slot = slotRef.current;
      if (!word || !slot) return;

      const next = (indexRef.current + 1) % KEYWORDS.length;
      const nextItem = KEYWORDS[next];

      if (reduceMotion) {
        indexRef.current = next;
        slot.style.width = "";
        slot.style.setProperty("--hero-keyword-color", nextItem.color);
        setIndex(next);
        schedule(HOLD_MS);
        return;
      }

      swappingRef.current = true;
      fromWidthRef.current = slot.getBoundingClientRect().width;
      const outgoing = Array.from(
        word.querySelectorAll<HTMLElement>(".hero-keyword__letter"),
      );

      if (!outgoing.length) {
        indexRef.current = next;
        phaseRef.current = "entering";
        slot.style.setProperty("--hero-keyword-color", nextItem.color);
        setIndex(next);
        return;
      }

      gsap.to(outgoing, {
        y: -14,
        rotateX: -78,
        opacity: 0,
        filter: "blur(7px)",
        duration: 0.36,
        stagger: { each: 0.016, from: "end" },
        ease: "power2.in",
        transformOrigin: "50% 80%",
        onComplete: () => {
          if (cancelled) return;
          gsap.killTweensOf(outgoing);
          indexRef.current = next;
          phaseRef.current = "entering";
          slot.style.setProperty("--hero-keyword-color", nextItem.color);
          setIndex(next);
        },
      });
    };

    /* Buttons are up — hold the opening keyword, then move on */
    schedule(FIRST_HOLD_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      const word = wordRef.current;
      const slot = slotRef.current;
      if (word) {
        gsap.killTweensOf(word);
        gsap.killTweensOf(word.querySelectorAll(".hero-keyword__letter"));
      }
      if (slot) gsap.killTweensOf(slot);
      swappingRef.current = false;
      phaseRef.current = "idle";
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
              {PREFIX} {active.word} {SUFFIX}
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
                    <span
                      key={active.word}
                      ref={wordRef}
                      className="hero-keyword__word"
                    >
                      {active.word.split("").map((ch, i) => (
                        <span
                          key={`${active.word}-${i}`}
                          className="hero-keyword__letter"
                        >
                          {ch}
                        </span>
                      ))}
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
