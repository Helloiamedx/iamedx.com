"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type TouchEvent,
} from "react";

/** Must match `project-showcase-hover-frame-*` / color-cycle duration in globals.css */
const SWAP_CYCLE_MS = 850;

type ProjectCardLinkProps = ComponentProps<typeof Link> & {
  /** When false (no hover swap), navigate immediately */
  enableSwapFlash?: boolean;
};

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (hover: none)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return coarse;
}

function hrefToPath(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") return href;
  if (href && typeof href === "object" && "pathname" in href) {
    const path = href.pathname ?? "/";
    const search =
      typeof href.search === "string"
        ? href.search.startsWith("?")
          ? href.search
          : `?${href.search}`
        : "";
    return `${path}${search}`;
  }
  return String(href);
}

/**
 * Project card / lead / full-width link.
 * Mobile: one tap plays one full cover-swap cycle, then navigates.
 * Desktop: normal Link (CSS :hover handles the cycle).
 */
export function ProjectCardLink({
  children,
  className,
  href,
  enableSwapFlash = true,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  ...rest
}: ProjectCardLinkProps) {
  const router = useRouter();
  const coarse = useCoarsePointer();
  const [swapping, setSwapping] = useState(false);
  const startYRef = useRef(0);
  const cancelledRef = useRef(false);
  const navigatingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const path = hrefToPath(href);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const release = useCallback(() => {
    cancelledRef.current = true;
    navigatingRef.current = false;
    clearTimer();
    setSwapping(false);
  }, [clearTimer]);

  /** Play one swap round, then enter the project. */
  const playCycleThenGo = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    cancelledRef.current = false;
    setSwapping(true);
    router.prefetch(path);
    clearTimer();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (cancelledRef.current) {
        navigatingRef.current = false;
        setSwapping(false);
        return;
      }
      router.push(path);
      window.setTimeout(() => {
        navigatingRef.current = false;
      }, 2000);
    }, SWAP_CYCLE_MS);
  }, [clearTimer, path, router]);

  const handleTouchStart = (event: TouchEvent<HTMLAnchorElement>) => {
    onTouchStart?.(event);
    if (!coarse || !enableSwapFlash) return;
    if (event.touches.length > 1) return;
    if (navigatingRef.current) return;
    cancelledRef.current = false;
    startYRef.current = event.touches[0]?.clientY ?? 0;
  };

  const handleTouchMove = (event: TouchEvent<HTMLAnchorElement>) => {
    onTouchMove?.(event);
    if (!coarse || !enableSwapFlash) return;
    if (navigatingRef.current) return;
    const y = event.touches[0]?.clientY ?? 0;
    if (Math.abs(y - startYRef.current) > 12) {
      cancelledRef.current = true;
    }
  };

  const handleTouchEnd = (event: TouchEvent<HTMLAnchorElement>) => {
    onTouchEnd?.(event);
    if (!coarse || !enableSwapFlash) return;
    if (navigatingRef.current) {
      event.preventDefault();
      return;
    }

    const y = event.changedTouches[0]?.clientY ?? 0;
    if (cancelledRef.current || Math.abs(y - startYRef.current) > 12) {
      cancelledRef.current = false;
      return;
    }

    event.preventDefault();
    playCycleThenGo();
  };

  const handleTouchCancel = (event: TouchEvent<HTMLAnchorElement>) => {
    onTouchCancel?.(event);
    if (!navigatingRef.current) {
      cancelledRef.current = false;
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (coarse && enableSwapFlash) {
      event.preventDefault();
      /* Fallback when click fires without a prior touchEnd commit */
      if (!navigatingRef.current) {
        playCycleThenGo();
      }
    }
  };

  const classes = [className, swapping ? "is-swapping" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      {...rest}
      href={href}
      className={classes}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
