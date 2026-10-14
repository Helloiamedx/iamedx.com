"use client";

import { useEffect, useState } from "react";
import { HeadlineMotion } from "@/components/HeadlineMotion";
import { HeroActions } from "@/components/HeroActions";

const HEADLINE =
  "Establish a Supply Chain From Scratch Tailored to Your Business";

const SUBTITLE =
  "No matter how small you start, I help turn your product ideas into a reliable and scalable supply chain in China built around your actual needs, budget, and growth.";

/**
 * Hero copy cascade — headline, then the supporting line, then the CTAs.
 *
 * Reading as a sequence rather than one block is what makes the reveal feel
 * composed; landing them together reads as a single hard cut. Each beat counts
 * from the one before it, so the chain stays in order if a value is retuned.
 */
const TITLE_TO_SUBTITLE_MS = 300;
const SUBTITLE_TO_ACTIONS_MS = 340;
/** CTAs land after the supporting line has started moving. */
const ACTIONS_AFTER_COPY_MS = TITLE_TO_SUBTITLE_MS + SUBTITLE_TO_ACTIONS_MS;

function prefersReducedMotion(): boolean {
  return Boolean(
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
}

/**
 * Hero copy and CTAs.
 *
 * The cascade starts one frame after mount and is not tied to anything else.
 * It used to wait on the hero clip's first frame — with a 6MB download on a
 * slow connection that meant no headline and no CTAs for seconds, so the wait
 * was capped by a fail-open clock. Neither is needed now: the hero sits on a
 * black stage (see `.hero`), so the copy is legible the moment it paints and
 * can run its own entrance.
 */
export function HeroHeadline() {
  const [copyGate, setCopyGate] = useState(false);
  const [subtitleGate, setSubtitleGate] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);

  /*
   * Beat 1 — the headline. Flipped from an animation frame, not synchronously,
   * so the first paint is the staged pose rather than a half-revealed one.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => setCopyGate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* Beat 2 — the supporting line, one step behind the headline. */
  useEffect(() => {
    if (!copyGate) return;
    const timer = window.setTimeout(
      () => setSubtitleGate(true),
      prefersReducedMotion() ? 0 : TITLE_TO_SUBTITLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [copyGate]);

  /* Beat 3 — the CTAs, after the supporting line is under way. */
  useEffect(() => {
    if (!copyGate) return;
    const timer = window.setTimeout(
      () => setActionsReady(true),
      prefersReducedMotion() ? 0 : ACTIONS_AFTER_COPY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [copyGate]);

  return (
    <>
      <div className={`hero__copy${copyGate ? " is-revealed" : ""}`}>
        {/*
         * Effect 01, `manual`: the hero owns when its copy plays (the next
         * frame), so the engine must not self-trigger off the viewport.
         */}
        <HeadlineMotion
          as="h1"
          effect="01"
          trigger="manual"
          play={copyGate}
          className="hero__title"
        >
          {HEADLINE}
        </HeadlineMotion>
        {/*
         * Same effect one beat later — `subtitleGate` is the headline's gate
         * plus the delay, so the two never fire in the same frame.
         */}
        <HeadlineMotion
          as="p"
          effect="01"
          trigger="manual"
          play={subtitleGate}
          className="hero__subtitle"
        >
          {SUBTITLE}
        </HeadlineMotion>
      </div>
      <HeroActions revealed={actionsReady} />
    </>
  );
}
