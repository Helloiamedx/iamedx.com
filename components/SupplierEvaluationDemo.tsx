"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type RowState = "pending" | "active" | "passed" | "discussion";

type EvalRow = {
  label: string;
  /** MOQ / Price — amber pause, then separate negotiate pass */
  needsDiscussion?: boolean;
  /**
   * Evaluating spin (ms) — longer = harder to verify in market.
   * Quality / manageability hardest; payment terms / responsiveness quickest.
   */
  evalMs: number;
};

const PRODUCTION: EvalRow[] = [
  { label: "Quality Level", evalMs: 820 },
  { label: "MOQ", needsDiscussion: true, evalMs: 540 },
  { label: "Price", needsDiscussion: true, evalMs: 680 },
  { label: "Lead Time", evalMs: 600 },
  { label: "Payment Terms", evalMs: 380 },
];

const COMMUNICATION: EvalRow[] = [
  { label: "Responsive", evalMs: 400 },
  { label: "Cooperative", evalMs: 560 },
  { label: "Manageable", evalMs: 740 },
];

const ALL_ROWS = [...PRODUCTION, ...COMMUNICATION];

/** Negotiate spin — 1.5× the original 1s hold */
const NEGOTIATE_MS = 1500;
const NEGOTIATE_GAP_MS = 350;
const SETTLE_MS = 170;

function symbolFor(state: RowState) {
  if (state === "passed") {
    return (
      <svg
        className="svc-workflow__eval-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3.2 8.2 6.6 11.6 12.8 4.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === "discussion") {
    return (
      <svg
        className="svc-workflow__eval-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M8 3.4v6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="12.2" r="1.15" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

function ariaFor(state: RowState) {
  if (state === "passed") return "Passed";
  if (state === "active") return "Evaluating";
  if (state === "discussion") return "Needs discussion";
  return "Pending";
}

/**
 * Supplier Evaluation checklist animation — workflow step 03 media.
 * Sized for the narrow right media column with internal air, not a forced 16:9 crop.
 */
export function SupplierEvaluationDemo() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const [states, setStates] = useState<RowState[]>(() =>
    ALL_ROWS.map(() => "pending"),
  );
  const [result, setResult] = useState("Ready to evaluate");
  const [done, setDone] = useState(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const setRow = useCallback((index: number, state: RowState) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = state;
      return next;
    });
  }, []);

  const play = useCallback(() => {
    clearTimers();
    setDone(false);
    setResult("Evaluating supplier…");
    setStates(ALL_ROWS.map(() => "pending"));

    if (reduceMotion) {
      setStates(ALL_ROWS.map(() => "passed"));
      setResult("✓ Added to Shortlist");
      setDone(true);
      schedule(() => {
        play();
      }, 5000);
      return;
    }

    let time = 450;
    ALL_ROWS.forEach((row, i) => {
      schedule(() => setRow(i, "active"), time);
      time += row.evalMs;
      schedule(
        () => setRow(i, row.needsDiscussion ? "discussion" : "passed"),
        time,
      );
      time += SETTLE_MS;
    });

    const discussionIndexes = ALL_ROWS.map((r, i) =>
      r.needsDiscussion ? i : -1,
    ).filter((i) => i >= 0);

    let confirmAt = time + 300;
    discussionIndexes.forEach((index) => {
      const label = ALL_ROWS[index]?.label ?? "item";
      schedule(() => {
        setResult(`Negotiating ${label}…`);
        setRow(index, "active");
      }, confirmAt);
      confirmAt += NEGOTIATE_MS;
      schedule(() => {
        setRow(index, "passed");
      }, confirmAt);
      confirmAt += NEGOTIATE_GAP_MS;
    });

    schedule(() => {
      setResult("✓ Added to Shortlist");
      setDone(true);
    }, confirmAt + 400);
    /* Hold finished state 5s, then loop */
    schedule(() => {
      play();
    }, confirmAt + 400 + 5000);
  }, [clearTimers, reduceMotion, schedule, setRow]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.2)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      clearTimers();
    };
  }, [play, clearTimers]);

  const passedCount = states.filter((s) => s === "passed").length;

  return (
    <div
      ref={rootRef}
      className="svc-workflow__eval"
      aria-label="Supplier evaluation animation"
    >
      <div className="svc-workflow__eval-surface">
        <div className="svc-workflow__eval-top">
          <h3 className="svc-workflow__eval-title">Supplier Evaluation</h3>
        </div>

        <div className="svc-workflow__eval-columns">
          <section className="svc-workflow__eval-col">
            <h4 className="svc-workflow__eval-col-title">
              Capability &amp; Terms
            </h4>
            {PRODUCTION.map((row, i) => (
              <EvalRowView
                key={row.label}
                label={row.label}
                state={states[i]!}
                showNote={row.needsDiscussion}
              />
            ))}
          </section>
          <section className="svc-workflow__eval-col">
            <h4 className="svc-workflow__eval-col-title">Manageability</h4>
            {COMMUNICATION.map((row, i) => (
              <EvalRowView
                key={row.label}
                label={row.label}
                state={states[PRODUCTION.length + i]!}
              />
            ))}
          </section>
        </div>

        <div className="svc-workflow__eval-bottom">
          <span className="svc-workflow__eval-count">
            {passedCount} / {ALL_ROWS.length} checked
          </span>
          <div
            className={cn("svc-workflow__eval-result", done && "is-done")}
            role="status"
            aria-live="polite"
          >
            {result}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvalRowView({
  label,
  state,
  showNote = false,
}: {
  label: string;
  state: RowState;
  showNote?: boolean;
}) {
  return (
    <div
      className={cn(
        "svc-workflow__eval-row",
        showNote && "svc-workflow__eval-row--noted",
      )}
      data-state={state}
    >
      <div className="svc-workflow__eval-copy">
        <span className="svc-workflow__eval-label">{label}</span>
        {showNote ? (
          <span
            className={cn(
              "svc-workflow__eval-note",
              state === "discussion" && "is-visible",
            )}
          >
            Needs Discussion
          </span>
        ) : null}
      </div>
      <span className="svc-workflow__eval-status">
        <span
          className="svc-workflow__eval-symbol"
          aria-label={ariaFor(state)}
        >
          {symbolFor(state)}
        </span>
      </span>
    </div>
  );
}
