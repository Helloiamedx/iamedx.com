import type { Metadata } from "next";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectGrid } from "@/components/ProjectGrid";
import {
  filterProjectsByMaterial,
  type Material,
} from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Product projects across wood, metal, paper, resin, and bundles.",
};

type ProjectsPageProps = {
  searchParams: Promise<{ material?: string }>;
};

const materialIds = ["wood", "metal", "paper", "resin", "bundle"] as const;

function isMaterial(value?: string): value is Material {
  return !!value && materialIds.includes(value as Material);
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const active: Material | "all" = isMaterial(params.material)
    ? params.material
    : "all";
  const projects = filterProjectsByMaterial(active);

  return (
    <main>
      <section className="page-cover page-cover--projects">
        <div className="page-cover__content">
          <p className="eyebrow">Projects</p>
          <h1>Products brought through the line.</h1>
        </div>
      </section>

      <section className="section">
        <ProjectFilter active={active} />
        <ProjectGrid projects={projects} />
      </section>
    </main>
  );
}
