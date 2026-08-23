"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef } from "react";
import { asset } from "@/lib/assets";

const aboutBannerImage = asset("/images/about/Banner.jpg");
const MOBILE_MQ = "(max-width: 800px)";

/** Max upward nudge while the content sheet covers the hero (~6.4vh). */
const MAX_PUSH_VH = 0.0644;
/** Headline gets a little extra travel on top of the hero push. */
const COPY_EXTRA_MULT = 0.41;

function supportsScrollDrivenParallax() {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timeline: scroll()")
  );
}

function applyHeroPush(
  hero: HTMLElement,
  copy: HTMLElement | null,
  scrollY: number,
) {
  const vh = window.innerHeight || 1;
  const sheet = document.querySelector<HTMLElement>(".about-content-sheet");
  let hideHero = false;

  if (sheet) {
    const sheetBottom = sheet.getBoundingClientRect().bottom;
    // Content sheet no longer fills the viewport — fixed hero would show through gaps
    hideHero = scrollY > vh * 0.35 && sheetBottom < vh - 1;
  }

  hero.style.visibility = hideHero ? "hidden" : "";
  hero.style.pointerEvents = hideHero ? "none" : "";

  if (hideHero) {
    hero.style.transform = "";
    if (copy) copy.style.transform = "";
    return;
  }

  const coverSpan = vh;
  const progress = Math.min(1, Math.max(0, scrollY / coverSpan));
  const eased = 1 - (1 - progress) ** 1.75;
  const push = eased * vh * MAX_PUSH_VH;

  if (push < 0.25) {
    hero.style.transform = "";
    if (copy) copy.style.transform = "";
    return;
  }

  hero.style.transform = `translate3d(0, ${-push.toFixed(2)}px, 0)`;

  if (copy) {
    const extra = push * COPY_EXTRA_MULT;
    copy.style.transform = `translate3d(0, ${-extra.toFixed(2)}px, 0)`;
  }
}

function syncMobileHeroHide(hero: HTMLElement, scrollY: number) {
  const vh = window.innerHeight || 1;
  const sheet = document.querySelector<HTMLElement>(".about-content-sheet");
  let hideHero = false;

  if (sheet) {
    const sheetBottom = sheet.getBoundingClientRect().bottom;
    hideHero = scrollY > vh * 0.35 && sheetBottom < vh - 1;
  }

  hero.classList.toggle("is-hero-hidden", hideHero);
}

export function AboutPageHero() {
  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);
  const mobileCssParallaxRef = useRef(false);

  const paint = useCallback((scrollY: number) => {
    const hero = heroRef.current;
    if (!hero || reducedRef.current) return;

    if (mobileCssParallaxRef.current) {
      syncMobileHeroHide(hero, scrollY);
      return;
    }

    applyHeroPush(hero, copyRef.current, scrollY);
  }, []);

  useLenis((lenis) => {
    if (lenis) paint(lenis.scroll);
  });

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const hero = heroRef.current;
    const copy = copyRef.current;
    if (!hero || reducedRef.current) return;

    const mobileMq = window.matchMedia(MOBILE_MQ);

    const syncMobileMode = () => {
      const useCss =
        mobileMq.matches && supportsScrollDrivenParallax();
      mobileCssParallaxRef.current = useCss;
      hero.classList.toggle("is-css-parallax", useCss);

      if (useCss) {
        hero.style.transform = "";
        hero.style.visibility = "";
        hero.style.pointerEvents = "";
        if (copy) copy.style.transform = "";
      } else {
        hero.classList.remove("is-hero-hidden");
      }

      paint(window.scrollY);
    };

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        paint(window.scrollY);
      });
    };

    syncMobileMode();
    mobileMq.addEventListener("change", syncMobileMode);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      mobileMq.removeEventListener("change", syncMobileMode);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      hero.classList.remove("is-css-parallax", "is-hero-hidden");
      hero.style.transform = "";
      hero.style.visibility = "";
      hero.style.pointerEvents = "";
      if (copy) copy.style.transform = "";
    };
  }, [paint]);

  return (
    <section
      ref={heroRef}
      className="about-boua__hero-banner"
      aria-label="About Edward Xu"
    >
      <div className="about-boua__hero-banner-media" aria-hidden="true">
        <Image
          src={aboutBannerImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="about-boua__hero-banner-img"
        />
      </div>
      <div ref={copyRef} className="about-boua__hero-banner-copy">
        <div className="about-boua__container">
          <h1 className="about-boua__hero-headline">
            Developing products through radical collaboration loved worldwide.
          </h1>
        </div>
      </div>
    </section>
  );
}
