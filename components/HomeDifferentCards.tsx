"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  whatSetsMeApart,
  type HomeCopyPoint,
} from "@/content/homeCopy";

const POINTS = whatSetsMeApart.points;
const CARD_COUNT = POINTS.length;
/** 1 beat to fan out + 1 beat per card flip */
const BEATS = 1 + CARD_COUNT;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Fan offsets — X silhouette (narrow middle, corners out). */
const STACK = [
  { x: 0, y: 0, rotate: 0, z: 5 },
  { x: -6, y: 0, rotate: -16, z: 4 },
  { x: 6, y: 0, rotate: 16, z: 3 },
  { x: -10, y: 0, rotate: -26, z: 2 },
  { x: 10, y: 0, rotate: 26, z: 1 },
] as const;

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
 * Home “What Makes Me Different” — scroll deck: stack → expand → flip.
 * Plays once per page load: progress only advances, never resets on re-entry.
 */
export function HomeDifferentCards() {
  const trackRef = useRef<HTMLDivElement>(null);
  const latchedPRef = useRef(0);
  const freeExitRef = useRef(false);
  const doneRef = useRef(false);
  const lenis = useLenis();

  const [latchedP, setLatchedP] = useState(0);
  const [freeExit, setFreeExit] = useState(false);
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

  const enterFreeExit = useCallback(() => {
    if (freeExitRef.current) return;
    const track = trackRef.current;
    if (!track) return;

    const before = track.offsetHeight;
    freeExitRef.current = true;
    setFreeExit(true);

    requestAnimationFrame(() => {
      const after = track.offsetHeight;
      const lost = before - after;
      if (lost <= 1) return;
      if (lenis) {
        lenis.scrollTo(lenis.scroll - lost, { immediate: true });
      } else {
        window.scrollBy(0, -lost);
      }
    });
  }, [lenis]);

  const markDone = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    latchedPRef.current = 1;
    setLatchedP(1);
    enterFreeExit();
  }, [enterFreeExit]);

  useEffect(() => {
    if (reduced) return;

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;

    const paint = () => {
      raf = 0;

      /* Already played once — keep final layout, no scrub / no replay */
      if (doneRef.current) {
        if (!freeExitRef.current) enterFreeExit();
        return;
      }

      if (freeExitRef.current) return;

      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = Math.max(1, track.offsetHeight - vh);
      const next = Math.min(1, Math.max(0, -rect.top / range));

      if (next > latchedPRef.current + 0.0005) {
        latchedPRef.current = next;
        setLatchedP(next);
      }

      if (latchedPRef.current >= 0.995) {
        markDone();
        return;
      }

      const expandDone = latchedPRef.current * BEATS >= 0.98;
      /* Leave upward after open → finish once, never replay */
      if (expandDone && next < latchedPRef.current - 0.012) {
        markDone();
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced, enterFreeExit, markDone]);

  const expandT = Math.min(1, latchedP * BEATS);
  const flipProgress = Math.max(0, latchedP * BEATS - 1);

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
        className={`home-different__track${freeExit ? " is-free-exit" : ""}`}
        style={{ "--beats": BEATS } as CSSProperties}
      >
        <div className="home-different__pin">
          {intro}

          <div
            className={`home-different__stage${isNarrow ? " is-narrow" : ""}`}
            aria-live="polite"
          >
            {isNarrow ? (
              <NarrowStage expandT={expandT} flipProgress={flipProgress} />
            ) : (
              <DesktopDeck expandT={expandT} flipProgress={flipProgress} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function NarrowStage({
  expandT,
  flipProgress,
}: {
  expandT: number;
  flipProgress: number;
}) {
  const isExpanded = expandT >= 0.98;

  if (!isExpanded) {
    const lead = POINTS[0];
    return (
      <div className="home-different__card home-different__card--solo">
        <div className="home-different__flip">
          <div
            className="home-different__face home-different__face--front"
            style={
              lead.cardColor
                ? ({ background: lead.cardColor } as CSSProperties)
                : undefined
            }
          >
            <CardKeywordFooter title={lead.title} />
          </div>
        </div>
      </div>
    );
  }

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

function DesktopDeck({
  expandT,
  flipProgress,
}: {
  expandT: number;
  flipProgress: number;
}) {
  const deckRef = useRef<HTMLUListElement>(null);
  const [deckW, setDeckW] = useState(720);
  const mid = (CARD_COUNT - 1) / 2;

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const measure = () => setDeckW(el.clientWidth || 720);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slot = deckW / CARD_COUNT;

  return (
    <ul
      ref={deckRef}
      className="home-different__deck"
      style={{ "--expand": expandT } as CSSProperties}
    >
      {POINTS.map((point, i) => {
        const stack = STACK[i] ?? STACK[0];
        const isFlipped = flipProgress >= i + 0.5;
        const slotOffset = (i - mid) * slot;
        const pull = 1 - expandT;
        const x = (stack.x - slotOffset) * pull;
        const y = stack.y * pull;
        const rotate = stack.rotate * pull;

        return (
          <motion.li
            key={point.id}
            className="home-different__slot"
            style={{ zIndex: Math.round(stack.z + expandT * (CARD_COUNT - i)) }}
            animate={{ x, y, rotate }}
            transition={{ duration: 0.04, ease: "linear" }}
          >
            <div className="home-different__card">
              <CardFaces point={point} flipped={isFlipped} />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
