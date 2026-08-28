/** Cloudflare R2 public CDN for static media */
export const ASSETS_BASE = "https://assets.iamedx.com";

/**
 * In development, serve media via same-origin `/__assets/*` (Next rewrite → R2)
 * so phone LAN preview does not need to reach the CDN directly.
 * Production keeps the absolute CDN URL.
 */
function useDevAssetProxy() {
  return process.env.NODE_ENV === "development";
}

/** Build an assets URL. Pass a path like `/brand/logo.svg` or `videos/large.mp4`. */
export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (useDevAssetProxy()) {
    return `/__assets${normalized}`;
  }
  return `${ASSETS_BASE}${normalized}`;
}
