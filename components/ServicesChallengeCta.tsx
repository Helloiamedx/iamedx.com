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
 */
export function ChallengeCta({ className }: ChallengeCtaProps) {
  return (
    <div className={cn("svc-challenge", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
      <img
        src={WORDMARK_GIF}
        alt=""
        className="svc-challenge__mark"
        width={320}
        height={320}
        decoding="async"
      />
      <p className="svc-challenge__headline">bring me your challenge</p>
      <OriginButton href={whatsAppCta.href} external>
        Contact me
      </OriginButton>
    </div>
  );
}
