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

/**
 * Same-origin `/__assets/*` URL for canvas / fetch (CDN has no CORS).
 * Display can still use the public CDN `asset()` URL.
 */
export function sameOriginAsset(src: string): string {
  if (src.startsWith("/__assets/") || src.startsWith("/__assets?")) {
    return src;
  }
  if (src.startsWith(ASSETS_BASE)) {
    return `/__assets${src.slice(ASSETS_BASE.length)}`;
  }
  try {
    const u = new URL(src, "https://assets.iamedx.com");
    if (u.hostname === "assets.iamedx.com") {
      return `/__assets${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return src;
}
