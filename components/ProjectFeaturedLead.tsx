import Image from "next/image";
import Link from "next/link";
import type { ProjectsFeaturedLead } from "@/content/projects";

type ProjectFeaturedLeadProps = {
  project: ProjectsFeaturedLead;
};

/**
 * Full-width「第一个项目」— overlay meta / spacing aligned with InsightsLead.
 */
export function ProjectFeaturedLead({ project }: ProjectFeaturedLeadProps) {
  const typeLabel = project.categories.at(0) ?? null;

  return (
    <article className="project-featured">
      <Link
        href={`/projects/${project.slug}`}
        className="project-featured__link"
      >
        <div className="project-featured__media">
          <Image
            src={project.coverImage}
            alt={project.title}
            width={project.coverWidth}
            height={project.coverHeight}
            sizes="(max-width: 1400px) calc(100vw - 2 * var(--shell-gutter)), 1400px"
            priority
            className="project-featured__image"
          />
          <div className="project-featured__meta">
            <h2 className="project-featured__title">{project.title}</h2>
            {project.tagline ? (
              <p className="project-featured__tagline">{project.tagline}</p>
            ) : (
              <span className="project-featured__tagline" aria-hidden="true" />
            )}
            {typeLabel ? (
              <span className="project-type-chip project-type-chip--on-media">
                {typeLabel}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
