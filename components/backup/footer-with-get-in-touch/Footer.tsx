"use client";

import {
  footerLinkColumns,
  footerTagline,
  mobileSocialLinks,
} from "@/content/nav";
import { FooterContactForm } from "@/components/FooterContactForm";
import { FooterScrollColumn } from "@/components/FooterScrollColumn";
import { LightRays } from "@/components/LightRays";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const MENU_ROW_SIZE = 4;

export function Footer() {
  const year = new Date().getFullYear();
  const rowOne = footerLinkColumns.slice(0, MENU_ROW_SIZE);
  const rowTwo = footerLinkColumns.slice(MENU_ROW_SIZE, MENU_ROW_SIZE * 2);

  return (
    <footer className="site-footer">
      <div className="site-footer__rays" aria-hidden="true">
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={2.2}
          rayLength={3}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
          className="custom-rays"
        />
      </div>

      <div className="shell site-footer__shell">
        {/* Left media · center contact · right links */}
        <div className="site-footer__top-band">
          <div className="site-footer__tl">
            <div className="footer-panel-beam">
              <div className="site-footer__panel site-footer__panel--media">
                <p className="site-footer__tagline">{footerTagline}</p>
                <ProtectedVideo
                  className="site-footer__video"
                  src={asset("videos/Turning Ideas Into Products.mp4")}
                  preload="metadata"
                  aria-label="Turning ideas into products"
                />
              </div>
            </div>
          </div>

          <div className="site-footer__tm">
            <FooterContactForm />
          </div>

          <div className="site-footer__tr">
            <div className="footer-panel-beam">
              <nav
                className="site-footer__panel site-footer__panel--links"
                aria-label="Footer"
              >
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
            </div>
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
