"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";

type PairSide = {
  primary: string;
  fallback?: string;
  alt: string;
};

type SyncedVideoPairProps = {
  left: PairSide;
  right: PairSide;
  /** CSS padding-bottom ratio per cell — omit when `nativeAspect` */
  ratio?: string;
  /** Size each side to the file’s intrinsic aspect (no forced box) */
  nativeAspect?: boolean;
};

const DRIFT_SEC = 0.08;

/**
 * Two gallery clips that wait until both are playable, then start together
 * and stay loop-synced (for paired left/right product videos).
 */
export function SyncedVideoPair({
  left,
  right,
  ratio = "100%",
  nativeAspect = false,
}: SyncedVideoPairProps) {
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);
  const { progress: leftProgress, ready: leftReady } = useVideoLoadProgress(
    leftRef,
    left.primary,
  );
  const { progress: rightProgress, ready: rightReady } = useVideoLoadProgress(
    rightRef,
    right.primary,
  );

  const bothReady = leftReady && rightReady;
  const pairProgress = Math.min(leftProgress, rightProgress);

  useEffect(() => {
    if (!bothReady) return;

    const a = leftRef.current;
    const b = rightRef.current;
    if (!a || !b) return;

    const startTogether = () => {
      try {
        a.currentTime = 0;
        b.currentTime = 0;
      } catch {
        /* seek can throw before metadata settles */
      }
      void Promise.all([a.play(), b.play()]).catch(() => {
        /* muted autoplay usually ok */
      });
    };

    startTogether();

    const onEnded = () => {
      startTogether();
    };

    const onTimeUpdate = () => {
      if (Math.abs(a.currentTime - b.currentTime) > DRIFT_SEC) {
        try {
          b.currentTime = a.currentTime;
        } catch {
          /* ignore seek race */
        }
      }
    };

    a.addEventListener("ended", onEnded);
    b.addEventListener("ended", onEnded);
    a.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [bothReady, left.primary, right.primary]);

  return (
    <div className="project-case-demo__pair project-case-demo__pair--video project-case-demo__pair--synced">
      <Side
        videoRef={leftRef}
        src={left.primary}
        alt={left.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        progress={pairProgress}
        ready={bothReady}
      />
      <Side
        videoRef={rightRef}
        src={right.primary}
        alt={right.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        progress={pairProgress}
        ready={bothReady}
      />
    </div>
  );
}

function Side({
  videoRef,
  src,
  alt,
  ratio,
  nativeAspect,
  progress,
  ready,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  alt: string;
  ratio: string;
  nativeAspect: boolean;
  progress: number;
  ready: boolean;
}) {
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | undefined>();

  const syncIntrinsic = () => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
  };

  return (
    <div
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${ready ? " is-ready" : ""}`}
      style={
        nativeAspect
          ? intrinsicRatio
            ? { aspectRatio: intrinsicRatio }
            : undefined
          : { paddingBottom: ratio }
      }
    >
      <ProtectedVideo
        ref={videoRef}
        className="project-fallback-video__media"
        src={src}
        preload="auto"
        autoPlay={false}
        loop={false}
        aria-label={alt}
        onLoadedMetadata={nativeAspect ? syncIntrinsic : undefined}
      />
      <VideoLoadingCover progress={progress} ready={ready} />
    </div>
  );
}
