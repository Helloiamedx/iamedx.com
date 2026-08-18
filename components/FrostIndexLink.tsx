"use client";

import Link from "next/link";
import { ClickSpark } from "@/components/ClickSpark";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";

type FrostIndexLinkProps = {
  href: string;
  children: string;
};

/** Same frosted rect + glare wipe as About the project — in-flow, not sticky. */
export function FrostIndexLink({ href, children }: FrostIndexLinkProps) {
  return (
    <div className="detail-index-cta">
      <ClickSpark>
        <GlareHover
          width="auto"
          height="auto"
          background="rgba(255, 255, 255, 0.72)"
          borderRadius="8px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.55}
          transitionDuration={GLARE_WIPE_MS}
          className="detail-index-cta__glare"
        >
          <Link href={href} className="detail-index-cta__link">
            {children}
          </Link>
        </GlareHover>
      </ClickSpark>
    </div>
  );
}
