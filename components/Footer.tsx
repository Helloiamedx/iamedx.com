"use client";

import Image from "next/image";
import {
  footerAboutCopy,
  footerChannels,
  footerHelpTitle,
  footerPaymentsNote,
  mobileSocialLinks,
} from "@/content/nav";
import { asset } from "@/lib/assets";

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

  return (
    <footer className="site-footer">
      <div className="site-footer__stage">
        <div className="site-footer__shell">
          <div className="site-footer__band">
            <p className="site-footer__band-label">{footerHelpTitle}</p>
            <ul className="site-footer__channels">
              {footerChannels.map((row) => (
                <li key={row.label} className="site-footer__channel">
                  <span className="site-footer__channel-label">{row.label}</span>
                  <a
                    href={row.href}
                    className="site-footer__channel-value"
                    {...(row.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {row.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <hr className="site-footer__rule" />

          <div className="site-footer__band site-footer__band--about">
            <p className="site-footer__band-label">About</p>
            <p className="site-footer__about-copy">{footerAboutCopy}</p>
          </div>
        </div>

        <div className="site-footer__brand" aria-hidden="true">
          <Image
            src={asset("/brand/iamedwardxu-logo-white.svg")}
            alt=""
            width={500}
            height={60}
            unoptimized
            className="site-footer__brand-img"
            draggable={false}
          />
        </div>

        <div className="site-footer__shell site-footer__shell--bottom">
          <div className="site-footer__bottom">
            <p className="site-footer__legal">
              <span>© {year} iamedx</span>
              <span className="site-footer__legal-sep" aria-hidden="true">
                ·
              </span>
              <span>All rights reserved</span>
            </p>

            <p className="site-footer__payments">{footerPaymentsNote}</p>

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
          </div>
        </div>
      </div>
    </footer>
  );
}
