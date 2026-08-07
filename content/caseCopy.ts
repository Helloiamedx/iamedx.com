import type { Project } from "@/content/projects";

export type CaseCopySectionId =
  | "background"
  | "challenges"
  | "execution"
  | "impact";

export type CaseCopySection = {
  id: CaseCopySectionId;
  /** Left column label */
  label: string;
  headline: string;
  body: string[];
};

const PLACEHOLDER_BODY = [
  "Placeholder copy for this chapter. Replace with the real narrative when the case is ready — keep the same left label / right headline + body layout.",
];

function asParagraphs(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}

/**
 * Every case detail copy stack is always these four chapters.
 * Images weave between them later, per project.
 */
export function getCaseCopySections(project: Project): CaseCopySection[] {
  const backgroundBody = asParagraphs(project.overview);
  const challengesBody = asParagraphs(project.challengesBody);
  const executionBody = asParagraphs(project.executionBody);
  const impactBody = asParagraphs(project.impactBody);

  return [
    {
      id: "background",
      label: "Background",
      headline:
        project.statementHeadline ??
        project.headline ??
        project.tagline ??
        project.summary,
      body:
        backgroundBody.length > 0
          ? backgroundBody
          : [
              project.summary,
              "Placeholder background — the fuller story for this project will land here.",
            ],
    },
    {
      id: "challenges",
      label: "Challenges",
      headline:
        project.challengesHeadline ??
        "The hard problems that shaped the work",
      body:
        challengesBody.length > 0
          ? challengesBody
          : [
              project.challenge,
              ...PLACEHOLDER_BODY,
            ],
    },
    {
      id: "execution",
      label: "Execution",
      headline:
        project.executionHeadline ??
        "How the idea moved from brief to delivery",
      body:
        executionBody.length > 0
          ? executionBody
          : [
              "Placeholder execution notes — samples, suppliers, production decisions, and the path from concept to ship.",
              ...PLACEHOLDER_BODY,
            ],
    },
    {
      id: "impact",
      label: "Impact",
      headline:
        project.impactHeadline ?? "What changed once it shipped",
      body:
        impactBody.length > 0
          ? impactBody
          : [
              project.result,
              "Placeholder impact — outcomes, reach, and what the work unlocked for the brand.",
            ],
    },
  ];
}
