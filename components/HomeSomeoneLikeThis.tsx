"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  someoneLikeThisLines,
  whyWorkWithMe,
} from "@/content/homeCopy";
import { usePinnedScrub } from "@/hooks/usePinnedScrub";

const LINES = someoneLikeThisLines;
const LAST = LINES.length - 1;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Home first editorial block — pinned sentence, scroll swaps ability + challenge.
 * Scrub follows scroll both ways.
 */
export function HomeSomeoneLikeThis() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const progress = usePinnedScrub({
    trackRef,
    enabled: !reduced,
  });

  const index = Math.min(
    LAST,
    Math.floor(progress * LINES.length + 1e-6),
  );
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
          className="home-someone__track"
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
