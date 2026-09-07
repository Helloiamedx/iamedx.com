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
  softenVideoDownload,
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
  /** CSS padding-bottom ratio per cell — always reserves height */
  ratio?: string;
  /** Contain inside the reserved box instead of cover-crop */
  nativeAspect?: boolean;
};

const DRIFT_SEC = 0.08;
const PRIMARY_TIMEOUT_MS = 2500;

/**
 * Two gallery clips that share one load-queue turn.
 * Left attaches first; right waits until left is playable.
 * Once both can play, start together in the background (no scroll wait).
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
  const [rightArmed, setRightArmed] = useState(false);

  useEffect(() => {
    setLeftSrc(left.primary);
    setLeftUsedFallback(false);
  }, [left.primary, left.fallback]);

  useEffect(() => {
    setRightSrc(right.primary);
    setRightUsedFallback(false);
  }, [right.primary, right.fallback]);

  useEffect(() => {
    if (!allowed) {
      setRightArmed(false);
      return;
    }
  }, [allowed]);

  const leftKey = allowed ? leftSrc : "";
  const rightKey = allowed && rightArmed ? rightSrc : "";

  const {
    progress: leftProgress,
    ready: leftReady,
    failed: leftFailed,
  } = useVideoLoadProgress(leftRef, leftKey);
  const {
    progress: rightProgress,
    ready: rightReady,
    failed: rightFailed,
  } = useVideoLoadProgress(rightRef, rightKey);

  /* Serial within the pair — right after left can play; don't deadlock if left stalls */
  useEffect(() => {
    if (!allowed || rightArmed) return;
    if (leftReady || leftFailed) {
      setRightArmed(true);
      return;
    }
    const id = window.setTimeout(() => setRightArmed(true), 10000);
    return () => window.clearTimeout(id);
  }, [allowed, leftReady, leftFailed, rightArmed]);

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
    if (!allowed || !rightArmed) return;
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
  }, [
    allowed,
    rightArmed,
    right.fallback,
    rightUsedFallback,
    rightReady,
    rightSrc,
  ]);

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

  const bothReady = Boolean(
    allowed && (leftReady || leftFailed) && (rightReady || rightFailed),
  );
  const [pairSettled, setPairSettled] = useState(false);
  const pairProgress = allowed ? Math.min(leftProgress, rightProgress) : 0;
  const [revealed, setRevealed] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    if (!allowed || pairSettled) return;
    const id = window.setTimeout(() => {
      setPairSettled(true);
      setRevealed(true);
      releaseSlot();
    }, 15000);
    return () => window.clearTimeout(id);
  }, [allowed, pairSettled, releaseSlot]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "120px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    setRevealed(false);
    setPairSettled(false);
  }, [leftSrc, rightSrc]);

  /* Off-screen: unveil when settled so the mark isn’t required to free state */
  useEffect(() => {
    if (!pairSettled || revealed || onScreen) return;
    setRevealed(true);
  }, [pairSettled, revealed, onScreen]);

  /* Play as soon as both sides can — no scroll / cover-animation gate */
  useEffect(() => {
    if (!bothReady) return;

    const a = leftRef.current;
    const b = rightRef.current;
    if (!a || !b) return;

    let cancelled = false;
    let released = false;
    let attempts = 0;
    let retryId = 0;
    const free = () => {
      if (cancelled || released) return;
      released = true;
      softenVideoDownload(a);
      softenVideoDownload(b);
      setPairSettled(true);
      releaseSlot();
    };

    const maybeFree = () => {
      if (!a.paused && !b.paused) free();
    };

    a.addEventListener("playing", maybeFree);
    b.addEventListener("playing", maybeFree);
    a.addEventListener("error", free);
    b.addEventListener("error", free);

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

    const startTogether = () => {
      void (async () => {
        await Promise.all([seekToStart(a), seekToStart(b)]);
        if (cancelled) return;
        attempts += 1;
        void Promise.all([a.play(), b.play()]).then(maybeFree, () => {
          if (cancelled || released) return;
          if (attempts < 6) {
            retryId = window.setTimeout(startTogether, 120 * attempts);
          } else {
            free();
          }
        });
      })();
    };

    const resumeBackgroundPair = () => {
      if (cancelled || document.hidden || a.ended || b.ended) return;
      window.clearTimeout(retryId);
      retryId = window.setTimeout(startTogether, 80);
    };

    const startupTimeout = window.setTimeout(free, 12000);
    if (a.error || b.error) free();
    else startTogether();

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
    a.addEventListener("pause", resumeBackgroundPair);
    b.addEventListener("pause", resumeBackgroundPair);
    a.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      cancelled = true;
      window.clearTimeout(startupTimeout);
      window.clearTimeout(retryId);
      a.removeEventListener("playing", maybeFree);
      b.removeEventListener("playing", maybeFree);
      a.removeEventListener("error", free);
      b.removeEventListener("error", free);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      a.removeEventListener("pause", resumeBackgroundPair);
      b.removeEventListener("pause", resumeBackgroundPair);
      a.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [bothReady, leftSrc, rightSrc, releaseSlot]);

  const handleCoverDone = () => {
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
        ready={bothReady || pairSettled}
        revealed={revealed}
        allowed={allowed}
        showLoader={Boolean(allowed && onScreen && !revealed)}
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
        ready={bothReady || pairSettled}
        revealed={revealed}
        allowed={allowed && rightArmed}
        showLoader={Boolean(allowed && onScreen && !revealed)}
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
  /** Mark loader while the pair is on-screen and not yet unveiled */
  showLoader: boolean;
  onCoverDone: () => void;
  onError: () => void;
}) {
  return (
    <div
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}`}
      style={{ paddingBottom: ratio }}
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
