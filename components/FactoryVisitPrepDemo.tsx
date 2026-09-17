"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

const PRODUCT_REQUIREMENTS = [
  "Process",
  "Equipment",
  "Key Production Stages",
  "Packaging",
] as const;

const CONCERNS = [
  "Mass-production quality consistency",
  "Response to production problems",
] as const;

const PLAN_ITEMS = [
  "What to verify",
  "Where to inspect",
  "What evidence to collect",
] as const;

const HOLD_AFTER_MS = 5;

/**
 * Factory-visit prep animation — “01 — Define What Needs to Be Verified”.
 * Requirements + concerns = verification plan. Loops with a 5s hold.
 */
export function FactoryVisitPrepDemo() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const killTimeline = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
  }, []);

  const showFinal = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    killTimeline();
    gsap.set(root.querySelectorAll("[data-fvp], [data-fvp-key]"), {
      opacity: 1,
      y: 0,
      x: 0,
    });
  }, [killTimeline]);

  const play = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    killTimeline();

    if (reduceMotion) {
      showFinal();
      return;
    }

    const keysPanel = root.querySelector("[data-fvp='keys-panel']");
    const keys = root.querySelectorAll("[data-fvp-key]");
    const plus = root.querySelector("[data-fvp='plus']");
    const concerns = root.querySelector("[data-fvp='concerns']");
    const chips = root.querySelectorAll("[data-fvp='chip']");
    const equals = root.querySelector("[data-fvp='equals']");
    const maps = root.querySelector("[data-fvp='maps']");
    const plan = root.querySelector("[data-fvp='plan']");
    const planItems = root.querySelectorAll("[data-fvp='plan-item']");
    const targets = [
      keysPanel,
      plus,
      concerns,
      equals,
      maps,
      plan,
      ...chips,
      ...keys,
    ];

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      repeat: -1,
      repeatDelay: HOLD_AFTER_MS,
    });
    tlRef.current = tl;

    /* Reset at the start of every loop */
    tl.set(targets, { opacity: 0, y: 8 });
    tl.set(planItems, { opacity: 1, y: 0 });
    tl.set(plan, { opacity: 0, y: 18 });

    tl.to(keysPanel, { opacity: 1, y: 0, duration: 0.4 }, 0);
    keys.forEach((key, i) => {
      tl.to(key, { opacity: 1, y: 0, duration: 0.32 }, 0.15 + i * 0.1);
    });
    tl.to(plus, { opacity: 1, y: 0, duration: 0.35 }, 0.55);
    tl.to(concerns, { opacity: 1, y: 0, duration: 0.4 }, 0.7);
    chips.forEach((chip, i) => {
      tl.to(chip, { opacity: 1, y: 0, duration: 0.32 }, 0.9 + i * 0.16);
    });
    tl.to(equals, { opacity: 1, y: 0, duration: 0.35 }, 1.5);
    tl.to(maps, { opacity: 1, y: 0, duration: 0.4 }, 1.85);
    /* Three plan cells rise together */
    tl.fromTo(
      plan,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
      2.25,
    );
    tl.set(planItems, { opacity: 1, y: 0 }, 2.25);
  }, [killTimeline, reduceMotion, showFinal]);

  useEffect(() => {
    let cancelled = false;
    const id = window.requestAnimationFrame(() => {
      if (cancelled) return;
      play();
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
      killTimeline();
      const root = rootRef.current;
      if (root) {
        gsap.set(root.querySelectorAll("[data-fvp], [data-fvp-key]"), {
          opacity: 1,
          y: 0,
          x: 0,
        });
      }
    };
  }, [play, killTimeline]);

  return (
    <div
      ref={rootRef}
      className="svc-workflow__fvp"
      aria-label="Factory visit preparation animation"
    >
      <div className="svc-workflow__fvp-surface">
        <div className="svc-workflow__fvp-formula">
          <div className="svc-workflow__fvp-equation">
            <div
              className="svc-workflow__fvp-panel svc-workflow__fvp-panel--side"
              data-fvp="keys-panel"
            >
              <p className="svc-workflow__fvp-panel-title">
                Product Requirements
              </p>
              <ul
                className="svc-workflow__fvp-panel-list"
                aria-label="Product requirements"
              >
                {PRODUCT_REQUIREMENTS.map((label) => (
                  <li
                    key={label}
                    className="svc-workflow__fvp-panel-item"
                    data-fvp-key
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <span
              className="svc-workflow__fvp-op"
              data-fvp="plus"
              aria-hidden="true"
            >
              +
            </span>

            <div
              className="svc-workflow__fvp-panel svc-workflow__fvp-panel--side"
              data-fvp="concerns"
            >
              <p className="svc-workflow__fvp-panel-title">
                Your Specific Concerns
              </p>
              <ul className="svc-workflow__fvp-panel-list">
                {CONCERNS.map((label) => (
                  <li
                    key={label}
                    className="svc-workflow__fvp-panel-item"
                    data-fvp="chip"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <span
            className="svc-workflow__fvp-op svc-workflow__fvp-op--eq"
            data-fvp="equals"
            aria-hidden="true"
          >
            =
          </span>

          <p className="svc-workflow__fvp-maps" data-fvp="maps">
            Maps to on-site checks
          </p>

          <div className="svc-workflow__fvp-plan-grid" data-fvp="plan">
            {PLAN_ITEMS.map((label) => (
              <div
                key={label}
                className="svc-workflow__fvp-plan-cell"
                data-fvp="plan-item"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
