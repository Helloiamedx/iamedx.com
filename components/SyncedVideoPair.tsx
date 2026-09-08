"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { useVideoLoadProgress } from "@/lib/videoPlayback";
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
 * Site-bg plates until playing — no site-mark load covers.
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
    if (!allowed) setRightArmed(false);
  }, [allowed]);

  const leftKey = allowed ? leftSrc : "";
  const rightKey = allowed && rightArmed ? rightSrc : "";

  const { ready: leftReady, failed: leftFailed } = useVideoLoadProgress(
    leftRef,
    leftKey,
  );
  const { ready: rightReady, failed: rightFailed } = useVideoLoadProgress(
    rightRef,
    rightKey,
  );

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

  useEffect(() => {
    if (!allowed || pairSettled) return;

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    let lastProgressAt = performance.now();
    let lastReady =
      (leftEl?.readyState ?? 0) + (rightEl?.readyState ?? 0);

    const markProgress = () => {
      lastProgressAt = performance.now();
    };
    const onReadyBump = () => {
      const next =
        (leftRef.current?.readyState ?? 0) +
        (rightRef.current?.readyState ?? 0);
      if (next > lastReady) {
        lastReady = next;
        markProgress();
      }
    };

    const events = [
      "progress",
      "loadeddata",
      "loadedmetadata",
      "canplay",
    ] as const;
    for (const event of events) {
      leftEl?.addEventListener(event, markProgress);
      rightEl?.addEventListener(event, markProgress);
      leftEl?.addEventListener(event, onReadyBump);
      rightEl?.addEventListener(event, onReadyBump);
    }

    const stallId = window.setInterval(() => {
      onReadyBump();
      if (performance.now() - lastProgressAt < 45000) return;
      setPairSettled(true);
      try {
        leftEl?.pause();
        rightEl?.pause();
        leftEl?.removeAttribute("src");
        rightEl?.removeAttribute("src");
        leftEl?.load();
        rightEl?.load();
      } catch {
        /* ignore */
      }
      releaseSlot();
    }, 2000);

    return () => {
      window.clearInterval(stallId);
      for (const event of events) {
        leftEl?.removeEventListener(event, markProgress);
        rightEl?.removeEventListener(event, markProgress);
        leftEl?.removeEventListener(event, onReadyBump);
        rightEl?.removeEventListener(event, onReadyBump);
      }
    };
  }, [allowed, pairSettled, releaseSlot]);

  useLayoutEffect(() => {
    setPairSettled(false);
  }, [leftSrc, rightSrc]);

  /* Play as soon as both sides can */
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

  const ready = bothReady || pairSettled;

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
        ready={ready}
        allowed={allowed}
        onError={switchLeftFallback}
      />
      <Side
        videoRef={rightRef}
        src={rightSrc}
        alt={right.alt}
        ratio={ratio}
        nativeAspect={nativeAspect}
        ready={ready}
        allowed={allowed && rightArmed}
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
  ready,
  allowed,
  onError,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  alt: string;
  ratio: string;
  nativeAspect: boolean;
  ready: boolean;
  allowed: boolean;
  onError: () => void;
}) {
  return (
    <div
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${ready ? " is-ready" : ""}`}
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
    </div>
  );
}
