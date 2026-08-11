"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type FilterResultsProps = {
  /** Changes when the active filter changes — drives exit-then-enter. */
  filterKey: string;
  children: ReactNode;
  className?: string;
};

/**
 * Filter swap shell (RSC-safe children):
 * 1) Old results fade/settle out (`mode="wait"`)
 * 2) New masonry mounts and runs its own left→right card stagger
 */
export function FilterResults({
  filterKey,
  children,
  className,
}: FilterResultsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={className ? `filter-results ${className}` : "filter-results"}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filterKey}
          className="filter-results__swap"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.01 } }
              : {
                  /* Soft shell fade while cards settle — matches Apple fade language */
                  opacity: 0,
                  transition: {
                    duration: 0.28,
                    ease: [0.455, 0.03, 0.515, 0.955],
                  },
                }
          }
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
