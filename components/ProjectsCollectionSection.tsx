"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
/** Mobile: inset so the panel never clips; larger pad = shorter travel */
const MOBILE_EDGE_PAD = 22;
const PARALLAX_FACTOR = 0.45;
const PARALLAX_FACTOR_MOBILE = 0.38;
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

function useCollectionMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

function getMaxImageTravel(section: HTMLElement): number {
  const panelField = section.querySelector<HTMLElement>(
    ".projects-collection__panel-field",
  );
  if (!panelField) return 0;

  const fieldHeight = panelField.clientHeight;
  if (fieldHeight <= 0) return 0;

  const panel =
    section.querySelector<HTMLElement>(".projects-collection__panel") ?? null;
  const panelHeight = panel?.offsetHeight || PANEL_H;
  if (fieldHeight <= panelHeight) return 0;

  /* Half the free space above/below the panel — travel must stay inside this */
  const slack = (fieldHeight - panelHeight) / 2;

  if (isCollectionMobile()) {
    /* Phone only: clamp to real slack so the middle still is never cropped */
    return Math.max(0, slack - MOBILE_EDGE_PAD);
  }

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
  const cycleClass =
    frames.length >= 6
      ? "projects-collection__panel-cycle projects-collection__panel-cycle--6"
      : "projects-collection__panel-cycle";

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
    <div className={cycleClass} aria-hidden="true">
      {frames.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${index}`}
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
  const mobile = useCollectionMobile();

  /** Phone: one slot cycles all six stills; desktop: three panels × two frames */
  const displayPanels = useMemo((): CollectionPanel[] => {
    if (!mobile) return [...collection.panels];
    return [
      {
        frames: collection.panels.flatMap((panel) =>
          panel.frames.filter(Boolean),
        ),
      },
    ];
  }, [collection.panels, mobile]);

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
      const isMobile = isCollectionMobile();
      const maxTravel = getMaxImageTravel(section);
      const delta = viewportCenter - sectionCenter;
      const factor = isMobile ? PARALLAX_FACTOR_MOBILE : PARALLAX_FACTOR;
      const raw = delta * factor;
      /* Both breakpoints: travel up and down within the field */
      return Math.max(-maxTravel, Math.min(maxTravel, raw));
    };

    const tick = () => {
      raf = 0;
      target = readTarget();
      const isMobile = isCollectionMobile();
      const smooth = isMobile ? SMOOTH_MOBILE : SMOOTH_DESKTOP;
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
  }, [reduceMotion, mobile]);

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
            {displayPanels.map((panel, index) => (
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
