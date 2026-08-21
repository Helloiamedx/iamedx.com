import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FrostIndexLink } from "@/components/FrostIndexLink";
import { ProjectCaseDemo } from "@/components/ProjectCaseDemo";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import {
  getProjectBySlug,
  getRelatedProjects,
  projects,
} from "@/content/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const related = getRelatedProjects([project.slug], 2, project.tags);

  return (
    <main className="project-detail">
      {/* Living case-detail template — project-aware fields wired later */}
      <ProjectCaseDemo key={slug} project={project} />
      {related.length > 0 ? (
        <section className="section projects-related project-detail__related">
          <h2 className="projects-related__title">Related</h2>
          <ProjectMasonry projects={related} layout="related" enableHoverSwap />
          <FrostIndexLink href="/projects">All projects</FrostIndexLink>
        </section>
      ) : (
        <section className="section project-detail__related">
          <FrostIndexLink href="/projects">All projects</FrostIndexLink>
        </section>
      )}
    </main>
  );
}
