import type { Metadata } from "next";
import { FilterResults } from "@/components/FilterResults";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { ProjectsHeroRoll } from "@/components/ProjectsHeroRoll";
import { projectIps } from "@/content/nav";
import {
  filterProjects,
  involvementFilters,
  projectsFeaturedLead,
  type Involvement,
} from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects showcasing challenges, solutions, and value created throughout the manufacturing journey.",
};

type ProjectsPageProps = {
  searchParams: Promise<{ involvement?: string; ip?: string }>;
};

const involvementIds = involvementFilters
  .map((item) => item.id)
  .filter((id): id is Involvement => id !== "all");

const ipSlugs = projectIps.map((label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
);

function isInvolvement(value?: string): value is Involvement {
  return !!value && involvementIds.includes(value as Involvement);
}

function isIp(value?: string): value is string {
  return !!value && ipSlugs.includes(value);
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const activeInvolvement: Involvement | "all" = isInvolvement(
    params.involvement,
  )
    ? params.involvement
    : "all";
  const activeIp = isIp(params.ip) ? params.ip : null;

  /* Featured lead is fixed above the filter — never tied to filter results */
  const listed = filterProjects({
    involvement: activeInvolvement,
    ip: activeIp,
  }).filter((p) => p.slug !== projectsFeaturedLead.slug);

  const filterKey = activeIp
    ? `${activeInvolvement}:${activeIp}`
    : activeInvolvement;

  return (
    <main className="projects-page">
      <ProjectsHeroRoll />

      <section className="section projects-body">
        <ProjectFeaturedLead project={projectsFeaturedLead} />
        <ProjectFilter active={activeInvolvement} activeIp={activeIp} />
        <FilterResults key={filterKey}>
          <ProjectMasonry projects={listed} />
        </FilterResults>
      </section>
    </main>
  );
}
