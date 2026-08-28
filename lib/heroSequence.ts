/**
 * Home hero playback sequence (documentElement data attrs):
 * 1. data-hero-copy-ready — headline/CTAs (immediate; do not wait for video)
 * 2. data-chrome-ready — header logo/menu painted (Header)
 * 3. data-hero-video-ready — video can play + revealed (HeroBackgroundVideo)
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

/** Resolve when `data-*` becomes "1" (or immediately if already set). */
export function whenHeroFlag(attr: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (isHeroFlag(attr)) return Promise.resolve();

  return new Promise((resolve) => {
    const root = getHeroRoot();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      obs.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(safety);
      resolve();
    };

    const obs = new MutationObserver(() => {
      if (isHeroFlag(attr)) finish();
    });
    obs.observe(root, {
      attributes: true,
      attributeFilter: [`data-${camelToKebab(attr)}`],
    });

    /* Poll + safety — MutationObserver attributeFilter can miss dataset writes */
    const poll = window.setInterval(() => {
      if (isHeroFlag(attr)) finish();
    }, 50);
    const safety = window.setTimeout(finish, 2500);
  });
}

function camelToKebab(attr: string) {
  return attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
