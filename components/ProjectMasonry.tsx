import Image from "next/image";
import Link from "next/link";
import {
  getInvolvementLabel,
  type Project,
} from "@/content/projects";

type ProjectMasonryProps = {
  projects: Project[];
  emptyLabel?: string;
};

export function ProjectMasonry({
  projects,
  emptyLabel = "No projects in this category yet.",
}: ProjectMasonryProps) {
  if (projects.length === 0) {
    return <p className="empty-state">{emptyLabel}</p>;
  }

  return (
    <ul className="project-showcase">
      {projects.map((project) => {
        const tagline = project.tagline ?? project.summary;
        const tag = getInvolvementLabel(project.involvement);

        return (
          <li key={project.slug} className="project-showcase__item">
            <Link
              href={`/projects/${project.slug}`}
              className="project-showcase__link"
            >
              <div className="project-showcase__media">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  width={project.coverWidth}
                  height={project.coverHeight}
                  sizes="(max-width: 700px) 100vw, (max-width: 1400px) 48vw, 700px"
                />
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
          </li>
        );
      })}
    </ul>
  );
}
