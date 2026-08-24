import type { Metadata } from "next";
import { FilterResults } from "@/components/FilterResults";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectsFilterGrid } from "@/components/ProjectsFilterGrid";
import { ProjectsHeroRoll } from "@/components/ProjectsHeroRoll";
import { projectIps } from "@/content/nav";
import {
  filterProjects,
  getProjectsFeaturedLead,
  involvementFilters,
  type Involvement,
} from "@/content/projects";
import { shuffleArray } from "@/lib/utils";

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

  const featuredLead = getProjectsFeaturedLead(activeInvolvement);

  /* Lead is already shown above — omit it from the filtered grid */
  const listed = shuffleArray(
    filterProjects({
      involvement: activeInvolvement,
      ip: activeIp,
    }).filter((project) => project.slug !== featuredLead.slug),
  );

  const filterKey = activeIp
    ? `${activeInvolvement}:${activeIp}`
    : activeInvolvement;

  return (
    <main className="projects-page">
      <ProjectsHeroRoll />

      <section className="section projects-body">
        <ProjectFilter active={activeInvolvement} activeIp={activeIp} />
        <ProjectFeaturedLead project={featuredLead} />
        <FilterResults filterKey={filterKey}>
          <ProjectsFilterGrid
            projects={listed}
            filterKey={filterKey}
            enableHoverSwap
          />
        </FilterResults>
      </section>
    </main>
  );
}
