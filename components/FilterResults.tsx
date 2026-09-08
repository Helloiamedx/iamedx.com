"use client";

import type { ReactNode } from "react";

type FilterResultsProps = {
  /** Changes when the active filter changes — remounts the results set. */
  filterKey: string;
  children: ReactNode;
  className?: string;
};

/**
 * Filter swap shell (RSC-safe children).
 * Instant cut on filter change — no stacked old/new layers, so copy never overlaps.
 */
export function FilterResults({
  filterKey,
  children,
  className,
}: FilterResultsProps) {
  return (
    <div className={className ? `filter-results ${className}` : "filter-results"}>
      <div key={filterKey} className="filter-results__swap">
        {children}
      </div>
    </div>
  );
}
