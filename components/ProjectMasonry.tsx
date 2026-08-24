"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  filterCardItemVariants,
  filterCardItemVariantsReduced,
  filterCardListVariants,
  filterCardListVariantsReduced,
} from "@/components/filterCardMotion";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import {
  getInvolvementLabel,
  type Project,
} from "@/content/projects";

type ProjectMasonryProps = {
  projects: Project[];
  emptyLabel?: string;
  /** `tri` = index filter (3-col). `related` = 2-col detail strip. */
  layout?: "tri" | "related";
  /** Projects index — hover cycles three placeholder frames (colors until per-project stills are set) */
  enableHoverSwap?: boolean;
};

/** Placeholder colors for hover cycle — replace with per-project stills later. */
const HOVER_SWAP_FRAME_COLORS = ["#0a0a0a", "#0076dd", "#86868b"] as const;

type ProjectShowcaseCardProps = {
  project: Project;
  sizes: string;
  enableHoverSwap: boolean;
};

function ProjectShowcaseCard({
  project,
  sizes,
  enableHoverSwap,
}: ProjectShowcaseCardProps) {
  const reduceMotion = useReducedMotion();
  const tagline = project.tagline ?? project.summary;
  const tag = getInvolvementLabel(project.involvement);
  const hoverStills = project.coverHoverStills;
  const hasHoverStills = Boolean(hoverStills && hoverStills.length === 3);
  const useSwap = enableHoverSwap && !reduceMotion;
  const mediaClass = useSwap
    ? hasHoverStills
      ? "project-showcase__media project-showcase__media--swap project-showcase__media--swap-3 project-showcase__media--swap-images"
      : "project-showcase__media project-showcase__media--swap project-showcase__media--swap-3"
    : "project-showcase__media";

  return (
    <Link href={`/projects/${project.slug}`} className="project-showcase__link">
      <div className={mediaClass}>
        {useSwap ? (
          <>
            <div className="project-showcase__swap-layer project-showcase__swap-layer--cover">
              {project.coverVideo ? (
                <CoverLoopVideo
                  className="project-showcase__cover-video"
                  src={project.coverVideo}
                  ariaLabel={project.title}
                />
              ) : (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  width={project.coverWidth}
                  height={project.coverHeight}
                  sizes={sizes}
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
                    sizes={sizes}
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
            className="project-showcase__cover-video"
            src={project.coverVideo}
            ariaLabel={project.title}
          />
        ) : (
          <Image
            src={project.coverImage}
            alt={project.title}
            width={project.coverWidth}
            height={project.coverHeight}
            sizes={sizes}
          />
        )}
      </div>
      <div className="project-window__meta project-window__meta--stack">
        <h3 className="project-window__title">{project.title}</h3>
        <ul className="project-window__chips" aria-label="Categories">
          <li>
            <span className="project-type-chip">{tag}</span>
          </li>
        </ul>
        <p className="project-window__tagline">{tagline}</p>
      </div>
    </Link>
  );
}

export function ProjectMasonry({
  projects,
  emptyLabel = "No more projects in this category yet.",
  layout = "tri",
  enableHoverSwap = false,
}: ProjectMasonryProps) {
  const reduceMotion = useReducedMotion();
  const listVariants = reduceMotion
    ? filterCardListVariantsReduced
    : filterCardListVariants;
  const itemVariants = reduceMotion
    ? filterCardItemVariantsReduced
    : filterCardItemVariants;

  if (projects.length === 0) {
    return (
      <motion.p
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
      >
        {emptyLabel}
      </motion.p>
    );
  }

  const listClass =
    layout === "related"
      ? "project-showcase project-showcase--related"
      : "project-showcase project-showcase--tri";
  const sizes =
    layout === "related"
      ? "(max-width: 700px) 100vw, (max-width: 1400px) 48vw, 700px"
      : "(max-width: 700px) 100vw, (max-width: 1400px) 33vw, 480px";

  return (
    <motion.ul
      className={listClass}
      variants={listVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {projects.map((project) => (
        <motion.li
          key={project.slug}
          className="project-showcase__item"
          variants={itemVariants}
        >
          <ProjectShowcaseCard
            project={project}
            sizes={sizes}
            enableHoverSwap={enableHoverSwap}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
