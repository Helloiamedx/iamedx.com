"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  footerChannels,
  mobileNavLinks,
  mobileSocialLinks,
  officeInfo,
} from "@/content/nav";

type MobileBubbleNavProps = {
  open: boolean;
  onNavigate: () => void;
};

function ExternalArrow() {
  return (
    <span className="mobile-menu__external-icon" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M4 10.5L10.5 4M10.5 4H5.5M10.5 4V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function MobileBubbleNav({ open, onNavigate }: MobileBubbleNavProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const links = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mobile-anim='link']"),
    );
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mobile-anim='block']"),
    );
    const targets = [...links, ...blocks];

    gsap.killTweensOf(targets);

    if (open) {
      gsap.set(links, { y: 22, autoAlpha: 0 });
      gsap.set(blocks, { y: 18, autoAlpha: 0 });

      gsap.to(links, {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        stagger: 0.055,
        ease: "power3.out",
        delay: 0.38,
      });
      gsap.to(blocks, {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.56,
      });
      return;
    }

    gsap.to(targets, {
      y: 8,
      autoAlpha: 0,
      duration: 0.14,
      ease: "power2.in",
      stagger: 0.012,
    });
  }, [open]);

  return (
    <div ref={rootRef} className="mobile-menu">
      <nav className="mobile-menu__nav" aria-label="Mobile">
        <ul className="mobile-menu__list">
          {mobileNavLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="mobile-menu__link"
                data-mobile-anim="link"
                onClick={onNavigate}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mobile-menu__meta">
        <div className="mobile-menu__block" data-mobile-anim="block">
          <p className="mobile-menu__eyebrow">{officeInfo.eyebrow}</p>
          <a
            href={officeInfo.mapsHref}
            className="mobile-menu__address"
            target="_blank"
            rel="noopener noreferrer"
          >
            {officeInfo.address}
          </a>
        </div>

        <div className="mobile-menu__block" data-mobile-anim="block">
          <p className="mobile-menu__eyebrow">Contact</p>
          <ul className="mobile-menu__channels">
            {footerChannels.map((row) => (
              <li key={row.label} className="mobile-menu__channel">
                <span className="mobile-menu__channel-label">{row.label}</span>
                <a
                  href={row.href}
                  className="mobile-menu__channel-value"
                  {...(row.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  onClick={onNavigate}
                >
                  {row.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mobile-menu__block" data-mobile-anim="block">
          <p className="mobile-menu__eyebrow">Social</p>
          <div className="mobile-menu__social">
            {mobileSocialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{item.label}</span>
                <ExternalArrow />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
