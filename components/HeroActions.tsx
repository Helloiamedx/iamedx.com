"use client";

import { OriginButton } from "@/components/ui/origin-button";

type HeroActionsProps = {
  revealed?: boolean;
};

export function HeroActions({ revealed = false }: HeroActionsProps) {
  return (
    <div
      className={`hero__actions${revealed ? " is-revealed" : ""}`}
      aria-hidden={!revealed}
    >
      <OriginButton href="/services" tabIndex={revealed ? undefined : -1}>
        View services
      </OriginButton>

      <OriginButton href="/projects" tabIndex={revealed ? undefined : -1}>
        View projects
      </OriginButton>
    </div>
  );
}
