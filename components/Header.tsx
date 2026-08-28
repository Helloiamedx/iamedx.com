"use client";

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

const MOBILE_CURTAIN_MS = 400;
/** Past this Y, down-scroll may tuck the chrome */
const NAV_HIDE_AFTER_Y = 48;
/** Ignore tiny scroll jitter */
const NAV_SCROLL_DELTA = 4;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePortalReady, setMobilePortalReady] = useState(false);
  const [mobileSurface, setMobileSurface] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const navHiddenRef = useRef(false);
  const menuId = useId();

  useEffect(() => {
    setMobileOpen(false);
    navHiddenRef.current = false;
    setNavHidden(false);
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
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

  /*
   * Chrome tuck: first screen may show the bar; after a short down-scroll it
   * hides; up-scroll reveals and keeps it until the next down-scroll.
   * While the mobile About sheet is open, page scroll is locked — listen to the
   * sheet’s own scrollTop instead of window.
   */
  useEffect(() => {
    if (mobileOpen) {
      navHiddenRef.current = false;
      setNavHidden(false);
      document.documentElement.removeAttribute("data-about-sheet-open");
      return;
    }

    let panelEl: HTMLElement | null = null;

    function setHidden(hidden: boolean) {
      if (navHiddenRef.current === hidden) return;
      navHiddenRef.current = hidden;
      setNavHidden(hidden);
    }

    function onScrollY(y: number) {
      const nextY = Math.max(0, y);
      const delta = nextY - lastScrollY.current;
      lastScrollY.current = nextY;

      if (nextY <= NAV_HIDE_AFTER_Y) {
        setHidden(false);
        return;
      }

      if (delta > NAV_SCROLL_DELTA) {
        setHidden(true);
        return;
      }

      if (delta < -NAV_SCROLL_DELTA) {
        setHidden(false);
      }
    }

    function onWindowScroll() {
      if (panelEl) return;
      onScrollY(window.scrollY);
    }

    function onPanelScroll() {
      if (!panelEl) return;
      onScrollY(panelEl.scrollTop);
    }

    function bindAboutPanel() {
      const next = document.querySelector(
        ".project-case-demo.is-panel-open .project-case-demo__panel",
      );
      const el = next instanceof HTMLElement ? next : null;
      if (el === panelEl) return;

      if (panelEl) {
        panelEl.removeEventListener("scroll", onPanelScroll);
      }

      panelEl = el;

      if (panelEl) {
        document.documentElement.dataset.aboutSheetOpen = "1";
        lastScrollY.current = panelEl.scrollTop;
        setHidden(false);
        panelEl.addEventListener("scroll", onPanelScroll, { passive: true });
        return;
      }

      document.documentElement.removeAttribute("data-about-sheet-open");
      lastScrollY.current = window.scrollY;
      onScrollY(window.scrollY);
    }

    lastScrollY.current = window.scrollY;
    onScrollY(window.scrollY);
    bindAboutPanel();

    window.addEventListener("scroll", onWindowScroll, { passive: true });
    const mo = new MutationObserver(bindAboutPanel);
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      panelEl?.removeEventListener("scroll", onPanelScroll);
      mo.disconnect();
      document.documentElement.removeAttribute("data-about-sheet-open");
    };
  }, [mobileOpen]);

  useLayoutEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const html = document.documentElement;
    html.style.overflow = "hidden";
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
      html.style.overflow = "";
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
    <div
      ref={chromeRef}
      className={`site-header-chrome${navHidden ? " is-nav-hidden" : ""}`}
    >
      {/* Same horizontal edges as page `.shell` content */}
      <div className="shell site-header__bar">
        <RollLink href="/" className="site-logo">
          Edward Xu
        </RollLink>

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
            /* Outside body — body is position:fixed while open; Safari then
               mis-anchors fixed overlays and the translucent top chrome leaks. */
            document.documentElement,
          )
        : null}
    </>
  );
}
