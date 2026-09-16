"use client";

import {
  useCallback,
  useEffect,
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

type AboutProcessItemProps = {
  label: string;
};

/**
 * Process label with optional hover demo (16:9 still / muted clip).
 * Only items with CDN media get the preview.
 */
export function AboutProcessItem({ label }: AboutProcessItemProps) {
  const src = getProcessCraftMedia(label);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLLIElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

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
        "about-boua__process-item--has-media",
        open && "is-open",
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="about-boua__process-trigger"
        aria-expanded={open}
        aria-label={`${label} process demo`}
        onClick={(e) => {
          /* Touch / no-hover: toggle. Pointer hover already opens on enter. */
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            return;
          }
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        {label}
      </button>
      <div
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
