"use client";

import { OriginButton } from "@/components/ui/origin-button";

type FrostIndexLinkProps = {
  href: string;
  children: string;
};

/** Global OriginButton — All projects / All thoughts and other index CTAs. */
export function FrostIndexLink({ href, children }: FrostIndexLinkProps) {
  return (
    <div className="detail-index-cta">
      <OriginButton href={href}>{children}</OriginButton>
    </div>
  );
}
