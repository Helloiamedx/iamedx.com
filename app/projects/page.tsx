import type { Metadata } from "next";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectIps } from "@/content/nav";
import { filterProjects, materials, type Material } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Product projects by IP and material — wood, metal, resin, fabric, leather, and paper.",
};

type ProjectsPageProps = {
  searchParams: Promise<{ material?: string; ip?: string }>;
};

const materialIds = materials
  .map((item) => item.id)
  .filter((id): id is Material => id !== "all");

const ipSlugs = projectIps.map((label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
);

function isMaterial(value?: string): value is Material {
  return !!value && materialIds.includes(value as Material);
}

function isIp(value?: string): value is string {
  return !!value && ipSlugs.includes(value);
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const activeMaterial: Material | "all" = isMaterial(params.material)
    ? params.material
    : "all";
  const activeIp = isIp(params.ip) ? params.ip : null;
  const projects = filterProjects({
    material: activeMaterial,
    ip: activeIp,
  });

  const ipLabel = activeIp
    ? projectIps.find(
        (label) =>
          label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") === activeIp,
      )
    : null;

  return (
    <main>
      <section className="page-cover page-cover--projects">
        <div className="page-cover__content">
          <p className="eyebrow">Projects</p>
          <h1>
            {ipLabel
              ? ipLabel
              : activeMaterial !== "all"
                ? materials.find((item) => item.id === activeMaterial)?.label
                : "Products brought through the line."}
          </h1>
        </div>
      </section>

      <section className="section">
        <ProjectFilter active={activeMaterial} activeIp={activeIp} />
        <ProjectGrid projects={projects} />
      </section>
    </main>
  );
}
