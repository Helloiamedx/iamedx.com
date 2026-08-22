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
import { WeChatQrModal } from "@/components/WeChatQrModal";

type MobileBubbleNavProps = {
  open: boolean;
  onNavigate: () => void;
};

/* Frost fade — text comes in with the plate */
const MOBILE_CONTENT_DELAY_S = 0.12;
const MOBILE_META_DELAY_S = 0.22;

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
      /* Start hidden — curtain paints first, then content eases in */
      gsap.set(links, { y: 28, autoAlpha: 0 });
      gsap.set(blocks, { y: 22, autoAlpha: 0 });

      gsap.to(links, {
        y: 0,
        autoAlpha: 1,
        duration: 0.55,
        stagger: 0.06,
        ease: "power3.out",
        delay: MOBILE_CONTENT_DELAY_S,
      });
      gsap.to(blocks, {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        delay: MOBILE_META_DELAY_S,
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
          <ul className="mobile-menu__channels">
            {footerChannels.map((row) => (
              <li key={row.label} className="mobile-menu__channel">
                <span className="mobile-menu__channel-label">{row.label}</span>
                {"action" in row && row.action === "wechat" ? (
                  <WeChatQrModal className="mobile-menu__channel-value">
                    {row.value}
                  </WeChatQrModal>
                ) : "href" in row ? (
                  <a
                    href={row.href}
                    className="mobile-menu__channel-value"
                    {...("external" in row && row.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={onNavigate}
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="mobile-menu__channel-value">{row.value}</span>
                )}
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
