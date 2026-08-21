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
  someoneLikeThisLines,
  whyWorkWithMe,
} from "@/content/homeCopy";

const LINES = someoneLikeThisLines;
const LAST = LINES.length - 1;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Home first editorial block — pinned sentence, scroll swaps ability + challenge.
 * Plays once per page load; never reverses or replays on re-entry.
 */
export function HomeSomeoneLikeThis() {
  const trackRef = useRef<HTMLDivElement>(null);
  const latchedIndexRef = useRef(0);
  const freeExitRef = useRef(false);
  const doneRef = useRef(false);
  const lenis = useLenis();

  const [index, setIndex] = useState(0);
  const [freeExit, setFreeExit] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
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
    latchedIndexRef.current = LAST;
    setIndex(LAST);
    enterFreeExit();
  }, [enterFreeExit]);

  useEffect(() => {
    if (reduced) return;

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;

    const paint = () => {
      raf = 0;

      if (doneRef.current) {
        if (!freeExitRef.current) enterFreeExit();
        return;
      }

      if (freeExitRef.current) return;

      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = Math.max(1, track.offsetHeight - vh);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      const next = Math.min(LAST, Math.floor(progress * LINES.length + 1e-6));

      if (next > latchedIndexRef.current) {
        latchedIndexRef.current = next;
        setIndex(next);
      }

      if (latchedIndexRef.current >= LAST && progress >= 0.995) {
        markDone();
        return;
      }

      /* Upward after first lines → finish once, never replay */
      if (
        latchedIndexRef.current > 0 &&
        progress < latchedIndexRef.current / LINES.length - 0.02
      ) {
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

  const line = LINES[index] ?? LINES[0];

  return (
    <section
      className="home-someone"
      id={whyWorkWithMe.id}
      aria-labelledby={`${whyWorkWithMe.id}-title`}
    >
      {reduced ? (
        <div className="home-someone__static">
          <div className="home-page__intro">
            <h2 id={`${whyWorkWithMe.id}-title`}>{whyWorkWithMe.title}</h2>
            <p>{whyWorkWithMe.subtitle}</p>
          </div>
          <ol className="home-someone__static-list">
            {LINES.map((item) => (
              <li key={item.ability}>
                Someone who {item.ability}, even if {item.challenge}.
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div
          ref={trackRef}
          className={`home-someone__track${freeExit ? " is-free-exit" : ""}`}
          style={{ "--beats": LINES.length } as CSSProperties}
        >
          <div className="home-someone__pin">
            <div className="home-page__intro">
              <h2 id={`${whyWorkWithMe.id}-title`}>{whyWorkWithMe.title}</h2>
              <p>{whyWorkWithMe.subtitle}</p>
            </div>

            <div className="home-someone__stage">
              <p className="home-someone__line" aria-live="polite">
                <span className="home-someone__lock">Someone who </span>
                <motion.span
                  key={`ability-${index}`}
                  className="home-someone__dyn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {line.ability}
                </motion.span>
                <span>, </span>
                <motion.span
                  className="home-someone__lock home-someone__even"
                  layout="position"
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  even if{" "}
                </motion.span>
                <motion.span
                  key={`challenge-${index}`}
                  className="home-someone__dyn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {line.challenge}
                </motion.span>
                <span>.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
