"use client";

import { useLenis } from "lenis/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const EXIT_MS = 460;

type ServiceWorkflowDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Service name — used for a11y until workflow copy is supplied */
  title: string;
};

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
 * Services — frosted full-screen overlay + white workflow panel (Apple-style shell).
 * Content TBD; layout and backdrop only for now.
 */
export function ServiceWorkflowDialog({
  open,
  onClose,
  title,
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
      if (event.key === "Escape") onCloseRef.current();
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
      <button
        type="button"
        className="svc-workflow__backdrop"
        aria-label="Close workflow"
        onClick={onClose}
      />
      <div
        className="svc-workflow__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
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
              d="M7 7l10 10M17 7L7 17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="square"
            />
          </svg>
        </button>

        <div className="svc-workflow__body" data-lenis-prevent>
          <p id={titleId} className="svc-workflow__sr-title">
            {title}
          </p>
          {/* Workflow copy / media — supplied later */}
        </div>
      </div>
    </div>,
    document.body,
  );
}
