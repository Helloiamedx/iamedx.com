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
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import { MobileBubbleNav } from "@/components/MobileBubbleNav";
import { headerCtaLinks, primaryNav } from "@/content/nav";
import { asset } from "@/lib/assets";

const MOBILE_CURTAIN_MS = 400;

/** Ignore the synthetic hover browsers fire when the window is focused again. */
let pointerHoverArmed = false;
let pointerSampleX = Number.NaN;
let pointerSampleY = Number.NaN;
let hoverGateBound = false;
const hoverResetters = new Set<() => void>();

function lockPointerHover() {
  pointerHoverArmed = false;
  pointerSampleX = Number.NaN;
  pointerSampleY = Number.NaN;
  hoverResetters.forEach((reset) => reset());
}

function bindPointerHoverGate() {
  if (hoverGateBound || typeof window === "undefined") return;
  hoverGateBound = true;

  const onPointerMove = (event: PointerEvent) => {
    const x = event.clientX;
    const y = event.clientY;
    if (!Number.isFinite(pointerSampleX)) {
      pointerSampleX = x;
      pointerSampleY = y;
      if (event.movementX === 0 && event.movementY === 0) return;
    }
    if (
      x === pointerSampleX &&
      y === pointerSampleY &&
      event.movementX === 0 &&
      event.movementY === 0
    ) {
      return;
    }
    pointerSampleX = x;
    pointerSampleY = y;
    pointerHoverArmed = true;
  };

  window.addEventListener("blur", lockPointerHover);
  window.addEventListener("pagehide", lockPointerHover);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) lockPointerHover();
  });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
}

function SiteLogo({
  onReady,
}: {
  onReady?: () => void;
}) {
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
        onLoad={onReady}
        onLoadingComplete={onReady}
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
        onLoad={onReady}
        onLoadingComplete={onReady}
      />
    </>
  );
}

function FillHoverLink({
  href,
  label,
  className,
  external,
}: {
  href: string;
  label: string;
  className?: string;
  external?: boolean;
}) {
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

  useEffect(() => {
    bindPointerHoverGate();
    const reset = () => setPhase("idle");
    hoverResetters.add(reset);
    return () => {
      hoverResetters.delete(reset);
    };
  }, []);

  function onFillEnd(event: TransitionEvent<HTMLSpanElement>) {
    if (event.propertyName !== "transform") return;
    setPhase((current) => (current === "out" ? "idle" : current));
  }

  function enter() {
    if (!pointerHoverArmed) return;
    setPhase("in");
  }

  function leave() {
    setPhase((current) => (current === "idle" ? "idle" : "out"));
  }

  const classes = `work-with-me${className ? ` ${className}` : ""}${phase === "in" ? " is-cta-in" : ""}${phase === "out" ? " is-cta-out" : ""}${phase === "idle" ? " is-cta-idle" : ""}`;
  const inner = (
    <>
      <span
        className="work-with-me__fill"
        aria-hidden="true"
        onTransitionEnd={onFillEnd}
      />
      <span className="work-with-me__label">{label}</span>
      <span className="work-with-me__arrow" aria-hidden="true">
        →
      </span>
    </>
  );

  const hover = {
    onPointerEnter: enter,
    onPointerMove: enter,
    onPointerLeave: leave,
    onFocus: (event: { currentTarget: HTMLElement }) => {
      if (event.currentTarget.matches(":focus-visible")) setPhase("in");
    },
    onBlur: leave,
  };

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...hover}
      >
        {inner}
      </a>
    );
  }

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={classes} {...hover}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...hover}>
      {inner}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePortalReady, setMobilePortalReady] = useState(false);
  const [mobileSurface, setMobileSurface] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobilePortalReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const chrome = chromeRef.current;
    const nav = chrome?.querySelector<HTMLElement>(".site-nav");
    const shell = chrome?.querySelector<HTMLElement>(".shell");
    if (!nav || !shell) return;

    const sync = () => {
      const shellRect = shell.getBoundingClientRect();
      const firstLink = nav.querySelector<HTMLElement>(".site-nav__link");
      if (!firstLink || shellRect.width <= 0) return;
      if (nav.getBoundingClientRect().width <= 0) return;

      const padLeft = Number.parseFloat(getComputedStyle(firstLink).paddingLeft) || 0;
      const alignLeft = firstLink.getBoundingClientRect().left + padLeft;
      const inset = Math.max(0, alignLeft - shellRect.left);
      document.documentElement.style.setProperty("--site-nav-inset", `${inset}px`);
      document.documentElement.style.setProperty(
        "--site-nav-half",
        `${nav.getBoundingClientRect().width / 2}px`,
      );
    };

    sync();
    void document.fonts?.ready.then(sync);
    window.addEventListener("resize", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(nav);
    ro.observe(shell);
    return () => {
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [mobilePortalReady]);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.chromeReady === "1") return;

    const markReady = () => {
      if (root.dataset.chromeReady === "1") return;
      root.dataset.chromeReady = "1";
    };

    const fallback = window.setTimeout(markReady, 900);
    return () => window.clearTimeout(fallback);
  }, []);

  function onLogoReady() {
    requestAnimationFrame(() => {
      document.documentElement.dataset.chromeReady = "1";
    });
  }

  useEffect(() => {
    document.body.classList.toggle("is-mobile-menu-open", mobileOpen);
    return () => {
      document.body.classList.remove("is-mobile-menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      const frame = requestAnimationFrame(() => {
        setMobileSurface(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const timer = setTimeout(() => {
      setMobileSurface(false);
    }, MOBILE_CURTAIN_MS);

    return () => clearTimeout(timer);
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
    <div
      ref={chromeRef}
      className={`site-header-chrome${mobileSurface ? " is-mobile-surface" : ""}`}
    >
      <div className="shell site-header__bar">
        <Link href="/" className="site-logo" aria-label="Edward Xu home">
          <SiteLogo onReady={onLogoReady} />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <FillHoverLink
              key={item.href}
              href={item.href}
              label={item.label}
              className="site-nav__link work-with-me--nav"
            />
          ))}
        </nav>

        <div className="site-header__actions">
          <div className="work-with-me-wrap">
            {headerCtaLinks.map((link) => (
              <FillHoverLink
                key={link.label}
                href={link.href}
                label={link.label}
                external={link.external}
                className={"mobile" in link && link.mobile ? undefined : "work-with-me--desktop"}
              />
            ))}
          </div>
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
      <header
        ref={headerRef}
        className={`site-header${mobileOpen ? " is-expanded" : ""}${mobileSurface ? " is-mobile-surface" : ""}`}
      >
        <div className="site-header__drop">
          <div className="site-header__frost" aria-hidden="true">
            <span className="site-header__blur site-header__blur--1" />
            <span className="site-header__blur site-header__blur--2" />
            <span className="site-header__blur site-header__blur--3" />
            <span className="site-header__blur site-header__blur--4" />
            <span className="site-header__blur site-header__blur--5" />
            <span className="site-header__wash" />
          </div>

          <div
            className="shell site-header__bar site-header__bar--spacer"
            aria-hidden="true"
          />
        </div>
      </header>

      {mobilePortalReady ? createPortal(chrome, document.body) : chrome}

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
