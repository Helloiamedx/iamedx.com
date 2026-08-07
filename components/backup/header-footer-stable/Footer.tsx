"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  contactCta,
  footerAssistCopy,
  footerAssistTitle,
  footerLeadCopy,
  footerNavColumns,
  footerPaymentsNote,
  mobileSocialLinks,
  weChatCta,
  whatsAppCta,
  whatsAppPhone,
} from "@/content/nav";
import { ClickSpark } from "@/components/ClickSpark";
import {
  EmailIcon,
  WeChatIcon,
  WhatsAppIcon,
} from "@/components/ContactChannelIcons";
import { FooterVideoMarquee } from "@/components/FooterVideoMarquee";
import { FooterWordmark } from "@/components/FooterWordmark";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import { LightRays } from "@/components/LightRays";
import VariableProximity from "@/components/VariableProximity";

function ExternalArrow() {
  return (
    <span className="site-footer__ext" aria-hidden="true">
      <svg viewBox="0 0 14 14" fill="none">
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

export function Footer() {
  const year = new Date().getFullYear();
  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <footer className="site-footer">
      <div className="site-footer__stage">
        <div className="site-footer__marquee">
          <FooterVideoMarquee />
        </div>

        <FooterWordmark
          rays={
            <LightRays
              raysOrigin="top-center"
              raysColor="#ffffff"
              raysSpeed={1}
              lightSpread={2.2}
              rayLength={3}
              followMouse={false}
              mouseInfluence={0}
              noiseAmount={0}
              distortion={0}
              pulsating={false}
              fadeDistance={1.5}
              saturation={1}
              className="custom-rays"
            />
          }
        />

        <div className="site-footer__shell" ref={shellRef}>
          <h2 className="site-footer__lead">
            <VariableProximity
              label={footerLeadCopy}
              className="site-footer__lead-proximity"
              fromFontVariationSettings="'wght' 600, 'opsz' 18"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              containerRef={shellRef}
              radius={140}
              falloff="linear"
            />
          </h2>

          <div className="site-footer__mid">
            <div className="site-footer__assist">
              <h3 className="site-footer__assist-title">{footerAssistTitle}</h3>
              <p className="site-footer__assist-copy">{footerAssistCopy}</p>
              <div className="site-footer__assist-actions">
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
                    className="nav-contact-glare nav-contact-glare--whatsapp"
                  >
                    <a
                      href={whatsAppCta.href}
                      className="nav-contact nav-contact--with-icon"
                      target={whatsAppPhone ? "_blank" : undefined}
                      rel={whatsAppPhone ? "noopener noreferrer" : undefined}
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
                    className="nav-contact-glare nav-contact-glare--wechat"
                  >
                    <a
                      href={weChatCta.href}
                      className="nav-contact nav-contact--with-icon"
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
                    className="nav-contact-glare"
                  >
                    <Link
                      href={contactCta.href}
                      className="nav-contact nav-contact--with-icon"
                    >
                      <EmailIcon className="nav-contact__icon" />
                      {contactCta.label}
                    </Link>
                  </GlareHover>
                </ClickSpark>
              </div>
            </div>

            <nav className="site-footer__nav" aria-label="Footer">
              {footerNavColumns.map((column) => (
                <div key={column.id} className="site-footer__nav-col">
                  <p className="site-footer__nav-heading">{column.label}</p>
                  <ul>
                    {column.links.map((link) => (
                      <li key={`${column.id}-${link.label}`}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="site-footer__bottom">
            <p className="site-footer__legal">
              <span>© {year} iamedx</span>
              <span className="site-footer__legal-sep" aria-hidden="true">
                ·
              </span>
              <span>All rights reserved</span>
            </p>

            <ul className="site-footer__social">
              {mobileSocialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="site-footer__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="site-footer__social-label">
                      {link.label}
                      <ExternalArrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="site-footer__payments">{footerPaymentsNote}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
