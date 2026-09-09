/**
 * One-shot bake of the Recognition cutout “sticker” outline.
 * Matches the old SVG filter look (dilate + white edge + soft drop shadow)
 * so hover / arrive can animate with transform only — no live feMorphology.
 */

import { sameOriginAsset } from "@/lib/assets";

/** SVG user-space values from the previous sticker filter (post 126.5% visual compensate). */
export const STICKER_OUTLINE_RADIUS = 3.2;
export const STICKER_SHADOW_DY = 2;
export const STICKER_SHADOW_BLUR = 1.6;
export const STICKER_SHADOW_OPACITY = 0.18;

/** Extra SVG units around the layout box so outline + shadow aren’t clipped. */
export const STICKER_PAD =
  Math.ceil(
    STICKER_OUTLINE_RADIUS + STICKER_SHADOW_DY + STICKER_SHADOW_BLUR * 3,
  ) + 1;

const bakeCache = new Map<string, Promise<string>>();

function cacheKey(src: string, layoutW: number, layoutH: number, dpr: number) {
  return `${src}|${layoutW}x${layoutH}|${dpr}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    // Same-origin proxy — CDN does not send ACAO; needed for canvas bake
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sticker load failed: ${src}`));
    img.src = sameOriginAsset(src);
  });
}

/** White silhouette of opaque pixels (same bitmap size as `img`). */
function whiteSilhouette(
  img: CanvasImageSource,
  w: number,
  h: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  return c;
}

/**
 * Approximate morphological dilate by stamping the silhouette on a ring.
 * Radius is in canvas pixels.
 */
function dilateWhite(
  silhouette: HTMLCanvasElement,
  radiusPx: number,
): HTMLCanvasElement {
  const pad = Math.ceil(radiusPx) + 1;
  const w = silhouette.width + pad * 2;
  const h = silhouette.height + pad * 2;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d unavailable");

  const steps = Math.max(12, Math.ceil(radiusPx * Math.PI * 2));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const ox = pad + Math.cos(a) * radiusPx;
    const oy = pad + Math.sin(a) * radiusPx;
    ctx.drawImage(silhouette, ox, oy);
  }
  // Fill interior (and odd gaps between stamps)
  ctx.drawImage(silhouette, pad, pad);
  return c;
}

async function bakeOnce(
  src: string,
  layoutW: number,
  layoutH: number,
  dpr: number,
): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.max(2, Math.min(3, dpr));
  const contentW = Math.max(1, Math.round(layoutW * scale));
  const contentH = Math.max(1, Math.round(layoutH * scale));
  const padPx = Math.ceil(STICKER_PAD * scale);
  const radiusPx = STICKER_OUTLINE_RADIUS * scale;

  const sil = whiteSilhouette(img, contentW, contentH);
  const outline = dilateWhite(sil, radiusPx);

  const canvas = document.createElement("canvas");
  canvas.width = contentW + padPx * 2;
  canvas.height = contentH + padPx * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d unavailable");

  // Outline is already padded by dilate; align to outer pad box
  const outlineX = padPx - Math.ceil(radiusPx) - 1;
  const outlineY = padPx - Math.ceil(radiusPx) - 1;

  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${STICKER_SHADOW_OPACITY})`;
  ctx.shadowBlur = STICKER_SHADOW_BLUR * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = STICKER_SHADOW_DY * scale;
  ctx.drawImage(outline, outlineX, outlineY);
  ctx.restore();

  ctx.drawImage(img, padPx, padPx, contentW, contentH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
  return URL.createObjectURL(blob);
}

/**
 * Returns a blob: URL of the baked sticker (outline + product).
 * Cached per src / layout size for the session.
 */
export function bakeRecognitionSticker(
  src: string,
  layoutW: number,
  layoutH: number,
): Promise<string> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("bake is client-only"));
  }
  const dpr =
    typeof window.devicePixelRatio === "number" && window.devicePixelRatio > 0
      ? window.devicePixelRatio
      : 2;
  const key = cacheKey(src, layoutW, layoutH, dpr);
  let pending = bakeCache.get(key);
  if (!pending) {
    pending = bakeOnce(src, layoutW, layoutH, dpr).catch((err) => {
      bakeCache.delete(key);
      throw err;
    });
    bakeCache.set(key, pending);
  }
  return pending;
}
