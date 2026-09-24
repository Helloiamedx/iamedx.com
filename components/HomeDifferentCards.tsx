"use client";

import { useRef } from "react";
import { HomeSectionIntro } from "@/components/HomeSectionIntro";
import { whatSetsMeApart, type HomeCopyPoint } from "@/content/homeCopy";
import { useAppleCardReveal } from "@/lib/appleCardReveal";

const POINTS = whatSetsMeApart.points;

function FeatureBody({
  body,
  highlight,
}: {
  body: string;
  highlight?: string;
}) {
  if (!highlight || !body.includes(highlight)) {
    return <p className="home-different__feature-body">{body}</p>;
  }
  const start = body.indexOf(highlight);
  const end = start + highlight.length;
  return (
    <p className="home-different__feature-body">
      {body.slice(0, start)}
      <span className="home-different__feature-hl">{highlight}</span>
      {body.slice(end)}
    </p>
  );
}

/**
 * Character cards — shared intro + columns (copy on top, keyword + cutout below).
 * Intro type recipe is the home-wide source of truth (`HomeSectionIntro`).
 */
export function HomeDifferentCards() {
  const sectionRef = useRef<HTMLElement>(null);

  /*
   * Apple card reveal — the five Character cards rise in a 150ms stagger as
   * the band's top crosses 85% of the viewport. Authored params, untouched;
   * see `lib/appleCardReveal.ts`.
   */
  useAppleCardReveal(sectionRef, ".home-different__feature");

  return (
    <section
      ref={sectionRef}
      className="home-different"
      id={whatSetsMeApart.id}
      aria-labelledby={`${whatSetsMeApart.id}-title`}
    >
      {whatSetsMeApart.backgroundImage ? (
        <div
          className="home-different__bg"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${whatSetsMeApart.backgroundImage}")`,
          }}
        />
      ) : null}
      <div className="home-different__frost" aria-hidden="true" />

      <div className="home-different__inner">
        <HomeSectionIntro
          titleId={`${whatSetsMeApart.id}-title`}
          label={whatSetsMeApart.eyebrow}
          title={whatSetsMeApart.title}
          description={whatSetsMeApart.subtitle}
        />

        <div className="home-different__features-wrap">
          <ul className="home-different__features">
            {POINTS.map((point: HomeCopyPoint) => (
              <li key={point.id} className="home-different__feature">
                <FeatureBody
                  body={point.body}
                  highlight={point.bodyHighlight}
                />
                <span className="home-different__feature-keyword">
                  {point.title}
                </span>
                {point.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={point.image}
                    alt=""
                    className="home-different__feature-img"
                    /*
                     * These cutouts are multi-megabyte PNGs (~6.2 MB across the
                     * five cards) and the band sits three viewports below the
                     * hero. A bare <img> defaults to eager, so without this the
                     * whole set competes with the hero video on first paint.
                     */
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
