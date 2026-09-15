"use client";

import { useEffect, useState } from "react";
import { HeroActions } from "@/components/HeroActions";
import { HERO_COPY_ATTR, whenHeroFlag } from "@/lib/heroSequence";

const HEADLINE =
  "Establish a Supply Chain From Scratch Tailored to Your Business";

const SUBTITLE =
  "No matter how small you start, I help turn your product ideas into a reliable and scalable supply chain in China built around your actual needs, budget, and growth.";

/** Beat after copy is visible — then CTAs */
const ACTIONS_AFTER_COPY_MS = 380;

export function HeroHeadline() {
  const [copyGate, setCopyGate] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);

  /* Hold copy until video has popped in (HeroBackgroundVideo sets the gate). */
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    void whenHeroFlag(HERO_COPY_ATTR, {
      timeoutMs: 0,
      signal: ac.signal,
    }).then(() => {
      if (!cancelled) setCopyGate(true);
    });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  useEffect(() => {
    if (!copyGate) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        setActionsReady(true);
      },
      reduceMotion ? 0 : ACTIONS_AFTER_COPY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [copyGate]);

  return (
    <>
      <div className={`hero__copy${copyGate ? " is-revealed" : ""}`}>
        <h1 className="hero__title">{HEADLINE}</h1>
        <p className="hero__subtitle">{SUBTITLE}</p>
      </div>
      <HeroActions revealed={actionsReady} />
    </>
  );
}
