import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseDemo } from "@/components/ProjectCaseDemo";
import { RelatedProjects } from "@/components/RelatedProjects";
import { ChallengeCta } from "@/components/ServicesChallengeCta";
import {
  getProjectBySlug,
  getSameTagPeers,
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

  const peers = getSameTagPeers([project.slug], project.tags);
  const tagKey = project.tags[0] ?? project.involvement;

  return (
    <main className="project-detail">
      {/* Living case-detail template — project-aware fields wired later */}
      <ProjectCaseDemo key={slug} project={project} />

      <section
        className="project-detail__challenge"
        aria-label="Bring me your challenge"
      >
        <ChallengeCta />
      </section>

      <RelatedProjects
        key={`related-${slug}`}
        currentSlug={slug}
        peers={peers}
        tagKey={tagKey}
      />
    </main>
  );
}
