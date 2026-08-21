"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MobileBubbleNav } from "@/components/MobileBubbleNav";
import { RollLink } from "@/components/RollLink";
import { primaryNav } from "@/content/nav";
import { asset } from "@/lib/assets";

const MOBILE_CURTAIN_MS = 400;

function SiteLogo() {
  return (
    <>
      <Image
        src={asset("/brand/iamedwardxu-logo-white.svg")}
        alt=""
        width={200}
        height={24}
        priority
        fetchPriority="high"
        unoptimized
        className="site-logo__img site-logo__img--white"
        aria-hidden="true"
      />
      <Image
        src={asset("/brand/iamedwardxu-logo-black.svg")}
        alt=""
        width={200}
        height={24}
        priority
        fetchPriority="high"
        unoptimized
        className="site-logo__img site-logo__img--black"
        aria-hidden="true"
      />
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePortalReady, setMobilePortalReady] = useState(false);
  const [mobileSurface, setMobileSurface] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Portal only after mount — avoid Image/load callbacks updating pre-mount trees. */
  useEffect(() => {
    setMobilePortalReady(true);
    document.documentElement.dataset.chromeReady = "1";
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-mobile-menu-open", mobileOpen);
    return () => {
      document.body.classList.remove("is-mobile-menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      setMobileSurface(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setMobileSurface(false);
    }, MOBILE_CURTAIN_MS);

    return () => window.clearTimeout(timer);
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useLayoutEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    const preventTouch = (event: TouchEvent) => {
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventTouch);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const chrome = (
    <div ref={chromeRef} className="site-header-chrome">
      <div className="shell site-header__bar">
        <Link href="/" className="site-logo" aria-label="Edward Xu home">
          <SiteLogo />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <RollLink key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </RollLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className={`nav-menu-toggle${mobileOpen ? " is-open" : ""}`}
            aria-expanded={mobileOpen}
            aria-controls={`${menuId}-mobile`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMobileOpen((value) => !value);
            }}
          >
            <span className="nav-menu-toggle__label" data-label="menu">
              Menu
            </span>
            <span className="nav-menu-toggle__label" data-label="close">
              Close
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="site-header" aria-hidden="true">
        <div className="site-header__drop">
          <div
            className="shell site-header__bar site-header__bar--spacer"
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Fixed chrome stays in-tree — no portal remount (avoids pre-mount setState). */}
      {chrome}

      {mobilePortalReady
        ? createPortal(
            <div
              className={`mobile-nav${mobileOpen ? " is-open" : ""}${mobileSurface ? " is-surface" : ""}`}
              id={`${menuId}-mobile`}
              aria-hidden={!mobileOpen}
            >
              <div className="mobile-nav__frost" aria-hidden="true">
                <span className="mobile-nav__frost-blur" />
                <span className="mobile-nav__frost-wash" />
              </div>
              <div className="shell mobile-nav__inner">
                <MobileBubbleNav
                  open={mobileOpen}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
