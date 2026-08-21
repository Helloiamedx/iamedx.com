"use client";

import Image from "next/image";
import {
  contactInfo,
  footerLeadLine,
  footerMenuLinks,
  linkedInHref,
  officeInfo,
  whatsAppCta,
} from "@/content/nav";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { RollLink } from "@/components/RollLink";
import { asset } from "@/lib/assets";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__stage">
        <div className="site-footer__shell">
          <div className="site-footer__top">
            <p className="site-footer__lead">{footerLeadLine}</p>

            <div className="site-footer__cta-actions">
              <div className="site-footer__whatsapp">
                <InteractiveHoverButton
                  text={whatsAppCta.label}
                  href={whatsAppCta.href}
                  external
                  className="site-footer__whatsapp-btn w-[9.25rem]"
                />
              </div>
            </div>

            <div className="site-footer__aside-col">
              <p className="site-footer__aside-label">Social</p>
              <p className="site-footer__aside-label">Support</p>
              <p className="site-footer__aside-label">Menu</p>

              <div className="site-footer__aside-content">
                <RollLink
                  href={linkedInHref}
                  className="site-footer__aside-link"
                  external
                >
                  LinkedIn
                </RollLink>
              </div>

              <div className="site-footer__aside-content">
                <RollLink href={contactInfo.emailHref} className="site-footer__aside-link">
                  {contactInfo.email}
                </RollLink>
              </div>

              <div className="site-footer__aside-content site-footer__aside-content--menu">
                <ul className="site-footer__menu">
                  {footerMenuLinks.map((item) => (
                    <li key={item.href}>
                      <RollLink href={item.href} className="site-footer__aside-link">
                        {item.label}
                      </RollLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="site-footer__aside-hq">
                <p className="site-footer__aside-label">Headquarters</p>
                <div className="site-footer__aside-content">
                  <a
                    href={officeInfo.mapsHref}
                    className="site-footer__aside-address site-footer__aside-address--static"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {officeInfo.address}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer__brand-block">
          <p className="site-footer__legal">
            <span>© {year} iamedx</span>
            <span className="site-footer__legal-extra">
              <span className="site-footer__legal-sep" aria-hidden="true">
                ·
              </span>
              <span>All rights reserved</span>
            </span>
          </p>

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
        </div>
      </div>
    </footer>
  );
}
