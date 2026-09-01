"use client";

type HeroVideoLoadingMarkProps = {
  /** 0–100 buffer / load progress */
  progress: number;
  /** True when video has revealed — cover fades out */
  ready: boolean;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/** Site mark paths only — no favicon plate (avoids CDN / broken-img). */
function SiteMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 500"
      width={160}
      height={160}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M392.17,317.83c-25.35,53.04-79.49,89.67-142.17,89.67s-116.83-36.62-142.17-89.67l42.36-19.76c17.88,37.11,55.86,62.7,99.81,62.7s81.94-25.59,99.81-62.7l42.36,19.76Z"
      />
      <path
        fill="currentColor"
        d="M404.9,221.42c-13.43-73.34-77.67-128.92-154.9-128.92s-141.47,55.58-154.9,128.92c-1.72,9.27-2.6,18.83-2.6,28.58,0,6.19.36,12.31,1.06,18.3h312.88c.7-6,1.06-12.11,1.06-18.3,0-9.76-.88-19.32-2.6-28.58ZM142.95,221.42c1.55-5.87,3.6-11.54,6.05-16.98,17.37-38.45,56.07-65.22,101.01-65.22s83.64,26.77,101.01,65.22c2.45,5.44,4.49,11.11,6.05,16.98h-214.11Z"
      />
    </svg>
  );
}

/**
 * Home hero load UI — site mark fills bottom → top with buffer progress.
 * Inline SVG so load UI never depends on CDN / network for the icon.
 */
export function HeroVideoLoadingMark({
  progress,
  ready,
}: HeroVideoLoadingMarkProps) {
  const pct = ready ? 100 : clampProgress(progress);

  return (
    <div
      className={`hero-video-load${ready ? " is-ready" : ""}`}
      aria-hidden={ready}
      aria-busy={!ready}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="Loading video"
      style={{ ["--load-p" as string]: pct }}
    >
      <div className="hero-video-load__mark">
        <SiteMark className="hero-video-load__base" />
        <div className="hero-video-load__reveal" aria-hidden="true">
          <SiteMark />
        </div>
      </div>
    </div>
  );
}
