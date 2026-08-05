"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ClickSpark } from "@/components/ClickSpark";
import { MobileBubbleNav } from "@/components/MobileBubbleNav";
import { contactCta, primaryNav, type NavItem } from "@/content/nav";

const CLOSE_DELAY_MS = 180;
const CLOSE_ANIMATION_MS = 480;

export function Header() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState<string | null>(null);
  const [panelOffset, setPanelOffset] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPanelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const menuId = useId();

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
    if (!trigger || !panel) return;

    const link = trigger.querySelector<HTMLElement>(".site-nav__link");
    const el = link ?? trigger;
    const styles = window.getComputedStyle(el);
    const padLeft = Number.parseFloat(styles.paddingLeft) || 0;

    // Offset relative to the mega panel's left edge (not the viewport alone).
    const panelLeft = panel.getBoundingClientRect().left;
    const textLeft = el.getBoundingClientRect().left + padLeft;
    const left = Math.max(16, Math.round(textLeft - panelLeft));
    setPanelOffset(left);
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

  useLayoutEffect(() => {
    if (!openKey) return;

    const frame = requestAnimationFrame(() => {
      alignPanelToTrigger(openKey);
      requestAnimationFrame(() => alignPanelToTrigger(openKey));
    });

    return () => cancelAnimationFrame(frame);
  }, [openKey, panelKey]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!panel) return;

    const barH =
      headerRef.current?.querySelector<HTMLElement>(".site-header__bar")
        ?.offsetHeight ?? 56;

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
      if (openKey) alignPanelToTrigger(openKey);
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
    if (!mobileOpen) {
      document.body.style.overflow = openKey ? "hidden" : "";
      document.body.style.touchAction = "";
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.inset = `-${scrollY}px 0 0 0`;
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";

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
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen, openKey]);

  const isPanelOpen = Boolean(openKey);
  const panelItem = primaryNav.find((item) => item.label === panelKey && item.mega);
  const isExpanded = isPanelOpen || mobileOpen;

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
        className={`site-header${isExpanded ? " is-expanded" : ""}`}
        onMouseLeave={scheduleClose}
      >
        <div className="shell site-header__bar">
          <Link href="/" className="site-logo" aria-label="iamedx home">
            <Image
              src="/brand/iamedxlogo-black.svg"
              alt="iamedx"
              width={92}
              height={32}
              priority
              unoptimized
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
                onCloseSchedule={scheduleClose}
              />
            ))}
          </nav>

          <div className="site-header__actions">
            <ClickSpark>
              <Link
                href={contactCta.href}
                className="nav-contact"
                onMouseEnter={scheduleClose}
              >
                {contactCta.label}
              </Link>
            </ClickSpark>
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
                {panelItem.mega.map((column) => (
                  <section
                    key={column.id}
                    className={`mega-column${column.links.length > 10 ? " mega-column--dense" : ""}`}
                  >
                    <h2>{column.title}</h2>
                    {column.description ? <p>{column.description}</p> : null}
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
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`mobile-nav${mobileOpen ? " is-open" : ""}`}
          id={`${menuId}-mobile`}
          aria-hidden={!mobileOpen}
        >
          <div className="shell mobile-nav__inner">
            <MobileBubbleNav
              open={mobileOpen}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      </header>
    </>
  );
}

type NavTriggerProps = {
  item: NavItem;
  menuId: string;
  isOpen: boolean;
  triggerRef: (node: HTMLElement | null) => void;
  onOpen: () => void;
  onCloseSchedule: () => void;
};

function NavTrigger({
  item,
  menuId,
  isOpen,
  triggerRef,
  onOpen,
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
      onMouseEnter={onOpen}
      onFocus={onOpen}
    >
      <Link
        href={item.href}
        className="site-nav__link"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${menuId}-desktop`}
        onClick={(event) => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            return;
          }
          event.preventDefault();
          if (isOpen) onCloseSchedule();
          else onOpen();
        }}
      >
        {item.label}
      </Link>
    </div>
  );
}
