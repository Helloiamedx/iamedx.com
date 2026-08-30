/** Cloudflare R2 public CDN for static media */
export const ASSETS_BASE = "https://assets.iamedx.com";

/**
 * Optional same-origin proxy (`/__assets/*` → R2) for LAN phone preview when
 * the phone cannot reach the CDN. Opt in with NEXT_PUBLIC_DEV_ASSET_PROXY=1.
 *
 * Default is off: the browser loads CDN URLs directly. That avoids broken
 * images when the Next process cannot resolve assets.iamedx.com (common when
 * `next dev` runs inside a restricted agent/sandbox shell).
 */
function useDevAssetProxy() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_ASSET_PROXY === "1"
  );
}

/** Build an assets URL. Pass a path like `/brand/logo.svg` or `videos/large.mp4`. */
export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (useDevAssetProxy()) {
    return `/__assets${normalized}`;
  }
  return `${ASSETS_BASE}${normalized}`;
}
