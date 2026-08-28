"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  buildInvolvementQueryValue,
  involvementFilters,
  involvementSelectionCount,
  type Involvement,
  type InvolvementSelection,
} from "@/content/projects";

const DRAWER_EXIT_MS = 380;

type ProjectFilterProps = {
  active: InvolvementSelection;
  activeIp?: string | null;
};

function selectionFromDraft(
  id: Involvement | "all",
  current: InvolvementSelection,
): InvolvementSelection {
  if (id === "all") return "all";

  if (current === "all") return [id];

  if (current.includes(id)) {
    const next = current.filter((entry) => entry !== id);
    return next.length === 0 ? "all" : next;
  }

  return [...current, id];
}

function isOptionChecked(
  id: Involvement | "all",
  selection: InvolvementSelection,
): boolean {
  if (id === "all") return selection === "all";
  return selection !== "all" && selection.includes(id);
}

function buildProjectsHref(
  selection: InvolvementSelection,
  activeIp?: string | null,
): string {
  const params = new URLSearchParams();
  const involvement = buildInvolvementQueryValue(selection);
  if (involvement) params.set("involvement", involvement);
  if (activeIp) params.set("ip", activeIp);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

function normalizeSelection(selection: InvolvementSelection): InvolvementSelection {
  if (selection === "all") return "all";
  return [...selection].sort();
}

export function ProjectFilter({ active, activeIp }: ProjectFilterProps) {
  const router = useRouter();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [draft, setDraft] = useState<InvolvementSelection>(() =>
    normalizeSelection(active),
  );

  const draftCount = involvementSelectionCount(draft);
  const activeCount = involvementSelectionCount(active);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setExiting(false);
      setVisible(true);
      return;
    }

    if (!visible) return;

    setExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
      exitTimerRef.current = null;
    }, DRAWER_EXIT_MS);
  }, [open, visible]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) setDraft(normalizeSelection(active));
  }, [active, open]);

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!visible || exiting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, exiting, close]);

  const applyChoices = () => {
    router.push(buildProjectsHref(draft, activeIp), { scroll: false });
    close();
  };

  const clearAll = () => {
    setDraft("all");
    router.push("/projects", { scroll: false });
    close();
  };

  const drawer =
    visible && mounted
      ? createPortal(
          <div
            className={`project-filter-drawer${exiting ? " is-exiting" : ""}`}
            role="presentation"
          >
            <button
              type="button"
              className="project-filter-drawer__backdrop"
              aria-label="Close filter"
              onClick={close}
            />
            <div
              className="project-filter-drawer__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${panelId}-title`}
            >
              <div className="project-filter-drawer__head">
                <button
                  type="button"
                  className="project-filter-drawer__close"
                  onClick={close}
                >
                  Close
                </button>
              </div>

              <div className="project-filter-drawer__body">
                <div className="project-filter-drawer__section">
                  <h2
                    id={`${panelId}-title`}
                    className="project-filter-drawer__section-heading"
                  >
                    Involvement
                    {draftCount > 0 ? ` (${draftCount})` : ""}
                  </h2>

                  <ul className="project-filter-drawer__options" role="list">
                    {involvementFilters.map((item) => {
                      const checked = isOptionChecked(item.id, draft);
                      return (
                        <li key={item.id}>
                          <label className="project-filter-drawer__option">
                            <input
                              type="checkbox"
                              className="project-filter-drawer__checkbox"
                              checked={checked}
                              onChange={() =>
                                setDraft((current) =>
                                  normalizeSelection(
                                    selectionFromDraft(item.id, current),
                                  ),
                                )
                              }
                            />
                            <span className="project-filter-drawer__option-label">
                              {item.label}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="project-filter-drawer__footer">
                <button
                  type="button"
                  className="project-filter-drawer__apply"
                  onClick={applyChoices}
                >
                  Set choices
                </button>
                <button
                  type="button"
                  className="project-filter-drawer__clear"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="project-filter-trigger"
        aria-expanded={open || visible}
        aria-controls={open || visible ? panelId : undefined}
        onClick={() => setOpen(true)}
      >
        Filter
        {activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      {drawer}
    </>
  );
}
