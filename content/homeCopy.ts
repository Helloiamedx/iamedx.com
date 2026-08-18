export type HomeCopyPoint = {
  id: string;
  title: string;
  body: string;
};

export type HomeCopySection = {
  id: string;
  title: string;
  /** Short line under the title — leave empty until copy is ready */
  subtitle: string;
  /** Points — empty array until user supplies copy */
  points: HomeCopyPoint[];
};

/**
 * Home editorial sections — titles locked; body/points filled when ready.
 */
export const whatSetsMeApart: HomeCopySection = {
  id: "what-sets-me-apart",
  title: "What Sets Me Apart",
  subtitle: "",
  points: [],
};

export const whyWorkWithMe: HomeCopySection = {
  id: "why-work-with-me",
  title: "Why Work With Me?",
  subtitle: "",
  points: [],
};
