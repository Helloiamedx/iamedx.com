"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import {
  buildCountryQueryValue,
  buildInvolvementQueryValue,
  buildMaterialQueryValue,
  countryFilters,
  involvementFilters,
  materials,
  projectsFilterSelectionCount,
  type CountrySelection,
  type InvolvementSelection,
  type MaterialSelection,
} from "@/content/projects";

const DRAWER_EXIT_MS = 380;

type ProjectFilterProps = {
  activeInvolvement: InvolvementSelection;
  activeMaterial: MaterialSelection;
  activeCountry: CountrySelection;
  activeIp?: string | null;
  /** Matching projects for the active filters (not selected-tag count). */
  matchCount: number;
};

type DraftState = {
  involvement: InvolvementSelection;
  material: MaterialSelection;
  country: CountrySelection;
};

function selectionFromDraft<T extends string>(
  id: T | "all",
  current: T[] | "all",
): T[] | "all" {
  if (id === "all") return "all";

  if (current === "all") return [id];

  if (current.includes(id)) {
    const next = current.filter((entry) => entry !== id);
    return next.length === 0 ? "all" : next;
  }

  return [...current, id];
}

function isOptionChecked<T extends string>(
  id: T | "all",
  selection: T[] | "all",
): boolean {
  if (id === "all") return selection === "all";
  return selection !== "all" && selection.includes(id);
}

function normalizeListSelection<T extends string>(
  selection: T[] | "all",
): T[] | "all" {
  if (selection === "all") return "all";
  return [...selection].sort();
}

function normalizeDraft(draft: DraftState): DraftState {
  return {
    involvement: normalizeListSelection(draft.involvement),
    material: normalizeListSelection(draft.material),
    country: normalizeListSelection(draft.country),
  };
}

function buildProjectsHref(
  draft: DraftState,
  activeIp?: string | null,
): string {
  const params = new URLSearchParams();
  const involvement = buildInvolvementQueryValue(draft.involvement);
  const material = buildMaterialQueryValue(draft.material);
  const country = buildCountryQueryValue(draft.country);
  if (involvement) params.set("involvement", involvement);
  if (material) params.set("material", material);
  if (country) params.set("country", country);
  if (activeIp) params.set("ip", activeIp);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

export function ProjectFilter({
  activeInvolvement,
  activeMaterial,
  activeCountry,
  activeIp,
  matchCount,
}: ProjectFilterProps) {
  const router = useRouter();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const lockedScrollYRef = useRef(0);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() =>
    normalizeDraft({
      involvement: activeInvolvement,
      material: activeMaterial,
      country: activeCountry,
    }),
  );

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const activeCount = projectsFilterSelectionCount({
    involvement: activeInvolvement,
    material: activeMaterial,
    country: activeCountry,
  });
  const filtersActive = activeCount > 0 || Boolean(activeIp);

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
    if (!open) {
      setDraft(
        normalizeDraft({
          involvement: activeInvolvement,
          material: activeMaterial,
          country: activeCountry,
        }),
      );
    }
  }, [activeInvolvement, activeMaterial, activeCountry, open]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!visible || exiting) return;

    const scrollY = window.scrollY;
    lockedScrollYRef.current = scrollY;
    const lenisNow = lenisRef.current;
    const useLenisLock = Boolean(lenisNow);

    lenisNow?.stop();

    if (!useLenisLock) {
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.width = "100%";
    } else {
      document.documentElement.style.overflow = "hidden";
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const blockPageScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-lenis-prevent]")) {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", blockPageScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchmove", blockPageScroll, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", blockPageScroll, true);
      window.removeEventListener("touchmove", blockPageScroll, true);

      const y = lockedScrollYRef.current;
      const lenisOnUnlock = lenisRef.current;

      if (lenisOnUnlock) {
        document.documentElement.style.overflow = "";
        window.scrollTo(0, y);
        lenisOnUnlock.scrollTo(y, { immediate: true, force: true });
        lenisOnUnlock.start();
      } else {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = "";
        body.style.overflow = "";
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.width = "";
        window.scrollTo(0, y);
      }
    };
  }, [visible, exiting, close]);

  const applyChoices = () => {
    router.push(buildProjectsHref(draft, activeIp), { scroll: false });
    close();
  };

  const clearAll = () => {
    setDraft({ involvement: "all", material: "all", country: "all" });
    router.push("/projects", { scroll: false });
    close();
  };

  const materialOptions = materials;
  const drawer =
    visible && mounted
      ? createPortal(
          <div
            className={`project-filter-drawer${exiting ? " is-exiting" : ""}`}
            role="presentation"
            data-lenis-prevent
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

              <div
                className="project-filter-drawer__body"
                data-lenis-prevent
              >
                <div className="project-filter-drawer__section">
                  <h2
                    id={`${panelId}-title`}
                    className="project-filter-drawer__section-heading"
                  >
                    Project type
                  </h2>
                  <ul className="project-filter-drawer__options" role="list">
                    {involvementFilters.map((item) => {
                      const checked = isOptionChecked(item.id, draft.involvement);
                      return (
                        <li key={item.id}>
                          <label className="project-filter-drawer__option">
                            <input
                              type="checkbox"
                              className="project-filter-drawer__checkbox"
                              checked={checked}
                              onChange={() =>
                                setDraft((current) =>
                                  normalizeDraft({
                                    ...current,
                                    involvement: selectionFromDraft(
                                      item.id,
                                      current.involvement,
                                    ) as InvolvementSelection,
                                  }),
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

                <div className="project-filter-drawer__section">
                  <h2 className="project-filter-drawer__section-heading">
                    Material
                  </h2>
                  <ul className="project-filter-drawer__options" role="list">
                    {materialOptions.map((item) => {
                      const checked = isOptionChecked(item.id, draft.material);
                      return (
                        <li key={item.id}>
                          <label className="project-filter-drawer__option">
                            <input
                              type="checkbox"
                              className="project-filter-drawer__checkbox"
                              checked={checked}
                              onChange={() =>
                                setDraft((current) =>
                                  normalizeDraft({
                                    ...current,
                                    material: selectionFromDraft(
                                      item.id,
                                      current.material,
                                    ) as MaterialSelection,
                                  }),
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

                <div className="project-filter-drawer__section">
                  <h2 className="project-filter-drawer__section-heading">
                    Region
                  </h2>
                  <ul className="project-filter-drawer__options" role="list">
                    {countryFilters.map((item) => {
                      const checked = isOptionChecked(item.id, draft.country);
                      return (
                        <li key={item.id}>
                          <label className="project-filter-drawer__option">
                            <input
                              type="checkbox"
                              className="project-filter-drawer__checkbox"
                              checked={checked}
                              onChange={() =>
                                setDraft((current) =>
                                  normalizeDraft({
                                    ...current,
                                    country: selectionFromDraft(
                                      item.id,
                                      current.country,
                                    ) as CountrySelection,
                                  }),
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
        {filtersActive ? ` (${matchCount})` : ""}
      </button>
      {drawer}
    </>
  );
}
