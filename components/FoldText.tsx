"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import "./FoldText.css";

type Hinge = "top" | "bottom" | "left" | "right";
type SplitBy = "char" | "word" | "line";
type Trigger = "mount" | "hover" | "scroll" | "loop";

type FoldTextProps = {
  text?: string;
  splitBy?: SplitBy;
  hinge?: Hinge;
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  trigger?: Trigger;
  fontSize?: number | string;
  fontWeight?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
  /** After fold: run one synced highlight sweep across the whole line. */
  shine?: boolean;
};

const HINGE_CONFIG: Record<
  Hinge,
  { origin: string; rotateX: number; rotateY: number }
> = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function renderWhitespace(value: string, key: string): ReactNode[] {
  return value.split(/(\n)/).map((part, index) => {
    if (part === "\n") return <br key={`${key}-br-${index}`} />;
    if (!part) return null;
    return (
      <span className="fold-text-whitespace" key={`${key}-space-${index}`}>
        {part.replace(/ /g, "\u00A0")}
      </span>
    );
  });
}

export function FoldText({
  text = "Design unfolds",
  splitBy = "char",
  hinge = "top",
  duration = 0.65,
  stagger = 0.045,
  ease = "power3.out",
  perspective = 700,
  creaseShading = 0.55,
  trigger = "mount",
  fontSize = 80,
  fontWeight = 800,
  color = "#f7f2e8",
  className = "",
  style = {},
  onComplete,
  shine = false,
}: FoldTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hingeConfig = HINGE_CONFIG[hinge] || HINGE_CONFIG.top;
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    let segmentIndex = 0;

    const renderSegment = (content: string, key: string, split: SplitBy = splitBy) => {
      segmentIndex += 1;
      return (
        <span
          className="fold-text-segment"
          data-fold-split={split}
          key={key}
          style={{ "--fold-perspective": `${safePerspective}px` } as CSSProperties}
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={
              {
                transformOrigin: hingeConfig.origin,
                "--fold-crease": 0,
              } as CSSProperties
            }
          >
            {content || "\u00A0"}
          </span>
        </span>
      );
    };

    if (splitBy === "line") {
      return text.split("\n").map((line, index) => (
        <span className="fold-text-line" key={`line-${index}`}>
          {renderSegment(line || "\u00A0", `segment-line-${index}`, "line")}
        </span>
      ));
    }

    if (splitBy === "word") {
      const nodes: ReactNode[] = [];
      text.split(/(\s+)/).forEach((part, index) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          nodes.push(...renderWhitespace(part, `ws-${index}`));
          return;
        }
        nodes.push(renderSegment(part, `segment-word-${segmentIndex}`));
      });
      return nodes;
    }

    return Array.from(text).map((char, index) => {
      if (char === "\n") return <br key={`br-${index}`} />;
      return renderSegment(
        char === " " ? "\u00A0" : char,
        `segment-char-${index}`,
      );
    });
  }, [text, splitBy, hinge, hingeConfig.origin, safePerspective]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>(".fold-text-piece"),
    );
    if (!pieces.length) return undefined;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const activeDuration = reduceMotion ? Math.min(duration, 0.22) : duration;
    const activeStagger = reduceMotion ? Math.min(stagger, 0.02) : stagger;
    const fromVars = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
      rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
      "--fold-crease": reduceMotion ? 0 : safeCrease,
      transformOrigin: hingeConfig.origin,
      force3D: true,
    };
    const toVars = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      "--fold-crease": 0,
      duration: activeDuration,
      ease: reduceMotion ? "power1.out" : ease,
      stagger: activeStagger,
      clearProps: "willChange",
      onComplete: () => onCompleteRef.current?.(),
    };

    const killTimeline = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(pieces);
    };

    const play = (repeat: boolean) => {
      killTimeline();
      timelineRef.current = gsap.timeline({
        repeat: repeat ? -1 : 0,
        repeatDelay: repeat ? 0.75 : 0,
      });
      timelineRef.current.fromTo(pieces, fromVars, toVars);
      return timelineRef.current;
    };

    let scrollTrigger: { kill: () => void } | undefined;
    let hoverHandler: (() => void) | undefined;
    let cancelled = false;

    const waitForStableLayout = async () => {
      // Wait for webfonts so wrap width matches the final face (not Helvetica swap).
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* ignore */
        }
      }
      // Two frames: post-font layout + paint settle before measuring/animating.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    };

    if (trigger === "hover") {
      gsap.set(pieces, {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        "--fold-crease": 0,
        transformOrigin: hingeConfig.origin,
      });
      hoverHandler = () => play(false);
      root.addEventListener("mouseenter", hoverHandler);
    } else if (trigger === "scroll") {
      gsap.set(pieces, fromVars);
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          once: true,
          onEnter: () => {
            void waitForStableLayout().then(() => {
              if (!cancelled) play(false);
            });
          },
        });
      });
    } else if (trigger === "loop") {
      void waitForStableLayout().then(() => {
        if (!cancelled) play(true);
      });
    } else {
      void waitForStableLayout().then(() => {
        if (!cancelled) play(false);
      });
    }

    return () => {
      cancelled = true;
      if (hoverHandler) root.removeEventListener("mouseenter", hoverHandler);
      scrollTrigger?.kill();
      killTimeline();
    };
  }, [
    text,
    splitBy,
    hinge,
    duration,
    stagger,
    ease,
    perspective,
    safeCrease,
    trigger,
    hingeConfig.origin,
    hingeConfig.rotateX,
    hingeConfig.rotateY,
  ]);

  useEffect(() => {
    if (!shine || typeof window === "undefined") return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>(".fold-text-piece"),
    );
    if (!pieces.length) return undefined;

    const state = { shift: 0 };
    let tween: gsap.core.Tween | null = null;

    const measure = () => {
      let minLeft = Infinity;
      let maxRight = -Infinity;
      pieces.forEach((piece) => {
        const rect = piece.getBoundingClientRect();
        minLeft = Math.min(minLeft, rect.left);
        maxRight = Math.max(maxRight, rect.right);
      });
      const shineWidth = Math.max(1, maxRight - minLeft);
      root.style.setProperty("--fold-shine-w", `${shineWidth}px`);
      pieces.forEach((piece) => {
        const rect = piece.getBoundingClientRect();
        piece.style.setProperty(
          "--fold-shine-offset",
          `${rect.left - minLeft}px`,
        );
      });
      return shineWidth;
    };

    const play = () => {
      const shineWidth = measure();
      // Move highlight band fully across text (left → right).
      const from = -shineWidth;
      const to = shineWidth;
      state.shift = from;
      root.style.setProperty("--shine-shift", `${from}px`);

      tween?.kill();
      tween = gsap.fromTo(
        state,
        { shift: from },
        {
          shift: to,
          duration: 2.6,
          ease: "none",
          repeat: -1,
          repeatDelay: 0.85,
          onUpdate: () => {
            root.style.setProperty("--shine-shift", `${state.shift}px`);
          },
        },
      );
    };

    play();
    window.addEventListener("resize", play);
    return () => {
      window.removeEventListener("resize", play);
      tween?.kill();
      pieces.forEach((piece) => {
        piece.style.removeProperty("--fold-shine-offset");
        piece.style.backgroundPosition = "";
      });
      root.style.removeProperty("--fold-shine-w");
      root.style.removeProperty("--shine-shift");
    };
  }, [shine]);

  const rootStyle: CSSProperties = {
    "--fold-text-font-size":
      typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    "--fold-text-font-weight": fontWeight,
    "--fold-text-color": color,
    ...style,
  } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={`fold-text${shine ? " is-shiny" : ""}${className ? ` ${className}` : ""}`.trim()}
      style={rootStyle}
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments}
      </span>
    </span>
  );
}
