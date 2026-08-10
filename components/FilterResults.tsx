"use client";

import type { ReactNode } from "react";

type FilterResultsProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Soft enter when remounted — parent should set `key={activeFilter}`.
 * Used on Projects + Insights index filters.
 */
export function FilterResults({ children, className }: FilterResultsProps) {
  return (
    <div className={className ? `filter-results ${className}` : "filter-results"}>
      {children}
    </div>
  );
}
