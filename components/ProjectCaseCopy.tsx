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
 * Fixed case-detail copy stack — Background → Challenge → What I did → Outcome.
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
