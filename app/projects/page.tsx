import type { Metadata } from "next";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectFilter } from "@/components/ProjectFilter";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { ProjectsHeroRoll } from "@/components/ProjectsHeroRoll";
import { projectIps } from "@/content/nav";
import {
  filterProjects,
  getRelatedProjects,
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

  const showFeaturedLead = activeInvolvement === "all" && !activeIp;

  const listed = filterProjects({
    involvement: activeInvolvement,
    ip: activeIp,
  }).filter((p) => !(showFeaturedLead && p.slug === projectsFeaturedLead.slug));

  const related = getRelatedProjects(
    [
      ...listed.map((p) => p.slug),
      ...(showFeaturedLead ? [projectsFeaturedLead.slug] : []),
    ],
    5,
  );

  return (
    <main className="projects-page">
      <ProjectsHeroRoll />

      <section className="section projects-body">
        <ProjectFilter active={activeInvolvement} activeIp={activeIp} />
        {showFeaturedLead ? (
          <ProjectFeaturedLead project={projectsFeaturedLead} />
        ) : null}
        <ProjectMasonry projects={listed} />
      </section>

      {related.length > 0 ? (
        <section className="section projects-related">
          <h2 className="projects-related__title">Related</h2>
          <ProjectMasonry projects={related} />
        </section>
      ) : null}
    </main>
  );
}
