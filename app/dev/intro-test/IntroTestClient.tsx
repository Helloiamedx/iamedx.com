"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SiteIntroLoader } from "@/components/SiteIntroLoader";

/**
 * Remountable intro preview — stroke loops, then fill + unveil.
 * “Ready after” simulates when homepage resources finish.
 */
export function IntroTestClient() {
  const [playId, setPlayId] = useState(0);
  const [readyAfterMs, setReadyAfterMs] = useState(7500);
  const [playing, setPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const replay = useCallback(() => {
    setPlaying(true);
    setPlayId((id) => id + 1);
  }, []);

  const markReadyNow = useCallback(() => {
    window.edxLoader?.complete();
  }, []);

  return (
    <main
      className="shell"
      style={{
        minHeight: "100vh",
        padding: "4rem 1.25rem 6rem",
        color: "#0a0a0a",
        background: "#f4f4f4",
      }}
    >
      {playing ? (
        <SiteIntroLoader
          key={playId}
          preview
          previewReadyAfterMs={readyAfterMs}
          onPreviewDone={() => setPlaying(false)}
        />
      ) : null}

      {playing && mounted
        ? createPortal(
            <div
              style={{
                position: "fixed",
                bottom: "max(1rem, env(safe-area-inset-bottom))",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2147483647,
                display: "flex",
                gap: "0.5rem",
                padding: "0.5rem",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                pointerEvents: "auto",
              }}
            >
              <button
                type="button"
                onClick={markReadyNow}
                style={{
                  border: "1px solid #fff",
                  background: "#fff",
                  color: "#0a0a0a",
                  padding: "0.55rem 0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                }}
              >
                Mark ready now
              </button>
            </div>,
            document.body,
          )
        : null}

      <p
        style={{
          fontFamily: "var(--font-label), monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#666",
          marginBottom: "0.75rem",
        }}
      >
        Dev · intro test
      </p>
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 300,
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          marginBottom: "0.75rem",
        }}
      >
        Home intro preview
      </h1>
      <p
        style={{
          maxWidth: "36rem",
          lineHeight: 1.55,
          marginBottom: "1.75rem",
          color: "#333",
        }}
      >
        Opens the fullscreen intro without touching{" "}
        <code>localStorage</code>. Stroke loops until “ready”, then fills and
        unveils. Use Replay — no hard refresh.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <button
          type="button"
          onClick={replay}
          style={{
            border: "1px solid #0a0a0a",
            background: "#0a0a0a",
            color: "#fff",
            padding: "0.65rem 1.1rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          Replay intro
        </button>
        <button
          type="button"
          onClick={markReadyNow}
          disabled={!playing}
          style={{
            border: "1px solid #0a0a0a",
            background: "transparent",
            color: "#0a0a0a",
            padding: "0.65rem 1.1rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontSize: "0.75rem",
            cursor: playing ? "pointer" : "not-allowed",
            opacity: playing ? 1 : 0.4,
          }}
        >
          Mark ready now
        </button>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          maxWidth: "20rem",
          fontSize: "0.875rem",
        }}
      >
        Auto-ready after (ms)
        <input
          type="number"
          min={2000}
          step={500}
          value={readyAfterMs}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) setReadyAfterMs(next);
          }}
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem 0.65rem",
            fontSize: "1rem",
          }}
        />
        <span style={{ color: "#666", fontSize: "0.8rem" }}>
          Stroke cycle is ~3s. Try 7500–12000 to watch multiple loops, then
          Replay.
        </span>
      </label>
    </main>
  );
}
