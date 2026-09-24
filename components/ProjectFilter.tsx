"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { HeadlineMotion } from "@/components/HeadlineMotion";
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
/** After page load — small control needs a beat so it’s noticed */
const FILTER_ENTER_DELAY_MS = 720;

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
  const reduceMotion = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  /**
   * Drives the Filter label's entrance. Held back until `load` plus
   * FILTER_ENTER_DELAY_MS so the small control is noticed rather than landing
   * with the first paint.
   */
  const [revealed, setRevealed] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Filter enter: wait for load + delay, then play when in view.
   *
   * The delay is the point of this control — it is deliberately late so the
   * small label is noticed after the page has settled. Effect 01 runs on
   * `trigger="manual"` for exactly that reason: `trigger="view"` would fire the
   * moment the bar intersects, well before the gate opens.
   *
   * Leave settles visible; each re-entry plays again.
   */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof IntersectionObserver === "undefined") return;

    let delayTimer = 0;
    let gateReady = false;
    let inView = false;
    let cancelled = false;

    const play = () => {
      /* Drop back to false first so the true flip is a fresh replay. */
      setRevealed(false);
      requestAnimationFrame(() => {
        if (!cancelled) setRevealed(true);
      });
    };

    const tryPlay = () => {
      if (!gateReady || !inView || cancelled) return;
      play();
    };

    const armGate = () => {
      /*
       * The hold only exists so a small control gets noticed after the page has
       * settled. Reduced motion gets none of it — the engine shows the label at
       * its resting state instead of animating, so there is nothing to notice.
       */
      delayTimer = window.setTimeout(
        () => {
          gateReady = true;
          tryPlay();
        },
        reduceMotion ? 0 : FILTER_ENTER_DELAY_MS,
      );
    };

    if (document.readyState === "complete") {
      armGate();
    } else {
      window.addEventListener("load", armGate, { once: true });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          /* Leave settles visible — arm for the next enter */
          inView = false;
          return;
        }
        if (inView) return;
        inView = true;
        tryPlay();
      },
      { threshold: 0 },
    );

    observer.observe(bar);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("load", armGate);
      if (delayTimer) window.clearTimeout(delayTimer);
    };
  }, [reduceMotion]);

  const activeCount = projectsFilterSelectionCount({
    involvement: activeInvolvement,
    material: activeMaterial,
    country: activeCountry,
  });
  const filtersActive = activeCount > 0 || Boolean(activeIp);

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

  /** Drawer only: reset multi-select draft options (does not change applied results). */
  const clearDraftOptions = () => {
    setDraft({ involvement: "all", material: "all", country: "all" });
  };

  /** Outside Clear: drop applied filters and show all projects. */
  const clearAppliedFilters = () => {
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
                  {/*
                   * Effect 01. The drawer body is a real scroll container, so a
                   * view observer clips to it — the heading for the section you
                   * can actually see plays, the rest wait for the scroll.
                   */}
                  <HeadlineMotion
                    as="h2"
                    effect="01"
                    id={`${panelId}-title`}
                    className="project-filter-drawer__section-heading"
                  >
                    Project type
                  </HeadlineMotion>
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
                  <HeadlineMotion
                    as="h2"
                    effect="01"
                    className="project-filter-drawer__section-heading"
                  >
                    Region
                  </HeadlineMotion>
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

                <div className="project-filter-drawer__section">
                  <HeadlineMotion
                    as="h2"
                    effect="01"
                    className="project-filter-drawer__section-heading"
                  >
                    Material
                  </HeadlineMotion>
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
                  onClick={clearDraftOptions}
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
      <div ref={barRef} className="project-filter-bar">
        <button
          ref={triggerRef}
          type="button"
          className={`project-filter-trigger${filtersActive ? " is-active" : ""}`}
          aria-expanded={open || visible}
          aria-controls={open || visible ? panelId : undefined}
          onClick={() => setOpen(true)}
        >
          {/*
           * Effect 01, same as the section labels and item titles.
           *
           * The animated span wraps the static word only. The count stays
           * outside it so `Filter (2)` never changes the span's children — the
           * engine owns that node, and a text swap would fight React for it.
           */}
          <HeadlineMotion
            as="span"
            effect="01"
            trigger="manual"
            play={revealed}
            className="project-filter-trigger__label"
          >
            Filter
          </HeadlineMotion>
          {filtersActive ? (
            /*
             * Held back with the label. The engine only hides its own node, so
             * without this a filtered URL would show a bare ` (3)` for the
             * length of the gate before the word arrives.
             */
            <span
              className={
                revealed
                  ? "project-filter-trigger__count"
                  : "project-filter-trigger__count is-pending"
              }
            >
              {` (${matchCount})`}
            </span>
          ) : null}
        </button>
        {filtersActive ? (
          <button
            type="button"
            className="project-filter-clear"
            onClick={clearAppliedFilters}
          >
            Clear
          </button>
        ) : null}
      </div>
      {drawer}
    </>
  );
}
