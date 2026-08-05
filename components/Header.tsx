"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { primaryNav, type NavItem } from "@/content/nav";

const CLOSE_DELAY_MS = 160;

export function Header() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuId = useId();

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu(key: string) {
    clearCloseTimer();
    setOpenKey(key);
    setPanelKey(key);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenKey(null), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenKey(null);
        setMobileOpen(false);
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenKey(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openItem = primaryNav.find((item) => item.label === openKey && item.mega);
  const panelItem = primaryNav.find((item) => item.label === panelKey && item.mega);

  return (
    <header
      ref={headerRef}
      className={`site-header${openKey || mobileOpen ? " is-expanded" : ""}`}
      onMouseLeave={scheduleClose}
    >
      <div className="shell site-header__inner">
        <Link href="/" className="site-logo" aria-label="iamedx home">
          <Image
            src="/brand/iamedxlogo-black.svg"
            alt="iamedx"
            width={120}
            height={28}
            priority
          />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavTrigger
              key={item.href}
              item={item}
              menuId={menuId}
              isOpen={openKey === item.label}
              onOpen={() => {
                if (item.mega) openMenu(item.label);
              }}
              onCloseSchedule={scheduleClose}
              onCloseCancel={clearCloseTimer}
            />
          ))}
        </nav>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls={`${menuId}-mobile`}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div
        className={`mega-panel${openItem ? " is-open" : ""}`}
        id={`${menuId}-desktop`}
        aria-hidden={!openItem}
        onMouseEnter={clearCloseTimer}
      >
        <div className="shell mega-panel__inner">
          <div className="mega-columns">
            {panelItem?.mega?.map((column) => (
              <section key={column.id} className="mega-column">
                <h2>{column.title}</h2>
                <p>{column.description}</p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.slug}>
                      <Link href={link.href} onClick={() => setOpenKey(null)}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`mobile-nav${mobileOpen ? " is-open" : ""}`}
        id={`${menuId}-mobile`}
        hidden={!mobileOpen}
      >
        <div className="shell mobile-nav__inner">
          {primaryNav.map((item) => (
            <div key={item.href} className="mobile-nav__group">
              <Link
                href={item.href}
                className="mobile-nav__parent"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.mega ? (
                <div className="mobile-nav__mega">
                  {item.mega.map((column) => (
                    <section key={column.id}>
                      <h3>{column.title}</h3>
                      <p>{column.description}</p>
                      <ul>
                        {column.links.map((link) => (
                          <li key={link.slug}>
                            <Link
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                            >
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
          ))}
        </div>
      </div>
    </header>
  );
}

type NavTriggerProps = {
  item: NavItem;
  menuId: string;
  isOpen: boolean;
  onOpen: () => void;
  onCloseSchedule: () => void;
  onCloseCancel: () => void;
};

function NavTrigger({
  item,
  menuId,
  isOpen,
  onOpen,
  onCloseSchedule,
  onCloseCancel,
}: NavTriggerProps) {
  if (!item.mega) {
    return (
      <Link href={item.href} className="site-nav__link" onMouseEnter={onCloseSchedule}>
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className={`site-nav__item${isOpen ? " is-open" : ""}`}
      onMouseEnter={onOpen}
      onFocus={onOpen}
    >
      <Link
        href={item.href}
        className="site-nav__link"
        aria-expanded={isOpen}
        aria-controls={`${menuId}-desktop`}
        onClick={(event) => {
          // Keep click-to-/services; hover opens mega on desktop.
          if (window.matchMedia("(hover: hover)").matches) return;
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
