"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ClickSpark } from "@/components/ClickSpark";
import { EmailIcon, WeChatIcon, WhatsAppIcon } from "@/components/ContactChannelIcons";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import {
  contactCta,
  contactInfo,
  mobileNavLinks,
  mobileSocialLinks,
  officeInfo,
  weChatCta,
  whatsAppCta,
  whatsAppPhone,
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
    const cta = root.querySelector<HTMLElement>("[data-mobile-anim='cta']");
    const targets = [...links, ...blocks, cta].filter(Boolean) as HTMLElement[];

    gsap.killTweensOf(targets);

    if (open) {
      gsap.set(links, { y: 22, autoAlpha: 0 });
      gsap.set(blocks, { y: 18, autoAlpha: 0 });
      if (cta) gsap.set(cta, { y: 16, autoAlpha: 0 });

      // Wait for vertical columns to drop, then cascade content
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
      if (cta) {
        gsap.to(cta, {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
          delay: 0.74,
        });
      }
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
          <p className="mobile-menu__eyebrow">{contactInfo.eyebrow}</p>
          <div className="mobile-menu__contact-links">
            <a href={contactInfo.emailHref}>{contactInfo.email}</a>
          </div>
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

      <div className="mobile-menu__cta" data-mobile-anim="cta">
        <ClickSpark>
          <GlareHover
            width="auto"
            height="auto"
            background="#25D366"
            borderRadius="999px"
            borderColor="#25D366"
            glareColor="#ffffff"
            glareOpacity={0.55}
            transitionDuration={GLARE_WIPE_MS}
            className="nav-contact-glare--whatsapp"
          >
            <a
              href={whatsAppCta.href}
              className="mobile-menu__cta-btn mobile-menu__cta-btn--with-icon"
              target={whatsAppPhone ? "_blank" : undefined}
              rel={whatsAppPhone ? "noopener noreferrer" : undefined}
              onClick={onNavigate}
            >
              <WhatsAppIcon className="nav-contact__icon" />
              {whatsAppCta.label}
            </a>
          </GlareHover>
        </ClickSpark>
        <ClickSpark>
          <GlareHover
            width="auto"
            height="auto"
            background="#07C160"
            borderRadius="999px"
            borderColor="#07C160"
            glareColor="#ffffff"
            glareOpacity={0.55}
            transitionDuration={GLARE_WIPE_MS}
            className="nav-contact-glare--wechat"
          >
            <a
              href={weChatCta.href}
              className="mobile-menu__cta-btn mobile-menu__cta-btn--with-icon"
              onClick={onNavigate}
            >
              <WeChatIcon className="nav-contact__icon" />
              {weChatCta.label}
            </a>
          </GlareHover>
        </ClickSpark>
        <ClickSpark>
          <GlareHover
            width="auto"
            height="auto"
            background="#0076dd"
            borderRadius="999px"
            borderColor="#0076dd"
            glareColor="#ffffff"
            glareOpacity={0.55}
            transitionDuration={GLARE_WIPE_MS}
          >
            <Link
              href={contactCta.href}
              className="mobile-menu__cta-btn mobile-menu__cta-btn--with-icon"
              onClick={onNavigate}
            >
              <EmailIcon className="nav-contact__icon" />
              {contactCta.label}
            </Link>
          </GlareHover>
        </ClickSpark>
      </div>
    </div>
  );
}
