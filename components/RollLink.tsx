"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const ROLL_CHAR_DELAY_MS = 30;

function RollText({ text, duplicate }: { text: string; duplicate?: boolean }) {
  return (
    <span className="roll-text" aria-hidden={duplicate ? true : undefined}>
      {[...text].map((character, index) => (
        <span
          key={`${duplicate ? "dup" : "main"}-${index}`}
          className="roll-char"
          style={{ transitionDelay: `${index * ROLL_CHAR_DELAY_MS}ms` }}
        >
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}

type RollLinkProps = {
  href: string;
  children: string;
  className?: string;
  external?: boolean;
};

export function RollLink({ href, children, className, external }: RollLinkProps) {
  const classes = cn("roll-link", className);
  const content = (
    <>
      <RollText text={children} />
      <RollText text={children} duplicate />
    </>
  );

  if (external || /^(https?:|mailto:|tel:)/i.test(href)) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
