"use client";

import {
  footerLinkColumns,
  footerTagline,
  mobileSocialLinks,
} from "@/content/nav";
import { FooterContactForm } from "@/components/FooterContactForm";
import { FooterScrollColumn } from "@/components/FooterScrollColumn";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const MENU_ROW_SIZE = 4;

export function Footer() {
  const year = new Date().getFullYear();
  const rowOne = footerLinkColumns.slice(0, MENU_ROW_SIZE);
  const rowTwo = footerLinkColumns.slice(MENU_ROW_SIZE, MENU_ROW_SIZE * 2);

  return (
    <footer className="site-footer">
      <div className="shell site-footer__shell">
        {/* Left copy · center menus · right contact */}
        <div className="site-footer__top-band">
          <div className="site-footer__tl site-footer__panel">
            <p className="site-footer__tagline">{footerTagline}</p>
            <ProtectedVideo
              className="site-footer__video"
              src={asset("videos/Turning Ideas Into Products.mp4")}
              preload="metadata"
              aria-label="Turning ideas into products"
            />
          </div>

          <nav className="site-footer__tr" aria-label="Footer">
            <div className="site-footer__menu-grid">
              {rowOne.map((column) => (
                <FooterScrollColumn
                  key={column.id}
                  title={column.title}
                  links={column.links}
                />
              ))}
              {rowTwo.map((column) => (
                <FooterScrollColumn
                  key={column.id}
                  title={column.title}
                  links={column.links}
                />
              ))}
            </div>
          </nav>

          <div className="site-footer__tm">
            <FooterContactForm />
          </div>
        </div>

        {/* Bottom: hairline + legal / social */}
        <div className="site-footer__bottom">
          <div className="site-footer__rule" aria-hidden="true" />
          <div className="site-footer__bottom-band">
            <div className="site-footer__bl">
              <p className="site-footer__legal">
                <span>© {year} iamedx</span>
                <span className="site-footer__legal-sep" aria-hidden="true">
                  ·
                </span>
                <span>All rights reserved</span>
              </p>
            </div>
            <div className="site-footer__br">
              <ul className="site-footer__social">
                {mobileSocialLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className="site-footer__ext" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
