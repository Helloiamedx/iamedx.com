import {
  formatProjectDisplayTags,
  getCountryLabel,
  getInvolvementLabel,
  getMaterialLabel,
  PROJECT_TAG_SEPARATOR,
  type Involvement,
  type Material,
  type ProjectCountry,
} from "@/content/projects";
import { cn } from "@/lib/utils";

type ProjectCardTagsProps = {
  project: {
    involvement: Involvement;
    materials?: Material[] | null;
    country?: ProjectCountry | null;
  };
  className?: string;
};

/**
 * Project tags — desktop: one horizontal line; mobile: type / material / region stacked.
 * Used on cards, featured lead, and case-detail hero.
 */
export function ProjectCardTags({ project, className }: ProjectCardTagsProps) {
  const type = getInvolvementLabel(project.involvement);
  const materials = (project.materials ?? []).map(getMaterialLabel);
  const region = project.country ? getCountryLabel(project.country) : null;
  const materialLine =
    materials.length > 0 ? materials.join(PROJECT_TAG_SEPARATOR) : null;

  return (
    <p
      className={cn("project-type-chip project-card-tags", className)}
      aria-label={formatProjectDisplayTags(project)}
    >
      <span className="project-card-tags__line">{type}</span>
      {materialLine ? (
        <span className="project-card-tags__line">{materialLine}</span>
      ) : null}
      {region ? (
        <span className="project-card-tags__line">{region}</span>
      ) : null}
    </p>
  );
}
