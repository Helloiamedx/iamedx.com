"use client";

import { useEffect, useRef, useState } from "react";
import { servicesHeroLines, servicesRoleLabels } from "@/content/services-roles";
import "./ServicesRoleBurst.css";

const LINE_HOLD_MS = 6500;
const LINE_FADE_MS = 560;
/* On-screen instances — may exceed unique roles; labels repeat from the pool */
const LABEL_COUNT = 22;
/** Seconds for one Z pass (far → through the lens) */
const TRAVEL_SEC_MIN = 14;
const TRAVEL_SEC_MAX = 22;
/** World Z: far → almost through the perspective plane (huge, clipped by overflow) */
const Z_FAR = -720;
/* perspective is 720px — park just short so scale fills/overruns the frame */
const Z_NEAR = 640;
const BLUR_MAX_PX = 14;

type Particle = {
  el: HTMLSpanElement;
  labelIndex: number;
  /** Fixed screen anchors 0–1 — full field, not a center ring */
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

function easeInOutSoft(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
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

    const labels: HTMLSpanElement[] = [];
    const particles: Particle[] = [];

    /** Place across the whole frame; bias off the center headline */
    function pickAnchor(): { x: number; y: number } {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const x = rand(0.08, 0.92);
        const y = rand(0.12, 0.9);
        const dx = x - 0.5;
        const dy = y - 0.48;
        /* Reject only the tight copy core — keep corners / sides / edges */
        if (dx * dx + dy * dy > 0.035) return { x, y };
      }
      /* Fallback: push to a side/corner */
      const side = Math.floor(rand(0, 4));
      if (side === 0) return { x: rand(0.06, 0.22), y: rand(0.15, 0.85) };
      if (side === 1) return { x: rand(0.78, 0.94), y: rand(0.15, 0.85) };
      if (side === 2) return { x: rand(0.1, 0.9), y: rand(0.08, 0.22) };
      return { x: rand(0.1, 0.9), y: rand(0.78, 0.94) };
    }

    function seedParticle(p: Particle, initialT?: number) {
      const anchor = pickAnchor();
      p.x = anchor.x;
      p.y = anchor.y;
      p.t = initialT ?? 0;
      p.speed = 1 / rand(TRAVEL_SEC_MIN, TRAVEL_SEC_MAX);
      p.labelIndex = Math.floor(Math.random() * servicesRoleLabels.length);
      p.el.textContent = servicesRoleLabels[p.labelIndex] ?? "";
      p.el.style.left = `${(p.x * 100).toFixed(2)}%`;
      p.el.style.top = `${(p.y * 100).toFixed(2)}%`;
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
        x: 0.5,
        y: 0.5,
        t: 0,
        speed: 0.1,
      };
      seedParticle(p, rand(0.02, 0.9));
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
          seedParticle(p, 0);
        }

        const t = clamp(p.t);
        const depth = easeInOutSoft(t);
        /* Pure Z travel — perspective on the field does the “push toward me” scale */
        const z = Z_FAR + (Z_NEAR - Z_FAR) * depth;

        /* Far = soft; sharp as it nears — no intentional fade-out; overflow clips it */
        const sharpness = clamp((depth - 0.12) / 0.45);
        const blur = (1 - sharpness) * BLUR_MAX_PX;

        /* Only a short emerge from the distance; stay solid until off-screen */
        const emerge = t < 0.08 ? t / 0.08 : 1;
        const opacity = emerge * (0.45 + sharpness * 0.55);

        p.el.style.zIndex = String(Math.floor(depth * 100));
        /* XY fixed on the stage; only Z advances toward the camera */
        p.el.style.transform = `translate3d(-50%, -50%, ${z.toFixed(1)}px)`;
        p.el.style.filter = blur < 0.2 ? "none" : `blur(${blur.toFixed(2)}px)`;
        p.el.style.opacity = String(Math.max(0, opacity));
        p.el.style.color = `rgba(29, 29, 31, ${(0.4 + sharpness * 0.5).toFixed(3)})`;
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
                [0.14, 0.22],
                [0.86, 0.2],
                [0.12, 0.72],
                [0.88, 0.7],
                [0.22, 0.48],
                [0.78, 0.52],
                [0.5, 0.16],
                [0.5, 0.84],
              ] as const;
              const [x, y] = spots[index] ?? [0.5, 0.5];
              return (
                <span
                  key={label}
                  className="services-role-burst__label"
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    transform: `translate3d(-50%, -50%, ${-520 + index * 70}px)`,
                    filter: index < 2 ? `blur(${7 - index * 3}px)` : "none",
                    opacity: 0.32 + index * 0.05,
                    zIndex: index,
                  }}
                >
                  {label}
                </span>
              );
            })
          : null}
      </div>
      <div className="services-role-burst__veil" aria-hidden="true" />
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
