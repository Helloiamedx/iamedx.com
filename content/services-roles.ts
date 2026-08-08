import { servicesMega } from "@/content/nav";

/** Center lines — cycle like Projects hero (`projectsHeroLines`). */
export const servicesHeroLines = [
  "Who do you want me to be?",
  "The one on the factory floor.",
  "One name across the whole chain.",
] as const;

/**
 * Background burst copy — ALWAYS the Services mega **first column** only
 * (`work-with-me` / “Work With Me”). Add/remove roles there; this follows.
 * Currently 10 labels. The stage may spawn more particles by repeating these.
 */
export const servicesRoleLabels: string[] =
  servicesMega
    .find((column) => column.id === "work-with-me")
    ?.links.map((link) => link.label) ?? [];
