"use client";

import { useId, type CSSProperties } from "react";
import {
  getRecognitionProductBoxSet,
  type RecognitionProductBoxSetId,
} from "@/content/recognitionProductBox";

type HomeRecognitionProductBoxProps = {
  /** Which pack to render — required so each card maps explicitly */
  setId: RecognitionProductBoxSetId;
  className?: string;
};

/**
 * Kraft open-box product stack for Recognition cards.
 * Layout / motion vars come from `content/recognitionProductBox.ts`.
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
  const stickerId = `pb-sticker-${rawId}`;
  const shadowId = `pb-shadow-${rawId}`;
  const grainId = `pb-grain-${rawId}`;
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
            {/* Extra L/R + top headroom so hover scale isn’t sheared */}
            <path d="M-120 -200H880V438H598L571 580H191L157 438H-120Z" />
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
          <filter
            id={stickerId}
            x="-18%"
            y="-18%"
            width="136%"
            height="140%"
          >
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="4"
              result="edge"
            />
            <feFlood floodColor="white" />
            <feComposite in2="edge" operator="in" result="outline" />
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="1.6"
              floodOpacity=".18"
            />
            <feComposite in="SourceGraphic" operator="over" />
          </filter>
          <filter id={shadowId}>
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <pattern
            id={grainId}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M1 1h1 M4 4h1"
              stroke="#4b321c"
              strokeOpacity=".10"
              strokeWidth=".7"
            />
          </pattern>
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
          {set.items.map((item) => {
            const s = item.scale ?? 1;
            const cx = item.x + item.width / 2;
            const cy = item.y + item.height / 2;
            const scaleXf =
              s === 1
                ? undefined
                : `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;
            return (
              <g
                key={item.id}
                className="home-recognition-product-box__arrive"
                style={{ ["--enter" as string]: item.enterDelay }}
              >
                <g
                  className="home-recognition-product-box__piece"
                  style={{ ["--delay" as string]: item.driftDelay }}
                >
                  <g
                    className="home-recognition-product-box__react"
                    style={
                      {
                        ["--lift"]: item.lift,
                        ["--turn"]: item.turn,
                        ["--hover-scale"]: item.hoverScale ?? 1.06,
                      } as CSSProperties
                    }
                  >
                    <g transform={scaleXf}>
                      <image
                        href={item.src}
                        x={item.x}
                        y={item.y}
                        width={item.width}
                        height={item.height}
                        transform={`rotate(${item.rotate} ${item.rotateOriginX} ${item.rotateOriginY})`}
                        filter={`url(#${stickerId})`}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  </g>
                </g>
              </g>
            );
          })}
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
          <path
            d="M184 457 598 440 571 586 214 586Z"
            fill={`url(#${grainId})`}
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
