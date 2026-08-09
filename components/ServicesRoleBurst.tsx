"use client";

import { useEffect, useRef, useState } from "react";
import { servicesHeroLines, servicesRoleLabels } from "@/content/services-roles";
import "./ServicesRoleBurst.css";

const LINE_HOLD_MS = 6500;
const LINE_FADE_MS = 560;

/**
 * Model (keep this simple — stacked patches made the effect worse):
 *
 * 1. Motion is ONLY translateZ. Perspective does the grow. No CSS scale, no
 *    XY drift, no filter:blur (blur + Z upscale = soft type at the end).
 * 2. Z stops well short of the perspective plane (720px) so glyphs never get
 *    massively upscaled. Edge labels clip via overflow; center ones finish
 *    the pass and recycle.
 * 3. Time: one shared travel speed + evenly spaced phases → steady field,
 *    not waves / empty pockets.
 * 4. Space: fixed zones + LRU (and avoid immediate same-zone reuse).
 */

const LABEL_COUNT = 10;
/** Slightly brisker pass */
const TRAVEL_SEC = 15;
/**
 * perspective is 720px. Push far enough that type overruns the frame and
 * overflow clips it — recycle only after that, not while still fully on-screen.
 */
const Z_FAR = -480;
const Z_NEAR = 580;

const ZONES = [
  { x0: 0.08, x1: 0.3, y0: 0.1, y1: 0.34 }, /* TL */
  { x0: 0.36, x1: 0.64, y0: 0.08, y1: 0.28 }, /* TC */
  { x0: 0.7, x1: 0.92, y0: 0.1, y1: 0.34 }, /* TR */
  { x0: 0.06, x1: 0.28, y0: 0.38, y1: 0.62 }, /* ML */
  { x0: 0.72, x1: 0.94, y0: 0.38, y1: 0.62 }, /* MR */
  { x0: 0.08, x1: 0.3, y0: 0.66, y1: 0.9 }, /* BL */
  { x0: 0.36, x1: 0.64, y0: 0.72, y1: 0.92 }, /* BC */
  { x0: 0.7, x1: 0.92, y0: 0.66, y1: 0.9 }, /* BR */
  { x0: 0.34, x1: 0.66, y0: 0.3, y1: 0.4 }, /* above copy */
  { x0: 0.34, x1: 0.66, y0: 0.56, y1: 0.68 }, /* below copy */
] as const;

type Particle = {
  el: HTMLSpanElement;
  labelIndex: number;
  zone: number;
  x: number;
  y: number;
  t: number;
  speed: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ServicesRoleBurst() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [lineVisible, setLineVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || servicesHeroLines.length < 2) return;

    let fadeTimer: number | undefined;
    const cycle = window.setInterval(() => {
      setLineVisible(false);
      fadeTimer = window.setTimeout(() => {
        setLineIndex((i) => (i + 1) % servicesHeroLines.length);
        setLineVisible(true);
      }, LINE_FADE_MS);
    }, LINE_HOLD_MS);

    return () => {
      window.clearInterval(cycle);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [reduced]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || reduced || servicesRoleLabels.length === 0) return;

    /*
     * Mobile Safari often flattens translateZ even with careful CSS. On coarse
     * pointers, drive size with scale as well so the field still “runs”.
     */
    const flatMotion =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 700px)").matches;

    const labels: HTMLSpanElement[] = [];
    const particles: Particle[] = [];
    const zoneStamp = ZONES.map(() => 0);
    let stamp = 0;

    function sampleInZone(zoneIndex: number): { x: number; y: number } {
      const zone = ZONES[zoneIndex] ?? ZONES[0];
      return { x: rand(zone.x0, zone.x1), y: rand(zone.y0, zone.y1) };
    }

    function pickZone(avoid?: number): number {
      let best = 0;
      let bestScore = Number.POSITIVE_INFINITY;

      for (let i = 0; i < ZONES.length; i += 1) {
        if (avoid !== undefined && i === avoid) continue;
        let live = 0;
        for (const p of particles) {
          if (p.zone === i) live += 1;
        }
        const score = zoneStamp[i]! + live * 100;
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }

      zoneStamp[best] = ++stamp;
      return best;
    }

    function applyPose(p: Particle, t: number) {
      const z = lerp(Z_FAR, Z_NEAR, t);
      /* Readable early; stay solid while still advancing — no mid-trip freeze */
      const clarity = clamp(t / 0.18);
      const emerge = t < 0.05 ? t / 0.05 : 1;
      const opacity = emerge * (0.5 + clarity * 0.5);
      /* Cap at 1 so glyphs stay sharp if Z is flattened and scale carries the grow */
      const scale = flatMotion ? lerp(0.4, 1, t) : 1;

      p.el.style.zIndex = String(Math.floor(t * 100));
      p.el.style.transform = flatMotion
        ? `translate3d(-50%, -50%, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`
        : `translate3d(-50%, -50%, ${z.toFixed(1)}px)`;
      p.el.style.opacity = String(opacity);
      /* Apple secondary gray (#a1a1a6) — mid gray, not near-white */
      p.el.style.color = `rgba(161, 161, 166, ${(0.55 + clarity * 0.4).toFixed(3)})`;
    }

    function seedParticle(p: Particle, opts?: { t?: number; zone?: number }) {
      const zone =
        opts?.zone ?? pickZone(p.zone >= 0 ? p.zone : undefined);
      const anchor = sampleInZone(zone);
      p.zone = zone;
      p.x = anchor.x;
      p.y = anchor.y;
      p.t = opts?.t ?? 0;
      p.speed = 1 / TRAVEL_SEC;
      p.labelIndex = Math.floor(Math.random() * servicesRoleLabels.length);
      p.el.textContent = servicesRoleLabels[p.labelIndex] ?? "";
      p.el.style.left = `${(p.x * 100).toFixed(2)}%`;
      p.el.style.top = `${(p.y * 100).toFixed(2)}%`;
      applyPose(p, p.t);
    }

    for (let i = 0; i < LABEL_COUNT; i += 1) {
      const el = document.createElement("span");
      el.className = "services-role-burst__label";
      el.setAttribute("aria-hidden", "true");
      field.appendChild(el);
      labels.push(el);

      const p: Particle = {
        el,
        labelIndex: 0,
        zone: -1,
        x: 0.5,
        y: 0.5,
        t: 0,
        speed: 1 / TRAVEL_SEC,
      };

      const zone = i % ZONES.length;
      seedParticle(p, { zone, t: (i + 0.5) / LABEL_COUNT });
      zoneStamp[zone] = ++stamp;
      particles.push(p);
    }

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      for (const p of particles) {
        p.t += p.speed * dt;
        if (p.t >= 1) {
          seedParticle(p, { t: 0 });
          continue;
        }
        applyPose(p, clamp(p.t));
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      labels.forEach((el) => el.remove());
    };
  }, [reduced]);

  return (
    <section className="services-role-burst" aria-label="Services">
      <div ref={fieldRef} className="services-role-burst__field" aria-hidden="true">
        {reduced
          ? servicesRoleLabels.slice(0, 8).map((label, index) => {
              const spots = [
                [0.5, 0.18],
                [0.5, 0.82],
                [0.48, 0.34],
                [0.52, 0.62],
                [0.14, 0.22],
                [0.86, 0.2],
                [0.12, 0.72],
                [0.88, 0.7],
              ] as const;
              const [x, y] = spots[index] ?? [0.5, 0.5];
              return (
                <span
                  key={label}
                  className="services-role-burst__label"
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    transform: `translate3d(-50%, -50%, ${lerp(Z_FAR, 0, (index + 1) / 8)}px)`,
                    opacity: 0.35 + index * 0.05,
                    zIndex: index,
                  }}
                >
                  {label}
                </span>
              );
            })
          : null}
      </div>
      <div className="services-role-burst__copy">
        <p
          className={`services-role-burst__line${lineVisible ? " is-visible" : ""}`}
          aria-live="polite"
        >
          {servicesHeroLines[lineIndex]}
        </p>
      </div>
    </section>
  );
}
