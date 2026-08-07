"use client";

import type { CSSProperties, ReactNode } from "react";
import "./GlareHover.css";

/** Site-wide CTA glare wipe — keep every GlareHover on this pace */
export const GLARE_WIPE_MS = 1000;

type GlareHoverProps = {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
};

function toGlareRgba(glareColor: string, glareOpacity: number) {
  const hex = glareColor.replace("#", "");
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = Number.parseInt(hex[0] + hex[0], 16);
    const g = Number.parseInt(hex[1] + hex[1], 16);
    const b = Number.parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  return glareColor;
}

export function GlareHover({
  width = "auto",
  height = "auto",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = GLARE_WIPE_MS,
  playOnce = false,
  className = "",
  style = {},
}: GlareHoverProps) {
  const vars = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": toGlareRgba(glareColor, glareOpacity),
    "--gh-border": borderColor,
  } as CSSProperties;

  return (
    <div
      className={`glare-hover${playOnce ? " glare-hover--play-once" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}
