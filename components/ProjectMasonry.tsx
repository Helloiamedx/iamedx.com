"use client";

import Image from "next/image";
import Link from "next/link";
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
};

export function ProjectMasonry({
  projects,
  emptyLabel = "No projects in this category yet.",
  layout = "tri",
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
      {projects.map((project) => {
        const tagline = project.tagline ?? project.summary;
        const tag = getInvolvementLabel(project.involvement);

        return (
          <motion.li
            key={project.slug}
            className="project-showcase__item"
            variants={itemVariants}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="project-showcase__link"
            >
              <div className="project-showcase__media">
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
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
