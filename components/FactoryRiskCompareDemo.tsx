"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

type CompareRow = {
  label: string;
  require: string;
  verified: string;
  mismatch: boolean;
};

const ROWS: readonly CompareRow[] = [
  {
    label: "Key Process",
    require: "In-house",
    verified: "In-house",
    mismatch: false,
  },
  {
    label: "Technique Experience",
    require: "Proven",
    verified: "Limited",
    mismatch: true,
  },
  {
    label: "Quality Check",
    require: "Defined",
    verified: "Limited",
    mismatch: true,
  },
  {
    label: "Production Capacity",
    require: "10K / month",
    verified: "10K / month",
    mismatch: false,
  },
];

const RISK_ROWS = [
  "No Pre-Production Sample Check",
  "Color Matching Depends on Operator Judgment",
  "Final Assembly Has No Positioning Aid",
] as const;

const CONTROLS = [
  "Pre-Production Check",
  "Color Standardization",
  "Assembly Support",
] as const;

const HOLD_AFTER_MS = 5;

/**
 * Identify Risks Before Production — same loop language as FactoryVisitPrepDemo.
 */
export function FactoryRiskCompareDemo() {
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
    gsap.set(root.querySelectorAll("[data-frc]"), {
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

    const requirePanel = root.querySelector("[data-frc='require']");
    const requireItems = root.querySelectorAll("[data-frc='require-item']");
    const arrowIn = root.querySelector("[data-frc='arrow-in']");
    const arrowOut = root.querySelector("[data-frc='arrow-out']");
    const verifiedPanel = root.querySelector("[data-frc='verified']");
    const verifiedItems = root.querySelectorAll("[data-frc='verified-item']");
    const risks = root.querySelector("[data-frc='risks']");
    const riskItems = root.querySelectorAll("[data-frc='risk-item']");
    const attention = root.querySelector("[data-frc='attention']");
    const controls = root.querySelectorAll("[data-frc='control']");

    const targets = [
      requirePanel,
      verifiedPanel,
      risks,
      attention,
      arrowIn,
      arrowOut,
      ...requireItems,
      ...verifiedItems,
      ...riskItems,
      ...controls,
    ];

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      repeat: -1,
      repeatDelay: HOLD_AFTER_MS,
    });
    tlRef.current = tl;

    /* Reset each loop — same language as Define What Needs to Be Verified */
    tl.set(targets, { opacity: 0, y: 8, x: 0 });
    tl.set(controls, { opacity: 1, y: 0, x: 0 });
    tl.set(attention, { opacity: 0, y: 18, x: 0 });
    tl.set([arrowIn, arrowOut], { opacity: 0, y: 0, x: 0 });

    tl.to(requirePanel, { opacity: 1, y: 0, duration: 0.4 }, 0);
    requireItems.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.32 }, 0.15 + i * 0.1);
    });

    /* ← / → short pulse, then settle back to rest */
    tl.to(arrowIn, { opacity: 1, duration: 0.28 }, 0.7);
    tl.to(arrowOut, { opacity: 1, duration: 0.28 }, 0.78);
    tl.fromTo(
      arrowIn,
      { x: 0, opacity: 0.55 },
      {
        x: -3.5,
        opacity: 1,
        duration: 0.65,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 5,
      },
      0.85,
    );
    tl.fromTo(
      arrowOut,
      { x: 0, opacity: 0.55 },
      {
        x: 3.5,
        opacity: 1,
        duration: 0.65,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 5,
      },
      1.0,
    );
    tl.to(
      [arrowIn, arrowOut],
      { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
      1.0 + 0.65 * 6,
    );

    tl.to(verifiedPanel, { opacity: 1, y: 0, duration: 0.4 }, 1.0);
    verifiedItems.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.32 }, 1.15 + i * 0.1);
    });

    tl.to(risks, { opacity: 1, y: 0, duration: 0.4 }, 1.75);
    riskItems.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.32 }, 1.95 + i * 0.12);
    });

    /* Attention cells rise together — same as FVP plan grid */
    tl.fromTo(
      attention,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
      2.55,
    );
    tl.set(controls, { opacity: 1, y: 0 }, 2.55);
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
        gsap.set(root.querySelectorAll("[data-frc]"), {
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
      className="svc-workflow__frc"
      aria-label="Identify production risks animation"
    >
      <div className="svc-workflow__frc-surface">
        <div className="svc-workflow__frc-columns">
          <div
            className="svc-workflow__frc-panel svc-workflow__frc-panel--require"
            data-frc="require"
          >
            <p className="svc-workflow__frc-panel-title">Project Requires</p>
            <ul className="svc-workflow__frc-panel-list">
              {ROWS.map((row) => (
                <li
                  key={`req-${row.label}`}
                  className="svc-workflow__frc-panel-item"
                  data-frc="require-item"
                >
                  <span className="svc-workflow__frc-panel-label">{row.label}</span>
                  <span className="svc-workflow__frc-panel-value">{row.require}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="svc-workflow__frc-arrows" aria-hidden="true">
            <span className="svc-workflow__frc-arrow" data-frc="arrow-in">
              ←
            </span>
            <span className="svc-workflow__frc-arrow" data-frc="arrow-out">
              →
            </span>
          </div>

          <div
            className="svc-workflow__frc-panel svc-workflow__frc-panel--verified"
            data-frc="verified"
          >
            <p className="svc-workflow__frc-panel-title">Factory Verified</p>
            <ul className="svc-workflow__frc-panel-list">
              {ROWS.map((row) => (
                <li
                  key={`ver-${row.label}`}
                  className="svc-workflow__frc-panel-item"
                  data-frc="verified-item"
                >
                  <span className="svc-workflow__frc-panel-label">{row.label}</span>
                  <span
                    className={
                      row.mismatch
                        ? "svc-workflow__frc-panel-value svc-workflow__frc-panel-value--result is-mismatch"
                        : "svc-workflow__frc-panel-value svc-workflow__frc-panel-value--result is-match"
                    }
                  >
                    {row.mismatch ? row.verified : "Met"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="svc-workflow__frc-risks" data-frc="risks">
          <p className="svc-workflow__frc-section-title">Potential Risks</p>
          <ul className="svc-workflow__frc-risk-list">
            {RISK_ROWS.map((risk, i) => (
              <li
                key={risk}
                className="svc-workflow__frc-risk-item"
                data-frc="risk-item"
              >
                <span className="svc-workflow__frc-risk-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="svc-workflow__frc-risk-sep" aria-hidden="true">
                  -
                </span>
                <span className="svc-workflow__frc-risk-text">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="svc-workflow__frc-attention" data-frc="attention">
          <p className="svc-workflow__frc-section-title">Requires More Attention</p>
          <div className="svc-workflow__frc-controls">
            {CONTROLS.map((label) => (
              <div
                key={label}
                className="svc-workflow__frc-control"
                data-frc="control"
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
