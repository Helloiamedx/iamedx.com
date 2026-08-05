/** Cloudflare R2 public CDN for static media */
export const ASSETS_BASE = "https://assets.iamedx.com";

/** Build an absolute assets URL. Pass a path like `/brand/logo.svg` or `videos/large.mp4`. */
export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${ASSETS_BASE}${normalized}`;
}
