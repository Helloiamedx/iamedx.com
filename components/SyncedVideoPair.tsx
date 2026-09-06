"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { wasVideoLoaded } from "@/lib/videoLoadMemory";

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
const PRIMARY_TIMEOUT_MS = 2500;

/**
 * Two gallery clips that wait until both are playable, then start together
 * and stay loop-synced. Primary → fallback matches ProjectFallbackVideo.
 */
export function SyncedVideoPair({
  left,
  right,
  ratio = "100%",
  nativeAspect = false,
}: SyncedVideoPairProps) {
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  const [leftSrc, setLeftSrc] = useState(left.primary);
  const [rightSrc, setRightSrc] = useState(right.primary);
  const [leftUsedFallback, setLeftUsedFallback] = useState(false);
  const [rightUsedFallback, setRightUsedFallback] = useState(false);

  useEffect(() => {
    setLeftSrc(left.primary);
    setLeftUsedFallback(false);
  }, [left.primary, left.fallback]);

  useEffect(() => {
    setRightSrc(right.primary);
    setRightUsedFallback(false);
  }, [right.primary, right.fallback]);

  const { progress: leftProgress, ready: leftReady } = useVideoLoadProgress(
    leftRef,
    leftSrc,
  );
  const { progress: rightProgress, ready: rightReady } = useVideoLoadProgress(
    rightRef,
    rightSrc,
  );

  useEffect(() => {
    if (!left.fallback || leftUsedFallback || leftReady || leftSrc === left.fallback) {
      return;
    }
    const id = window.setTimeout(() => {
      setLeftUsedFallback(true);
      setLeftSrc(left.fallback!);
    }, PRIMARY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [left.fallback, leftUsedFallback, leftReady, leftSrc]);

  useEffect(() => {
    if (
      !right.fallback ||
      rightUsedFallback ||
      rightReady ||
      rightSrc === right.fallback
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      setRightUsedFallback(true);
      setRightSrc(right.fallback!);
    }, PRIMARY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [right.fallback, rightUsedFallback, rightReady, rightSrc]);

  const switchLeftFallback = () => {
    if (!left.fallback || leftUsedFallback || leftSrc === left.fallback) return;
    setLeftUsedFallback(true);
    setLeftSrc(left.fallback);
  };

  const switchRightFallback = () => {
    if (!right.fallback || rightUsedFallback || rightSrc === right.fallback) {
      return;
    }
    setRightUsedFallback(true);
    setRightSrc(right.fallback);
  };

  const bothReady = leftReady && rightReady;
  const pairProgress = Math.min(leftProgress, rightProgress);
  const [revealed, setRevealed] = useState(false);
  const [instant, setInstant] = useState(false);

  useLayoutEffect(() => {
    if (wasVideoLoaded(leftSrc) && wasVideoLoaded(rightSrc)) {
      setInstant(true);
      setRevealed(false);
    } else {
      setInstant(false);
      setRevealed(false);
    }
  }, [leftSrc, rightSrc]);

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
  }, [bothReady, leftSrc, rightSrc]);

  return (
    <div className="project-case-demo__pair project-case-demo__pair--video project-case-demo__pair--synced">
      <Side
        videoRef={leftRef}
        src={leftSrc}
        alt={left.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        progress={pairProgress}
        ready={bothReady}
        revealed={revealed}
        instant={instant}
        onCoverDone={() => setRevealed(true)}
        onError={switchLeftFallback}
      />
      <Side
        videoRef={rightRef}
        src={rightSrc}
        alt={right.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        progress={pairProgress}
        ready={bothReady}
        revealed={revealed}
        instant={instant}
        onCoverDone={() => setRevealed(true)}
        onError={switchRightFallback}
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
  revealed,
  instant,
  onCoverDone,
  onError,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  alt: string;
  ratio: string;
  nativeAspect: boolean;
  progress: number;
  ready: boolean;
  revealed: boolean;
  instant: boolean;
  onCoverDone: () => void;
  onError: () => void;
}) {
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | undefined>();

  const syncIntrinsic = () => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
  };

  return (
    <div
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}${instant ? " is-instant" : ""}`}
      style={
        nativeAspect
          ? intrinsicRatio
            ? { aspectRatio: intrinsicRatio }
            : undefined
          : { paddingBottom: ratio }
      }
    >
      <ProtectedVideo
        key={src}
        ref={videoRef}
        className="project-fallback-video__media"
        src={src}
        preload="auto"
        autoPlay={false}
        loop={false}
        aria-label={alt}
        onError={onError}
        onLoadedMetadata={nativeAspect ? syncIntrinsic : undefined}
      />
      <VideoLoadingCover
        progress={progress}
        ready={ready}
        cacheKey={src}
        onDone={onCoverDone}
      />
    </div>
  );
}
