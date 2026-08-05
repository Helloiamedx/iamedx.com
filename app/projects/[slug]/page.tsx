import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="section project-detail">
      <Link href="/projects" className="back-link">
        ← Projects
      </Link>
      <div className="project-detail__media">
        <Image
          src={project.coverImage}
          alt={project.title}
          width={1200}
          height={800}
          priority
        />
      </div>
      <header>
        <p className="eyebrow">{project.materials.join(" · ")}</p>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </header>
      <div className="project-detail__body">
        <section>
          <h2>Challenge</h2>
          <p>{project.challenge}</p>
        </section>
        <section>
          <h2>Role in the chain</h2>
          <ul>
            {project.role.map((item) => (
              <li key={item}>{item.replaceAll("-", " ")}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Result</h2>
          <p>{project.result}</p>
        </section>
      </div>
    </main>
  );
}
