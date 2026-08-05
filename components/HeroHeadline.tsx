"use client";

import { useState } from "react";
import { FoldText } from "@/components/FoldText";
import { ShinyText } from "@/components/ShinyText";

const HERO_COPY =
  "Help You Establish a Supply Chain in China Tailored to Your Business with a Transparent Approach";

const FONT_SIZE = "clamp(2.2rem, 6.2vw, 5.25rem)";
const FONT_WEIGHT = 500;
const TEXT_COLOR = "#b5b5b5";

export function HeroHeadline() {
  const [shiny, setShiny] = useState(false);

  return (
    <div className="hero-headline">
      {!shiny ? (
        <FoldText
          text={HERO_COPY}
          splitBy="word"
          hinge="top"
          color={TEXT_COLOR}
          fontSize={FONT_SIZE}
          fontWeight={FONT_WEIGHT}
          duration={0.55}
          stagger={0.035}
          className="hero-headline__fold-text"
          onComplete={() => setShiny(true)}
        />
      ) : (
        <ShinyText
          text={HERO_COPY}
          color={TEXT_COLOR}
          shineColor="#ffffff"
          speed={2.4}
          delay={0.8}
          spread={120}
          direction="left"
          yoyo={false}
          className="hero-headline__shiny"
        />
      )}
    </div>
  );
}
