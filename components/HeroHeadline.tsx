"use client";

import { useEffect, useState } from "react";
import { HeadlineMotion } from "@/components/HeadlineMotion";
import { HeroActions } from "@/components/HeroActions";
import {
  HERO_COPY_ATTR,
  HERO_COPY_FALLBACK_ATTR,
  setHeroFlag,
  whenHeroFlag,
} from "@/lib/heroSequence";

const HEADLINE =
  "Establish a Supply Chain From Scratch Tailored to Your Business";

const SUBTITLE =
  "No matter how small you start, I help turn your product ideas into a reliable and scalable supply chain in China built around your actual needs, budget, and growth.";

/**
 * Hero copy cascade, measured from the moment the copy gate opens.
 *
 * The beats are ordered on purpose — headline, then supporting line, then the
 * CTAs. Reading as a sequence rather than one block is what makes the reveal
 * feel composed; landing them together reads as a single hard cut. Each beat is
 * also what the next one counts from, so the chain stays in order if a value is
 * retuned.
 */
const TITLE_TO_SUBTITLE_MS = 300;
const SUBTITLE_TO_ACTIONS_MS = 340;
/** CTAs land after the subtitle has started moving. */
const ACTIONS_AFTER_COPY_MS = TITLE_TO_SUBTITLE_MS + SUBTITLE_TO_ACTIONS_MS;
/**
 * Fail-open clock for the hero copy.
 *
 * The copy normally waits on the hero video (the band has nothing but a beige
 * plate behind it until a frame paints). That wait had no ceiling: the video's
 * own hard-fail path only gives up after a 45s stall window, so a slow or
 * wedged download left the page with no headline and no CTAs for that long.
 * At this mark the copy is revealed anyway, together with a dark stage so the
 * white type still reads. It is a ceiling, not a schedule — whenever the video
 * arrives first, nothing here runs.
 */
const HERO_COPY_FALLBACK_MS = 2500;

export function HeroHeadline() {
  const [copyGate, setCopyGate] = useState(false);
  const [subtitleGate, setSubtitleGate] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);

  /* Hold copy until the video has popped in — or until the fallback clock runs out. */
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setHeroFlag(HERO_COPY_FALLBACK_ATTR);
      setCopyGate(true);
    }, HERO_COPY_FALLBACK_MS);
    void whenHeroFlag(HERO_COPY_ATTR, {
      timeoutMs: 0,
      signal: ac.signal,
    }).then(() => {
      if (cancelled) return;
      window.clearTimeout(fallback);
      setCopyGate(true);
    });
    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(fallback);
      /* The flag is ours — never leave a dark stage behind for the next route. */
      delete document.documentElement.dataset[HERO_COPY_FALLBACK_ATTR];
    };
  }, []);

  /*
   * Subtitle beat — the same effect 01 the headline runs, held back so it
   * follows rather than doubles it. Driven off `copyGate`, so it inherits the
   * video wait and the fail-open clock without knowing about either.
   */
  useEffect(() => {
    if (!copyGate) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        setSubtitleGate(true);
      },
      reduceMotion ? 0 : TITLE_TO_SUBTITLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [copyGate]);

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
        {/*
         * Effect 01 fires only once the video is playable (`copyGate`) — the
         * hero already owns that timing, so the engine must not self-trigger.
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
         * Same effect, one beat later — `subtitleGate` is the headline's own
         * gate plus the delay, so the two never fire in the same frame.
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
