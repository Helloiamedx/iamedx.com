"use client";

import {
  Fragment,
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import {
  applyHeadlineMotion,
  type HeadlineEffectKey,
  type HeadlineMotionController,
  type HeadlineTrigger,
} from "@/lib/headlineMotion";

/** Tags a headline may render as. Keeps `ref` / `style` properly typed. */
type HeadlineTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";

type TagProps = {
  ref?: Ref<HTMLElement>;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type HeadlineMotionProps = {
  /**
   * Plain text, or an array of lines for an explicit break.
   *
   * Intentionally not `ReactNode`: the engine slices text into rows, so links,
   * emphasis and other inline markup cannot be split safely. Pass a string, or
   * an array where each entry is its own line.
   */
  children: string | readonly string[];
  /** `"03"` · `"模糊聚焦"` · `"blur-focus"`. Defaults to `"07"`. */
  effect?: HeadlineEffectKey;
  /** `view` (default) plays once on scroll-in. `immediate` plays on mount. */
  trigger?: HeadlineTrigger;
  /**
   * With `trigger="manual"`: flip to `true` to play. Flipping again replays.
   * Used where another sequence owns the timing — e.g. the home hero holds its
   * copy until the background video is playable.
   */
  play?: boolean;
  /** `1` = authored speed. `1.2` faster, `0.8` slower. */
  speed?: number;
  /** Element to render. Defaults to `h2`. */
  as?: HeadlineTag;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /**
   * Line height. Long multi-row titles read best at `1.08`; omit to inherit the
   * surrounding typography. The engine never sets this itself.
   */
  lineHeight?: number | string;
};

/** `useLayoutEffect` warns when a client component renders on the server. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Headline with one of the seven fixed entrance effects.
 *
 * Ownership: this component renders the text once, then hands the element to
 * the motion engine, which owns its children until unmount. React must never
 * reconcile those nodes again — so the text is keyed, and changing `children`
 * remounts the element instead of letting React patch a detached text node.
 *
 * ```tsx
 * <HeadlineMotion as="h2" effect="03" lineHeight={1.08}>
 *   What makes me stand out.
 * </HeadlineMotion>
 * ```
 */
function HeadlineMotionBase({
  children,
  effect = "07",
  trigger = "view",
  speed = 1,
  play = false,
  as = "h2",
  className,
  id,
  style,
  lineHeight,
}: HeadlineMotionProps) {
  const elementRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<HeadlineMotionController | null>(null);

  /** Stable identity for the rendered text — drives the remount key below. */
  const textKey = typeof children === "string" ? children : children.join("\u0000");

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    try {
      controllerRef.current = applyHeadlineMotion(element, effect, {
        speed,
        trigger,
      });
    } catch (error) {
      /* The element is untouched when the engine rejects it, so it simply
       * renders as a plain headline. Surface the reason in development. */
      if (process.env.NODE_ENV !== "production") {
        console.error("[HeadlineMotion]", error);
      }
      controllerRef.current = null;
    }

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [effect, trigger, speed, textKey]);

  /*
   * `trigger="manual"` playback signal. The setup effect above runs first, so
   * the controller exists by the time this fires.
   */
  useIsomorphicLayoutEffect(() => {
    if (!play) return;
    controllerRef.current?.replay();
  }, [play, textKey]);

  const Tag = as as ElementType<TagProps>;
  const lines = Array.isArray(children) ? children : [children];

  return (
    <Tag
      /* Remount on text change — React must not patch the engine's nodes. */
      key={textKey}
      ref={elementRef}
      id={id}
      className={className}
      style={lineHeight === undefined ? style : { lineHeight, ...style }}
    >
      {/*
       * Fragments, not wrappers — the engine only accepts text nodes and <br>.
       * An extra span per line would be rejected by its markup guard.
       */}
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </Tag>
  );
}

export const HeadlineMotion = memo(HeadlineMotionBase);
