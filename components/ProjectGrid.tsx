import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="empty-state">No projects in this category yet.</p>;
  }

  return (
    <ul className="project-grid">
      {projects.map((project) => (
        <li key={project.slug}>
          <Link href={`/projects/${project.slug}`} className="project-card">
            <div className="project-card__media">
              <Image
                src={project.coverImage}
                alt={project.title}
                width={800}
                height={600}
              />
            </div>
            <div className="project-card__meta">
              <h2>{project.title}</h2>
              <p>{project.materials.join(" · ")}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
