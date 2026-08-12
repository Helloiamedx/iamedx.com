"use client";

import { useLenis } from "lenis/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClickSpark } from "@/components/ClickSpark";
import { HeroSegmentVideo } from "@/components/HeroSegmentVideo";
import { ProjectFallbackVideo } from "@/components/ProjectFallbackVideo";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import { getCaseCopySections } from "@/content/caseCopy";
import type { Project } from "@/content/projects";
import { asset } from "@/lib/assets";

type MediaItem =
  | { kind: "full"; src: string; alt: string; ratio: string }
  | {
      kind: "pair";
      left: { src: string; alt: string; ratio: string };
      right: { src: string; alt: string; ratio: string };
    }
  | {
      kind: "row";
      items: { src: string; alt: string; ratio: string }[];
    }
  | {
      kind: "video";
      primary: string;
      fallback?: string;
      alt: string;
      ratio: string;
    }
  | {
      kind: "still-video-pair";
      still: { src: string; alt: string; ratio: string };
      video: {
        primary: string;
        fallback?: string;
        alt: string;
        ratio: string;
      };
    }
  | {
      kind: "video-pair";
      left: { primary: string; fallback?: string; alt: string };
      right: { primary: string; fallback?: string; alt: string };
      ratio?: string;
    };

const PLACEHOLDER_MEDIA: MediaItem[] = [
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 1.jpg"),
    alt: "Demo hero still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 2.jpg"),
      alt: "Demo frame A",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 3.jpg"),
      alt: "Demo frame B",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 4.jpg"),
    alt: "Demo featured still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 5.jpg"),
      alt: "Demo frame C",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 6.jpg"),
      alt: "Demo frame D",
      ratio: "100%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 7.jpg"),
    alt: "Demo landscape still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 8.jpg"),
      alt: "Demo frame E",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 9.jpg"),
      alt: "Demo frame F",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 10.jpg"),
    alt: "Demo closing still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 11.jpg"),
      alt: "Demo frame G",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 12.jpg"),
      alt: "Demo frame H",
      ratio: "100%",
    },
  },
];

function readCssPx(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readHeaderOffset() {
  return readCssPx("--header-offset", 60);
}

function readShellGutter() {
  return readCssPx("--shell-gutter", 24);
}

/** Keep in sync with `--about-push-ms` in globals.css */
function readAboutPushMs() {
  if (typeof window === "undefined") return 900;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--about-push-ms")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 900;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Frame({
  src,
  alt,
  ratio,
}: {
  src: string;
  alt: string;
  ratio: string;
}) {
  return (
    <div className="project-case-demo__frame" style={{ paddingBottom: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="project-case-demo__img"
        draggable={false}
      />
    </div>
  );
}

/**
 * Living Pentagram-style case layout (mounted on `/projects/[slug]`):
 * video hero with left-stacked overlay, image weave, case panel toggle.
 */
type ProjectCaseDemoProps = {
  project: Project;
};

export function ProjectCaseDemo({ project }: ProjectCaseDemoProps) {
  const copySections = getCaseCopySections(project);
  const tags = project.tags.length > 0 ? project.tags : [project.involvement];
  const stillRatio = project.afterCoverStills?.ratio ?? "56.25%";
  const media: MediaItem[] = [
    ...(project.galleryLeadImage
      ? [
          {
            kind: "full" as const,
            src: project.galleryLeadImage,
            alt: project.title,
            ratio: "56.25%",
          },
        ]
      : []),
    ...(project.afterCoverStills
      ? project.afterCoverStills.items.length === 1
        ? [
            {
              kind: "full" as const,
              src: project.afterCoverStills.items[0].src,
              alt: project.afterCoverStills.items[0].alt,
              ratio: stillRatio,
            },
          ]
        : [
            {
              kind: "row" as const,
              items: project.afterCoverStills.items.map((item) => ({
                src: item.src,
                alt: item.alt,
                ratio: stillRatio,
              })),
            },
          ]
      : []),
    ...(project.afterCoverExtraRows?.flatMap((row) => {
      const ratio = row.ratio ?? "100%";
      if (row.items.length === 1) {
        return [
          {
            kind: "full" as const,
            src: row.items[0].src,
            alt: row.items[0].alt,
            ratio,
          },
        ];
      }
      return [
        {
          kind: "row" as const,
          items: row.items.map((item) => ({
            src: item.src,
            alt: item.alt,
            ratio,
          })),
        },
      ];
    }) ?? []),
    ...(project.afterCoverStillVideoPair
      ? [
          {
            kind: "still-video-pair" as const,
            still: {
              src: project.afterCoverStillVideoPair.still.src,
              alt: project.afterCoverStillVideoPair.still.alt,
              ratio: project.afterCoverStillVideoPair.ratio ?? "100%",
            },
            video: {
              primary: project.afterCoverStillVideoPair.video.primary,
              fallback: project.afterCoverStillVideoPair.video.fallback,
              alt: project.afterCoverStillVideoPair.video.alt,
              ratio: project.afterCoverStillVideoPair.ratio ?? "100%",
            },
          },
        ]
      : []),
    ...(project.afterCoverVideos?.length
      ? project.afterCoverVideos.map((clip) => ({
          kind: "video" as const,
          primary: clip.primary,
          fallback: clip.fallback,
          alt: clip.alt,
          ratio: clip.ratio ?? "56.25%",
        }))
      : project.afterCoverVideo
        ? [
            {
              kind: "video" as const,
              primary: project.afterCoverVideo.primary,
              fallback: project.afterCoverVideo.fallback,
              alt: project.afterCoverVideo.alt,
              ratio: project.afterCoverVideo.ratio ?? "56.25%",
            },
          ]
        : []),
    ...(() => {
      const stills = project.afterVideoStills ?? [];
      const row = project.afterVideoRow;
      const split = Math.min(
        Math.max(row?.afterIndex ?? stills.length, 0),
        stills.length,
      );
      const rowRatio = row?.ratio ?? "100%";
      const before = stills.slice(0, split).map((still) => ({
        kind: "full" as const,
        src: still.src,
        alt: still.alt,
        ratio: still.ratio ?? "56.25%",
      }));
      const mid = row
        ? [
            {
              kind: "row" as const,
              items: row.items.map((item) => ({
                src: item.src,
                alt: item.alt,
                ratio: rowRatio,
              })),
            },
          ]
        : [];
      const after = stills.slice(split).map((still) => ({
        kind: "full" as const,
        src: still.src,
        alt: still.alt,
        ratio: still.ratio ?? "56.25%",
      }));
      return [...before, ...mid, ...after];
    })(),
    /* Demo weave only when this project has no real after-cover gallery yet */
    ...(!(
      project.afterCoverStills ||
      project.afterCoverExtraRows?.length ||
      project.afterCoverStillVideoPair ||
      project.afterCoverVideo ||
      project.afterCoverVideos?.length ||
      project.afterVideoStills ||
      project.afterVideoRow ||
      project.beforeEndRow
    )
      ? PLACEHOLDER_MEDIA
      : []),
    ...(project.beforeEndRow
      ? [
          {
            kind: "row" as const,
            items: project.beforeEndRow.items.map((item) => ({
              src: item.src,
              alt: item.alt,
              ratio: project.beforeEndRow!.ratio ?? "100%",
            })),
          },
        ]
      : []),
    ...(project.endVideoPair
      ? [
          {
            kind: "video-pair" as const,
            left: project.endVideoPair.left,
            right: project.endVideoPair.right,
            ratio: "177.78%",
          },
        ]
      : []),
  ];

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnReady, setBtnReady] = useState(false);
  const [btnTop, setBtnTop] = useState(0);
  const panelId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const mediaStackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const isMobilePanel = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 799px)").matches;

  const scrollCopyToStart = (opts?: { smooth?: boolean }) => {
    const panel = panelRef.current;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = Boolean(opts?.smooth) && !reduceMotion;
    /* Mobile sheet scrolls itself — don’t move the page under it */
    if (isMobilePanel()) {
      panel?.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const body = bodyRef.current;
    if (!body) return;
    const offset = -(readHeaderOffset() + readShellGutter());
    const target = panel ?? body;
    const lenisNow = lenisRef.current;
    if (lenisNow) {
      if (smooth) {
        lenisNow.scrollTo(target, {
          offset,
          duration: readAboutPushMs() / 1000,
          easing: easeInOutCubic,
          onComplete: () => {
            /* Layout push may drift the target a few px — lock final spot */
            lenisNow.scrollTo(target, { offset, immediate: true });
          },
        });
      } else {
        lenisNow.scrollTo(target, { offset, immediate: true });
      }
    } else {
      const y =
        window.scrollY + target.getBoundingClientRect().top + offset;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: smooth ? "smooth" : "auto",
      });
    }
    panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Center-X, prefer ~30px above the viewport bottom.
   * Top: clamp to contentTop + inset (gap under first frames, then stop).
   * Bottom: rest in the pad under the last frame — never on the images,
   * never into Related / footer.
   * Hero: hide once media top clears the pin slot — no loose hysteresis
   * that re-shows a flash over the video.
   */
  useEffect(() => {
    const media = mediaStackRef.current;
    const body = bodyRef.current;
    if (!media) return;

    const sync = () => {
      const mediaRect = media.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      const mobile = isMobilePanel();
      const contentTop = mediaRect.top;
      /* When open on desktop, taller of media vs copy defines the box */
      const contentBottom =
        open && !mobile && panelRect && panelRect.height > 0
          ? Math.max(mediaRect.bottom, panelRect.bottom)
          : mediaRect.bottom;
      const viewH = window.visualViewport?.height ?? window.innerHeight;
      const pinBottom = 30;
      const btnH = pinRef.current?.offsetHeight || 44;
      const preferredTop = viewH - pinBottom - btnH;
      const inset = Math.max(readShellGutter(), 32);
      const minTop = contentTop + inset;
      const relatedEl = document.querySelector(".project-detail__related");
      const relatedTop =
        relatedEl?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const footerEl = document.querySelector(".site-footer");
      const footerTop =
        footerEl?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const bodyBottom =
        body?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
      /*
       * Hard stop in the gap under the last frame (body pad / Related),
       * not on the images — do not clamp to contentBottom.
       */
      const bandBottom = Math.min(relatedTop, footerTop, bodyBottom);
      const maxTop = bandBottom - inset - btnH;

      /* Mobile open sheet: park at preferred bottom so Close stays reachable */
      if (open && mobile) {
        setBtnReady(true);
        setBtnTop((prev) => (prev === preferredTop ? prev : preferredTop));
        return;
      }

      const hasRoom = maxTop >= minTop;
      /*
       * Visible only while media has entered enough that the docked top
       * (minTop) still sits at/above the preferred pin — not over the hero.
       */
      const nextReady =
        hasRoom &&
        contentTop < preferredTop &&
        contentBottom > inset &&
        minTop < viewH;
      const top = nextReady
        ? Math.min(Math.max(preferredTop, minTop), maxTop)
        : preferredTop;

      setBtnReady((prev) => (prev === nextReady ? prev : nextReady));
      setBtnTop((prev) => (prev === top ? prev : top));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(media);
    if (body) ro.observe(body);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [mounted, open]);

  /*
   * On open: ease page to copy line 1 (same duration as the panel push).
   * Disable scroll anchoring so width change doesn’t fight Lenis mid-tween.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    let rafInner = 0;
    const rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => {
        scrollCopyToStart({ smooth: true });
      });
    });
    const restoreId = window.setTimeout(() => {
      root.style.overflowAnchor = prevAnchor;
    }, readAboutPushMs() + 80);
    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.clearTimeout(restoreId);
      root.style.overflowAnchor = prevAnchor;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isMobilePanel()) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    panelRef.current?.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <div className={`project-case-demo${open ? " is-panel-open" : ""}`}>
      <section
        className="project-case-demo__hero"
        aria-label={project.title}
      >
        <div className="project-case-demo__hero-media" aria-hidden="true">
          {project.heroVideo ? (
            <HeroSegmentVideo
              className="project-case-demo__hero-video"
              src={project.heroVideo}
              startSeconds={project.heroVideoStart ?? 0}
              endSeconds={project.heroVideoEnd}
            />
          ) : project.heroYoutubeId ? (
            <YouTubeBackground
              className="project-case-demo__hero-video project-case-demo__hero-video--embed"
              videoId={project.heroYoutubeId}
              startSeconds={project.heroYoutubeStart ?? 0}
              endSeconds={project.heroYoutubeEnd}
            />
          ) : project.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="project-case-demo__hero-video"
              src={project.heroImage}
              alt=""
              draggable={false}
            />
          ) : (
            <ProtectedVideo
              className="project-case-demo__hero-video"
              src={asset("videos/home-hero-video.mp4")}
              preload="metadata"
            />
          )}
          <div className="project-case-demo__hero-scrim" />
        </div>

        <div className="project-case-demo__hero-copy">
          <h1 className="project-case-demo__title">{project.title}</h1>
          <p className="project-case-demo__summary">
            {project.tagline ?? project.summary}
          </p>
          <ul className="project-case-demo__tags">
            {tags.map((tag) => (
              <li key={tag}>
                <span className="project-case-demo__tag">{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {mounted
        ? createPortal(
            <div
              ref={pinRef}
              className={`project-case-demo__toggle-pin${btnReady ? " is-ready" : ""}`}
              style={{ top: btnTop }}
            >
              <ClickSpark>
                <div className="project-case-demo__toggle-glass">
                  {/* Adaptive contrast only — mix-blend difference vs pixels behind */}
                  <span
                    className="project-case-demo__toggle-contrast"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`project-case-demo__toggle${open ? " is-open" : ""}`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    tabIndex={btnReady ? 0 : -1}
                    onClick={toggleOpen}
                  >
                    <span>About The Project</span>
                    <span
                      className="project-case-demo__toggle-icon"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </div>
              </ClickSpark>
            </div>,
            document.body,
          )
        : null}

      <div ref={bodyRef} className="project-case-demo__body">
        <div className="project-case-demo__columns">
          <div className="project-case-demo__media-col">
            <div ref={mediaStackRef} className="project-case-demo__media-stack">
              {media.map((item, index) => {
                if (item.kind === "video-pair") {
                  return (
                    <div
                      key={`video-pair-${index}`}
                      className="project-case-demo__pair project-case-demo__pair--video"
                    >
                      <ProjectFallbackVideo
                        primarySrc={item.left.primary}
                        fallbackSrc={item.left.fallback}
                        alt={item.left.alt}
                        ratio={item.ratio}
                      />
                      <ProjectFallbackVideo
                        primarySrc={item.right.primary}
                        fallbackSrc={item.right.fallback}
                        alt={item.right.alt}
                        ratio={item.ratio}
                      />
                    </div>
                  );
                }
                if (item.kind === "still-video-pair") {
                  return (
                    <div
                      key={`still-video-${index}`}
                      className="project-case-demo__pair project-case-demo__pair--video"
                    >
                      <Frame {...item.still} />
                      <ProjectFallbackVideo
                        primarySrc={item.video.primary}
                        fallbackSrc={item.video.fallback}
                        alt={item.video.alt}
                        ratio={item.video.ratio}
                      />
                    </div>
                  );
                }
                if (item.kind === "video") {
                  return (
                    <div
                      key={`video-${index}`}
                      className="project-case-demo__full project-case-demo__full--video"
                    >
                      <ProjectFallbackVideo
                        primarySrc={item.primary}
                        fallbackSrc={item.fallback}
                        alt={item.alt}
                        ratio={item.ratio}
                      />
                    </div>
                  );
                }
                if (item.kind === "row") {
                  return (
                    <div
                      key={`row-${index}`}
                      className="project-case-demo__row"
                      style={{
                        gridTemplateColumns: `repeat(${item.items.length}, 1fr)`,
                      }}
                    >
                      {item.items.map((frame) => (
                        <Frame
                          key={frame.src}
                          src={frame.src}
                          alt={frame.alt}
                          ratio={frame.ratio}
                        />
                      ))}
                    </div>
                  );
                }
                if (item.kind === "pair") {
                  return (
                    <div key={`pair-${index}`} className="project-case-demo__pair">
                      <Frame {...item.left} />
                      <Frame {...item.right} />
                    </div>
                  );
                }
                return (
                  <div key={`full-${index}`} className="project-case-demo__full">
                    <Frame {...item} />
                  </div>
                );
              })}
            </div>
          </div>

          <aside
            ref={panelRef}
            id={panelId}
            className="project-case-demo__panel"
            aria-hidden={!open}
            {...(!open ? { inert: true } : {})}
          >
            <div ref={panelInnerRef} className="project-case-demo__panel-inner">
              <button
                type="button"
                className="project-case-demo__panel-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>

              <div className="project-case-demo__panel-copy">
                {copySections.map((section) => (
                  <section
                    key={section.id}
                    className="project-case-demo__panel-block"
                  >
                    <h3 className="project-case-demo__panel-title">
                      {section.label}
                    </h3>
                    {section.body.map((paragraph, index) => (
                      <p key={`${section.id}-${index}`}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
