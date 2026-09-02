/** Cloudflare R2 public CDN for static media */
export const ASSETS_BASE = "https://assets.iamedx.com";

/**
 * Same-origin proxy (`/__assets/*` → R2) so LAN phone preview only talks to
 * this Mac (Next rewrite fetches the CDN). On by default in development —
 * set `NEXT_PUBLIC_DEV_ASSET_PROXY=0` to force direct CDN URLs (e.g. when
 * the Next process itself cannot resolve assets.iamedx.com).
 */
function useDevAssetProxy() {
  if (process.env.NODE_ENV !== "development") return false;
  return process.env.NEXT_PUBLIC_DEV_ASSET_PROXY !== "0";
}

/** Build an assets URL. Pass a path like `/brand/logo.svg` or `videos/large.mp4`. */
export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (useDevAssetProxy()) {
    return `/__assets${normalized}`;
  }
  return `${ASSETS_BASE}${normalized}`;
}

/** Public CDN URL only — never the dev `__assets` proxy. */
export function cdnAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${ASSETS_BASE}${normalized}`;
}
