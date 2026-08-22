"use client";

import { motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  whatSetsMeApart,
  type HomeCopyPoint,
} from "@/content/homeCopy";
import { usePinnedScrub } from "@/hooks/usePinnedScrub";

const POINTS = whatSetsMeApart.points;
const CARD_COUNT = POINTS.length;
/** One scroll beat per card flip */
const BEATS = CARD_COUNT;
const EASE = [0.22, 1, 0.36, 1] as const;

function CardBrowserMark() {
  return (
    <svg
      className="home-different__browser-mark"
      viewBox="0 0 500 500"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M392.17,317.83c-25.35,53.04-79.49,89.67-142.17,89.67s-116.83-36.62-142.17-89.67l42.36-19.76c17.88,37.11,55.86,62.7,99.81,62.7s81.94-25.59,99.81-62.7l42.36,19.76Z"
      />
      <path
        fill="currentColor"
        d="M404.9,221.42c-13.43-73.34-77.67-128.92-154.9-128.92s-141.47,55.58-154.9,128.92c-1.72,9.27-2.6,18.83-2.6,28.58,0,6.19.36,12.31,1.06,18.3h312.88c.7-6,1.06-12.11,1.06-18.3,0-9.76-.88-19.32-2.6-28.58ZM142.95,221.42c1.55-5.87,3.6-11.54,6.05-16.98,17.37-38.45,56.07-65.22,101.01-65.22s83.64,26.77,101.01,65.22c2.45,5.44,4.49,11.11,6.05,16.98h-214.11Z"
      />
    </svg>
  );
}

function CardKeywordFooter({ title }: { title: string }) {
  return (
    <div className="home-different__keyword-row">
      <span className="home-different__keyword">{title}</span>
      <CardBrowserMark />
    </div>
  );
}

function CardBody({
  body,
  highlight,
}: {
  body: string;
  highlight?: string;
}) {
  if (!highlight || !body.includes(highlight)) {
    return <p>{body}</p>;
  }
  const start = body.indexOf(highlight);
  const end = start + highlight.length;
  return (
    <p>
      {body.slice(0, start)}
      <span className="home-different__hl">{highlight}</span>
      {body.slice(end)}
    </p>
  );
}

function CardFaces({ point, flipped }: { point: HomeCopyPoint; flipped: boolean }) {
  const faceStyle = point.cardColor
    ? ({ background: point.cardColor } as CSSProperties)
    : undefined;

  return (
    <motion.div
      className="home-different__flip"
      initial={{ rotateY: 0 }}
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      <div
        className="home-different__face home-different__face--front"
        style={faceStyle}
      >
        <CardKeywordFooter title={point.title} />
      </div>
      <div
        className="home-different__face home-different__face--back"
        style={faceStyle}
      >
        <div className="home-different__card-copy">
          <CardBody body={point.body} highlight={point.bodyHighlight} />
        </div>
        <CardKeywordFooter title={point.title} />
      </div>
    </motion.div>
  );
}

/**
 * Home “What Makes Me Different” — scroll deck: flip on scrub.
 * Scrub follows scroll both ways.
 */
export function HomeDifferentCards() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 800px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const progress = usePinnedScrub({
    trackRef,
    enabled: !reduced,
  });

  const flipProgress = progress * BEATS;

  const intro = (
    <div className="home-page__intro">
      <h2 id={`${whatSetsMeApart.id}-title`}>{whatSetsMeApart.title}</h2>
      <p>{whatSetsMeApart.subtitle}</p>
    </div>
  );

  if (reduced) {
    return (
      <section
        className="home-different"
        id={whatSetsMeApart.id}
        aria-labelledby={`${whatSetsMeApart.id}-title`}
      >
        <div className="home-different__static">
          {intro}
          <ul className="home-different__static-list">
            {POINTS.map((point) => (
              <li
                key={point.id}
                className="home-different__static-card"
                style={
                  point.cardColor
                    ? ({ background: point.cardColor } as CSSProperties)
                    : undefined
                }
              >
                <CardBody body={point.body} highlight={point.bodyHighlight} />
                <CardKeywordFooter title={point.title} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      className="home-different"
      id={whatSetsMeApart.id}
      aria-labelledby={`${whatSetsMeApart.id}-title`}
    >
      <div
        ref={trackRef}
        className="home-different__track"
        style={{ "--beats": BEATS } as CSSProperties}
      >
        <div className="home-different__pin">
          {intro}

          <div
            className={`home-different__stage${isNarrow ? " is-narrow" : ""}`}
            aria-live="polite"
          >
            {isNarrow ? (
              <NarrowStage flipProgress={flipProgress} />
            ) : (
              <DesktopDeck flipProgress={flipProgress} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function NarrowStage({ flipProgress }: { flipProgress: number }) {
  const active = Math.min(
    CARD_COUNT - 1,
    Math.max(0, Math.floor(flipProgress - 0.5 + 1e-6)),
  );
  const point = POINTS[active] ?? POINTS[0];
  const flipped = flipProgress >= active + 0.5;

  return (
    <div className="home-different__card home-different__card--solo">
      <CardFaces key={point.id} point={point} flipped={flipped} />
    </div>
  );
}

function DesktopDeck({ flipProgress }: { flipProgress: number }) {
  return (
    <ul className="home-different__deck">
      {POINTS.map((point, i) => {
        const isFlipped = flipProgress >= i + 0.5;

        return (
          <li
            key={point.id}
            className="home-different__slot"
            style={{ zIndex: CARD_COUNT - i }}
          >
            <div className="home-different__card">
              <CardFaces point={point} flipped={isFlipped} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
