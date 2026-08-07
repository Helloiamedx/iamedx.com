import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseCopy } from "@/components/ProjectCaseCopy";
import { ProjectCaseHero } from "@/components/ProjectCaseHero";
import { getProjectBySlug, projects } from "@/content/projects";

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

  return (
    <main className="project-detail">
      <ProjectCaseHero project={project} />
      <ProjectCaseCopy project={project} />
      {/* Images weave between chapters later — per project */}
    </main>
  );
}
