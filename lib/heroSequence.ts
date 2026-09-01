/**
 * Home hero playback sequence (documentElement data attrs):
 * 1. data-chrome-ready — header logo/menu painted (Header)
 * 2. data-hero-video-ready — video can play + revealed (HeroBackgroundVideo)
 * 3. data-hero-copy-ready — headline may appear (short delay after video in)
 *    → HeroHeadline then reveals CTAs after another short beat
 */

export const HERO_CHROME_ATTR = "chromeReady";
export const HERO_VIDEO_ATTR = "heroVideoReady";
export const HERO_COPY_ATTR = "heroCopyReady";

export function getHeroRoot(): HTMLElement {
  return document.documentElement;
}

export function isHeroFlag(attr: string): boolean {
  return getHeroRoot().dataset[attr] === "1";
}

export function setHeroFlag(attr: string) {
  getHeroRoot().dataset[attr] = "1";
}

type WhenHeroFlagOptions = {
  /** Fail-open after this many ms; `0` = wait until the flag is set */
  timeoutMs?: number;
  signal?: AbortSignal;
};

/** Resolve when `data-*` becomes "1" (or immediately if already set). */
export function whenHeroFlag(
  attr: string,
  options: number | WhenHeroFlagOptions = 2500,
): Promise<void> {
  const opts: WhenHeroFlagOptions =
    typeof options === "number" ? { timeoutMs: options } : options;
  const timeoutMs = opts.timeoutMs ?? 2500;
  const signal = opts.signal;

  if (typeof document === "undefined") return Promise.resolve();
  if (isHeroFlag(attr)) return Promise.resolve();
  if (signal?.aborted) return Promise.resolve();

  return new Promise((resolve) => {
    const root = getHeroRoot();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      obs.disconnect();
      window.clearInterval(poll);
      if (safety) window.clearTimeout(safety);
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };

    const onAbort = () => {
      if (settled) return;
      settled = true;
      obs.disconnect();
      window.clearInterval(poll);
      if (safety) window.clearTimeout(safety);
      resolve();
    };

    const obs = new MutationObserver(() => {
      if (isHeroFlag(attr)) finish();
    });
    obs.observe(root, {
      attributes: true,
      attributeFilter: [`data-${camelToKebab(attr)}`],
    });

    /* Poll — MutationObserver attributeFilter can miss dataset writes */
    const poll = window.setInterval(() => {
      if (isHeroFlag(attr)) finish();
    }, 50);
    const safety =
      timeoutMs > 0 ? window.setTimeout(finish, timeoutMs) : 0;

    signal?.addEventListener("abort", onAbort);
  });
}

function camelToKebab(attr: string) {
  return attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
