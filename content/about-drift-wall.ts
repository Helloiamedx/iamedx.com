import { asset } from "@/lib/assets";

/**
 * About hero DriftWall tiles — portrait stills from CDN.
 * Reuses roll1–3 until more frames land.
 */
export type AboutDriftWallItem = {
  image: string;
  title: string;
  href?: string;
};

const ROLL_SOURCES = [
  { file: "roll1.jpg", title: "About roll 1" },
  { file: "roll2.jpg", title: "About roll 2" },
  { file: "roll3.jpg", title: "About roll 3" },
] as const;

/** Repeat so every column stays dense while only three frames exist. */
export const aboutDriftWallItems: AboutDriftWallItem[] = Array.from(
  { length: 15 },
  (_, i) => {
    const src = ROLL_SOURCES[i % ROLL_SOURCES.length]!;
    return {
      image: asset(`/images/about/${src.file}`),
      title: src.title,
    };
  },
);
