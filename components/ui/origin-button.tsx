"use client";

import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

type OriginButtonProps = {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  href?: string;
  external?: boolean;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children" | "className" | "disabled"
>;

function hasTextContent(node: React.ReactNode): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim().length > 0;
  }

  if (Array.isArray(node)) {
    return node.some(hasTextContent);
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return hasTextContent(node.props.children);
  }

  return false;
}

function isExternalHref(href: string, external?: boolean) {
  if (external) return true;
  return /^(https?:|mailto:|tel:)/i.test(href);
}

/** Hold solid hover fill long enough to read, then navigate */
const TOUCH_PRESS_MS = 180;

function OriginButtonShell({ children }: { children: React.ReactNode }) {
  return <span className="origin-button-wrap">{children}</span>;
}

function useCoarsePointer() {
  const [coarse, setCoarse] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (hover: none)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return coarse;
}

function usePressFlash() {
  const [pressed, setPressed] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const startYRef = React.useRef(0);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const release = React.useCallback(() => {
    clearTimer();
    setPressed(false);
  }, [clearTimer]);

  React.useEffect(() => () => clearTimer(), [clearTimer]);

  const arm = React.useCallback(
    (clientY?: number) => {
      clearTimer();
      if (clientY != null) startYRef.current = clientY;
      setPressed(true);
    },
    [clearTimer],
  );

  const movedTooFar = React.useCallback((clientY: number) => {
    return Math.abs(clientY - startYRef.current) > 12;
  }, []);

  const afterFlash = React.useCallback(
    (fn: () => void) => {
      clearTimer();
      setPressed(true);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setPressed(false);
        fn();
      }, TOUCH_PRESS_MS);
    },
    [clearTimer],
  );

  return { pressed, arm, release, afterFlash, movedTooFar };
}

const OriginButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  OriginButtonProps
>(
  (
    {
      children,
      className,
      disabled = false,
      loading = false,
      type = "button",
      href,
      external,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled || loading);
    const coarse = useCoarsePointer();
    const { pressed, arm, release, afterFlash, movedTooFar } = usePressFlash();
    const classes = cn(
      "origin-button",
      pressed && "is-pressed",
      className,
    );

    const ariaLabel = props["aria-label"];
    const ariaLabelledBy = props["aria-labelledby"];

    React.useEffect(() => {
      if (process.env.NODE_ENV === "production") {
        return;
      }

      if (
        hasTextContent(children) ||
        ariaLabel?.trim() ||
        ariaLabelledBy?.trim()
      ) {
        return;
      }

      console.warn(
        "OriginButton: provide visible label text or aria-label / aria-labelledby so the control has an accessible name.",
      );
    }, [ariaLabel, ariaLabelledBy, children]);

    const go = React.useCallback(() => {
      if (!href || isDisabled) return;
      if (isExternalHref(href, external)) {
        if (external) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.assign(href);
        }
        return;
      }
      window.location.assign(href);
    }, [external, href, isDisabled]);

    if (href) {
      const anchorProps =
        props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>;

      /* Mobile / coarse: plain <a>, flash full hover, then hard navigate */
      if (coarse) {
        return (
          <OriginButtonShell>
            <a
              {...anchorProps}
              aria-busy={loading || undefined}
              aria-disabled={isDisabled || undefined}
              className={classes}
              href={isDisabled ? undefined : href}
              ref={ref as React.Ref<HTMLAnchorElement>}
              rel={external ? "noopener noreferrer" : undefined}
              target={external ? "_blank" : undefined}
              onTouchStart={(event) => {
                if (isDisabled) return;
                if (event.touches.length > 1) return;
                arm(event.touches[0]?.clientY);
              }}
              onTouchCancel={release}
              onTouchEnd={(event) => {
                if (isDisabled) return;
                const y = event.changedTouches[0]?.clientY ?? 0;
                if (movedTooFar(y)) {
                  release();
                  return;
                }
                event.preventDefault();
                afterFlash(go);
              }}
              onClick={(event) => {
                onClick?.(
                  event as unknown as React.MouseEvent<HTMLButtonElement>,
                );
                event.preventDefault();
              }}
            >
              {children}
            </a>
          </OriginButtonShell>
        );
      }

      const handleClick = (
        event: React.MouseEvent<HTMLAnchorElement>,
      ) => {
        onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        if (event.defaultPrevented || isDisabled) {
          event.preventDefault();
        }
      };

      if (isExternalHref(href, external)) {
        return (
          <OriginButtonShell>
            <a
              {...anchorProps}
              aria-busy={loading || undefined}
              aria-disabled={isDisabled || undefined}
              className={classes}
              href={isDisabled ? undefined : href}
              onClick={handleClick}
              ref={ref as React.Ref<HTMLAnchorElement>}
              rel={external ? "noopener noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {children}
            </a>
          </OriginButtonShell>
        );
      }

      return (
        <OriginButtonShell>
          <Link
            {...anchorProps}
            aria-busy={loading || undefined}
            aria-disabled={isDisabled || undefined}
            className={classes}
            href={href}
            onClick={handleClick}
            ref={ref as React.Ref<HTMLAnchorElement>}
          >
            {children}
          </Link>
        </OriginButtonShell>
      );
    }

    return (
      <OriginButtonShell>
        <button
          {...props}
          aria-busy={loading || undefined}
          className={classes}
          disabled={isDisabled}
          ref={ref as React.Ref<HTMLButtonElement>}
          type={type}
          onTouchStart={() => {
            if (!isDisabled) arm();
          }}
          onTouchCancel={release}
          onTouchEnd={() => {
            if (!isDisabled) {
              window.setTimeout(release, TOUCH_PRESS_MS);
            }
          }}
          onClick={onClick}
        >
          {children}
        </button>
      </OriginButtonShell>
    );
  },
);
OriginButton.displayName = "OriginButton";

export { OriginButton };
export type { OriginButtonProps };
