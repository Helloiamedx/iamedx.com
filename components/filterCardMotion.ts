import type { Variants } from "motion/react";

/**
 * Apple iPhone “Explore the lineup” StaggeredFadeIn (from overview.built.css / main.built.js):
 * - --staggered-delay: 0.15
 * - --staggered-opacity-duration: 0.9
 * - --staggered-translate-y: 30px
 * - --staggered-translate-y-duration: 0.7
 * - easeFunction: easeInOutQuad (both axes)
 * - no horizontal drift, no spring / scale
 */

/** Penner easeInOutQuad ≈ cubic-bezier used across Apple’s anim system */
const easeInOutQuad: [number, number, number, number] = [0.455, 0.03, 0.515, 0.955];

export const filterCardListVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

export const filterCardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.9, ease: easeInOutQuad },
      y: { duration: 0.7, ease: easeInOutQuad },
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: {
      duration: 0.28,
      ease: easeInOutQuad,
    },
  },
};

/** Instant swap when the user prefers reduced motion. */
export const filterCardListVariantsReduced: Variants = {
  hidden: {},
  show: {},
  exit: {},
};

export const filterCardItemVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};
