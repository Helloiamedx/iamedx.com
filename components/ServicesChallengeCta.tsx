"use client";

import { useState } from "react";
import { OriginButton } from "@/components/ui/origin-button";
import { whatsAppCta } from "@/content/nav";
import { asset } from "@/lib/assets";
import { cn } from "@/lib/utils";

const WORDMARK_GIF = asset("/3D_SpinningWordmark.gif");

type ChallengeCtaProps = {
  className?: string;
};

/**
 * Footer challenge CTA — spinning wordmark + line + WhatsApp Contact me.
 * GIF stays lazy: reserved placeholder until near viewport, then fade in.
 */
export function ChallengeCta({ className }: ChallengeCtaProps) {
  const [gifReady, setGifReady] = useState(false);

  return (
    <div className={cn("svc-challenge", className)}>
      <div
        className={cn(
          "svc-challenge__mark-slot",
          gifReady && "is-ready",
        )}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
        <img
          src={WORDMARK_GIF}
          alt=""
          className="svc-challenge__mark"
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setGifReady(true)}
        />
      </div>
      <p className="svc-challenge__headline">bring me your challenge</p>
      <OriginButton href={whatsAppCta.href} external>
        Contact me
      </OriginButton>
    </div>
  );
}
