"use client";

import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type FilterSegmentItem = {
  id: string;
  label: string;
  href: string;
};

type FilterSegmentTrackProps = {
  items: FilterSegmentItem[];
  activeId: string;
  ariaLabel: string;
};

/**
 * Desktop: iOS-style capsule with a sliding thumb under the active label.
 * Narrow: content-sized pills that wrap by available width (no full-width stack).
 */
export function FilterSegmentTrack({
  items,
  activeId,
  ariaLabel,
}: FilterSegmentTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => {
      /* Narrow layout: thumb is hidden — skip measuring */
      if (window.matchMedia("(max-width: 860px)").matches) {
        setThumb((prev) => (prev.ready ? { x: 0, w: 0, ready: false } : prev));
        return;
      }
      const pill = pillRefs.current.get(activeId);
      if (!pill) return;
      setThumb({
        x: pill.offsetLeft,
        w: pill.offsetWidth,
        ready: true,
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(track);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [activeId, items]);

  const thumbStyle: CSSProperties | undefined = thumb.ready
    ? {
        width: thumb.w,
        transform: `translate3d(${thumb.x}px, 0, 0)`,
      }
    : undefined;

  return (
    <div
      ref={trackRef}
      className="project-involvement__track"
      role="list"
      aria-label={ariaLabel}
    >
      <span
        className={
          thumb.ready
            ? "project-involvement__thumb is-ready"
            : "project-involvement__thumb"
        }
        style={thumbStyle}
        aria-hidden="true"
      />
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            scroll={false}
            role="listitem"
            ref={(node) => {
              if (node) pillRefs.current.set(item.id, node);
              else pillRefs.current.delete(item.id);
            }}
            className={
              isActive
                ? "project-involvement__pill is-active"
                : "project-involvement__pill"
            }
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
