"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type HomeRecognitionPhotoAccordionProps = {
  images: string[];
  /** Reset open panel / slideshow when the parent carousel leaves this slide */
  active?: boolean;
  /**
   * Mobile (≤700px): full-bleed hard-cut slideshow instead of accordion.
   * Desktop keeps the 4-up hover accordion.
   */
  slideshow?: boolean;
  /** When false, freeze the hard-cut frame (matches carousel autoplay pause). */
  playing?: boolean;
  /** Hard-cut interval on mobile (ms) */
  slideMs?: number;
  /**
   * Bump from parent (e.g. tap on card copy) to collapse accordion
   * or reset slideshow to the first frame.
   */
  resetKey?: number;
};

export const RECOGNITION_PHOTO_SLIDE_MS = 2000;

/**
 * Recognition “Clients Reorder” media.
 * Desktop: 4-up photo accordion. Mobile: full-frame hard-cut cycle.
 */
export function HomeRecognitionPhotoAccordion({
  images,
  active = true,
  slideshow = false,
  playing = true,
  slideMs = RECOGNITION_PHOTO_SLIDE_MS,
  resetKey = 0,
}: HomeRecognitionPhotoAccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const lastResetKeyRef = useRef(resetKey);
  const openIndexRef = useRef(openIndex);
  openIndexRef.current = openIndex;
  const lastPointerTypeRef = useRef<string>("mouse");

  const activate = useCallback((next: number | null) => {
    setOpenIndex(next);
  }, []);

  const collapse = useCallback(() => {
    setOpenIndex(null);
  }, []);

  const resetLayout = useCallback(() => {
    collapse();
    setSlideIndex(0);
  }, [collapse]);

  useEffect(() => {
    if (!active) resetLayout();
  }, [active, resetLayout]);

  useEffect(() => {
    if (resetKey === lastResetKeyRef.current) return;
    lastResetKeyRef.current = resetKey;
    resetLayout();
  }, [resetKey, resetLayout]);

  /* Mobile hard-cut — advances only while carousel autoplay is armed */
  useEffect(() => {
    if (!slideshow || !active || !playing || images.length < 2) return;
    const timer = window.setInterval(() => {
      setSlideIndex((value) => (value + 1) % images.length);
    }, slideMs);
    return () => window.clearInterval(timer);
  }, [slideshow, active, playing, images.length, slideMs]);

  /*
   * Touch / click outside the strips (copy, chrome, page): collapse accordion.
   */
  useEffect(() => {
    if (slideshow || !active || openIndex === null) return;

    const onPointerDown = (event: Event) => {
      const root = rootRef.current;
      const target = event.target as Node | null;
      if (!root || !target) return;
      if (root.contains(target)) return;
      collapse();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [slideshow, active, openIndex, collapse]);

  const onPointerEnterPanel = (
    index: number,
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      activate(index);
    }
  };

  const onPointerLeaveRoot = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      collapse();
    }
  };

  const onFocusOutRoot = (event: FocusEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    if (!root.contains(event.relatedTarget as Node | null)) {
      collapse();
    }
  };

  const onKeyDownRoot = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    const root = rootRef.current;
    if (root?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    collapse();
  };

  if (images.length === 0) return null;

  if (slideshow) {
    return (
      <div
        className="home-recognition-photo-slideshow"
        aria-hidden={!active}
      >
        {images.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- hard-cut stack
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            draggable={false}
            className={`home-recognition-photo-slideshow__frame${
              index === slideIndex ? " is-active" : ""
            }`}
          />
        ))}
      </div>
    );
  }

  const isOpen = openIndex !== null;

  return (
    <div
      ref={rootRef}
      className={`home-recognition-photo-accordion${isOpen ? " is-active" : ""}`}
      onPointerLeave={onPointerLeaveRoot}
      onBlur={onFocusOutRoot}
      onKeyDown={onKeyDownRoot}
    >
      {images.map((src, index) => {
        const panelActive = openIndex === index;
        return (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`home-recognition-photo-accordion__panel${panelActive ? " is-active" : ""}`}
            aria-label={`Expand photo ${index + 1}`}
            aria-pressed={panelActive}
            onClick={(event) => {
              event.stopPropagation();
              if (
                lastPointerTypeRef.current === "mouse" ||
                lastPointerTypeRef.current === "pen"
              ) {
                return;
              }
              if (openIndexRef.current !== null) {
                collapse();
                return;
              }
              activate(index);
            }}
            onPointerDown={(event) => {
              lastPointerTypeRef.current = event.pointerType;
            }}
            onPointerEnter={(event) => onPointerEnterPanel(index, event)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- square crop window needs height-locked img */}
            <img src={src} alt="" draggable={false} />
          </button>
        );
      })}
    </div>
  );
}
