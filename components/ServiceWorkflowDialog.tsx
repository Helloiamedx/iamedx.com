"use client";

import { useLenis } from "lenis/react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { SupplierEvaluationDemo } from "@/components/SupplierEvaluationDemo";
import { WorkflowKeywordBurst } from "@/components/WorkflowKeywordBurst";
import { WorkflowMediaWall } from "@/components/WorkflowMediaWall";
import { cn } from "@/lib/utils";

const EXIT_MS = 460;

type WorkflowStep = {
  title: string;
  body: string;
  judgment?: boolean;
  media?: string;
  checks?: readonly string[];
  keywords?: readonly string[];
  mediaWall?: readonly string[];
  evaluationDemo?: boolean;
};

type ServiceWorkflowDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Service name — a11y */
  title: string;
  /** Real workflow steps when ready; omit → Coming Soon */
  steps?: readonly WorkflowStep[];
};

function isVideoMedia(src: string) {
  return /\.(mp4|m4v|mov|webm)(\?|#|$)/i.test(src);
}

const CHECK_TICK_MS = 380;
const CHECK_HOLD_MS = 700;

function WorkflowCheckList({ items }: { items: readonly string[] }) {
  const [checkedCount, setCheckedCount] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      const ready = window.setTimeout(() => {
        setCheckedCount(items.length);
      }, 0);
      return () => window.clearTimeout(ready);
    }

    let count = 0;
    let timer = 0;

    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        count += 1;
        if (count > items.length) {
          count = 0;
          setCheckedCount(0);
          schedule(CHECK_HOLD_MS);
          return;
        }
        setCheckedCount(count);
        schedule(CHECK_TICK_MS);
      }, delay);
    };

    schedule(CHECK_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [items.length]);

  return (
    <div className="svc-workflow__step-checks">
      <ul className="svc-workflow__check-grid" aria-label="Capability checks">
        {items.map((label, index) => {
          const on = index < checkedCount;
          return (
            <li
              key={label}
              className={cn(
                "svc-workflow__check-cell",
                on && "is-checked",
              )}
            >
              <span className="svc-workflow__check-label">{label}</span>
              <span className="svc-workflow__check-mark" aria-hidden="true">
                <svg
                  className="svc-workflow__check-svg"
                  viewBox="0 0 16 16"
                  focusable="false"
                >
                  <path
                    className="svc-workflow__check-path"
                    d="M3.2 8.2 6.6 11.6 12.8 4.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function lockBodyScroll(scrollY: number) {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  const html = document.documentElement;
  const body = document.body;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.width = "100%";
  body.style.touchAction = "none";
  if (scrollbar > 0) {
    body.style.paddingRight = `${scrollbar}px`;
  }
}

function unlockBodyScroll(scrollY: number) {
  const html = document.documentElement;
  const body = document.body;

  html.style.overflow = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.width = "";
  body.style.touchAction = "";
  body.style.paddingRight = "";
  window.scrollTo(0, scrollY);
}

/**
 * Services — frosted full-screen overlay + white workflow panel.
 * Pass `steps` for a real workflow; otherwise Coming Soon.
 */
export function ServiceWorkflowDialog({
  open,
  onClose,
  title,
  steps,
}: ServiceWorkflowDialogProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const lockedScrollYRef = useRef(0);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

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
    }, EXIT_MS);
  }, [open, visible]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const scrollY = window.scrollY;
    lockedScrollYRef.current = scrollY;
    const lenisNow = lenisRef.current;
    const useLenisLock = Boolean(lenisNow);

    // Stop Lenis while window.scrollY is still accurate — stop() resets to actualScroll.
    lenisNow?.stop();

    if (!useLenisLock) {
      lockBodyScroll(scrollY);
    } else {
      document.documentElement.style.overflow = "hidden";
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    }

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
        unlockBodyScroll(y);
      }
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={cn("svc-workflow", exiting && "is-exiting")}
      role="presentation"
      data-lenis-prevent
    >
      <div className="svc-workflow__backdrop" aria-hidden="true" />
      <div
        className="svc-workflow__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="svc-workflow__body">
          <div className="svc-workflow__scroll" data-lenis-prevent>
            <p id={titleId} className="svc-workflow__sr-title">
              {steps?.length ? title : `${title} — Coming Soon`}
            </p>
            {steps?.length ? (
              <div className="svc-workflow__steps">
                {steps.map((step, index) => (
                  <Fragment key={step.title}>
                    {index > 0 ? (
                      <hr className="svc-workflow__rule" aria-hidden="true" />
                    ) : null}
                    <div
                      className={cn(
                        "svc-workflow__step svc-workflow__step--media",
                        step.judgment && "svc-workflow__step--judgment",
                      )}
                    >
                      <div className="svc-workflow__step-copy">
                        <h3 className="svc-workflow__step-title">
                          {step.title}
                        </h3>
                        <p className="svc-workflow__step-body">{step.body}</p>
                      </div>
                      <div
                        className="svc-workflow__step-gap"
                        aria-hidden="true"
                      />
                      {step.judgment ? (
                        <WorkflowCheckList items={step.checks ?? []} />
                      ) : step.evaluationDemo ? (
                        <div className="svc-workflow__step-media svc-workflow__step-media--eval">
                          <SupplierEvaluationDemo />
                        </div>
                      ) : step.mediaWall?.length ? (
                        <div className="svc-workflow__step-media svc-workflow__step-media--wall">
                          <WorkflowMediaWall items={step.mediaWall} />
                        </div>
                      ) : step.keywords?.length ? (
                        <div className="svc-workflow__step-media svc-workflow__step-media--burst">
                          <WorkflowKeywordBurst labels={step.keywords} />
                        </div>
                      ) : step.media ? (
                        <div className="svc-workflow__step-media">
                          {isVideoMedia(step.media) ? (
                            <CoverLoopVideo
                              src={step.media}
                              className="svc-workflow__step-media-img"
                              ariaLabel={step.title}
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={step.media}
                              alt=""
                              className="svc-workflow__step-media-img"
                              draggable={false}
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="svc-workflow__coming-soon">
                <h3 className="svc-workflow__coming-soon-title">Coming Soon</h3>
                <p className="svc-workflow__coming-soon-body">
                  A detailed look at my workflow is currently being developed.
                </p>
              </div>
            )}
          </div>
          <div
            className="svc-workflow__veil svc-workflow__veil--top"
            aria-hidden="true"
          />
          <div
            className="svc-workflow__veil svc-workflow__veil--bottom"
            aria-hidden="true"
          />
        </div>

        <button
          type="button"
          className="svc-workflow__close"
          aria-label="Close workflow"
          onClick={onClose}
        >
          <svg
            className="svc-workflow__close-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
