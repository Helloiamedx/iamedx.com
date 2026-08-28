"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { ProjectCardTags } from "@/components/ProjectCardTags";
import { type Project } from "@/content/projects";

const HOVER_SWAP_FRAME_COLORS = ["#0a0a0a", "#0076dd", "#86868b"] as const;

type ProjectShowcaseFullWidthProps = {
  project: Project;
  enableHoverSwap?: boolean;
};

/** Full-width interleaved card on /projects — 16:9 cover + stack meta. */
export function ProjectShowcaseFullWidth({
  project,
  enableHoverSwap = false,
}: ProjectShowcaseFullWidthProps) {
  const reduceMotion = useReducedMotion();
  const tagline = project.tagline ?? project.summary;
  const hoverStills = project.coverHoverStills;
  const hasHoverStills = Boolean(hoverStills && hoverStills.length === 3);
  const useSwap = enableHoverSwap && !reduceMotion;
  const mediaClass = useSwap
    ? hasHoverStills
      ? "project-showcase-full__media project-showcase__media--swap-3 project-showcase__media--swap-images"
      : "project-showcase-full__media project-showcase__media--swap-3"
    : "project-showcase-full__media";
  const mediaSizes =
    "(max-width: 1400px) calc(100vw - 2 * var(--shell-gutter)), 1400px";

  return (
    <article className="project-showcase-full">
      <Link
        href={`/projects/${project.slug}`}
        className="project-showcase-full__link"
      >
        <div className={mediaClass}>
          {useSwap ? (
            <>
              <div className="project-showcase__swap-layer project-showcase__swap-layer--cover">
                {project.coverVideo ? (
                  <CoverLoopVideo
                    className="project-showcase-full__cover-video"
                    src={project.coverVideo}
                    ariaLabel={project.title}
                  />
                ) : (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    width={project.coverWidth}
                    height={project.coverHeight}
                    sizes={mediaSizes}
                    className="project-showcase-full__image"
                  />
                )}
              </div>
              {hasHoverStills ? (
                <div
                  className="project-showcase__swap-layer project-showcase__swap-layer--cycle project-showcase__swap-layer--images"
                  aria-hidden="true"
                >
                  {hoverStills!.map((src, index) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={project.coverWidth}
                      height={project.coverHeight}
                      sizes={mediaSizes}
                      className={`project-showcase__swap-frame project-showcase__swap-frame--${index + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="project-showcase__swap-layer project-showcase__swap-layer--cycle"
                  aria-hidden="true"
                  style={
                    {
                      "--swap-color-1": HOVER_SWAP_FRAME_COLORS[0],
                      "--swap-color-2": HOVER_SWAP_FRAME_COLORS[1],
                      "--swap-color-3": HOVER_SWAP_FRAME_COLORS[2],
                    } as CSSProperties
                  }
                />
              )}
            </>
          ) : project.coverVideo ? (
            <CoverLoopVideo
              className="project-showcase-full__cover-video"
              src={project.coverVideo}
              ariaLabel={project.title}
            />
          ) : (
            <Image
              src={project.coverImage}
              alt={project.title}
              width={project.coverWidth}
              height={project.coverHeight}
              sizes={mediaSizes}
              className="project-showcase-full__image"
            />
          )}
        </div>
        <div className="project-window__meta project-window__meta--stack">
          <div className="card-meta__head">
            <h3 className="project-window__title">{project.title}</h3>
            <ProjectCardTags project={project} />
          </div>
          <p className="project-window__tagline">{tagline}</p>
        </div>
      </Link>
    </article>
  );
}
