"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MegaLink } from "@/content/nav";

type FooterScrollColumnProps = {
  title: string;
  links: MegaLink[];
};

const SPEED_PX_PER_SEC = 18;

/**
 * Fixed-height link column — seamless upward loop (short lists included).
 * Pauses on hover; links stay clickable.
 */
export function FooterScrollColumn({ title, links }: FooterScrollColumnProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || links.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cycle = 0;
    let raf = 0;
    let last = performance.now();

    const items = () =>
      Array.from(
        track.querySelectorAll<HTMLElement>(".footer-scroll-col__item"),
      );

    const measure = () => {
      const els = items();
      const n = links.length;
      if (els.length < n * 2) {
        cycle = 0;
        return;
      }
      cycle = els[n].offsetTop - els[0].offsetTop;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduceMotion && !pausedRef.current && cycle > 0) {
        offsetRef.current += SPEED_PX_PER_SEC * dt;
        if (offsetRef.current >= cycle) offsetRef.current -= cycle;
        track.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(viewport);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [links]);

  const sequence = [0, 1] as const;

  return (
    <section className="footer-scroll-col">
      <h2 className="footer-scroll-col__title">{title}</h2>
      <div
        ref={viewportRef}
        className="footer-scroll-col__viewport"
        onPointerEnter={() => {
          pausedRef.current = true;
        }}
        onPointerLeave={() => {
          pausedRef.current = false;
        }}
      >
        <ul ref={trackRef} className="footer-scroll-col__track">
          {sequence.map((copy) =>
            links.map((link) => (
              <li
                key={`${copy}-${link.slug}`}
                className="footer-scroll-col__item"
                aria-hidden={copy === 1}
              >
                <Link href={link.href} tabIndex={copy === 1 ? -1 : undefined}>
                  {link.label}
                </Link>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
