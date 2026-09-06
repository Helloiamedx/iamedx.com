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
import {
  VIDEO_LOAD_PRIORITY,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";

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
 * Two gallery clips that share one load-queue turn, then start together
 * and stay loop-synced.
 */
export function SyncedVideoPair({
  left,
  right,
  ratio = "100%",
  nativeAspect = false,
}: SyncedVideoPairProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);
  const pairId = `${left.primary}||${right.primary}`;
  const { allowed, releaseSlot } = useVideoLoadSlot(
    pairId,
    true,
    VIDEO_LOAD_PRIORITY.syncedPair,
    rootRef,
  );

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

  const leftKey = allowed ? leftSrc : "";
  const rightKey = allowed ? rightSrc : "";

  const { progress: leftProgress, ready: leftReady } = useVideoLoadProgress(
    leftRef,
    leftKey,
  );
  const { progress: rightProgress, ready: rightReady } = useVideoLoadProgress(
    rightRef,
    rightKey,
  );

  useEffect(() => {
    if (!allowed) return;
    if (
      !left.fallback ||
      leftUsedFallback ||
      leftReady ||
      leftSrc === left.fallback
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      setLeftUsedFallback(true);
      setLeftSrc(left.fallback!);
    }, PRIMARY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [allowed, left.fallback, leftUsedFallback, leftReady, leftSrc]);

  useEffect(() => {
    if (!allowed) return;
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
  }, [allowed, right.fallback, rightUsedFallback, rightReady, rightSrc]);

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

  const bothReady = Boolean(allowed && leftReady && rightReady);
  const pairProgress = allowed ? Math.min(leftProgress, rightProgress) : 0;
  const [revealed, setRevealed] = useState(false);
  const [nearView, setNearView] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNearView(true);
      },
      { rootMargin: "160px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    setRevealed(false);
  }, [leftSrc, rightSrc]);

  /* Free queue when pair is playable — rest of page can keep buffering */
  useEffect(() => {
    if (bothReady) releaseSlot();
  }, [bothReady, releaseSlot]);

  /* Off-screen: unveil as soon as playable (playback already started below) */
  useEffect(() => {
    if (!bothReady || revealed || nearView) return;
    setRevealed(true);
  }, [bothReady, revealed, nearView]);

  useEffect(() => {
    if (!bothReady) return;

    const a = leftRef.current;
    const b = rightRef.current;
    if (!a || !b) return;

    const seekToStart = (v: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        if (v.currentTime <= 0.08) {
          resolve();
          return;
        }
        const done = () => {
          v.removeEventListener("seeked", done);
          window.clearTimeout(safety);
          resolve();
        };
        const safety = window.setTimeout(done, 500);
        v.addEventListener("seeked", done);
        try {
          v.currentTime = 0;
        } catch {
          done();
        }
      });

    let cancelled = false;

    const startTogether = () => {
      void (async () => {
        await Promise.all([seekToStart(a), seekToStart(b)]);
        if (cancelled) return;
        void Promise.all([a.play(), b.play()]).catch(() => {});
      })();
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
      cancelled = true;
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [bothReady, leftSrc, rightSrc]);

  const handleCoverDone = () => {
    releaseSlot();
    setRevealed(true);
  };

  return (
    <div
      ref={rootRef}
      className="project-case-demo__pair project-case-demo__pair--video project-case-demo__pair--synced"
    >
      <Side
        videoRef={leftRef}
        src={leftSrc}
        alt={left.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        progress={pairProgress}
        ready={bothReady}
        revealed={revealed}
        allowed={allowed}
        showLoader={Boolean(allowed && nearView && !revealed)}
        onCoverDone={handleCoverDone}
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
        allowed={allowed}
        showLoader={false}
        onCoverDone={handleCoverDone}
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
  allowed,
  showLoader,
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
  allowed: boolean;
  /** Mark loader only on the lead cell while on-screen */
  showLoader: boolean;
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
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}`}
      style={
        nativeAspect
          ? intrinsicRatio
            ? { aspectRatio: intrinsicRatio }
            : undefined
          : { paddingBottom: ratio }
      }
    >
      {allowed ? (
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
      ) : null}
      {showLoader ? (
        <VideoLoadingCover
          active
          progress={progress}
          ready={ready}
          cacheKey={src}
          onDone={onCoverDone}
        />
      ) : null}
    </div>
  );
}
