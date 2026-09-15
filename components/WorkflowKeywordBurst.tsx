"use client";

import { useEffect, useRef } from "react";

// Perspective projection preserves the original far-to-near fly-through.
// Spatially separated origins and staggered depth keep the field legible.
const ORIGINS = [[0.28, 0.24], [0.53, 0.2], [0.75, 0.29],
  [0.22, 0.51], [0.51, 0.49], [0.78, 0.55],
  [0.27, 0.77], [0.51, 0.82], [0.73, 0.76]];
const PHASES = [0.64, 0.08, 0.42, 0.2, 0.76, 0.97, 0.86, 0.53, 0.31];
const TRAVEL_SEC = 14;
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function shuffle<T>(list: T[]) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = list[i];
    list[i] = list[j]!;
    list[j] = swap!;
  }
  return list;
}

function pickWord(pool: readonly string[], active: Set<string>) {
  const free = pool.filter((word) => !active.has(word));
  const source = free.length ? free : pool;
  return source[Math.floor(Math.random() * source.length)] ?? pool[0] ?? "";
}

export function WorkflowKeywordBurst({ labels }: { labels: readonly string[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || labels.length === 0) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const words = shuffle([...new Set(labels)]);
    const count = Math.min(ORIGINS.length, words.length);
    let width = field.clientWidth;
    let height = field.clientHeight;
    let disposed = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    const particles = Array.from({ length: count }, (_, i) => {
      const el = document.createElement("span");
      el.className = "svc-workflow__keyword";
      el.textContent = words[i];
      field.appendChild(el);
      return { el, t: PHASES[i], width: el.offsetWidth };
    });

    function paint() {
      particles.forEach((p, i) => {
        const t = p.t;
        const reduced = motion.matches;
        // Same 720px lens and -420 → 520 depth range as the original.
        const scale = reduced ? 1 : 720 / (720 - lerp(-420, 520, t));
        const [ox, oy] = ORIGINS[i];
        const x = reduced ? width * 0.5 : width * (0.5 + (ox - 0.5) * scale);
        const y = reduced
          ? height * (0.12 + i * 0.76 / Math.max(1, count - 1))
          : height * (0.5 + (oy - 0.5) * scale);
        // Fade at the edge of the window before a large foreground word clips.
        const edge = Math.min(x - p.width * scale / 2, width - x - p.width * scale / 2,
          y - 8 * scale, height - y - 8 * scale);
        const opacity = reduced ? 0.72 : smooth(t / 0.1)
          * (1 - smooth((t - 0.86) / 0.14))
          * lerp(0.35, 1, smooth(t / 0.32)) * smooth(edge / (width * 0.055));
        const blur = reduced ? 0 : 7 * (1 - smooth(t / 0.3));
        p.el.style.zIndex = String(Math.round(t * 100));
        // Keep layout coordinates fixed: position and depth share one compositor transform.
        p.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        p.el.style.opacity = opacity.toFixed(4);
        // Keep the same filter pipeline through the sharp phase; avoid a raster switch.
        p.el.style.filter = `blur(${blur}px)`;
      });
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      particles.forEach((p) => {
        p.t += dt / TRAVEL_SEC;
        if (p.t >= 1) {
          p.t %= 1;
          const active = new Set(
            particles
              .filter((other) => other !== p)
              .map((other) => other.el.textContent ?? ""),
          );
          p.el.textContent = pickWord(words, active);
          p.width = p.el.offsetWidth;
        }
      });
      paint();
      raf = requestAnimationFrame(frame);
    }

    function syncPlayback() {
      cancelAnimationFrame(raf);
      paint();
      if (!motion.matches && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    function measure() {
      if (disposed) return;
      width = field!.clientWidth;
      height = field!.clientHeight;
      particles.forEach((p) => { p.width = p.el.offsetWidth; });
      paint();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(field);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    intersection.observe(field);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    document.fonts.addEventListener("loadingdone", measure);
    void document.fonts.ready.then(measure);
    paint();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      document.fonts.removeEventListener("loadingdone", measure);
      particles.forEach(({ el }) => el.remove());
    };
  }, [labels]);

  return <div ref={fieldRef} className="svc-workflow__keyword-burst" aria-hidden="true" />;
}
