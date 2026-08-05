"use client";

import Link from "next/link";
import { GlareHover } from "@/components/GlareHover";

export function HeroActions() {
  return (
    <div className="hero__actions">
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
        <Link href="/services" className="hero-cta__link">
          View services
        </Link>
      </GlareHover>

      <GlareHover
        width="auto"
        height="auto"
        background="rgba(0, 118, 221, 0.72)"
        borderRadius="999px"
        borderColor="rgba(0, 118, 221, 0.45)"
        glareColor="#ffffff"
        glareOpacity={0.5}
        className="hero-cta hero-cta--contact"
      >
        <Link href="/contact" className="hero-cta__link">
          Contact
        </Link>
      </GlareHover>
    </div>
  );
}
