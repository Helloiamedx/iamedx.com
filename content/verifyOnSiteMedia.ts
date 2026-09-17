import { asset } from "@/lib/assets";

const DIR =
  "images/service/Supplier%20Evaluation%20%26%20Factory%20Visit%20and%20Audit/Verify%20Everything%20On%20Site";

/** Bust browser / dev-proxy cache after CDN renames. */
const CACHE_BUST = "v=20260917c";

/**
 * Verify Everything On Site — hard-cut stills.
 * `1.jpeg` … `19.jpeg`, in order, starting at 1.
 */
export const verifyOnSiteMediaCut: readonly string[] = Array.from(
  { length: 19 },
  (_, i) => `${asset(`${DIR}/${i + 1}.jpeg`)}?${CACHE_BUST}`,
);
