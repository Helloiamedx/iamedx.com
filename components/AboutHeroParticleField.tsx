"use client";

/**
 * WebGL2 particle field that condenses into the headline <em> word
 * (ported from bouayaben.com hero-field — SF Pro + site accent).
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec4 aSeed;
in vec4 aTgt;
uniform vec2 uRes;
uniform float uT;
uniform vec2 uMouse;
uniform float uDpr;
uniform vec4 uGuard;
uniform float uMorph;
uniform vec2 uTouch;
uniform float uTouchAmp;
out float vAlpha;
out float vAccent;
out float vSettle;
out float vShimmer;

vec3 psi(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.3 + t * 0.40) + cos(p.z * 1.7 - t * 0.30),
    sin(p.z * 1.1 - t * 0.35) + cos(p.x * 1.5 + t * 0.45),
    sin(p.x * 1.7 + t * 0.30) + cos(p.y * 1.2 - t * 0.40)
  );
}

vec3 flow(vec3 p, float t) {
  const float e = 0.12;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  float x = (psi(p + dy, t).z - psi(p - dy, t).z)
          - (psi(p + dz, t).y - psi(p - dz, t).y);
  float y = (psi(p + dz, t).x - psi(p - dz, t).x)
          - (psi(p + dx, t).z - psi(p - dx, t).z);
  float z = (psi(p + dx, t).y - psi(p - dx, t).y)
          - (psi(p + dy, t).x - psi(p - dy, t).x);
  return vec3(x, y, z) / (2.0 * e);
}

void main() {
  vec2 base = aSeed.xy * uRes;
  vec3 wp = vec3(base / uRes.y * 3.0, aSeed.w * 2.0);
  vec2 p = base + flow(wp, uT * 0.35).xy * (10.0 + 22.0 * aSeed.z) * uDpr;

  vec2 d = p - uMouse;
  float dist2 = dot(d, d) + 60.0;
  p += (d * inversesqrt(dist2)) * min(9000.0 * uDpr * uDpr / dist2, 46.0 * uDpr);

  float tD = distance(p, uTouch);
  vec2 tDir = (p - uTouch) / max(tD, 1e-3);
  p += tDir * (uTouchAmp * exp(-tD / (190.0 * uDpr)) *
               sin(tD * (0.045 / uDpr) - uT * 22.0) * 46.0 * uDpr);

  float local = clamp((uMorph - aTgt.w * 0.35) / 0.65, 0.0, 1.0);
  float e2 = local * local * (3.0 - 2.0 * local);
  float settle = e2 * aTgt.z;
  vSettle = settle;

  vec2 chord = aTgt.xy - p;
  float span = length(chord);
  vec2 dirc = chord / max(span, 1e-4);
  vec2 perp = vec2(-dirc.y, dirc.x);
  float side = fract(sin(dot(aSeed.zw, vec2(157.31, 93.17))) * 43758.5453) - 0.5;
  vec2 formed = mix(p, aTgt.xy, settle) + perp * (sin(3.14159265 * settle) * span * 0.2 * side);

  vec2 d2 = formed - uMouse;
  float dd2 = dot(d2, d2) + 80.0;
  formed += (d2 * inversesqrt(dd2)) * min(2600.0 * uDpr * uDpr / dd2, 15.0 * uDpr) * settle;

  vec2 g1 = uGuard.xy;
  vec2 g2 = uGuard.xy + uGuard.zw;
  float feather = 44.0 * uDpr;
  vec2 s = smoothstep(g1 - feather, g1 + feather, formed) *
           (1.0 - smoothstep(g2 - feather, g2 + feather, formed));
  vAlpha = mix(mix(1.0, 0.14, s.x * s.y), 1.0, settle);

  vAccent = step(0.94, fract(aSeed.z * 7.31 + aSeed.w * 3.17));
  vShimmer = uTouchAmp * exp(-distance(formed, uTouch) / (110.0 * uDpr));

  vec2 clip = (formed / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  float swell = sin(3.14159265 * settle);
  gl_PointSize = ((0.8 + 1.3 * aSeed.z) + swell * 0.9 + settle * 0.9 +
                  vShimmer * settle * 1.3) * uDpr;
}`;

const FRAG = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vAccent;
in float vSettle;
in float vShimmer;
uniform vec3 uInk;
uniform vec3 uAccentCol;
uniform float uFade;
out vec4 outColor;

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float m = 1.0 - smoothstep(0.5, 1.0, dot(c, c));
  vec3 col = mix(mix(uInk, uAccentCol, vAccent), uAccentCol,
                 smoothstep(0.5, 0.95, vSettle));
  /* No ambient field — only particles that settle into the glyph */
  float a = m * uFade *
    (mix(0.0, 0.85, vSettle) + sin(3.14159265 * vSettle) * 0.18 +
     vShimmer * 0.45 * vSettle);
  outColor = vec4(col * a, a);
}`;

function parseHexColor(raw: string): [number, number, number] {
  const hex = raw.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const n = Number.parseInt(full, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

function particleCount() {
  if (window.matchMedia("(max-width: 720px)").matches) return 24_000;
  return (navigator.hardwareConcurrency || 4) >= 8 ? 90_000 : 48_000;
}

type MouseState = {
  x: number;
  y: number;
  tx: number;
  ty: number;
};

export function AboutHeroParticleField({
  startMorph = false,
}: {
  startMorph?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beginMorphRef = useRef<(() => void) | null>(null);
  const morphStartedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    function compile(type: number, src: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn("about hero-field shader:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const count = particleCount();
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();

    const seedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const aSeed = gl.getAttribLocation(program, "aSeed");
    gl.enableVertexAttribArray(aSeed);
    gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0);

    const tgtBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tgtBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(count * 4), gl.DYNAMIC_DRAW);
    const aTgt = gl.getAttribLocation(program, "aTgt");
    gl.enableVertexAttribArray(aTgt);
    gl.vertexAttribPointer(aTgt, 4, gl.FLOAT, false, 0, 0);

    const uni = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uni("uRes");
    const uT = uni("uT");
    const uMouse = uni("uMouse");
    const uGuard = uni("uGuard");
    const uFade = uni("uFade");
    const uMorph = uni("uMorph");
    const uTouch = uni("uTouch");
    const uTouchAmp = uni("uTouchAmp");
    const uDpr = uni("uDpr");

    const ink = parseHexColor(
      getComputedStyle(document.documentElement).getPropertyValue("--about-ink") ||
        "#f5f0eb",
    );
    const accent = parseHexColor(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--about-accent",
      ) || "#ff5c28",
    );
    gl.uniform3fv(uni("uInk"), ink);
    gl.uniform3fv(uni("uAccentCol"), accent);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    gl.uniform1f(uDpr, dpr);

    let emEl: HTMLElement | null = null;
    let morphStart = 0;
    let raf = 0;
    let running = false;
    let fade = 0;
    const t0 = performance.now();

    const mouse: MouseState = { x: -9e4, y: -9e4, tx: -9e4, ty: -9e4 };
    let mouseBound = false;

    function bindMouse() {
      if (mouseBound) return;
      mouseBound = true;
      window.addEventListener(
        "pointermove",
        (e) => {
          mouse.tx = e.clientX;
          mouse.ty = e.clientY;
        },
        { passive: true },
      );
      window.addEventListener(
        "pointerdown",
        (e) => {
          mouse.tx = e.clientX;
          mouse.ty = e.clientY;
          if (e.pointerType === "touch") {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
          }
        },
        { passive: true },
      );
      const clearTouch = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        mouse.tx = -9e4;
        mouse.ty = -9e4;
        mouse.x = -9e4;
        mouse.y = -9e4;
      };
      window.addEventListener("pointerup", clearTouch, { passive: true });
      window.addEventListener("pointercancel", clearTouch, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => {
        mouse.tx = -9e4;
        mouse.ty = -9e4;
      });
      gsap.ticker.add(() => {
        mouse.x += (mouse.tx - mouse.x) * 0.22;
        mouse.y += (mouse.ty - mouse.y) * 0.22;
      });
    }

    function emBox() {
      const em = host!.querySelector<HTMLElement>(
        ".about-boua__hero-headline em",
      );
      if (!em) return null;
      const hostRect = host!.getBoundingClientRect();
      const rect = em.getBoundingClientRect();
      return {
        em,
        x: rect.left - hostRect.left,
        y: rect.top - hostRect.top,
        w: rect.width,
        h: rect.height,
      };
    }

    function resize() {
      const hostRect = host!.getBoundingClientRect();
      let h = hostRect.height;
      const box = emBox();
      if (box) h = Math.max(h, box.y + box.h + 60);
      canvas!.style.height = `${h}px`;
      canvas!.width = Math.max(1, Math.round(hostRect.width * dpr));
      canvas!.height = Math.max(1, Math.round(h * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);

      const headline = host!.querySelector<HTMLElement>(
        ".about-boua__hero-headline",
      );
      if (headline) {
        const hr = headline.getBoundingClientRect();
        gl!.uniform4f(
          uGuard,
          (hr.left - hostRect.left) * dpr,
          (hr.top - hostRect.top) * dpr,
          hr.width * dpr,
          hr.height * dpr,
        );
      }
    }

    function sampleGlyph() {
      const box = emBox();
      if (!box || box.w < 1 || box.h < 1) return null;
      const { em } = box;
      const style = getComputedStyle(em);
      const text = (em.textContent ?? "").trim();
      if (!text) return null;
      const fontSize = Number.parseFloat(style.fontSize);
      if (!Number.isFinite(fontSize) || fontSize < 1) return null;

      const off = document.createElement("canvas");
      const ctx = off.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;

      const applyFont = () => {
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
        try {
          ctx.letterSpacing =
            style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
        } catch {
          /* letterSpacing not always writable */
        }
      };
      applyFont();
      const pad = Math.ceil(fontSize * 0.6);
      const textW = ctx.measureText(text).width;
      if (!Number.isFinite(textW) || textW < 1) return null;

      off.width = Math.max(1, Math.ceil(textW + pad * 2));
      off.height = Math.max(1, Math.ceil(fontSize * 1.7));
      applyFont();
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, pad, Math.round(fontSize * 1.15));

      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, off.width, off.height).data;
      } catch {
        return null;
      }

      const pts: [number, number][] = [];
      let minX = 1e9;
      let minY = 1e9;
      let maxX = -1e9;
      let maxY = -1e9;
      for (let y = 0; y < off.height; y++) {
        for (let x = 0; x < off.width; x++) {
          if (data[(y * off.width + x) * 4 + 3]! > 128) {
            const px = x + Math.random();
            const py = y + Math.random();
            pts.push([px, py]);
            if (px < minX) minX = px;
            if (py < minY) minY = py;
            if (px > maxX) maxX = px;
            if (py > maxY) maxY = py;
          }
        }
      }
      if (!pts.length) return null;
      return {
        em,
        pts,
        bc: [(minX + maxX) / 2, (minY + maxY) / 2] as [number, number],
        ec: [box.x + box.w / 2, box.y + box.h / 2] as [number, number],
      };
    }

    function uploadTargets() {
      const sample = sampleGlyph();
      if (!sample) return;
      emEl = sample.em;
      for (let i = sample.pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = sample.pts[i]!;
        sample.pts[i] = sample.pts[j]!;
        sample.pts[j] = tmp;
      }
      const granted = Math.min(sample.pts.length, Math.floor(count * 0.5));
      const buf = new Float32Array(count * 4);
      for (let i = 0; i < granted; i++) {
        const pt = sample.pts[i]!;
        buf[i * 4] = (sample.ec[0] + (pt[0] - sample.bc[0])) * dpr;
        buf[i * 4 + 1] = (sample.ec[1] + (pt[1] - sample.bc[1])) * dpr;
        buf[i * 4 + 2] = 1;
        buf[i * 4 + 3] = Math.random();
      }
      gl!.bindBuffer(gl!.ARRAY_BUFFER, tgtBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, buf, gl!.DYNAMIC_DRAW);
    }

    const touch = { x: -9e4, y: -9e4, amp: 0 };
    const onTouch = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const rect = canvas!.getBoundingClientRect();
      touch.x = (e.clientX - rect.left) * dpr;
      touch.y = (e.clientY - rect.top) * dpr;
      touch.amp = e.type === "pointerdown" ? 1 : Math.min(1, touch.amp + 0.3);
    };
    window.addEventListener("pointerdown", onTouch, { passive: true });
    window.addEventListener("pointermove", onTouch, { passive: true });

    bindMouse();
    resize();

    function beginMorph() {
      if (morphStartedRef.current) return;
      // Wait two frames so flex-centered / width layout is final before sampling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (morphStartedRef.current) return;
          resize();
          uploadTargets();
          const em =
            emEl ??
            host!.querySelector<HTMLElement>(".about-boua__hero-headline em");
          if (!emEl) {
            if (em) em.style.opacity = "1";
            return;
          }
          morphStartedRef.current = true;
          morphStart = performance.now();
          emEl.style.transition = "opacity 0.7s ease";
          emEl.style.opacity = "0";
        });
      });
    }

    beginMorphRef.current = beginMorph;

    function frame(now: number) {
      raf = 0;
      if (!running) return;
      fade = Math.min(1, fade + 0.016);
      const rect = canvas!.getBoundingClientRect();
      const morph = morphStart
        ? Math.min(1, (now - morphStart) / 1900)
        : 0;
      touch.amp *= 0.965;
      gl!.uniform1f(uT, (now - t0) / 1000);
      gl!.uniform2f(uMouse, (mouse.x - rect.left) * dpr, (mouse.y - rect.top) * dpr);
      gl!.uniform2f(uTouch, touch.x, touch.y);
      gl!.uniform1f(uTouchAmp, touch.amp);
      gl!.uniform1f(uFade, fade * fade);
      gl!.uniform1f(uMorph, morph);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.POINTS, 0, count);
      raf = requestAnimationFrame(frame);
    }

    function setRunning(next: boolean) {
      running = next;
      if (next && !raf) raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      ([entry]) => setRunning(Boolean(entry?.isIntersecting) && !document.hidden),
      { threshold: 0 },
    );
    io.observe(host);
    setRunning(!document.hidden);

    const onVisibility = () => {
      const visible = canvas.getBoundingClientRect().top < window.innerHeight &&
        canvas.getBoundingClientRect().bottom > 0;
      setRunning(!document.hidden && visible);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const remesh = () => {
      const hostRect = host.getBoundingClientRect();
      if (hostRect.width < 1 || hostRect.height < 1) return;
      resize();
      if (emEl || morphStartedRef.current) uploadTargets();
    };
    const onResize = () => remesh();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => remesh());
    ro.observe(host);
    const headlineEl = host.querySelector<HTMLElement>(
      ".about-boua__hero-headline",
    );
    if (headlineEl) ro.observe(headlineEl);

    const onLost = (e: Event) => {
      e.preventDefault();
      setRunning(false);
      canvas!.style.opacity = "0";
      if (emEl) emEl.style.opacity = "";
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      setRunning(false);
      if (raf) cancelAnimationFrame(raf);
      beginMorphRef.current = null;
      morphStartedRef.current = false;
      if (emEl) {
        emEl.style.transition = "";
        emEl.style.opacity = "";
      }
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onTouch);
      window.removeEventListener("pointermove", onTouch);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  useEffect(() => {
    if (!startMorph) return;
    const run = () => beginMorphRef.current?.();
    if (document.fonts?.ready) {
      void document.fonts.ready.then(run).catch(run);
    } else {
      run();
    }
  }, [startMorph]);

  return (
    <canvas
      ref={canvasRef}
      className="about-boua__hero-field"
      aria-hidden="true"
    />
  );
}
