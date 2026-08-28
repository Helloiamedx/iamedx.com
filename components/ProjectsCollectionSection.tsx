"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { OriginButton } from "@/components/ui/origin-button";
import type {
  CollectionPanel,
  ProjectCollection,
} from "@/content/collections";

const PANEL_W = 240;
const PANEL_H = 300;
/**
 * Minimum px between image edges and the panel-field clip (title / button zone).
 * Raise this value → less parallax travel + more clearance.
 */
const PANEL_IMAGE_GAP_MIN = 44;
/** Scroll-linked drift on the image canvas only */
const PARALLAX_FACTOR = 0.4;

type ProjectsCollectionSectionProps = {
  collection: ProjectCollection;
};

function getMaxImageTravel(section: HTMLElement, gapMin: number): number {
  const panelField = section.querySelector<HTMLElement>(
    ".projects-collection__panel-field",
  );
  const panel = section.querySelector<HTMLElement>(
    ".projects-collection__panel",
  );
  if (!panelField || !panel) return 0;

  const fieldHeight = panelField.clientHeight;
  const panelHeight = panel.offsetHeight || PANEL_H;
  if (fieldHeight <= panelHeight) return 0;

  return Math.max(0, (fieldHeight - panelHeight) / 2 - gapMin);
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
 * Separate from standard project detail; links to `/collections/[slug]`.
 */
export function ProjectsCollectionSection({
  collection,
}: ProjectsCollectionSectionProps) {
  const titleId = `collection-${collection.slug}-title`;
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [canvasOffset, setCanvasOffset] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setCanvasOffset(0);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const paint = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = vh / 2;
      const maxTravel = getMaxImageTravel(section, PANEL_IMAGE_GAP_MIN);
      const raw = (sectionCenter - viewportCenter) * PARALLAX_FACTOR;
      /* Scroll down → images drift down (opposite to section rise) */
      setCanvasOffset(Math.max(-maxTravel, Math.min(maxTravel, -raw)));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const panelField = section.querySelector(".projects-collection__panel-field");
    const ro =
      typeof ResizeObserver !== "undefined" && panelField
        ? new ResizeObserver(schedule)
        : null;
    if (ro && panelField) ro.observe(panelField);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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
        <div
          className="projects-collection__canvas"
          aria-hidden="true"
          style={{ transform: `translate3d(0, ${canvasOffset}px, 0)` }}
        >
          <div className="projects-collection__panels">
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

      <div className="projects-collection__cta">
        <OriginButton href={`/collections/${collection.slug}`}>
          Read more
        </OriginButton>
      </div>
    </section>
  );
}
