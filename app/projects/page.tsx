import type { Metadata } from "next";
import { FilterResults } from "@/components/FilterResults";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectsFilterGrid } from "@/components/ProjectsFilterGrid";
import { ProjectsPageIntro } from "@/components/ProjectsPageIntro";
import { projectIps } from "@/content/nav";
import {
  featuredLeadInvolvementKey,
  filterProjects,
  getProjectsFeaturedLead,
  parseCountrySelection,
  parseInvolvementSelection,
  parseMaterialSelection,
  projectsFilterSelectionCount,
} from "@/content/projects";
import { shuffleArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects showcasing challenges, solutions, and value created throughout the manufacturing journey.",
};

type ProjectsPageProps = {
  searchParams: Promise<{
    involvement?: string;
    material?: string;
    country?: string;
    ip?: string;
  }>;
};

const ipSlugs = projectIps.map((label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
);

function isIp(value?: string): value is string {
  return !!value && ipSlugs.includes(value);
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const activeInvolvement = parseInvolvementSelection(params.involvement);
  const activeMaterial = parseMaterialSelection(params.material);
  const activeCountry = parseCountrySelection(params.country);
  const activeIp = isIp(params.ip) ? params.ip : null;

  const hasExplicitFilters =
    projectsFilterSelectionCount({
      involvement: activeInvolvement,
      material: activeMaterial,
      country: activeCountry,
    }) > 0 || Boolean(activeIp);

  const featuredLead = getProjectsFeaturedLead(
    featuredLeadInvolvementKey(activeInvolvement),
  );

  const filtered = filterProjects({
    involvement: activeInvolvement,
    material: activeMaterial,
    country: activeCountry,
    ip: activeIp,
  });

  /* Explicit tags: only keep 首推 if it still matches; never list it in results */
  const featuredMatchesFilters = filtered.some(
    (project) => project.slug === featuredLead.slug,
  );
  const showFeaturedLead = !hasExplicitFilters || featuredMatchesFilters;

  const listed = shuffleArray(
    filtered.filter((project) => project.slug !== featuredLead.slug),
  );

  const filterKey = [
    activeInvolvement === "all" ? "all" : activeInvolvement.join(","),
    activeMaterial === "all" ? "all" : activeMaterial.join(","),
    activeCountry === "all" ? "all" : activeCountry.join(","),
    activeIp ?? "",
  ].join(":");

  return (
    <main className="projects-page">
      <ProjectsPageIntro />

      <section className="section projects-body">
        <div
          className={
            showFeaturedLead
              ? "project-featured-band"
              : "project-featured-band project-featured-band--filter-only"
          }
        >
          <ProjectFilter
            activeInvolvement={activeInvolvement}
            activeMaterial={activeMaterial}
            activeCountry={activeCountry}
            activeIp={activeIp}
            matchCount={filtered.length}
          />
          {showFeaturedLead ? (
            <ProjectFeaturedLead project={featuredLead} />
          ) : null}
        </div>
        <FilterResults filterKey={filterKey}>
          <ProjectsFilterGrid
            projects={listed}
            filterKey={filterKey}
            layout="related"
            enableHoverSwap
            interleaveCollections={!hasExplicitFilters}
          />
        </FilterResults>
      </section>
    </main>
  );
}
