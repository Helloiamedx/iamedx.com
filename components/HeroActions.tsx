"use client";

import Link from "next/link";
import { ClickSpark } from "@/components/ClickSpark";
import { GlareHover } from "@/components/GlareHover";

type HeroActionsProps = {
  revealed?: boolean;
};

export function HeroActions({ revealed = false }: HeroActionsProps) {
  return (
    <div
      className={`hero__actions${revealed ? " is-revealed" : ""}`}
      aria-hidden={!revealed}
    >
      <ClickSpark>
        <GlareHover
          width="auto"
          height="auto"
          background="rgba(255, 255, 255, 0.72)"
          borderRadius="999px"
          borderColor="rgba(255, 255, 255, 0.35)"
          glareColor="#ffffff"
          glareOpacity={0.55}
          className="hero-cta hero-cta--services"
        >
          <Link
            href="/services"
            className="hero-cta__link"
            tabIndex={revealed ? undefined : -1}
          >
            View services
          </Link>
        </GlareHover>
      </ClickSpark>

      <ClickSpark>
        <GlareHover
          width="auto"
          height="auto"
          background="#0076dd"
          borderRadius="999px"
          borderColor="#0076dd"
          glareColor="#ffffff"
          glareOpacity={0.55}
          className="hero-cta hero-cta--contact"
        >
          <Link
            href="/contact"
            className="hero-cta__link"
            tabIndex={revealed ? undefined : -1}
          >
            Contact
          </Link>
        </GlareHover>
      </ClickSpark>
    </div>
  );
}
