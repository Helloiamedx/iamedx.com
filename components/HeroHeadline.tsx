"use client";

import { useEffect, useState } from "react";
import { HeroActions } from "@/components/HeroActions";
import { HERO_COPY_ATTR, whenHeroFlag } from "@/lib/heroSequence";

const HEADLINE =
  "ESTABLISH A SUPPLY CHAIN FROM SCRATCH TAILORED TO YOUR BUSINESS";

/** Beat after headline is in — then CTAs */
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

  /* Title first, then buttons */
  useEffect(() => {
    if (!copyGate) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setActionsReady(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setActionsReady(true);
    }, ACTIONS_AFTER_COPY_MS);
    return () => window.clearTimeout(timer);
  }, [copyGate]);

  return (
    <>
      <h1 className={`hero__title${copyGate ? " is-revealed" : ""}`}>
        {HEADLINE}
      </h1>
      <HeroActions revealed={actionsReady} />
    </>
  );
}
