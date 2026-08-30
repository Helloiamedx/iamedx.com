"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
 * Character cards — one container: copy on top, vertical keyword + cutout below.
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
      <div className="home-different__inner">
        <div className="home-different__features-wrap">
          <header className="home-different__intro">
            <p className="svc-demo__hero-eyebrow">{whatSetsMeApart.eyebrow}</p>
            <h2
              id={`${whatSetsMeApart.id}-title`}
              className="svc-demo__hero-title"
            >
              {whatSetsMeApart.title}
            </h2>
          </header>

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
