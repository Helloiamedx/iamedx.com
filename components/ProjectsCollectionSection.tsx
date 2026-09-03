"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { OriginButton } from "@/components/ui/origin-button";
import {
  COLLECTIONS_DETAIL_LIVE,
  type CollectionPanel,
  type ProjectCollection,
} from "@/content/collections";

const PANEL_W = 240;
const PANEL_H = 300;
/** Desktop: keep images clear of title / button chrome */
const PANEL_IMAGE_GAP_MIN = 44;
const PARALLAX_FACTOR = 0.45;
/** Mobile: soft one-way drift after center — shorter than before */
const PARALLAX_FACTOR_MOBILE = 0.38;
const MOBILE_TRAVEL_MIN = 28;
const MOBILE_TRAVEL_MAX = 52;
/** Lerp toward scroll target — softens hard cut on touch scroll */
const SMOOTH_MOBILE = 0.14;
const SMOOTH_DESKTOP = 0.22;

type ProjectsCollectionSectionProps = {
  collection: ProjectCollection;
};

function isCollectionMobile() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 899px)").matches
  );
}

function getMaxImageTravel(section: HTMLElement): number {
  const panelField = section.querySelector<HTMLElement>(
    ".projects-collection__panel-field",
  );
  if (!panelField) return 0;

  const fieldHeight = panelField.clientHeight;
  if (fieldHeight <= 0) return 0;

  if (isCollectionMobile()) {
    return Math.min(
      MOBILE_TRAVEL_MAX,
      Math.max(MOBILE_TRAVEL_MIN, fieldHeight * 0.12),
    );
  }

  const panel =
    section.querySelector<HTMLElement>(".projects-collection__panel") ?? null;
  const panelHeight = panel?.offsetHeight || PANEL_H;
  if (fieldHeight <= panelHeight) return 0;
  const slack = (fieldHeight - panelHeight) / 2;
  return Math.max(0, slack - PANEL_IMAGE_GAP_MIN);
}

function CollectionPanelMedia({
  panel,
  reduceMotion,
}: {
  panel: CollectionPanel;
  reduceMotion: boolean | null;
}) {
  const frames = panel.frames.filter(Boolean);
  const cycle = !reduceMotion && frames.length >= 2;

  if (!cycle) {
    const src = frames[0];
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={PANEL_W}
        height={PANEL_H}
        className="projects-collection__panel-image"
        draggable={false}
      />
    );
  }

  return (
    <div className="projects-collection__panel-cycle" aria-hidden="true">
      {frames.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          width={PANEL_W}
          height={PANEL_H}
          className={`projects-collection__panel-image projects-collection__panel-frame projects-collection__panel-frame--${index + 1}`}
          draggable={false}
        />
      ))}
    </div>
  );
}

/**
 * Full-bleed collection break on `/projects` — multi-variant product family.
 * Detail page / Read more gated by `COLLECTIONS_DETAIL_LIVE`.
 */
export function ProjectsCollectionSection({
  collection,
}: ProjectsCollectionSectionProps) {
  const titleId = `collection-${collection.slug}-title`;
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const panels = panelsRef.current;
    if (!section || !panels) return;

    if (reduceMotion) {
      panels.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    let raf = 0;
    let current = 0;
    let target = 0;
    let running = false;

    const readTarget = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = vh / 2;
      const mobile = isCollectionMobile();
      const maxTravel = getMaxImageTravel(section);
      const delta = viewportCenter - sectionCenter;

      if (mobile) {
        /*
         * Entering from below → keep centered (no negative offset / top park).
         * Past viewport center → soft drift down only (shorter travel).
         */
        const raw = delta * PARALLAX_FACTOR_MOBILE;
        return Math.max(0, Math.min(maxTravel, raw));
      }

      return Math.max(
        -maxTravel,
        Math.min(maxTravel, delta * PARALLAX_FACTOR),
      );
    };

    const tick = () => {
      raf = 0;
      target = readTarget();
      const mobile = isCollectionMobile();
      const smooth = mobile ? SMOOTH_MOBILE : SMOOTH_DESKTOP;
      current += (target - current) * smooth;

      if (Math.abs(target - current) < 0.15) {
        current = target;
        running = false;
      } else {
        running = true;
      }

      panels.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;

      if (running) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      target = readTarget();
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("touchmove", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.visualViewport?.addEventListener("scroll", schedule);
    window.visualViewport?.addEventListener("resize", schedule);

    const panelField = section.querySelector(".projects-collection__panel-field");
    const ro =
      typeof ResizeObserver !== "undefined" && panelField
        ? new ResizeObserver(schedule)
        : null;
    if (ro && panelField) ro.observe(panelField);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("touchmove", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="projects-collection"
      aria-labelledby={titleId}
    >
      <p className="projects-collection__eyebrow">Collection</p>

      <div className="projects-collection__panel-field">
        <div className="projects-collection__canvas" aria-hidden="true">
          <div ref={panelsRef} className="projects-collection__panels">
            {collection.panels.map((panel, index) => (
              <div
                key={`${collection.slug}-panel-${index}`}
                className="projects-collection__panel"
              >
                <CollectionPanelMedia
                  panel={panel}
                  reduceMotion={reduceMotion}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="projects-collection__headline-wrap">
          <h2 id={titleId} className="projects-collection__headline">
            {collection.headline}
          </h2>
        </div>
      </div>

      {COLLECTIONS_DETAIL_LIVE ? (
        <div className="projects-collection__cta">
          <OriginButton href={`/collections/${collection.slug}`}>
            Read more
          </OriginButton>
        </div>
      ) : null}
    </section>
  );
}
