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

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

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

const OriginButton = React.forwardRef<HTMLButtonElement, OriginButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      loading = false,
      type = "button",
      href,
      external,
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled || loading);
    const classes = cn("origin-button", className);

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

    if (href) {
      const linkRef = ref as unknown as React.Ref<HTMLAnchorElement>;

      if (isExternalHref(href, external)) {
        return (
          <a
            {...props}
            aria-busy={loading || undefined}
            aria-disabled={isDisabled || undefined}
            className={classes}
            href={isDisabled ? undefined : href}
            ref={linkRef}
            rel={external ? "noopener noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          {...props}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          className={classes}
          href={href}
          ref={linkRef}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        {...props}
        aria-busy={loading || undefined}
        className={classes}
        disabled={isDisabled}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
OriginButton.displayName = "OriginButton";

export { OriginButton };
export type { OriginButtonProps };
