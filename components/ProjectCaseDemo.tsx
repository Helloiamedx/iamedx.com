"use client";

import { useLenis } from "lenis/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HeroSegmentVideo } from "@/components/HeroSegmentVideo";
import { OriginButton } from "@/components/ui/origin-button";
import { ProjectFallbackVideo } from "@/components/ProjectFallbackVideo";
import { SyncedVideoPair } from "@/components/SyncedVideoPair";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import { getCaseCopySections } from "@/content/caseCopy";
import {
  getProjectCollaborators,
  getProjectSpecialThanks,
} from "@/content/projectCredits";
import type { Project } from "@/content/projects";
import { ProjectCardTags } from "@/components/ProjectCardTags";
import { asset } from "@/lib/assets";

type StillFrame = {
  src: string;
  alt: string;
  /** CSS padding-bottom ratio; omit for native asset dimensions */
  ratio?: string;
};

type MediaItem =
  | { kind: "full"; src: string; alt: string; ratio?: string }
  | {
      kind: "pair";
      left: StillFrame;
      right: StillFrame;
    }
  | {
      kind: "row";
      items: StillFrame[];
      columnTemplate?: string;
      equalRowHeight?: boolean;
      rowAspect?: string;
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
      still: StillFrame;
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
  fillCell = false,
}: {
  src: string;
  alt: string;
  ratio?: string;
  fillCell?: boolean;
}) {
  const useNative = !fillCell && !ratio;

  if (useNative) {
    return (
      <div className="project-case-demo__frame project-case-demo__frame--native">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="project-case-demo__img project-case-demo__img--native"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={
        fillCell
          ? "project-case-demo__frame project-case-demo__frame--fill"
          : "project-case-demo__frame"
      }
      style={fillCell ? undefined : { paddingBottom: ratio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={
          fillCell
            ? "project-case-demo__img project-case-demo__img--contain"
            : "project-case-demo__img"
        }
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

function buildCaseMedia(project: Project): MediaItem[] {
  const media: MediaItem[] = [];
  const stillRowRatio = project.afterCoverStills?.ratio;

  const pushAfterCoverProcessVideo = () => {
    if (project.afterCoverVideos?.length) {
      for (const clip of project.afterCoverVideos) {
        media.push({
          kind: "video",
          primary: clip.primary,
          fallback: clip.fallback,
          alt: clip.alt,
          ratio: clip.ratio ?? "56.25%",
        });
      }
    } else if (project.afterCoverVideo) {
      media.push({
        kind: "video",
        primary: project.afterCoverVideo.primary,
        fallback: project.afterCoverVideo.fallback,
        alt: project.afterCoverVideo.alt,
        ratio: project.afterCoverVideo.ratio ?? "56.25%",
      });
    }
  };

  if (project.galleryLeadImage) {
    media.push({
      kind: "full",
      src: project.galleryLeadImage,
      alt: project.title,
      ratio: project.galleryLeadRatio,
    });
  }

  if (project.afterCoverVideoFirst) {
    pushAfterCoverProcessVideo();
  }

  if (project.afterCoverStills) {
    if (project.afterCoverStills.items.length === 1) {
      const item = project.afterCoverStills.items[0];
      media.push({
        kind: "full",
        src: item.src,
        alt: item.alt,
        ratio: item.ratio ?? stillRowRatio,
      });
    } else {
      media.push({
        kind: "row",
        items: project.afterCoverStills.items.map((item) => ({
          src: item.src,
          alt: item.alt,
          ratio: item.ratio ?? stillRowRatio,
        })),
      });
    }
  }

  if (project.afterCoverVideoPair) {
    media.push({
      kind: "video-pair",
      left: project.afterCoverVideoPair.left,
      right: project.afterCoverVideoPair.right,
      ratio: project.afterCoverVideoPair.ratio ?? "100%",
    });
  }

  const pushAfterCoverExtraRows = () => {
    for (const row of project.afterCoverExtraRows ?? []) {
      const rowRatio = row.ratio;
      if (row.items.length === 1) {
        const item = row.items[0];
        media.push({
          kind: "full",
          src: item.src,
          alt: item.alt,
          ratio: item.ratio ?? rowRatio,
        });
      } else {
        const columnTemplate = row.columnWidths
          ? row.columnWidths.map((w) => `${w}fr`).join(" ")
          : undefined;
        media.push({
          kind: "row",
          items: row.items.map((item) => ({
            src: item.src,
            alt: item.alt,
            ratio: item.ratio ?? rowRatio,
          })),
          columnTemplate,
          equalRowHeight: row.equalRowHeight,
          rowAspect: row.rowAspect,
        });
      }
    }
  };

  const pushAfterCoverStillVideoPair = () => {
    if (!project.afterCoverStillVideoPair) return;
    const pair = project.afterCoverStillVideoPair;
    const ratio = pair.ratio ?? "100%";
    media.push({
      kind: "still-video-pair",
      still: {
        src: pair.still.src,
        alt: pair.still.alt,
        ratio,
      },
      video: {
        primary: pair.video.primary,
        fallback: pair.video.fallback,
        alt: pair.video.alt,
        ratio,
      },
    });
  };

  if (project.afterCoverStillVideoBeforeExtraRows) {
    pushAfterCoverStillVideoPair();
    pushAfterCoverExtraRows();
  } else {
    pushAfterCoverExtraRows();
    pushAfterCoverStillVideoPair();
  }

  if (!project.afterCoverVideoFirst) {
    pushAfterCoverProcessVideo();
  }

  const stills = project.afterVideoStills ?? [];
  const afterVideoRow = project.afterVideoRow;
  const split = Math.min(
    Math.max(afterVideoRow?.afterIndex ?? stills.length, 0),
    stills.length,
  );
  const rowRatio = afterVideoRow?.ratio;

  for (const still of stills.slice(0, split)) {
    media.push({
      kind: "full",
      src: still.src,
      alt: still.alt,
      ratio: still.ratio,
    });
  }
  if (afterVideoRow) {
    media.push({
      kind: "row",
      items: afterVideoRow.items.map((item) => ({
        src: item.src,
        alt: item.alt,
        ratio: item.ratio ?? rowRatio,
      })),
    });
  }

  if (project.beforeEndRow) {
    const beforeEndRatio = project.beforeEndRow.ratio;
    media.push({
      kind: "row",
      items: project.beforeEndRow.items.map((item) => ({
        src: item.src,
        alt: item.alt,
        ratio: item.ratio ?? beforeEndRatio,
      })),
    });
  }

  if (project.afterEndRow) {
    const afterEndRatio = project.afterEndRow.ratio;
    media.push({
      kind: "row",
      items: project.afterEndRow.items.map((item) => ({
        src: item.src,
        alt: item.alt,
        ratio: item.ratio ?? afterEndRatio,
      })),
    });
  }

  /* Trailing afterVideoStills — after beforeEndRow so a moved lead can sit last */
  for (const still of stills.slice(split)) {
    media.push({
      kind: "full",
      src: still.src,
      alt: still.alt,
      ratio: still.ratio,
    });
  }

  if (project.endVideoPair) {
    media.push({
      kind: "video-pair",
      left: project.endVideoPair.left,
      right: project.endVideoPair.right,
      ratio: project.endVideoPair.ratio ?? "177.78%",
    });
  }

  if (project.afterEndVideoPairRow) {
    const row = project.afterEndVideoPairRow;
    const rowRatio = row.ratio;
    media.push({
      kind: "row",
      items: row.items.map((item) => ({
        src: item.src,
        alt: item.alt,
        ratio: item.ratio ?? rowRatio,
      })),
    });
  }

  if (project.endVideo) {
    media.push({
      kind: "video",
      primary: project.endVideo.primary,
      fallback: project.endVideo.fallback,
      alt: project.endVideo.alt,
      ratio: project.endVideo.ratio ?? "56.25%",
    });
  }

  return media;
}

export function ProjectCaseDemo({ project }: ProjectCaseDemoProps) {
  const copySections = getCaseCopySections(project);
  const specialThanks = getProjectSpecialThanks(project);
  const collaborators = getProjectCollaborators(project);
  const media = buildCaseMedia(project);

  const [open, setOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const panelId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const mediaStackRef = useRef<HTMLDivElement>(null);
  const mediaColRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const isMobilePanel = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 799px)").matches;

  useEffect(() => {
    setPortalReady(true);
    const mq = window.matchMedia("(max-width: 799px)");
    const sync = () => setMobileSheet(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Mobile hero: sync CSS --app-vvh to visualViewport so first paint fills the screen */
  useEffect(() => {
    const root = document.documentElement;
    const paint = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty("--app-vvh", `${Math.round(h)}px`);
    };
    paint();
    window.visualViewport?.addEventListener("resize", paint);
    window.visualViewport?.addEventListener("scroll", paint);
    window.addEventListener("resize", paint);
    window.addEventListener("orientationchange", paint);
    return () => {
      window.visualViewport?.removeEventListener("resize", paint);
      window.visualViewport?.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
      window.removeEventListener("orientationchange", paint);
    };
  }, []);

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

  const aboutToggle = (
    <div
      className={`project-case-demo__toggle-pin${open && mobileSheet ? " is-sheet-float" : ""}`}
    >
      <OriginButton
        type="button"
        className={open ? "is-open" : undefined}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close article" : "About the project"}
        onClick={toggleOpen}
      >
        {open ? "Close Article" : "About the project"}
      </OriginButton>
    </div>
  );

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
        </div>

        <div className="project-case-demo__hero-copy">
          <h1 className="project-case-demo__title">{project.title}</h1>
          <p className="project-case-demo__summary">
            {project.tagline ?? project.summary}
          </p>
          <ProjectCardTags
            project={project}
            className="project-case-demo__tag"
          />
        </div>
      </section>

      <div ref={bodyRef} className="project-case-demo__body">
        {open && mobileSheet && portalReady
          ? createPortal(aboutToggle, document.body)
          : aboutToggle}
        <div className="project-case-demo__columns">
          <div ref={mediaColRef} className="project-case-demo__media-col">
            <div ref={mediaStackRef} className="project-case-demo__media-stack">
              {media.map((item, index) => {
                if (item.kind === "video-pair") {
                  return (
                    <SyncedVideoPair
                      key={`video-pair-${index}`}
                      left={item.left}
                      right={item.right}
                      ratio={item.ratio}
                    />
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
                      className={
                        item.equalRowHeight
                          ? "project-case-demo__row project-case-demo__row--equal-height"
                          : "project-case-demo__row"
                      }
                      style={{
                        gridTemplateColumns:
                          item.columnTemplate ??
                          `repeat(${item.items.length}, 1fr)`,
                        aspectRatio: item.equalRowHeight
                          ? item.rowAspect
                          : undefined,
                      }}
                    >
                      {item.items.map((frame) => (
                        <Frame
                          key={frame.src}
                          src={frame.src}
                          alt={frame.alt}
                          ratio={frame.ratio}
                          fillCell={item.equalRowHeight}
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

        <div
          ref={creditsRef}
          className="project-case-demo__credits"
          aria-label="Special thanks and collaborators"
        >
          <div className="project-case-demo__credits-grid">
            <p className="project-case-demo__credits-label">Special thanks</p>
            {specialThanks.map((item) => (
              <div
                key={item.company}
                className="project-case-demo__credits-row"
              >
                <span className="project-case-demo__credits-company">
                  {item.company}
                </span>
                <span className="project-case-demo__credits-name">
                  {item.names.map((name) => (
                    <span
                      key={name}
                      className="project-case-demo__credits-name-line"
                    >
                      {name}
                    </span>
                  ))}
                </span>
              </div>
            ))}
            {collaborators.leadPartners?.map((item) => (
              <div
                key={`${item.company}-${item.name}`}
                className="project-case-demo__credits-row project-case-demo__credits-row--collaborator-lead"
              >
                <span className="project-case-demo__credits-company">
                  {item.company}
                </span>
                <span className="project-case-demo__credits-name">
                  <span className="project-case-demo__credits-name-line">
                    {item.name}
                  </span>
                </span>
              </div>
            ))}
            <div className="project-case-demo__credits-row project-case-demo__credits-row--collaborators">
              <span className="project-case-demo__credits-company">
                Collaborators
              </span>
              <span className="project-case-demo__credits-name">
                {collaborators.names.map((name) => (
                  <span
                    key={name}
                    className="project-case-demo__credits-name-line"
                  >
                    {name}
                  </span>
                ))}
              </span>
            </div>
            {collaborators.partners?.map((item) => (
              <div
                key={item.company}
                className="project-case-demo__credits-row project-case-demo__credits-row--collaborator-partner"
              >
                <span className="project-case-demo__credits-company">
                  {item.company}
                </span>
                <span className="project-case-demo__credits-name">
                  {item.names.map((name) => (
                    <span
                      key={name}
                      className="project-case-demo__credits-name-line"
                    >
                      {name}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
