"use client";

import { useEffect, useState } from "react";
import { AboutHeroParticleField } from "@/components/AboutHeroParticleField";
import { DriftWall } from "@/components/DriftWall";
import { aboutDriftWallItems } from "@/content/about-drift-wall";

/** Brief beat before worldwide particles gather. */
const WORLDWIDE_DELAY_MS = 550;

export function AboutHeroHeadline() {
  const [startMorph, setStartMorph] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStartMorph(true);
      return;
    }
    const id = window.setTimeout(() => setStartMorph(true), WORLDWIDE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <div className="about-boua__hero-drift" aria-hidden="true">
        <DriftWall
          items={aboutDriftWallItems}
          columns={7}
          fillWidth
          scale={1.55}
          turn={14}
          radius={9}
          tileWidth={148}
          tileHeight={222}
          gap={14}
          speed={14}
          overlayColor="#0a0a0a"
          dim={0.42}
          fade={0}
        />
      </div>
      <AboutHeroParticleField startMorph={startMorph} />
      <h1 className="about-boua__hero-headline">
        Developing products through radical collaboration loved{" "}
        <em>worldwide.</em>
      </h1>
    </>
  );
}
