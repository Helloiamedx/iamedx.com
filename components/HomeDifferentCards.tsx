"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { HomeSectionIntro } from "@/components/HomeSectionIntro";
import { whatSetsMeApart, type HomeCopyPoint } from "@/content/homeCopy";

const POINTS = whatSetsMeApart.points;
const CARD_COUNT = POINTS.length;
/** Auto polish duration once the band is in view */
const POLISH_MS = 2600;

/** Softstep so each column lights before the next starts */
function columnPolish(progress: number, index: number, count: number) {
  if (count <= 0) return 1;
  const start = index / count;
  const end = (index + 1) / count;
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  const t = (progress - start) / (end - start);
  return 1 - (1 - t) * (1 - t);
}

/** Softstep so each glyph lights before the next starts */
function charPolish(progress: number, index: number, count: number) {
  if (count <= 0) return 1;
  const start = index / count;
  const end = (index + 1) / count;
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  const t = (progress - start) / (end - start);
  return 1 - (1 - t) * (1 - t);
}

function FeatureBody({
  body,
  highlight,
  polish,
}: {
  body: string;
  highlight?: string;
  polish: number;
}) {
  if (!highlight || !body.includes(highlight)) {
    return <p className="home-different__feature-body">{body}</p>;
  }
  const start = body.indexOf(highlight);
  const end = start + highlight.length;
  const chars = Array.from(highlight);
  return (
    <p className="home-different__feature-body">
      {body.slice(0, start)}
      <span className="home-different__feature-hl" aria-label={highlight}>
        {chars.map((ch, i) => (
          <span
            key={`${i}-${ch}`}
            className="home-different__feature-hl-char"
            aria-hidden="true"
            style={
              {
                "--char-lit": charPolish(polish, i, chars.length),
              } as CSSProperties
            }
          >
            {ch}
          </span>
        ))}
      </span>
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
  const [reduced, setReduced] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }

    const root = sectionRef.current;
    if (!root) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();

        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / POLISH_MS);
          const eased = 1 - (1 - t) * (1 - t);
          setProgress(eased);
          if (t < 1) raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);
      },
      { threshold: 0.28 },
    );

    io.observe(root);
    return () => {
      io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

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
        />

        <div className="home-different__features-wrap">
          <ul className="home-different__features">
            {POINTS.map((point: HomeCopyPoint, i) => {
              const polish = columnPolish(progress, i, CARD_COUNT);
              return (
                <li
                  key={point.id}
                  className="home-different__feature"
                  style={{ "--polish": polish } as CSSProperties}
                >
                  <FeatureBody
                    body={point.body}
                    highlight={point.bodyHighlight}
                    polish={polish}
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
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
