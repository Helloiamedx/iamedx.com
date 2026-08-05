"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { linkedInHref, mobileBubbleItems } from "@/content/nav";

type MobileBubbleNavProps = {
  open: boolean;
  onNavigate: () => void;
};

export function MobileBubbleNav({ open, onNavigate }: MobileBubbleNavProps) {
  const pillsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pills = pillsRef.current.filter(Boolean) as HTMLAnchorElement[];
    const labels = labelsRef.current.filter(Boolean) as HTMLSpanElement[];
    const footer = footerRef.current;
    if (!pills.length) return;

    gsap.killTweensOf([...pills, ...labels, footer].filter(Boolean));

    if (open) {
      gsap.set(pills, {
        y: -160,
        scale: 0.72,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(labels, { autoAlpha: 1 });
      if (footer) gsap.set(footer, { y: 16, autoAlpha: 0 });

      pills.forEach((pill, i) => {
        const delay = i * 0.1 + gsap.utils.random(-0.04, 0.04);
        gsap.to(pill, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.62,
          delay,
          ease: "back.out(1.6)",
        });
      });

      if (footer) {
        gsap.to(footer, {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
          delay: pills.length * 0.1 + 0.2,
        });
      }
      return;
    }

    if (footer) {
      gsap.to(footer, {
        y: 12,
        autoAlpha: 0,
        duration: 0.18,
        ease: "power3.in",
      });
    }
    gsap.to(pills, {
      y: -80,
      scale: 0.85,
      autoAlpha: 0,
      duration: 0.22,
      ease: "power3.in",
    });
  }, [open]);

  return (
    <div className="mobile-bubble">
      <div className="mobile-bubble__stage">
        <ul className="mobile-bubble__list">
          {mobileBubbleItems.map((item, idx) => (
            <li
              key={item.href}
              className="mobile-bubble__col"
              style={
                {
                  "--item-rot": `${item.rotation}deg`,
                } as CSSProperties
              }
            >
              <Link
                href={item.href}
                className="mobile-bubble__pill"
                aria-label={item.label}
                ref={(el) => {
                  pillsRef.current[idx] = el;
                }}
                style={
                  {
                    "--pill-bg": item.hoverStyles.bgColor,
                    "--pill-color": item.hoverStyles.textColor,
                    "--hover-bg": item.hoverStyles.bgColor,
                    "--hover-color": item.hoverStyles.textColor,
                  } as CSSProperties
                }
                onClick={onNavigate}
              >
                <span
                  className="mobile-bubble__label"
                  ref={(el) => {
                    labelsRef.current[idx] = el;
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div ref={footerRef} className="mobile-bubble__footer">
        <hr className="mobile-bubble__rule" />
        <a
          href={linkedInHref}
          className="mobile-bubble__external"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>LinkedIn</span>
          <span className="mobile-bubble__external-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M4 10.5L10.5 4M10.5 4H5.5M10.5 4V9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
