"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

import { ProtectedVideo } from "@/components/ProtectedVideo";
import { isProcessCraftVideo } from "@/content/processCraftMedia";
import { cn } from "@/lib/utils";

type WorkflowMediaWallProps = {
  items: readonly string[];
  className?: string;
};

const COL_COUNT = 2;
/** Base seconds per tile so a typical clip can finish while on-screen. */
const SECONDS_PER_TILE = 6.5;
const MIN_DURATION_S = 32;

function splitColumns(items: readonly string[], cols: number) {
  const columns: string[][] = Array.from({ length: cols }, () => []);
  items.forEach((src, i) => {
    columns[i % cols]!.push(src);
  });
  return columns.map((col) => (col.length >= 2 ? col : [...col, ...items]));
}

function durationForColumn(tileCount: number, stagger: number) {
  return Math.max(MIN_DURATION_S, tileCount * SECONDS_PER_TILE + stagger);
}

/**
 * Projects-hero style media wall: tiles drift upward inside a clipped window.
 * Every source appears; videos restart when they enter view so each clip can
 * play through while scrolling.
 */
export function WorkflowMediaWall({
  items,
  className,
}: WorkflowMediaWallProps) {
  const reduceMotion = useReducedMotion();
  const columns = useMemo(() => splitColumns(items, COL_COUNT), [items]);
  const stageRef = useRef<HTMLDivElement>(null);

  /* Restart a clip when its tile enters the stage so it can play through. */
  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    const videos = [...stage.querySelectorAll("video")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            try {
              if (video.currentTime > 0.2) video.currentTime = 0;
            } catch {
              /* ignore */
            }
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { root: stage, threshold: [0, 0.35, 0.6] },
    );

    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [items, reduceMotion, columns]);

  if (!items.length) return null;

  return (
    <div
      className={cn("svc-workflow__media-roll", className)}
      aria-hidden="true"
    >
      <div ref={stageRef} className="svc-workflow__media-roll-stage">
        {columns.map((col, colIndex) => {
          const duration = durationForColumn(col.length, colIndex * 4);
          const trackStyle = {
            ["--svc-roll-duration" as string]: `${duration}s`,
            animationPlayState: reduceMotion ? "paused" : "running",
          } as CSSProperties;

          const loop = [...col, ...col];

          return (
            <div
              key={`col-${colIndex}`}
              className={cn(
                "svc-workflow__media-roll-col",
                colIndex % 2 === 1 && "is-offset",
              )}
            >
              <div
                className={cn(
                  "svc-workflow__media-roll-track",
                  reduceMotion && "is-static",
                )}
                style={trackStyle}
              >
                {loop.map((src, i) => {
                  const video = isProcessCraftVideo(src);
                  return (
                    <div
                      key={`${src}-${i}`}
                      className="svc-workflow__media-roll-tile"
                    >
                      {video ? (
                        <ProtectedVideo
                          src={reduceMotion ? undefined : src}
                          className="svc-workflow__media-roll-media"
                          preload="auto"
                          loop
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt=""
                          className="svc-workflow__media-roll-media"
                          draggable={false}
                          decoding="async"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
