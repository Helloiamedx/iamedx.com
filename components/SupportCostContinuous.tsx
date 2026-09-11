"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const CUTS_CENTS = [9, 6, 5, 7] as const;
const ORIGINAL_CENTS = 1058;
const SAVED_CENTS = 27;

/** Equal hold after each act settles, before the next beat. */
const HOLD_MS = 2400;

const INTRO_MS = 1600;
const LEVER_START = 2400;
const LEVER_STAGGER = 1000;
const LEVER_DUR = 900;
const LEVER_DONE = LEVER_START + (CUTS_CENTS.length - 1) * LEVER_STAGGER + LEVER_DUR;

const GATHER_START = LEVER_DONE + HOLD_MS;
const GATHER_MS = 1200;
const GATHER_END = GATHER_START + GATHER_MS;

const SAVED_START = GATHER_END - 180;
const SAVED_DUR = 1100;
const SAVED_DONE = SAVED_START + SAVED_DUR;

const ACT2_END = SAVED_DONE + HOLD_MS;

const ROW_START = ACT2_END;
const ROW_STAGGER = 280;
const ROW_COUNT = 4;
const ROW_DONE = ROW_START + (ROW_COUNT - 1) * ROW_STAGGER + 320;

const TOTAL_MS = ROW_DONE + HOLD_MS;

type SupportCostContinuousProps = {
  active: boolean;
  /** Stage play/pause — freezes timeline without resetting. Default true. */
  playing?: boolean;
};

/**
 * Cost Optimization panel — continuous breakdown → unit saving → scale impact.
 * Plays while the card is active and the stage is playing; leave resets to start.
 */
export function SupportCostContinuous({
  active,
  playing = true,
}: SupportCostContinuousProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const lastRef = useRef(0);
  const playingRef = useRef(false);
  const stepRef = useRef(-1);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const screen = root.querySelector<HTMLElement>(".support-know-cost__screen");
    const leversRoot = root.querySelector<HTMLElement>(".support-know-cost__levers");
    const levers = [...root.querySelectorAll<HTMLElement>(".support-know-cost__lever")];
    const rows = [...root.querySelectorAll<HTMLElement>(".support-know-cost__row")];
    const price = root.querySelector<HTMLElement>("[data-price]");
    const saving = root.querySelector<HTMLElement>("[data-saving]");
    const caption = root.querySelector<HTMLElement>("[data-caption]");
    const operator = root.querySelector<HTMLElement>(".support-know-cost__operator");

    if (!screen || !leversRoot || !price || !saving || !caption || !operator) {
      return;
    }

    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    const hardResetLevers = () => {
      gatherOrigins = null;
      leversRoot.classList.remove("is-gathering");
      screen.classList.remove("is-pre-save");
      levers.forEach((element) => {
        element.style.transition = "none";
        element.style.opacity = "0";
        element.style.transform = "translateY(14px)";
        element.classList.remove("is-visible", "is-applied");
        const review = element.querySelector<HTMLElement>("[data-cut-review]");
        const value = element.querySelector<HTMLElement>("[data-cut-value]");
        const amount = element.querySelector<HTMLElement>("[data-cut-amount]");
        if (review) review.hidden = false;
        if (value) value.hidden = true;
        if (amount) amount.textContent = "0.00";
      });
      void root.offsetWidth;
      levers.forEach((element) => {
        element.style.transition = "";
        element.style.opacity = "";
        element.style.transform = "";
      });
    };

    /** Snap back to act 1 with no step-3 → step-0 morph. */
    const hardClearStage = () => {
      screen.classList.add("is-instant");
      hardResetLevers();
      rows.forEach((row) => {
        row.classList.remove("is-visible");
      });
      stepRef.current = 0;
      screen.dataset.step = "0";
      price.textContent = (ORIGINAL_CENTS / 100).toFixed(2);
      saving.textContent = "0.00";
      caption.textContent = "Original / unit";
      operator.textContent = "→";
      void screen.offsetWidth;
      window.requestAnimationFrame(() => {
        screen.classList.remove("is-instant");
      });
    };

    let prevTime = timeRef.current;
    let gatherOrigins: { dx: number; dy: number }[] | null = null;

    /** One shared meet point — middle of the lever list (stable on mobile). */
    const measureGatherOrigins = () => {
      screen.classList.add("is-pre-save");
      leversRoot.classList.add("is-gathering");
      levers.forEach((element) => {
        element.style.transition = "none";
        element.style.transform = "none";
        element.style.opacity = "";
      });
      void screen.offsetWidth;

      const tr = leversRoot.getBoundingClientRect();
      const tx = tr.left + tr.width / 2;
      const ty = tr.top + tr.height / 2;

      gatherOrigins = levers.map((element) => {
        const box = element.getBoundingClientRect();
        return {
          dx: tx - (box.left + box.width / 2),
          dy: ty - (box.top + box.height / 2),
        };
      });

      levers.forEach((element) => {
        element.style.transition = "";
        element.style.transform = "";
      });
    };

    const draw = () => {
      const time = timeRef.current;
      const next =
        time < INTRO_MS
          ? 0
          : time < GATHER_END
            ? 1
            : time < ACT2_END
              ? 2
              : 3;

      if (time < prevTime - 50) {
        hardClearStage();
        prevTime = time;
        return;
      }
      prevTime = time;

      if (next !== stepRef.current) {
        stepRef.current = next;
        screen.dataset.step = String(next);
      }

      /*
       * Keep levers collapsed after the gather. Removing is-gathering snaps
       * layout back open (= “explode”) right as $0.27 appears.
       */
      const mergeActive = time >= GATHER_START && next <= 2;
      if (mergeActive) {
        if (!gatherOrigins) measureGatherOrigins();
        leversRoot.classList.add("is-gathering");
        if (next === 1) screen.classList.add("is-pre-save");
        else screen.classList.remove("is-pre-save");
      } else if (time < GATHER_START) {
        leversRoot.classList.remove("is-gathering");
        screen.classList.remove("is-pre-save");
        gatherOrigins = null;
        levers.forEach((element) => {
          element.style.transform = "";
          element.style.opacity = "";
        });
      }

      let removed = 0;
      levers.forEach((element, index) => {
        const cut = CUTS_CENTS[index] ?? 0;
        const progress = clamp(
          (time - LEVER_START - index * LEVER_STAGGER) / LEVER_DUR,
        );
        removed += cut * progress;
        element.classList.toggle(
          "is-visible",
          time >= 750 + index * 500 && (mergeActive || time < GATHER_START),
        );
        element.classList.toggle("is-applied", progress >= 1);

        const review = element.querySelector<HTMLElement>("[data-cut-review]");
        const value = element.querySelector<HTMLElement>("[data-cut-value]");
        const amount = element.querySelector<HTMLElement>("[data-cut-amount]");
        if (review && value && amount) {
          if (progress > 0) {
            review.hidden = true;
            value.hidden = false;
            amount.textContent = ((cut * progress) / 100).toFixed(2);
          } else {
            review.hidden = false;
            value.hidden = true;
            amount.textContent = "0.00";
          }
        }

        /* All four converge on one point while shrinking to nothing. */
        if (mergeActive && gatherOrigins) {
          const origin = gatherOrigins[index] ?? { dx: 0, dy: 0 };
          const gatherP = clamp((time - GATHER_START) / GATHER_MS);
          const gatherE = 1 - (1 - gatherP) ** 3;
          const scale = Math.max(1 - gatherE, 0);
          element.style.transform = `translate(${origin.dx * gatherE}px, ${origin.dy * gatherE}px) scale(${scale})`;
          element.style.opacity = String(scale);
        }
      });

      price.textContent = ((ORIGINAL_CENTS - removed) / 100).toFixed(2);
      caption.textContent =
        next === 0
          ? "Original / unit"
          : removed < SAVED_CENTS - 0.01
            ? "Optimizing / unit"
            : "Optimized / unit";
      operator.textContent = next >= 2 ? "−" : "→";

      const saved = SAVED_CENTS * clamp((time - SAVED_START) / SAVED_DUR);
      saving.textContent = (saved / 100).toFixed(2);

      rows.forEach((row, index) => {
        row.classList.toggle(
          "is-visible",
          time >= ROW_START + index * ROW_STAGGER,
        );
      });
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    const loop = (now: number) => {
      if (playingRef.current) {
        if (lastRef.current) {
          timeRef.current = Math.min(
            TOTAL_MS,
            timeRef.current + Math.min(now - lastRef.current, 100),
          );
        }
        if (timeRef.current >= TOTAL_MS) {
          timeRef.current = 0;
          lastRef.current = 0;
          hardClearStage();
          prevTime = 0;
        }
        draw();
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(loop);
    };

    if (!active) {
      stopLoop();
      playingRef.current = false;
      timeRef.current = 0;
      lastRef.current = 0;
      hardClearStage();
      prevTime = 0;
      return () => {
        stopLoop();
      };
    }

    if (reduceMotion) {
      stopLoop();
      playingRef.current = false;
      timeRef.current = TOTAL_MS;
      draw();
      return () => {
        stopLoop();
      };
    }

    playingRef.current = playing;
    /* Avoid a large dt spike when resuming after pause. */
    lastRef.current = 0;
    draw();

    if (playing) {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    } else {
      stopLoop();
    }

    return () => {
      stopLoop();
      playingRef.current = false;
    };
  }, [active, playing, reduceMotion]);

  const levers = [
    "Material",
    "Packaging",
    "Labor process",
    "Logistics",
  ] as const;
  const totals = [
    { qty: "1,000", total: "270" },
    { qty: "3,000", total: "810" },
    { qty: "5,000", total: "1,350" },
    { qty: "10,000", total: "2,700" },
  ] as const;

  return (
    <div
      ref={rootRef}
      className="support-know__panel support-know__panel--price support-know-cost"
      aria-label="Cost optimization animation"
    >
      <div className="support-know-cost__screen" data-step="0">
        <div className="support-know-cost__stage">
          <div className="support-know-cost__figures">
            <div className="support-know-cost__price support-know-cost__price--original">
              <div className="support-know-cost__label">Original / unit</div>
              <div className="support-know-cost__number">
                <span className="support-know-cost__currency">$</span>10.58
              </div>
            </div>

            <div className="support-know-cost__operator" aria-hidden="true">
              →
            </div>

            <div className="support-know-cost__price support-know-cost__price--current">
              <div className="support-know-cost__label" data-caption>
                Original / unit
              </div>
              <div className="support-know-cost__number">
                <span className="support-know-cost__currency">$</span>
                <span data-price>10.58</span>
              </div>
            </div>

            <div className="support-know-cost__saving">
              <div className="support-know-cost__number">
                <span className="support-know-cost__currency">$</span>
                <span data-saving>0.00</span>
              </div>
              <div className="support-know-cost__label">Saved / unit</div>
            </div>
          </div>

          <div
            className="support-know-cost__levers"
            aria-label="Example cost optimization items"
          >
            {levers.map((title) => (
              <div key={title} className="support-know-cost__lever">
                <span className="support-know-cost__lever-name">{title}</span>
                <span className="support-know-cost__lever-cut" data-cut>
                  <span data-cut-review>Review</span>
                  <span data-cut-value hidden>
                    <span className="support-know-cost__cut-minus">−</span>
                    <span className="support-know-cost__currency">$</span>
                    <span data-cut-amount>0.00</span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div
            className="support-know-cost__totals"
            aria-label="Per-unit savings times quantity"
          >
            {totals.map((row) => (
              <div key={row.qty} className="support-know-cost__row">
                <span>
                  <span className="support-know-cost__currency">$</span>
                  0.27 <small>/ unit</small>
                </span>
                <span>×</span>
                <span>
                  {row.qty} <small>units</small>
                </span>
                <span>=</span>
                <strong>
                  <span className="support-know-cost__currency">$</span>
                  {row.total}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
