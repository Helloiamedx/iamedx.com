import Image from "next/image";
import Link from "next/link";
import type { ProjectsFeaturedLead } from "@/content/projects";

type ProjectFeaturedLeadProps = {
  project: ProjectsFeaturedLead;
};

export function ProjectFeaturedLead({ project }: ProjectFeaturedLeadProps) {
  const categories = project.categories.join(" · ");

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
          />
        </div>
        <div className="project-window__meta">
          <h2 className="project-window__title">{project.title}</h2>
          <p className="project-window__tagline">{project.tagline}</p>
          <p className="project-window__categories">{categories}</p>
        </div>
      </Link>
    </article>
  );
}
