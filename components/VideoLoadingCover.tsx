type VideoLoadingCoverProps = {
  ready: boolean;
  /** Accessible busy label while waiting */
  label?: string;
};

/**
 * Dark cover + spinner until the video (or embed) can show a real frame.
 * Signals “this is video” — never a still poster extracted from the clip.
 */
export function VideoLoadingCover({
  ready,
  label = "Loading video",
}: VideoLoadingCoverProps) {
  return (
    <div
      className={`video-loading-cover${ready ? " is-ready" : ""}`}
      aria-hidden={ready}
      aria-busy={!ready}
    >
      <span className="video-loading-cover__spinner" aria-hidden="true" />
      <span className="video-loading-cover__label">{label}</span>
    </div>
  );
}
