"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type FilterResultsProps = {
  /** Changes when the active filter changes — drives exit / enter. */
  filterKey: string;
  children: ReactNode;
  className?: string;
};

const EASE = [0.455, 0.03, 0.515, 0.955] as const;

/**
 * Filter swap shell (RSC-safe children):
 * - Crossfade old → new in a stacked grid (never collapses to 0 height)
 * - Outer height tweens so the footer eases instead of jumping
 * - New masonry still runs its own card stagger on mount
 */
export function FilterResults({
  filterKey,
  children,
  className,
}: FilterResultsProps) {
  const reduceMotion = useReducedMotion();
  const measureRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const primedRef = useRef(false);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const read = () => Math.ceil(el.getBoundingClientRect().height);

    const apply = (next: number) => {
      if (!primedRef.current) {
        primedRef.current = true;
        setHeight(next);
        return;
      }
      setHeight((prev) => (prev === next ? prev : next));
    };

    apply(read());

    const ro = new ResizeObserver(() => apply(read()));
    ro.observe(el);
    return () => ro.disconnect();
  }, [filterKey]);

  return (
    <motion.div
      className={className ? `filter-results ${className}` : "filter-results"}
      initial={false}
      animate={reduceMotion ? { height: "auto" } : { height }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { height: { duration: 0.5, ease: EASE } }
      }
      style={{ overflow: reduceMotion ? undefined : "hidden" }}
    >
      <div ref={measureRef} className="filter-results__stack">
        <AnimatePresence initial={false}>
          <motion.div
            key={filterKey}
            className="filter-results__swap"
            initial={false}
            animate={{ opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0.01 } }
                : {
                    opacity: 0,
                    transition: {
                      duration: 0.28,
                      ease: EASE,
                    },
                  }
            }
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
