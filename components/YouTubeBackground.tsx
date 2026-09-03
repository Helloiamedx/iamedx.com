"use client";

import { useEffect, useId, useRef, useState } from "react";
import { VideoLoadingCover } from "@/components/VideoLoadingCover";

type YouTubeBackgroundProps = {
  videoId: string;
  /** Seek / restart point in seconds (e.g. 79 = 1:19) */
  startSeconds?: number;
  /** Stop / loop-back point in seconds (e.g. 401 = 6:41) */
  endSeconds?: number;
  className?: string;
  title?: string;
};

type YtPlayer = {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
};

type YtNamespace = {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YtPlayer }) => void;
        onStateChange?: (event: { data: number; target: YtPlayer }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
};

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YtNamespace> | null = null;

/** Stay in PLAYING past start for this long before lifting the veil */
const REVEAL_HOLD_MS = 550;

function loadYouTubeApi(): Promise<YtNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires window"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const finish = () => {
      if (window.YT?.Player) resolve(window.YT);
    };
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      finish();
    };
    if (window.YT?.Player) {
      finish();
      return;
    }
    if (
      !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

/**
 * Full-bleed muted YouTube background.
 * Plays `[startSeconds, endSeconds]` (or to natural end), then restarts at start.
 * Keeps a solid veil until PLAYING is stable past start — no title / big-play flash.
 */
export function YouTubeBackground({
  videoId,
  startSeconds = 0,
  endSeconds,
  className = "",
  title = "",
}: YouTubeBackgroundProps) {
  const reactId = useId().replace(/:/g, "");
  const hostId = `yt-bg-${reactId}`;
  const playerRef = useRef<YtPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let revealedBuffer = false;
    let watchId = 0;
    let playingSince: number | null = null;
    setReady(false);
    setProgress(0);
    setRevealed(false);

    const restart = (target: YtPlayer) => {
      playingSince = null;
      target.mute();
      target.seekTo(startSeconds, true);
      target.playVideo();
    };

    const inStartWindow = (t: number) => t >= Math.max(0, startSeconds - 0.25);

    /* Soft crawl toward ~90% while waiting for stable PLAYING */
    const crawlId = window.setInterval(() => {
      if (cancelled || revealedBuffer) return;
      setProgress((p) => (p >= 90 ? p : Math.min(90, p + 3 + Math.random() * 4)));
    }, 180);

    void loadYouTubeApi().then((YT) => {
      if (cancelled) return;

      const playerVars: Record<string, string | number> = {
        autoplay: 1,
        mute: 1,
        controls: 0,
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
        cc_load_policy: 0,
        start: startSeconds,
      };
      if (endSeconds != null && endSeconds > startSeconds) {
        playerVars.end = endSeconds;
      }

      const tryReveal = (target: YtPlayer) => {
        if (cancelled || revealedBuffer) return;
        try {
          const state = target.getPlayerState();
          const t = target.getCurrentTime();
          if (state === YT.PlayerState.PLAYING && inStartWindow(t)) {
            const now = performance.now();
            if (playingSince == null) playingSince = now;
            if (now - playingSince >= REVEAL_HOLD_MS) {
              revealedBuffer = true;
              setProgress(100);
              setReady(true);
            }
          } else {
            playingSince = null;
          }
        } catch {
          playingSince = null;
        }
      };

      const player = new YT.Player(hostId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars,
        events: {
          onReady: (event) => {
            event.target.mute();
            if (startSeconds > 0) {
              event.target.seekTo(startSeconds, true);
            }
            event.target.playVideo();
            setProgress((p) => Math.max(p, 35));

            watchId = window.setInterval(() => {
              try {
                tryReveal(event.target);
                if (
                  endSeconds != null &&
                  endSeconds > startSeconds &&
                  event.target.getCurrentTime() >= endSeconds - 0.15
                ) {
                  restart(event.target);
                }
              } catch {
                /* player may be mid-destroy */
              }
            }, 100);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              event.target.mute();
              setProgress((p) => Math.max(p, 75));
              tryReveal(event.target);
            } else if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.BUFFERING ||
              event.data === YT.PlayerState.CUED
            ) {
              playingSince = null;
              /* Keep pushing play so the big play button never sticks */
              if (!revealedBuffer) {
                event.target.mute();
                event.target.playVideo();
              }
            } else if (event.data === YT.PlayerState.ENDED) {
              restart(event.target);
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      window.clearInterval(crawlId);
      if (watchId) window.clearInterval(watchId);
      try {
        playerRef.current?.destroy();
      } catch {
        /* player may already be gone */
      }
      playerRef.current = null;
    };
  }, [hostId, videoId, startSeconds, endSeconds]);

  return (
    <div
      className={`youtube-background${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden={title ? undefined : true}
    >
      <div id={hostId} className="youtube-background__host" title={title} />
      {/* Opaque until cover settles — blocks YouTube title + big play */}
      <VideoLoadingCover
        progress={progress}
        ready={ready}
        onDone={() => setRevealed(true)}
      />
    </div>
  );
}
