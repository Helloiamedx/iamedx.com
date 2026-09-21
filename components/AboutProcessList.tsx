"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "motion/react";

import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  getProcessCraftMedia,
  isProcessCraftVideo,
} from "@/content/processCraftMedia";
import { cn } from "@/lib/utils";

/** Air between the hovered label and its preview card */
const PREVIEW_GAP_PX = 14;
/** Keep the card clear of the viewport edges */
const PREVIEW_MARGIN_PX = 16;

type AboutProcessItemProps = {
  label: string;
};

/**
 * Process label with a hover demo (16:9 still / muted clip).
 *
 * Only devices with a real hover pointer get the preview: mouse / trackpad via
 * `any-hover`, or Apple Pencil on iPad Pro via its `pointerenter`. Because that
 * gates the render, touch-only phones never fetch the still / clip at all.
 *
 * The card picks its own spot next to the hovered label — right by default,
 * flipping left and clamping vertically so it can never land off-screen — rather
 * than always appearing in one fixed place.
 */
export function AboutProcessItem({ label }: AboutProcessItemProps) {
  const src = getProcessCraftMedia(label);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLLIElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(any-hover: hover)").matches) setHoverCapable(true);
  }, []);

  /**
   * Place the card beside the label and clamp it into the viewport.
   *
   * Written straight to the element rather than React state — the reposition
   * pass runs on every scroll frame, and re-rendering the list there would be
   * pure waste.
   */
  const place = useCallback(() => {
    const item = rootRef.current;
    const preview = previewRef.current;
    if (!item || !preview) return;

    const itemRect = item.getBoundingClientRect();
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    if (!width || !height) return;

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    /* Prefer the right of the label; flip left when that would leave the view */
    let side: "left" | "right" = "right";
    let left = itemRect.right + PREVIEW_GAP_PX;
    if (left + width > vw - PREVIEW_MARGIN_PX) {
      const flipped = itemRect.left - PREVIEW_GAP_PX - width;
      if (flipped >= PREVIEW_MARGIN_PX) {
        side = "left";
        left = flipped;
      } else {
        /* No room on either side — pin inside the right edge */
        left = Math.max(PREVIEW_MARGIN_PX, vw - PREVIEW_MARGIN_PX - width);
      }
    }

    /* Centre on the label, then pull back inside the viewport */
    let top = itemRect.top + itemRect.height / 2 - height / 2;
    top = Math.max(
      PREVIEW_MARGIN_PX,
      Math.min(top, vh - height - PREVIEW_MARGIN_PX),
    );

    /* Absolute coords → offsets from the item, which is the containing block */
    preview.style.setProperty("--preview-left", `${left - itemRect.left}px`);
    preview.style.setProperty("--preview-top", `${top - itemRect.top}px`);
    preview.dataset.side = side;
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* Measure before paint so the card never flashes at its fallback corner. */
  useLayoutEffect(() => {
    if (!open || !hoverCapable) return;
    place();
  }, [open, hoverCapable, place]);

  /* Hold the clamped spot while the page moves underneath it. */
  useEffect(() => {
    if (!open || !hoverCapable) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener("resize", onMove);
    };
  }, [open, hoverCapable, place]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (open && !reduceMotion) {
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [open, reduceMotion, src]);

  if (!src) {
    return <li>{label}</li>;
  }

  const video = isProcessCraftVideo(src);

  return (
    <li
      ref={rootRef}
      className={cn(
        "about-boua__process-item",
        hoverCapable && "about-boua__process-item--has-media",
        open && "is-open",
      )}
      onPointerEnter={(event) => {
        /* A tap is not a hover — never arm the preview from touch */
        if (event.pointerType === "touch") return;
        setHoverCapable(true);
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        setOpen(false);
      }}
      onFocus={() => {
        if (hoverCapable) setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="about-boua__process-trigger"
        aria-expanded={hoverCapable ? open : undefined}
        aria-label={`${label} process demo`}
      >
        {label}
      </button>
      {hoverCapable ? (
        <div
          ref={previewRef}
          className={cn("about-boua__process-preview", open && "is-open")}
          role="presentation"
          style={
            {
              /* 340px × 0.9 ≈ 306px → 19.125rem */
              ["--process-preview-w" as string]: "min(19.125rem, 64.8vw)",
            } as CSSProperties
          }
        >
          {video ? (
            <ProtectedVideo
              ref={videoRef}
              src={open ? src : undefined}
              className="about-boua__process-preview-media"
              preload="auto"
              loop
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="about-boua__process-preview-media"
              draggable={false}
              decoding="async"
            />
          )}
        </div>
      ) : null}
    </li>
  );
}

type AboutProcessListProps = {
  items: readonly string[];
};

export function AboutProcessList({ items }: AboutProcessListProps) {
  return (
    <ul className="about-boua__expertise-list">
      {items.map((item) => (
        <AboutProcessItem key={item} label={item} />
      ))}
    </ul>
  );
}
