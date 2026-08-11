import type { Project } from "@/content/projects";

export type CaseCopySectionId =
  | "background"
  | "challenge"
  | "what-i-did"
  | "outcome";

export type CaseCopySection = {
  id: CaseCopySectionId;
  /** Section label in the About panel */
  label: string;
  body: string[];
};

function asParagraphs(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}

/**
 * 项目详情文案 — always Background → Challenge → What I did → Outcome.
 */
export function getCaseCopySections(project: Project): CaseCopySection[] {
  const backgroundBody = asParagraphs(project.overview);
  const challengeBody = asParagraphs(project.challengesBody);
  const whatIDidBody = asParagraphs(project.executionBody);
  const outcomeBody = asParagraphs(project.impactBody);

  return [
    {
      id: "background",
      label: "Background",
      body:
        backgroundBody.length > 0
          ? backgroundBody
          : [
              project.summary,
              "Placeholder background — the fuller story for this project will land here.",
            ],
    },
    {
      id: "challenge",
      label: "Challenge",
      body:
        challengeBody.length > 0
          ? challengeBody
          : [
              project.challenge,
              "Placeholder challenge — the hard problems that shaped the work.",
            ],
    },
    {
      id: "what-i-did",
      label: "What I did",
      body:
        whatIDidBody.length > 0
          ? whatIDidBody
          : [
              "Placeholder — samples, suppliers, production decisions, and the path from concept to ship.",
            ],
    },
    {
      id: "outcome",
      label: "Outcome",
      body:
        outcomeBody.length > 0
          ? outcomeBody
          : [
              project.result,
              "Placeholder outcome — what changed once it shipped.",
            ],
    },
  ];
}
