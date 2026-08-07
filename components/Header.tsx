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

const CLOSE_DELAY_MS = 180;
const CLOSE_ANIMATION_MS = 480;
/* Curtain: 480ms + last-column stagger 210ms — keep frost off until done */
const MOBILE_CURTAIN_MS = 700;
/* Mega frost height tween is 480ms — pills land after the sheet is mostly on */
const CTA_PILL_AFTER_FROST_MS = 360;

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
  /* Stays true through open + close curtain so frost doesn't fight the strips */
  const [mobileSurface, setMobileSurface] = useState(false);
  /* Top of page: clear chrome on every route (same scroll gate as the home hero) */
  const [atTop, setAtTop] = useState(true);
  /* Colored contact pills — delayed until after frost when mega/mobile opens */
  const [ctaPills, setCtaPills] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPanelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const menuId = useId();

  useEffect(() => {
    function onScroll() {
      // Any downward scroll leaves the at-top chrome immediately.
      setAtTop(window.scrollY <= 0);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

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

  useLayoutEffect(() => {
    const expanded = Boolean(openKey) || mobileOpen || mobileSurface;
    const clearChrome = !expanded && atTop;

    if (clearChrome) {
      /* Layout phase: drop pills before paint so ghost never shares a frame
         with brand fills (difference blend → wrong capsule colors). */
      setCtaPills(false);
      return;
    }

    /* Already on frosted chrome (scrolled) — pills can show immediately */
    if (!openKey && !mobileOpen && !mobileSurface) {
      setCtaPills(true);
      return;
    }

    /* Mega / mobile: frost first, then color pills */
    const timer = setTimeout(() => {
      setCtaPills(true);
    }, CTA_PILL_AFTER_FROST_MS);

    return () => clearTimeout(timer);
  }, [atTop, openKey, mobileOpen, mobileSurface]);

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
     * If trigger-align would clip columns past the right gutter (common on
     * iPad-width when nav is centered), pull left — down to the shell edge.
     */
    const cols = track?.querySelector<HTMLElement>(".mega-columns");
    let contentWidth = 0;
    if (cols) {
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
    clearCloseTimer();
    setOpenKey(null);
    // Keep panel content mounted until the close animation finishes.
    clearClearPanelTimer();
    clearPanelTimer.current = setTimeout(() => {
      setPanelKey(null);
      clearPanelTimer.current = null;
    }, CLOSE_ANIMATION_MS);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => closeMenu(), CLOSE_DELAY_MS);
  }

  /** Hover menus only — touch taps synthesize mouseleave and would flash-close. */
  function scheduleCloseFromHover() {
    if (!canHoverFine()) return;
    scheduleClose();
  }

  function openMenuFromHover(key: string) {
    if (!canHoverFine()) return;
    openMenu(key);
  }

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
      // Measure real content height so close can animate from pixels → 0.
      // Track padding already includes the bar, so scrollHeight is the full frost surface.
      const height = track.scrollHeight;
      if (panel.style.height === "0px" || panel.style.height === "") {
        // Start at bar height so the frosted sheet already covers the nav (no hole / seam).
        panel.style.height = `${barH}px`;
        void panel.offsetHeight;
      }
      panel.style.height = `${height}px`;
      return;
    }

    // Closing: collapse from current pixel height to 0.
    if (panelKey) {
      const current = panel.getBoundingClientRect().height;
      panel.style.height = `${current}px`;
      void panel.offsetHeight;
      panel.style.height = "0px";
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
      clearClearPanelTimer();
    };
  }, [openKey]);

  useEffect(() => {
    /* Only lock scroll for the full-screen mobile menu.
       Locking for desktop mega removes the scrollbar, shifts layout under the
       cursor, fires mouseleave, and the panel appears then instantly closes. */
    if (!mobileOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.inset = "";
      document.body.style.width = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.inset = `-${scrollY}px 0 0 0`;
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
      document.body.style.inset = "";
      document.body.style.width = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const isPanelOpen = Boolean(openKey);
  const panelItem = primaryNav.find((item) => item.label === panelKey && item.mega);
  const isExpanded = isPanelOpen || mobileOpen || mobileSurface;
  /* Every page at top: fully clear bar; contrast via mix-blend-mode:difference */
  const overClear = !isExpanded && atTop;

  return (
    <>
      <div
        className={`nav-scrim${isPanelOpen || mobileOpen ? " is-visible" : ""}`}
        aria-hidden="true"
        onClick={() => {
          closeMenu();
          setMobileOpen(false);
        }}
      />

      <header
        ref={headerRef}
        className={`site-header${isExpanded ? " is-expanded" : ""}${overClear ? " is-over-clear" : ""}${mobileSurface ? " is-mobile-surface" : ""}`}
        onMouseLeave={scheduleCloseFromHover}
      >
        <div className="shell site-header__bar">
          <Link href="/" className="site-logo" aria-label="iamedx home">
            <Image
              src="/brand/edxlogo-white.svg"
              alt=""
              width={135}
              height={32}
              priority
              unoptimized
              className="site-logo__img site-logo__img--white"
              aria-hidden="true"
            />
            <Image
              src="/brand/edxlogo-black.svg"
              alt="iamedx"
              width={135}
              height={32}
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
          className={`mega-panel${isPanelOpen ? " is-open" : ""}`}
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
                className="mega-columns"
                data-cols={panelItem.mega.length}
                key={panelKey ?? "empty"}
              >
                {panelItem.mega.map((column) => {
                  const heading = (column.description || column.title).trim();
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
                            <Link href={link.href} onClick={closeMenu}>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`mobile-nav${mobileOpen ? " is-open" : ""}`}
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
        </div>
      </header>

      {/* Sibling raft: ghost (difference) at rest; colored pills after frost.
          Never combine is-ghost + is-pills — difference blend on brand fills
          flashes the wrong capsule colors for a frame before pills clear. */}
      <div
        className={`site-header-cta${overClear ? " is-ghost" : ""}${ctaPills && !overClear ? " is-pills" : ""}`}
        onMouseEnter={scheduleCloseFromHover}
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
      onFocus={onOpen}
    >
      <Link
        href={item.href}
        className="site-nav__link"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${menuId}-desktop`}
        onClick={(event) => {
          if (canHoverFine()) {
            return;
          }
          event.preventDefault();
          if (isOpen) onClose();
          else onOpen();
        }}
      >
        {item.label}
      </Link>
    </div>
  );
}
