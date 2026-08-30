"use client";

import { useLayoutEffect, useRef } from "react";
import {
  HOME_LOGO_CENTER_ID,
  homeClientLogos,
} from "@/content/client-logos";
import "./ClientLogoMarquee.css";

/**
 * Infinite logo rail at the top of the home recognition section.
 * Two identical tracks — CSS translate -50% loops without a jump.
 * On every load, animation is already mid-cycle with Disney in the center.
 */
function LogoTrack({ copy }: { copy: "a" | "b" }) {
  return (
    <ul className="client-logo-marquee__track" aria-hidden="true">
      {homeClientLogos.map((logo) => (
        <li
          key={`${copy}-${logo.id}`}
          className="client-logo-marquee__item"
          data-logo-id={logo.id}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="client-logo-marquee__img"
            src={logo.src}
            alt=""
            width={160}
            height={48}
            /* Eager — lazy load changes widths mid-loop and makes -50% hitch */
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
}

function readDurationMs(rail: HTMLElement): number {
  const raw = getComputedStyle(rail).animationDuration;
  const seconds = Number.parseFloat(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return 80_000;
  return seconds * 1000;
}

export function ClientLogoMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewportEl = viewportRef.current;
    const railEl = railRef.current;
    if (!viewportEl || !railEl) return;
    /* Explicit locals — nested sync must not see HTMLDivElement | null */
    const viewport: HTMLDivElement = viewportEl;
    const rail: HTMLDivElement = railEl;

    const imgs = rail.querySelectorAll<HTMLImageElement>(
      ".client-logo-marquee__track:first-child .client-logo-marquee__img",
    );

    /*
     * Bootstrap Disney-centered delay once images are ready. Do not re-run
     * on resize — mobile URL-bar show/hide fires resize while scrolling and
     * would restart the CSS animation from the sync point every time.
     */
    let bootstrapped = false;

    function syncCenterInMotion() {
      if (bootstrapped) return;

      /* Measure at rest so offsetLeft is not polluted by live transform */
      rail.classList.add("is-measuring");
      void rail.offsetWidth;

      const track = rail.querySelector<HTMLElement>(
        ".client-logo-marquee__track:first-child",
      );
      const logo = rail.querySelector<HTMLElement>(
        `.client-logo-marquee__track:first-child [data-logo-id="${HOME_LOGO_CENTER_ID}"]`,
      );
      if (!track || !logo) {
        rail.classList.remove("is-measuring");
        return;
      }

      const logoCenter = track.offsetLeft + logo.offsetLeft + logo.offsetWidth / 2;
      const loopWidth = rail.scrollWidth / 2;
      if (loopWidth <= 0) {
        rail.classList.remove("is-measuring");
        return;
      }

      /*
       * Keyframes: 0 → -50% of rail (= one loopWidth).
       * Progress p puts logoCenter at viewport center when:
       *   logoCenter - p * loopWidth = viewportWidth / 2
       */
      let progress = (logoCenter - viewport.clientWidth / 2) / loopWidth;
      progress = ((progress % 1) + 1) % 1;

      const delayMs = -progress * readDurationMs(rail);

      rail.classList.remove("is-measuring");
      /* Restart mid-cycle: negative delay = already scrolling with logo centered */
      rail.style.animation = "none";
      void rail.offsetWidth;
      rail.style.removeProperty("animation");
      rail.style.animationDelay = `${delayMs}ms`;

      const imgsReady = Array.from(imgs).every((img) => img.complete);
      if (imgsReady) bootstrapped = true;
    }

    let syncRaf = 0;
    function scheduleSync() {
      if (bootstrapped) return;
      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(() => syncCenterInMotion());
    }

    syncCenterInMotion();

    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", scheduleSync);
    });

    return () => {
      cancelAnimationFrame(syncRaf);
      imgs.forEach((img) => img.removeEventListener("load", scheduleSync));
    };
  }, []);

  return (
    <section
      className="client-logo-marquee"
      aria-label="Selected clients and partners"
    >
      <div ref={viewportRef} className="client-logo-marquee__viewport">
        <div ref={railRef} className="client-logo-marquee__rail">
          <LogoTrack copy="a" />
          <LogoTrack copy="b" />
        </div>
      </div>
    </section>
  );
}
