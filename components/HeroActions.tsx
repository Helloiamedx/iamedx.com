"use client";

import { ClickSpark } from "@/components/ClickSpark";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import { SpecularButton } from "@/components/SpecularButton";

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
        {/*
          Stack (bottom → top): GlareHover fill → glare wipe (::before) → label.
          SpecularButton fill must stay transparent or it buries the wipe.
        */}
        <GlareHover
          width="auto"
          height="auto"
          background="rgba(11, 11, 11, 0.72)"
          borderRadius="999px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.65}
          transitionDuration={GLARE_WIPE_MS}
          className="hero-cta-glare hero-cta-glare--dark"
        >
          <SpecularButton
            href="/services"
            className="hero-cta hero-cta--services hero-cta__link"
            tint="#0b0b0b"
            tintOpacity={0}
            textColor="#ffffff"
            lineColor="#ffffff"
            baseColor="#3a3a3a"
            blur={0}
            radius={999}
            intensity={0.82}
            thickness={0.78}
            shineSize={20}
            shineFade={38}
            speed={0.85}
            autoAnimate
            pauseOnHover
            followMouse={false}
            enabled={revealed}
            tabIndex={revealed ? undefined : -1}
          >
            View services
          </SpecularButton>
        </GlareHover>
      </ClickSpark>

      <ClickSpark>
        <GlareHover
          width="auto"
          height="auto"
          background="rgba(255, 255, 255, 0.16)"
          borderRadius="999px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.6}
          transitionDuration={GLARE_WIPE_MS}
          className="hero-cta-glare hero-cta-glare--glass"
        >
          <SpecularButton
            href="/projects"
            className="hero-cta hero-cta--projects hero-cta__link"
            tint="#ffffff"
            tintOpacity={0}
            textColor="#ffffff"
            lineColor="#ffffff"
            baseColor="#8a8a8a"
            blur={0}
            radius={999}
            intensity={0.85}
            thickness={0.8}
            shineSize={20}
            shineFade={38}
            speed={0.85}
            autoAnimate
            pauseOnHover
            followMouse={false}
            enabled={revealed}
            tabIndex={revealed ? undefined : -1}
          >
            View projects
          </SpecularButton>
        </GlareHover>
      </ClickSpark>
    </div>
  );
}
