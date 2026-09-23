"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { HeadlineMotion } from "@/components/HeadlineMotion";
import {
  HEADLINE_EFFECTS,
  HEADLINE_EFFECT_IDS,
  headlineEffectLabel,
  type HeadlineEffectId,
} from "@/lib/headlineMotion";

/** The six site section titles this will eventually be offered for. */
const SECTION_TITLES = [
  "Recognition comes first.",
  "From concept to delivery.",
  "What makes me stand out.",
  "My approach.",
  "Products Brought to Life.",
  "How I Think.",
] as const;

/** Longest real headline on the site — the row-splitting stress case. */
const LONG_TITLE =
  "Establish a Supply Chain From Scratch Tailored to Your Business";

const TEXT_SWAP = [
  "How I Think.",
  "Products Brought to Life.",
] as const;

const LONG_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.6rem, 5.4vw, 3.4rem)",
  fontWeight: 500,
  letterSpacing: "-0.03em",
};

const SMALL_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.1rem, 3.4vw, 1.6rem)",
  fontWeight: 500,
  letterSpacing: "-0.02em",
};

export function HeadlineMotionLab() {
  const [effect, setEffect] = useState<HeadlineEffectId>("02");
  const [mounted, setMounted] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const [speedsUp, setSpeedsUp] = useState(false);
  /** Bumped by “Replay all” — remounts every headline, which re-runs the engine. */
  const [runId, setRunId] = useState(0);
  const [rows, setRows] = useState<Record<string, number>>({});
  const labRef = useRef<HTMLDivElement>(null);

  /** Count the engine's own `.hm-line` nodes — proof of real row splitting. */
  const measure = useCallback(() => {
    const lab = labRef.current;
    if (!lab) return;
    const next: Record<string, number> = {};
    lab.querySelectorAll<HTMLElement>("[data-lab-row]").forEach((node) => {
      const id = node.dataset.labRow;
      if (id) next[id] = node.querySelectorAll(".hm-line").length;
    });
    setRows(next);
  }, []);

  useEffect(() => {
    measure();
    const timer = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [measure, effect, mounted, swapped, runId, speedsUp]);

  const speed = speedsUp ? 1.6 : 1;
  /** Everything that must force a fresh engine instance. */
  const runKey = `${effect}-${speed}-${runId}`;

  return (
    <div ref={labRef} style={styles.page}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Developer preview · not linked from the site</p>
        <h1 style={styles.labTitle}>Headline motion · 01–07</h1>
        <p style={styles.note}>
          Module: <code>lib/headlineMotion.ts</code> +{" "}
          <code>components/HeadlineMotion.tsx</code>. Row counts are read from the
          engine&rsquo;s own <code>.hm-line</code> nodes.
        </p>
      </header>

      <div style={styles.controls}>
        <label style={styles.control}>
          <span style={styles.controlLabel}>Effect</span>
          <select
            value={effect}
            onChange={(event) => setEffect(event.target.value as HeadlineEffectId)}
            style={styles.input}
          >
            {HEADLINE_EFFECT_IDS.map((id) => (
              <option key={id} value={id}>
                {headlineEffectLabel(id)} / {HEADLINE_EFFECTS[id].id}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.control}>
          <input
            type="checkbox"
            checked={speedsUp}
            onChange={(event) => setSpeedsUp(event.target.checked)}
          />
          <span style={styles.controlLabel}>speed 1.6</span>
        </label>

        <label style={styles.control}>
          <input
            type="checkbox"
            checked={mounted}
            onChange={(event) => setMounted(event.target.checked)}
          />
          <span style={styles.controlLabel}>
            mounted (off = unmount / destroy test)
          </span>
        </label>

        <label style={styles.control}>
          <input
            type="checkbox"
            checked={swapped}
            onChange={(event) => setSwapped(event.target.checked)}
          />
          <span style={styles.controlLabel}>
            swap text (React remount-key test)
          </span>
        </label>

        <button
          type="button"
          style={styles.button}
          onClick={() => setRunId((id) => id + 1)}
        >
          Replay all
        </button>
      </div>

      <section style={styles.block}>
        <h2 style={styles.blockTitle}>Long headline · line-height 1.08</h2>
        {mounted ? (
          <div data-lab-row="long">
            <HeadlineMotion
              key={`long-${runKey}`}
              as="h2"
              effect={effect}
              speed={speed}
              lineHeight={1.08}
              style={LONG_STYLE}
            >
              {LONG_TITLE}
            </HeadlineMotion>
            <p style={styles.readout}>
              rows: {rows.long ?? "—"} · {headlineEffectLabel(effect)}
            </p>
          </div>
        ) : (
          <p style={styles.placeholder}>unmounted</p>
        )}
      </section>

      <section style={styles.block}>
        <h2 style={styles.blockTitle}>Section titles</h2>
        <div style={styles.grid}>
          {SECTION_TITLES.map((text, index) => {
            const rowId = `s${index + 1}`;
            return (
              <div key={rowId} data-lab-row={rowId}>
                {mounted ? (
                  <>
                    <HeadlineMotion
                      key={`${rowId}-${runKey}`}
                      as="h3"
                      effect={effect}
                      speed={speed}
                      lineHeight={1.08}
                      style={SMALL_STYLE}
                    >
                      {text}
                    </HeadlineMotion>
                    <p style={styles.readout}>rows: {rows[rowId] ?? "—"}</p>
                  </>
                ) : (
                  <p style={styles.placeholder}>unmounted</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section style={styles.block}>
        <h2 style={styles.blockTitle}>Live text swap · no parent key</h2>
        <div data-lab-row="swap">
          {mounted ? (
            <>
              <HeadlineMotion
                /* Deliberately NOT keyed by the parent: the component must key
                 * itself on `children` so React never patches engine nodes. */
                as="h3"
                effect={effect}
                speed={speed}
                lineHeight={1.08}
                style={SMALL_STYLE}
              >
                {swapped ? TEXT_SWAP[1] : TEXT_SWAP[0]}
              </HeadlineMotion>
              <p style={styles.readout}>
                rows: {rows.swap ?? "—"} · text: {swapped ? TEXT_SWAP[1] : TEXT_SWAP[0]}
              </p>
            </>
          ) : (
            <p style={styles.placeholder}>unmounted</p>
          )}
        </div>
      </section>

      <section style={styles.block}>
        <h2 style={styles.blockTitle}>Explicit line break · array children</h2>
        <div data-lab-row="lines">
          {mounted ? (
            <>
              <HeadlineMotion
                key={`lines-${runKey}`}
                as="h3"
                effect={effect}
                speed={speed}
                lineHeight={1.08}
                style={SMALL_STYLE}
              >
                {["Tailored to", "Your Business"]}
              </HeadlineMotion>
              <p style={styles.readout}>
                rows: {rows.lines ?? "—"} · forced 2 lines
              </p>
            </>
          ) : (
            <p style={styles.placeholder}>unmounted</p>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#eaeae1",
    color: "#0a0a0a",
    fontFamily: "var(--font-sans)",
    padding: "clamp(1.5rem, 4vw, 3.5rem)",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(1.5rem, 3vw, 2.5rem)",
  },
  header: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  eyebrow: {
    margin: 0,
    fontFamily: "var(--font-label)",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5c5c5c",
  },
  labTitle: { margin: 0, fontSize: "clamp(1.5rem, 3vw, 2.25rem)" },
  note: { margin: 0, maxWidth: "60ch", color: "#5c5c5c", lineHeight: 1.5 },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem 1.5rem",
    alignItems: "center",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(10, 10, 10, 0.14)",
  },
  control: { display: "flex", alignItems: "center", gap: "0.5rem" },
  controlLabel: { fontSize: "0.875rem" },
  input: {
    font: "inherit",
    fontSize: "0.875rem",
    padding: "0.4rem 0.6rem",
    background: "#fff",
    border: "1px solid rgba(10, 10, 10, 0.2)",
    color: "#0a0a0a",
  },
  button: {
    font: "inherit",
    fontSize: "0.875rem",
    padding: "0.4rem 0.9rem",
    background: "transparent",
    border: "1px solid #0a0a0a",
    color: "#0a0a0a",
    cursor: "pointer",
  },
  block: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  blockTitle: {
    margin: 0,
    fontFamily: "var(--font-label)",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5c5c5c",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
    gap: "1.5rem 2rem",
  },
  readout: {
    margin: "0.35rem 0 0",
    fontFamily: "var(--font-label)",
    fontSize: "0.6875rem",
    letterSpacing: "0.04em",
    color: "#5c5c5c",
  },
  placeholder: { margin: 0, color: "#5c5c5c", fontStyle: "italic" },
};
