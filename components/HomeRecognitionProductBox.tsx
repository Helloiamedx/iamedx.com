"use client";

import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
} from "react";
import {
  getRecognitionProductBoxSet,
  type RecognitionProductBoxItem,
  type RecognitionProductBoxSetId,
} from "@/content/recognitionProductBox";
import {
  STICKER_PAD,
  bakeRecognitionSticker,
} from "@/lib/recognitionStickerBake";

type HomeRecognitionProductBoxProps = {
  /** Which pack to render — required so each card maps explicitly */
  setId: RecognitionProductBoxSetId;
  className?: string;
};

/**
 * Kraft open-box product stack for Recognition cards.
 * Cutout “sticker” outlines are baked once to a bitmap (Safari-friendly);
 * hover / arrive only animate parent transform + opacity.
 */
export function HomeRecognitionProductBox({
  setId,
  className,
}: HomeRecognitionProductBoxProps) {
  const rawId = useId().replace(/:/g, "");
  const set = getRecognitionProductBoxSet(setId);
  const openingId = `pb-opening-${rawId}`;
  const frontId = `pb-front-${rawId}`;
  const innerId = `pb-inner-${rawId}`;
  const sideId = `pb-side-${rawId}`;
  const shadowId = `pb-shadow-${rawId}`;
  const frontMaskId = `pb-front-mask-${rawId}`;

  /** Front-panel handle cutout — punch through so products show */
  const handleCutout =
    "M327 473h94a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6h-94a6 6 0 0 1-6-6v-4a6 6 0 0 1 6-6Z";

  return (
    <div
      className={`home-recognition-product-box${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <svg
        className="home-recognition-product-box__scene"
        viewBox="0 0 760 650"
        overflow="visible"
        role="presentation"
        focusable="false"
      >
        <defs>
          <clipPath id={openingId}>
            {/* Wide + tall headroom — larger desktop hover must not shear */}
            <path d="M-220 -520H980V438H598L571 580H191L157 438H-220Z" />
          </clipPath>
          <mask
            id={frontMaskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="760"
            height="650"
          >
            <rect width="760" height="650" fill="#fff" />
            <path d={handleCutout} fill="#000" />
          </mask>
          <linearGradient id={frontId} x1="0" y1="0" x2=".7" y2="1">
            <stop stopColor="#d2ae80" />
            <stop offset="1" stopColor="#b88d5b" />
          </linearGradient>
          <linearGradient id={innerId} x2="0" y2="1">
            <stop stopColor="#98744f" />
            <stop offset="1" stopColor="#5f442e" />
          </linearGradient>
          <linearGradient id={sideId} x2="1" y2=".6">
            <stop stopColor="#b78e5e" />
            <stop offset="1" stopColor="#987040" />
          </linearGradient>
          {/* Floor soft-shadow only — not applied to animated cutouts */}
          <filter id={shadowId}>
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <ellipse
          cx="380"
          cy="599"
          rx="237"
          ry="17"
          fill="#675442"
          opacity=".18"
          filter={`url(#${shadowId})`}
        />

        <g stroke="#fff" strokeWidth="7" strokeLinejoin="round">
          <path
            d="M161 420 208 372 552 372 605 420 576 573 190 573Z"
            fill={`url(#${innerId})`}
          />
          <path d="m161 420-51-51 70-39 28 42Z" fill="#c7a276" />
          <path d="m552 372 29-42 73 40-49 50Z" fill="#d6b78f" />
        </g>

        <g clipPath={`url(#${openingId})`}>
          {set.items.map((item) => (
            <ProductCutout key={item.id} item={item} />
          ))}
        </g>

        <g mask={`url(#${frontMaskId})`} strokeLinejoin="round">
          <path
            d="M157 440 598 440 571 586 191 586Z"
            fill={`url(#${frontId})`}
            stroke="white"
            strokeWidth="7"
          />
          <path
            d="M157 440 184 457 214 586 191 586Z"
            fill={`url(#${sideId})`}
          />
          <path
            d="M184 457 598 440 571 586 214 586Z"
            fill={`url(#${frontId})`}
          />
          <path d="M163 443 596 443" stroke="#e6c69d" strokeWidth="3" />
          <path
            d="m184 457 30 126"
            stroke="#9e7449"
            strokeOpacity=".45"
          />
        </g>
        {/* Handle rim — hollow cutout, products show through */}
        <path
          d={handleCutout}
          fill="none"
          stroke="#e5bf90"
          strokeWidth="2.5"
        />
        <path
          d={handleCutout}
          fill="none"
          stroke="#6a4a2e"
          strokeOpacity=".35"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function ProductCutout({ item }: { item: RecognitionProductBoxItem }) {
  /*
   * The item’s `scale` is folded into the *baked* geometry instead of being
   * applied as a transform on the bitmap.
   *
   * A transform scaled the baked white outline together with the product, so
   * the outline’s rendered width came out multiplied by the item’s own scale:
   * the pieces here span `0.72`–`1.79`, a 2.47× spread in outline weight
   * across one card. The outline is a fixed radius in user units, so it has to
   * be baked into the drawing rather than scaled in the rendering — baking at
   * the final size gives every product in the card the same outline.
   *
   * Nothing else changes, and `scale: 1` renders exactly as before: the scale
   * still grows about the item’s own centre, and the rotation origin is scaled
   * about that same centre (uniform scaling about C commutes with a rotation
   * about O once O moves to `C + s·(O − C)`).
   */
  const s = item.scale ?? 1;
  const centerX = item.x + item.width / 2;
  const centerY = item.y + item.height / 2;
  const aboutCenter = (value: number, c: number) => c + (value - c) * s;
  /* Final on-screen box, in the SVG’s 760×650 user space. */
  const boxW = Math.round(item.width * s);
  const boxH = Math.round(item.height * s);

  const bakedHref = useBakedStickerHref(item.src, boxW, boxH);

  const pad = STICKER_PAD;
  const href = bakedHref ?? item.src;
  const padded = Boolean(bakedHref);
  const x = centerX - boxW / 2 - (padded ? pad : 0);
  const y = centerY - boxH / 2 - (padded ? pad : 0);
  const width = padded ? boxW + pad * 2 : boxW;
  const height = padded ? boxH + pad * 2 : boxH;

  const rotateOriginX = aboutCenter(item.rotateOriginX, centerX);
  const rotateOriginY = aboutCenter(item.rotateOriginY, centerY);

  return (
    <g
      className="home-recognition-product-box__arrive"
      style={{ ["--enter" as string]: item.enterDelay }}
    >
      <g
        className="home-recognition-product-box__react"
        style={
          {
            ["--hover-scale"]: item.hoverScale ?? 1.06,
          } as CSSProperties
        }
      >
        {/* Static bitmap (baked outline) — parents own all motion */}
        <image
          href={href}
          x={x}
          y={y}
          width={width}
          height={height}
          transform={`rotate(${item.rotate} ${rotateOriginX} ${rotateOriginY})`}
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: "none" }}
        />
      </g>
    </g>
  );
}

function useBakedStickerHref(
  src: string,
  layoutW: number,
  layoutH: number,
): string | null {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bakeRecognitionSticker(src, layoutW, layoutH)
      .then((url) => {
        if (!cancelled) setHref(url);
      })
      .catch(() => {
        /* CORS / bake failure — keep raw cutout (no live filter) */
        if (!cancelled) setHref(null);
      });
    return () => {
      cancelled = true;
    };
  }, [src, layoutW, layoutH]);

  return href;
}
