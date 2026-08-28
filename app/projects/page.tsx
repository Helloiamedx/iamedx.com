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
  parseInvolvementSelection,
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
  const activeIp = isIp(params.ip) ? params.ip : null;

  const featuredLead = getProjectsFeaturedLead(
    featuredLeadInvolvementKey(activeInvolvement),
  );

  /* Lead is already shown above — omit it from the filtered grid */
  const listed = shuffleArray(
    filterProjects({
      involvement: activeInvolvement,
      ip: activeIp,
    }).filter((project) => project.slug !== featuredLead.slug),
  );

  const filterKey =
    activeInvolvement === "all"
      ? activeIp
        ? `all:${activeIp}`
        : "all"
      : activeIp
        ? `${activeInvolvement.join(",")}:${activeIp}`
        : activeInvolvement.join(",");

  return (
    <main className="projects-page">
      <ProjectsPageIntro />

      <section className="section projects-body">
        <div className="project-featured-band">
          <ProjectFilter active={activeInvolvement} activeIp={activeIp} />
          <ProjectFeaturedLead project={featuredLead} />
        </div>
        <FilterResults filterKey={filterKey}>
          <ProjectsFilterGrid
            projects={listed}
            filterKey={filterKey}
            layout="related"
            enableHoverSwap
          />
        </FilterResults>
      </section>
    </main>
  );
}
