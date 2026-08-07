import {
  getCaseCopySections,
  type CaseCopySection,
} from "@/content/caseCopy";
import type { Project } from "@/content/projects";

type ProjectCaseCopyProps = {
  project: Project;
};

function CaseCopyBlock({ section }: { section: CaseCopySection }) {
  return (
    <section
      className="project-case-statement"
      aria-label={section.label}
      data-case-chapter={section.id}
    >
      <div className="project-case-statement__frame">
        <h2 className="project-case-statement__title">{section.label}</h2>
        <div className="project-case-statement__copy">
          <p className="project-case-statement__headline">{section.headline}</p>
          {section.body.map((paragraph, index) => (
            <p
              key={`${section.id}-${index}`}
              className="project-case-statement__overview"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Fixed case-detail copy stack — always Background → Challenges → Execution → Impact.
 * Images insert between chapters later, per project.
 */
export function ProjectCaseCopy({ project }: ProjectCaseCopyProps) {
  const sections = getCaseCopySections(project);

  return (
    <div className="project-case-copy">
      {sections.map((section) => (
        <CaseCopyBlock key={section.id} section={section} />
      ))}
    </div>
  );
}
