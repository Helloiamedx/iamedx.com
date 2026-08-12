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
 * 项目详情文案 — order fixed: Background → Challenge → What I did → Outcome.
 * Only include chapters that have real body copy. No placeholders.
 */
export function getCaseCopySections(project: Project): CaseCopySection[] {
  const candidates: {
    id: CaseCopySectionId;
    label: string;
    body: string[];
  }[] = [
    {
      id: "background",
      label: "Background",
      body: asParagraphs(project.overview),
    },
    {
      id: "challenge",
      label: "Challenge",
      body: asParagraphs(project.challengesBody),
    },
    {
      id: "what-i-did",
      label: "What I did",
      body: asParagraphs(project.executionBody),
    },
    {
      id: "outcome",
      label: "Outcome",
      body: asParagraphs(project.impactBody),
    },
  ];

  return candidates.filter((section) => section.body.length > 0);
}
