"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { ProjectCardTags } from "@/components/ProjectCardTags";
import type { ProjectsFeaturedLead } from "@/content/projects";

type ProjectFeaturedLeadProps = {
  project: ProjectsFeaturedLead;
};

/** Same placeholder cycle as filter cards when hover stills are not set yet */
const HOVER_SWAP_FRAME_COLORS = ["#0a0a0a", "#0076dd", "#86868b"] as const;

/**
 * Full-width featured lead on /projects (below the involvement filter).
 * Meta: TITLE (remaining) | gap | DESC | gap | TAGS — mobile stacks tags like cards.
 */
export function ProjectFeaturedLead({ project }: ProjectFeaturedLeadProps) {
  const reduceMotion = useReducedMotion();
  const hoverStills = project.coverHoverStills;
  const hasHoverStills = Boolean(hoverStills && hoverStills.length === 3);
  const useSwap = !reduceMotion;
  const mediaClass = useSwap
    ? hasHoverStills
      ? "project-featured__media project-showcase__media--swap-3 project-showcase__media--swap-images"
      : "project-featured__media project-showcase__media--swap-3"
    : "project-featured__media";
  const mediaSizes =
    "(max-width: 1400px) calc(100vw - 2 * var(--shell-gutter)), 1400px";

  return (
    <article className="project-featured">
      <Link
        href={`/projects/${project.slug}`}
        className="project-featured__link"
      >
        <div className={mediaClass}>
          {useSwap ? (
            <>
              <div className="project-showcase__swap-layer project-showcase__swap-layer--cover">
                {project.coverVideo ? (
                  <CoverLoopVideo
                    className="project-featured__cover-video"
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
                    priority
                    className="project-featured__image"
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
              className="project-featured__cover-video"
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
              priority
              className="project-featured__image"
            />
          )}
        </div>
        <div className="project-featured__meta">
          <h2 className="project-featured__title">{project.title}</h2>
          {project.tagline ? (
            <p className="project-featured__tagline">{project.tagline}</p>
          ) : (
            <span className="project-featured__tagline" aria-hidden="true" />
          )}
          <ProjectCardTags project={project} />
        </div>
      </Link>
    </article>
  );
}
