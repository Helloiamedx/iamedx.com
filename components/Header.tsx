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
  type CSSProperties,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { ClickSpark } from "@/components/ClickSpark";
import { EmailIcon, WeChatIcon, WhatsAppIcon } from "@/components/ContactChannelIcons";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import { MobileBubbleNav } from "@/components/MobileBubbleNav";
import {
  contactCta,
  primaryNav,
  weChatCta,
  whatsAppCta,
  whatsAppPhone,
  type NavItem,
} from "@/content/nav";
import { asset } from "@/lib/assets";

const CLOSE_DELAY_MS = 180;
const CLOSE_ANIMATION_MS = 480;
/* Hold dimming until mega height is ~halfway collapsed, then fade opacity */
const SCRIM_FADE_DELAY_MS = Math.round(CLOSE_ANIMATION_MS * 0.5);
/* Curtain: 480ms + last-column stagger 210ms — keep frost off until done */
const MOBILE_CURTAIN_MS = 700;
/*
 * Mega opens from bar height → full sheet (480ms). Pills start once the frost
 * already covers the nav bar — not after the whole panel finishes expanding.
 */
const CTA_PILL_AFTER_FROST_MS = 64;
/* 320ms tween + 110ms reverse stagger — land after the last capsule settles */
const CTA_PILL_OUT_MS = 450;
/*
 * Leave top → frost shows and MUST hold for NAV_FROST_INTRO_MS (distance
 * cannot cut that short). After the intro, further down-scroll tucks now.
 * Scroll-up reveals with a longer idle peek.
 */
const NAV_HIDE_AFTER_Y = 8;
/** First leave from top: frost + bar stay at least this long */
const NAV_FROST_INTRO_MS = 1500;
/** After scroll-up peek: time to reach the bar with the pointer */
const NAV_HIDE_IDLE_MS = 2500;
const NAV_SCROLL_DELTA = 2;

type CtaMode = "ghost" | "pills" | "pills-out";

function canHoverFine() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export function Header() {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState<string | null>(null);
  const [panelOffset, setPanelOffset] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePortalReady, setMobilePortalReady] = useState(false);
  /* Stays true through open + close curtain so frost doesn't fight the strips */
  const [mobileSurface, setMobileSurface] = useState(false);
  /* Top of page: clear chrome on every route (same scroll gate as the home hero) */
  const [atTop, setAtTop] = useState(true);
  /* Whole bar + Contact raft slide away while reading down-page */
  const [navHidden, setNavHidden] = useState(false);
  /*
   * Contact CTA: ghost (text) ↔ pills (buttons) ↔ pills-out (shrink tween).
   * Never apply is-ghost in the same frame as dropping is-pills — difference
   * blend + brand fills flash. pills-out runs the shrink, then ghost.
   */
  const [ctaMode, setCtaMode] = useState<CtaMode>("ghost");
  /* Scrim stays through first half of mega close, then opacity-fades out */
  const [scrimOn, setScrimOn] = useState(false);
  /* Mega right-rail preview — slug of hovered link (media assets TBD) */
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPanelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrimFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctaOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctaModeRef = useRef<CtaMode>("ghost");
  ctaModeRef.current = ctaMode;
  const lastScrollY = useRef(0);
  const leftTopAt = useRef<number | null>(null);
  const navHiddenRef = useRef(false);
  const navLockedRef = useRef(false);
  /**
   * After a scroll-up peek is shown (and later tucked), ignore further up-scroll
   * reveals until the reader scrolls down again — otherwise continuous up-scroll
   * re-opens the bar every frame after hide.
   */
  const peekConsumedRef = useRef(false);
  const navHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  /*
   * Window reactivation (Cmd-Tab / leave fullscreen) synthesizes mouseenter for
   * whatever sits under the cursor — that was auto-opening the mega. Only honor
   * hover-open after a real pointermove in this foreground session.
   */
  const hoverOpenEnabled = useRef(true);
  /*
   * Apple-style: after a mega link click, keep the panel open until the
   * destination URL commits (not on mousedown). Blocks hover-close mid-nav.
   */
  const navPendingRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);
  const menuId = useId();

  function clearNavHideTimer() {
    if (!navHideTimer.current) return;
    clearTimeout(navHideTimer.current);
    navHideTimer.current = null;
  }

  /** Live :hover — avoids enter/leave count getting stuck at 1 */
  function isChromeHovered() {
    const header = headerRef.current;
    const cta = ctaRef.current;
    return Boolean(
      (header && header.matches(":hover")) || (cta && cta.matches(":hover")),
    );
  }

  function hideNav() {
    clearNavHideTimer();
    if (navHiddenRef.current || navLockedRef.current) return;
    if (isChromeHovered()) return;
    navHiddenRef.current = true;
    setNavHidden(true);
  }

  function scheduleHideWhenIdle(delayMs = NAV_HIDE_IDLE_MS, restart = true) {
    /* Scroll-up peek: don’t keep resetting the clock on every wheel tick */
    if (!restart && navHideTimer.current) return;
    clearNavHideTimer();
    if (navHiddenRef.current || navLockedRef.current) return;
    if (isChromeHovered()) return;
    if (window.scrollY <= NAV_HIDE_AFTER_Y) return;
    navHideTimer.current = setTimeout(() => {
      navHideTimer.current = null;
      hideNav();
    }, delayMs);
  }

  function onChromePointerEnter() {
    clearNavHideTimer();
  }

  function onChromePointerLeave() {
    /* Leave header ↔ CTA: the other node may still be :hover */
    requestAnimationFrame(() => {
      if (isChromeHovered() || navLockedRef.current) return;
      scheduleHideWhenIdle();
    });
  }

  function finishPanelClose() {
    clearPanelTimer.current = null;
    /*
     * Handoff BEFORE collapsing height. Old order zeroed height while the bar
     * was still transparent (is-closing), then frost landed next frame → empty
     * flash + “套底” pop. Drop is-closing first so resting frost/clear paints
     * in the same frame the sheet stops covering the bar.
     */
    flushSync(() => {
      setPanelKey(null);
    });
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transition = "none";
    panel.style.height = "0px";
    void panel.offsetHeight;
    panel.style.transition = "";
  }

  function collapseMenus() {
    clearCloseTimer();
    setOpenKey(null);
    setMobileOpen(false);
    clearClearPanelTimer();
    clearPanelTimer.current = setTimeout(finishPanelClose, CLOSE_ANIMATION_MS);
  }

  useEffect(() => {
    /* Soft navigations keep Header mounted — collapse when the route commits */
    navPendingRef.current = false;
    pendingHrefRef.current = null;
    collapseMenus();
    navHiddenRef.current = false;
    setNavHidden(false);
    leftTopAt.current = null;
    peekConsumedRef.current = false;
    clearNavHideTimer();
    lastScrollY.current = window.scrollY;
    setAtTop(window.scrollY <= 0);
    return () => clearClearPanelTimer();
  }, [pathname]);

  useEffect(() => {
    function revealNav() {
      clearNavHideTimer();
      if (!navHiddenRef.current) return;
      navHiddenRef.current = false;
      setNavHidden(false);
    }

    function onScroll() {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      setAtTop(y <= 0);

      /* Back at / near top — clear chrome, reset frost intro + peek */
      if (navLockedRef.current || y <= NAV_HIDE_AFTER_Y) {
        leftTopAt.current = null;
        peekConsumedRef.current = false;
        revealNav();
        return;
      }

      if (leftTopAt.current === null) {
        leftTopAt.current = performance.now();
      }

      /* Pointer on the bar — keep it while they use it */
      if (isChromeHovered()) {
        clearNavHideTimer();
        return;
      }

      /*
       * Scroll up → one peek only. After it idles away, keep scrolling up
       * must NOT pull the bar back (reader is just traveling toward the top).
       */
      if (delta < -NAV_SCROLL_DELTA) {
        if (navHiddenRef.current) {
          if (peekConsumedRef.current) return;
          navHiddenRef.current = false;
          setNavHidden(false);
          peekConsumedRef.current = true;
          scheduleHideWhenIdle(NAV_HIDE_IDLE_MS, true);
        } else {
          scheduleHideWhenIdle(NAV_HIDE_IDLE_MS, false);
        }
        return;
      }

      const introElapsed = performance.now() - (leftTopAt.current ?? performance.now());
      const introDone = introElapsed >= NAV_FROST_INTRO_MS;

      /* During frost intro: never tuck early, no matter how far they scroll */
      if (!introDone) {
        if (!navHiddenRef.current && !navHideTimer.current) {
          scheduleHideWhenIdle(Math.max(200, NAV_FROST_INTRO_MS - introElapsed));
        }
        return;
      }

      /* Intro finished + still scrolling down → tuck; allow a future up-peek */
      if (delta > NAV_SCROLL_DELTA) {
        peekConsumedRef.current = false;
        hideNav();
        return;
      }

      /* Intro finished, stopped mid-page with chrome up → idle tuck */
      if (!navHiddenRef.current && !navHideTimer.current) {
        scheduleHideWhenIdle(NAV_HIDE_IDLE_MS, false);
      }
    }

    lastScrollY.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearNavHideTimer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const menuUp = Boolean(openKey || panelKey || mobileOpen || mobileSurface);
    if (menuUp) {
      clearNavHideTimer();
      navHiddenRef.current = false;
      setNavHidden(false);
      return;
    }
    /*
     * Leave-while-mega-closing used to call scheduleHideWhileStillLocked → no-op,
     * then never re-armed after panelKey cleared. Resume idle hide here.
     */
    if (window.scrollY > NAV_HIDE_AFTER_Y && !isChromeHovered()) {
      scheduleHideWhenIdle();
    }
  }, [openKey, panelKey, mobileOpen, mobileSurface]);

  /* Query-only navigations (e.g. /projects?involvement=…) don't change pathname */
  useEffect(() => {
    if (!openKey && !mobileOpen) return;

    const id = window.setInterval(() => {
      if (!navPendingRef.current || !pendingHrefRef.current) return;
      try {
        const target = new URL(pendingHrefRef.current, window.location.href);
        if (
          window.location.pathname !== target.pathname ||
          window.location.search !== target.search
        ) {
          return;
        }
      } catch {
        return;
      }
      navPendingRef.current = false;
      pendingHrefRef.current = null;
      collapseMenus();
    }, 50);

    return () => window.clearInterval(id);
  }, [openKey, mobileOpen, pathname]);

  useEffect(() => {
    setMobilePortalReady(true);
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

    const timer = setTimeout(() => {
      setMobileSurface(false);
    }, MOBILE_CURTAIN_MS);

    return () => clearTimeout(timer);
  }, [mobileOpen]);

  useEffect(() => {
    if (scrimFadeTimer.current) {
      clearTimeout(scrimFadeTimer.current);
      scrimFadeTimer.current = null;
    }

    /* Desktop mega only — mobile curtain is opaque; a black scrim flashes first */
    if (openKey) {
      setScrimOn(true);
      return;
    }

    /* Menu closing: keep dim until sheet is ~halfway up, then fade */
    scrimFadeTimer.current = setTimeout(() => {
      setScrimOn(false);
      scrimFadeTimer.current = null;
    }, SCRIM_FADE_DELAY_MS);

    return () => {
      if (scrimFadeTimer.current) {
        clearTimeout(scrimFadeTimer.current);
        scrimFadeTimer.current = null;
      }
    };
  }, [openKey]);

  function clearCtaOutTimer() {
    if (ctaOutTimer.current) {
      clearTimeout(ctaOutTimer.current);
      ctaOutTimer.current = null;
    }
  }

  /** Animate pills → text, then land on ghost (safe with difference blend). */
  function startCtaPillsOut() {
    if (ctaModeRef.current === "ghost") return;
    if (ctaModeRef.current === "pills-out") return;
    clearCtaOutTimer();
    setCtaMode("pills-out");
    ctaOutTimer.current = setTimeout(() => {
      setCtaMode("ghost");
      ctaOutTimer.current = null;
    }, CTA_PILL_OUT_MS);
  }

  useLayoutEffect(() => {
    const megaOpen = Boolean(openKey);
    const megaClosing = Boolean(panelKey) && !openKey;
    const menuOpen = megaOpen || mobileOpen;

    if (menuOpen) {
      clearCtaOutTimer();
      if (ctaModeRef.current === "pills") return;
      if (ctaModeRef.current === "pills-out") {
        setCtaMode("pills");
        return;
      }
      /* From ghost: wait for frost, then grow into pills */
      const timer = setTimeout(() => {
        setCtaMode("pills");
      }, CTA_PILL_AFTER_FROST_MS);
      return () => clearTimeout(timer);
    }

    if (megaClosing) {
      if (atTop) {
        /* Hover dismiss at top — shrink while mega sheet still frosts */
        startCtaPillsOut();
      } else {
        /* Scrolled: mega can close; colored pills stay as the resting chrome */
        clearCtaOutTimer();
        setCtaMode("pills");
      }
      return;
    }

    if (mobileSurface && atTop) {
      startCtaPillsOut();
      return;
    }

    /* Idle: scrolled → pills; at top → shrink back to ghost text */
    if (!atTop) {
      clearCtaOutTimer();
      setCtaMode("pills");
      return;
    }

    if (ctaModeRef.current === "pills") {
      startCtaPillsOut();
    } else if (ctaModeRef.current !== "pills-out") {
      setCtaMode("ghost");
    }
  }, [atTop, openKey, panelKey, mobileOpen, mobileSurface]);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function clearClearPanelTimer() {
    if (clearPanelTimer.current) {
      clearTimeout(clearPanelTimer.current);
      clearPanelTimer.current = null;
    }
  }

  function alignPanelToTrigger(label: string) {
    const trigger = triggerRefs.current[label];
    const panel = headerRef.current?.querySelector<HTMLElement>(".mega-panel");
    const track = trackRef.current;
    const shell = headerRef.current?.querySelector<HTMLElement>(".shell");
    if (!trigger || !panel) return;

    const link = trigger.querySelector<HTMLElement>(".site-nav__link");
    const el = link ?? trigger;
    const styles = window.getComputedStyle(el);
    const padLeft = Number.parseFloat(styles.paddingLeft) || 0;

    const panelRect = panel.getBoundingClientRect();
    const panelLeft = panelRect.left;
    const textLeft = el.getBoundingClientRect().left + padLeft;
    const shellLeft = shell?.getBoundingClientRect().left ?? 16;
    const shellRight = shell?.getBoundingClientRect().right ?? window.innerWidth - 16;
    const rightGutter = Math.max(16, window.innerWidth - shellRight);

    /* Prefer Apple-style: columns start under the trigger label. */
    const preferred = Math.max(0, Math.round(textLeft - panelLeft));
    /* Floor: same left edge as the logo / content shell. */
    const minLeft = Math.max(0, Math.round(shellLeft - panelLeft));

    /*
     * If trigger-align would clip the body (columns + preview) past the right
     * gutter, pull left — down to the shell edge.
     */
    const body = track?.querySelector<HTMLElement>(".mega-panel__body");
    const cols = track?.querySelector<HTMLElement>(".mega-columns");
    let contentWidth = 0;
    if (body) {
      contentWidth = body.getBoundingClientRect().width;
    } else if (cols) {
      const pieces = Array.from(cols.children) as HTMLElement[];
      const gap = Number.parseFloat(getComputedStyle(cols).columnGap || getComputedStyle(cols).gap) || 0;
      contentWidth = pieces.reduce((sum, el, index) => {
        return sum + el.getBoundingClientRect().width + (index > 0 ? gap : 0);
      }, 0);
    }

    let left = preferred;
    if (contentWidth > 0) {
      const maxLeft = Math.round(
        window.innerWidth - panelLeft - rightGutter - contentWidth,
      );
      if (preferred > maxLeft) {
        left = Math.max(minLeft, maxLeft);
      }
    } else if (window.matchMedia("(max-width: 1679px)").matches) {
      left = minLeft;
    }

    setPanelOffset((prev) => (prev === left ? prev : left));
  }

  function openMenu(key: string) {
    clearCloseTimer();
    clearClearPanelTimer();
    setOpenKey(key);
    setPanelKey(key);
  }

  function closeMenu() {
    navPendingRef.current = false;
    pendingHrefRef.current = null;
    clearCloseTimer();
    setOpenKey(null);
    // Keep panel content mounted until the close animation finishes.
    clearClearPanelTimer();
    clearPanelTimer.current = setTimeout(finishPanelClose, CLOSE_ANIMATION_MS);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => closeMenu(), CLOSE_DELAY_MS);
  }

  /** Hover menus only — touch taps synthesize mouseleave and would flash-close. */
  function scheduleCloseFromHover() {
    if (!canHoverFine()) return;
    /* Stay open while a clicked route is still loading */
    if (navPendingRef.current) return;
    scheduleClose();
  }

  function openMenuFromHover(key: string) {
    if (!canHoverFine()) return;
    if (!hoverOpenEnabled.current) return;
    if (navPendingRef.current) return;
    openMenu(key);
  }

  /** Clicked a menu link — close only once the destination is ready (or same URL). */
  function onMenuNavigate(href: string) {
    try {
      const next = new URL(href, window.location.href);
      if (
        next.pathname === window.location.pathname &&
        next.search === window.location.search
      ) {
        closeMenu();
        setMobileOpen(false);
        return;
      }
    } catch {
      closeMenu();
      setMobileOpen(false);
      return;
    }
    navPendingRef.current = true;
    pendingHrefRef.current = href;
    clearCloseTimer();
  }

  useEffect(() => {
    function suppressHoverOpen() {
      hoverOpenEnabled.current = false;
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        suppressHoverOpen();
        closeMenu();
        setMobileOpen(false);
        return;
      }
      /* Becoming visible again — wait for a real pointermove before hover-open */
      suppressHoverOpen();
    }

    function onWindowFocus() {
      suppressHoverOpen();
    }

    function onPointerMove() {
      hoverOpenEnabled.current = true;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useLayoutEffect(() => {
    if (!openKey) return;

    const frame = requestAnimationFrame(() => {
      alignPanelToTrigger(openKey);
      requestAnimationFrame(() => alignPanelToTrigger(openKey));
    });

    return () => cancelAnimationFrame(frame);
  }, [openKey, panelKey, panelOffset]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!panel) return;

    /* Full sticky header (bar + safe-area), so open tween covers the status bar */
    const barH = headerRef.current?.offsetHeight ?? 56;

    if (openKey && track) {
      // Track padding already includes the bar, so scrollHeight is the full frost surface.
      const height = track.scrollHeight;
      const current = panel.style.height;
      /*
       * Always open from the hanging bar height (e.g. 50 → full), never from 0.
       * Snap the “from” value with transition disabled — otherwise the height
       * tween runs 0 → full and looks like the resting frost was stripped first.
       */
      if (current === "0px" || current === "" || current === "0") {
        panel.style.transition = "none";
        panel.style.height = `${barH}px`;
        void panel.offsetHeight;
        panel.style.transition = "";
      }
      panel.style.height = `${height}px`;
      return;
    }

    /*
     * Closing: retract the sheet to the nav bar height — not to 0.
     * Going to 0 killed the frost under the links, then the resting bar fill
     * popped back in (still within frost-intro / visible-chrome time). Stopping
     * at barH keeps one continuous surface; when is-closing ends, clear-at-top
     * or resting frost takes over in place.
     */
    if (panelKey) {
      const current = panel.getBoundingClientRect().height;
      panel.style.height = `${current}px`;
      void panel.offsetHeight;
      panel.style.height = `${barH}px`;
    }
  }, [openKey, panelKey, panelOffset]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        setMobileOpen(false);
      }
    }

    function onResize() {
      if (!openKey) return;
      if (window.matchMedia("(max-width: 899px)").matches) {
        closeMenu();
        return;
      }
      alignPanelToTrigger(openKey);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      clearCloseTimer();
      /*
       * Do NOT clearClearPanelTimer here. closeMenu() sets openKey→null and
       * schedules panelKey clear; this effect’s cleanup runs on that same
       * openKey change and was cancelling the unmount — panelKey stuck forever,
       * chrome stayed “expanded”, Contact never returned to ghost text.
       */
    };
  }, [openKey]);

  useEffect(() => {
    /* Only lock scroll for the full-screen mobile menu.
       Locking for desktop mega removes the scrollbar, shifts layout under the
       cursor, fires mouseleave, and the panel appears then instantly closes. */
    if (!mobileOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    /* top only — inset with bottom:0 stretches the body and flashes the footer */
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    /* One-screen menu — lock all page/menu pan */
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

  const isPanelOpen = Boolean(openKey);
  /* panelKey stays until height tween finishes — keep frost while collapsing */
  const isPanelClosing = Boolean(panelKey) && !openKey;
  const panelItem = primaryNav.find((item) => item.label === panelKey && item.mega);

  /* Flash preview only for Services → first column (“Work With Me”) */
  const servicesPreviewColumn =
    panelKey === "Services" ? panelItem?.mega?.[0] : undefined;
  const showMegaPreview = Boolean(servicesPreviewColumn?.links.length);

  useEffect(() => {
    if (panelKey !== "Services") {
      setPreviewSlug(null);
      setPreviewLabel("");
      return;
    }
    const first = primaryNav
      .find((entry) => entry.label === "Services")
      ?.mega?.[0]?.links[0];
    if (!first) {
      setPreviewSlug(null);
      setPreviewLabel("");
      return;
    }
    setPreviewSlug(first.slug);
    setPreviewLabel(first.label);
  }, [panelKey]);
  const isExpanded = isPanelOpen || isPanelClosing || mobileOpen || mobileSurface;
  /*
   * No difference blend on the bar while mega is open or closing — that was
   * painting a second composite (“复色”) onto the menu chrome mid-retract.
   */
  const overClear =
    atTop && !isPanelOpen && !isPanelClosing && !mobileOpen && !mobileSurface;
  /* Keep chrome pinned while any menu surface is up */
  navLockedRef.current = isExpanded || navPendingRef.current;
  const chromeHidden = navHidden && !isExpanded;

  return (
    <>
      <div
        className={`nav-scrim${scrimOn ? " is-visible" : ""}${isPanelOpen ? " is-interactive" : ""}`}
        aria-hidden="true"
        onClick={() => {
          closeMenu();
        }}
      />

      <header
        ref={headerRef}
        className={`site-header${atTop ? " is-at-top" : ""}${isExpanded ? " is-expanded" : ""}${overClear ? " is-over-clear" : ""}${mobileSurface ? " is-mobile-surface" : ""}${chromeHidden ? " is-nav-hidden" : ""}`}
        onMouseEnter={onChromePointerEnter}
        onMouseLeave={() => {
          onChromePointerLeave();
          scheduleCloseFromHover();
        }}
      >
        <div className="shell site-header__bar">
          <Link href="/" className="site-logo" aria-label="Edward Xu home">
            <Image
              src={asset("/brand/iamedwardxu-logo-white.svg")}
              alt=""
              width={200}
              height={24}
              priority
              unoptimized
              className="site-logo__img site-logo__img--white"
              aria-hidden="true"
            />
            <Image
              src={asset("/brand/iamedwardxu-logo-black.svg")}
              alt="Edward Xu"
              width={200}
              height={24}
              priority
              unoptimized
              className="site-logo__img site-logo__img--black"
            />
          </Link>

          <nav className="site-nav" aria-label="Primary">
            {primaryNav.map((item) => (
              <NavTrigger
                key={item.href}
                item={item}
                menuId={menuId}
                isOpen={openKey === item.label}
                triggerRef={(node) => {
                  triggerRefs.current[item.label] = node;
                }}
                onOpen={() => {
                  if (item.mega) openMenu(item.label);
                }}
                onOpenFromHover={() => {
                  if (item.mega) openMenuFromHover(item.label);
                }}
                onClose={closeMenu}
                onCloseSchedule={scheduleCloseFromHover}
                onNavigate={() => onMenuNavigate(item.href)}
              />
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
                closeMenu();
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

        <div
          ref={panelRef}
          className={`mega-panel${isPanelOpen ? " is-open" : ""}${isPanelClosing ? " is-closing" : ""}`}
          id={`${menuId}-desktop`}
          aria-hidden={!isPanelOpen}
          onMouseEnter={clearCloseTimer}
        >
          <div
            ref={trackRef}
            className="mega-panel__track"
            style={{ "--mega-align": `${panelOffset}px` } as CSSProperties}
          >
            {panelItem?.mega ? (
              <div
                className={`mega-panel__body${showMegaPreview ? " has-preview" : ""}`}
                data-cols={panelItem.mega.length}
                key={panelKey ?? "empty"}
              >
                <div className="mega-columns">
                  {panelItem.mega.map((column, columnIndex) => {
                    const heading = (column.description || column.title).trim();
                    const previewColumn =
                      panelKey === "Services" && columnIndex === 0;
                    return (
                      <section
                        key={column.id}
                        className={[
                          "mega-column",
                          heading ? "" : "mega-column--plain",
                          column.links.length > 10 ? "mega-column--dense" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {/* No heading → links sit on the Services description baseline */}
                        {heading ? <h2>{heading}</h2> : null}
                        <ul>
                          {column.links.map((link) => (
                            <li key={link.slug}>
                              <Link
                                href={link.href}
                                onClick={() => onMenuNavigate(link.href)}
                                onMouseEnter={
                                  previewColumn
                                    ? () => {
                                        setPreviewSlug(link.slug);
                                        setPreviewLabel(link.label);
                                      }
                                    : undefined
                                }
                                onFocus={
                                  previewColumn
                                    ? () => {
                                        setPreviewSlug(link.slug);
                                        setPreviewLabel(link.label);
                                      }
                                    : undefined
                                }
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>

                {/* Services col-1 only — 16:9 flash placeholders until real media */}
                {showMegaPreview ? (
                  <aside className="mega-preview" aria-hidden="true">
                    <div className="mega-preview__frame">
                      <div
                        key={previewSlug ?? "idle"}
                        className="mega-preview__slot"
                        data-preview={previewSlug ?? ""}
                      >
                        <span className="mega-preview__label">{previewLabel}</span>
                      </div>
                    </div>
                  </aside>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

      </header>

      {/* Portal to body — header backdrop-filter must not trap position:fixed */}
      {mobilePortalReady
        ? createPortal(
            <div
              className={`mobile-nav${mobileOpen ? " is-open" : ""}${mobileSurface ? " is-surface" : ""}`}
              id={`${menuId}-mobile`}
              aria-hidden={!mobileOpen}
            >
              {/* Vertical columns slide down left→right (~25% each) */}
              <div className="mobile-nav__curtain" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
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

      {/* Sibling raft: ghost (difference) at rest; colored pills after frost.
          Never combine is-ghost + is-pills — difference blend on brand fills
          flashes the wrong capsule colors for a frame before pills clear. */}
      <div
        ref={ctaRef}
        className={`site-header-cta${ctaMode === "ghost" ? " is-ghost" : ""}${ctaMode === "pills" ? " is-pills" : ""}${ctaMode === "pills-out" ? " is-pills-out" : ""}${chromeHidden ? " is-nav-hidden" : ""}`}
        onMouseEnter={() => {
          onChromePointerEnter();
          scheduleCloseFromHover();
        }}
        onMouseLeave={onChromePointerLeave}
      >
        <div className="site-header-cta__inner">
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
                <span className="nav-contact__label">{whatsAppCta.label}</span>
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
                <span className="nav-contact__label">{weChatCta.label}</span>
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
                <span className="nav-contact__label">{contactCta.label}</span>
              </Link>
            </GlareHover>
          </ClickSpark>
        </div>
      </div>
    </>
  );
}

type NavTriggerProps = {
  item: NavItem;
  menuId: string;
  isOpen: boolean;
  triggerRef: (node: HTMLElement | null) => void;
  onOpen: () => void;
  onOpenFromHover: () => void;
  onClose: () => void;
  onCloseSchedule: () => void;
  onNavigate: () => void;
};

function NavTrigger({
  item,
  menuId,
  isOpen,
  triggerRef,
  onOpen,
  onOpenFromHover,
  onClose,
  onCloseSchedule,
  onNavigate,
}: NavTriggerProps) {
  if (!item.mega) {
    return (
      <Link
        href={item.href}
        className="site-nav__link"
        onMouseEnter={onCloseSchedule}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={triggerRef}
      className={`site-nav__item${isOpen ? " is-open" : ""}`}
      onMouseEnter={onOpenFromHover}
    >
      <Link
        href={item.href}
        className="site-nav__link"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${menuId}-desktop`}
        onFocus={(event) => {
          /* Keyboard only — window restore / mouse click focus must not open mega */
          if (event.currentTarget.matches(":focus-visible")) onOpen();
        }}
        onClick={(event) => {
          if (canHoverFine()) {
            /* Desktop: navigate; mega stays until the route commits */
            onNavigate();
            return;
          }
          /*
           * Touch / iPad: first tap opens the mega; second tap on the same
           * top-level item follows the section link (don’t just toggle shut).
           */
          if (isOpen) {
            onNavigate();
            return;
          }
          event.preventDefault();
          onOpen();
        }}
      >
        {item.label}
      </Link>
    </div>
  );
}
