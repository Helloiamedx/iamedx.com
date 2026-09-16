import { asset } from "@/lib/assets";

const dir = "images/about/process";

export type ProcessCraftMedia = {
  /** Matches About Expertise Process label */
  label: string;
  src: string;
};

/**
 * Process craft demos — About hover + Services workflow media wall.
 * Filenames match CDN objects under images/about/process/.
 */
export const processCraftMedia = [
  { label: "CNC Machining", src: asset(`${dir}/CNC%20Machining.jpg`) },
  { label: "Creasing", src: asset(`${dir}/Creasing.mp4`) },
  { label: "Digital Printing", src: asset(`${dir}/Digital%20Printing.mp4`) },
  { label: "Electroplating", src: asset(`${dir}/Electroplating.mp4`) },
  { label: "Embossing", src: asset(`${dir}/Embossing.jpg`) },
  { label: "Foil Stamping", src: asset(`${dir}/Foil%20Stamping.mp4`) },
  { label: "Injection Molding", src: asset(`${dir}/Injection%20Molding.mp4`) },
  { label: "Laser Cutting", src: asset(`${dir}/Laser%20Cutting.mp4`) },
  { label: "Laser Engraving", src: asset(`${dir}/Laser%20Engraving.mp4`) },
  { label: "Spray Coating", src: asset(`${dir}/Spray%20Coating.mp4`) },
  { label: "Embroidery", src: asset(`${dir}/embroidery.jpg`) },
] as const satisfies readonly ProcessCraftMedia[];

export const processCraftMediaWall = processCraftMedia.map(
  (entry) => entry.src,
);

const byLabel = new Map(
  processCraftMedia.map((entry) => [entry.label.toLowerCase(), entry.src]),
);

/** Resolve demo media for an About Process label (case-insensitive). */
export function getProcessCraftMedia(label: string): string | undefined {
  return byLabel.get(label.trim().toLowerCase());
}

export function isProcessCraftVideo(src: string) {
  return /\.(mp4|m4v|mov|webm)(\?|#|$)/i.test(src);
}
