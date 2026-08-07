"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** viewBox from assets HELLOIAMEDX.svg */
const VB_W = 1904.71;
const VB_H = 435.43;

const LETTER_PATHS = [
  "M108.27,245.37h-37.66v190.06H0V0h70.61v185.94h37.66V0h70.02v435.43h-70.02v-190.06Z",
  "M204.18,0h136.51v57.67h-66.49v128.86h59.43v57.67h-59.43v133.57h66.49v57.67h-136.51V0Z",
  "M360.11,0h70.02v377.77h59.43v57.67h-129.45V0Z",
  "M508.97,0h70.02v377.77h59.43v57.67h-129.45V0Z",
  "M822.02,349.61c0,55.29-32.36,85.82-85.91,85.82s-86.5-30.53-86.5-85.82V85.82c0-55.29,32.36-85.82,86.5-85.82s85.91,30.53,85.91,85.82v263.79ZM736.11,386.59c11.18,0,15.89-10.59,15.89-28.24V77.08c0-17.65-4.71-28.24-15.89-28.24-11.77,0-16.48,10.59-16.48,28.24v281.27c0,17.65,4.71,28.24,16.48,28.24Z",
  "M846.14,0h70.61v435.43h-70.61V0Z",
  "M1065.62,0l52.37,435.43h-68.85l-7.65-94.74h-36.48l-7.65,94.74h-65.32L984.41,0h81.2ZM1009.72,283.03h27.07l-7.65-89.44-5.3-75.32h-1.77l-5.3,75.32-7.06,89.44Z",
  "M1219.78,435.43l-21.18-221.25-5.3-54.14h-1.18l.59,54.14v221.25h-59.43V0h85.91l21.77,222.42,4.71,48.84h1.77l4.12-48.84L1273.32,0h85.32v435.43h-62.96v-221.25l.59-54.14h-1.77l-4.12,54.14-22.36,221.25h-48.25Z",
  "M1384.53,0h136.51v57.67h-66.49v128.86h59.43v57.67h-59.43v133.57h66.49v57.67h-136.51V0Z",
  "M1712.87,353.64c0,52.37-30.6,81.79-80.61,81.79h-91.79V0h91.79C1682.27,0,1712.87,29.42,1712.87,82.38v271.26ZM1626.37,383.06c11.77,0,16.48-10.59,16.48-30.01V82.38c0-19.42-4.71-30.01-16.48-30.01h-15.3v330.69h15.3Z",
  "M1814.68,124.16L1832.92,0h65.32l-40.6,205.36,47.07,230.07h-70.61l-23.54-142.99h-1.18l-24.12,142.99h-66.49l47.07-230.07L1725.83,0h69.43l18.24,124.16h1.18Z",
] as const;

type FooterWordmarkProps = {
  /** LightRays (or similar) — punched out of letter shapes so beams stay on the black plate */
  rays?: ReactNode;
};

/**
 * Full-stage black plate; HELLOIAMEDX SVG paths punch holes at shell width
 * (menu L/R). Proportional scale — width === shell, height follows viewBox.
 *
 * Optional `rays` render in a blend group above the plate; letter shapes are
 * cut out (destination-out) so Safari can’t composite beams over the video glyphs.
 */
export function FooterWordmark({ rays }: FooterWordmarkProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({
    w: 0,
    h: 0,
    shellX: 0,
    shellW: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;

    const sync = () => {
      if (cancelled) return;
      const rootRect = root.getBoundingClientRect();
      const w = Math.max(Math.round(rootRect.width), 1);
      const h = Math.max(Math.round(rootRect.height), 1);
      const stage = root.closest<HTMLElement>(".site-footer__stage");
      const shell = stage?.querySelector<HTMLElement>(".site-footer__shell");
      const shellRect = shell?.getBoundingClientRect();
      const shellW =
        shellRect && shellRect.width > 1
          ? Math.round(shellRect.width)
          : w;
      const shellX =
        shellRect && shellRect.width > 1
          ? Math.round(shellRect.left - rootRect.left)
          : 0;
      const wordH = Math.round(shellW * (VB_H / VB_W));
      /* Video uses the exact HELLOIAMEDX box (shell width × glyph height at bottom) */
      if (stage) {
        stage.style.setProperty("--footer-wordmark-x", `${shellX}px`);
        stage.style.setProperty("--footer-wordmark-w", `${shellW}px`);
        stage.style.setProperty("--footer-wordmark-h", `${wordH}px`);
      }

      setBox((prev) =>
        prev.w === w &&
        prev.h === h &&
        prev.shellX === shellX &&
        prev.shellW === shellW
          ? prev
          : { w, h, shellX, shellW },
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    const shell = root
      .closest(".site-footer__stage")
      ?.querySelector(".site-footer__shell");
    if (shell) ro.observe(shell);
    window.addEventListener("resize", sync);

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  const { w, h, shellX, shellW } = box;
  const scale = shellW > 0 ? shellW / VB_W : 0;
  const wordH = Math.round(VB_H * scale);
  /* Flush to stage bottom — no gap under glyphs */
  const wordY = Math.max(0, h - wordH);
  const letterTransform = `translate(${shellX} ${wordY}) scale(${scale})`;
  const ready = w > 0 && h > 0 && scale > 0;

  const renderLetters = () => (
    <g fill="#000" transform={letterTransform}>
      {LETTER_PATHS.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </g>
  );

  return (
    <>
      <div className="footer-wordmark" ref={rootRef} aria-hidden="true">
        {ready ? (
          <svg
            className="footer-wordmark__svg"
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
          >
            <defs>
              <mask
                id="footer-helloiamedx-mask"
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={w}
                height={h}
              >
                <rect x={0} y={0} width={w} height={h} fill="#fff" />
                {renderLetters()}
              </mask>
            </defs>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#000"
              mask="url(#footer-helloiamedx-mask)"
            />
          </svg>
        ) : null}
      </div>

      {rays ? (
        <div className="site-footer__rays-stack" aria-hidden="true">
          <div className="site-footer__rays">{rays}</div>
          {ready ? (
            <svg
              className="footer-wordmark__rays-cutout"
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
            >
              {/* Punches letter holes so beams never sit on the video glyphs */}
              {renderLetters()}
            </svg>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
