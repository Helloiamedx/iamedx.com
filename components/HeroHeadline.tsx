"use client";

import { useState } from "react";
import { FoldText } from "@/components/FoldText";
import { HeroActions } from "@/components/HeroActions";

const HERO_COPY =
  "Help You Establish a Supply Chain in China Tailored to Your Business with a Transparent Approach";

const FONT_SIZE = "clamp(2.2rem, 6.2vw, 5.25rem)";
const FONT_WEIGHT = 500;
const TEXT_COLOR = "#b5b5b5";

export function HeroHeadline() {
  const [complete, setComplete] = useState(false);

  return (
    <>
      <h1 className="hero__title">
        <div className="hero-headline">
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
            shine={complete}
            onComplete={() => setComplete(true)}
          />
        </div>
      </h1>
      <HeroActions revealed={complete} />
    </>
  );
}
