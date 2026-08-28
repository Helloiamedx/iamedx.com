import type { Involvement, Project } from "@/content/projects";

export type SpecialThanksEntry = {
  company: string;
  names: string[];
};

export type CollaboratorCredits = {
  /** Company + name rows above the Collaborators label */
  leadPartners?: { company: string; name: string }[];
  names: string[];
  partners?: { company: string; name: string }[];
};

/** Every case detail — fixed row above Collaborators */
export const SITE_CREDIT_ROW: SpecialThanksEntry = {
  company: "Wenzhou Shanxi Cultural Media Co., Ltd.",
  names: ["Edward Xu"],
};

export const SGS_CREDIT_COMPANY =
  "SGS-CSTC Standards Technical Services Co., Ltd.";

/** Shared Special thanks for wooden-box collection projects */
export const WOODEN_BOX_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Michelle Wu"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Karyn Leung", "Susan Hu"],
  },
  {
    company: SGS_CREDIT_COMPANY,
    names: ["Liu Xinyu"],
  },
  {
    company: "Wenzhou Xianrui Packaging Co., Ltd.",
    names: ["Vincent"],
  },
];

/** Shared Collaborators for wooden-box collection projects */
export const WOODEN_BOX_COLLABORATORS: CollaboratorCredits = {
  names: [
    "Mr. Zhang",
    "Zhang Wei",
    "Li Qiang",
    "Wang Jianguo",
    "Chen Zhiyuan",
    "Liu Haifeng",
  ],
};

const END_TO_END_SGS_NAME = "Liu Xinyu";
const CONTRIBUTION_SGS_NAME = "Chen Wei";

const DPI_MERCHANDISING_COMPANY = "DPI Merchandising Inc.";
const DPI_ANGELA_MCREYNOLDS = "Angela McReynolds";

function sortSpecialThanksDpiFirst(items: SpecialThanksEntry[]) {
  return [...items].sort((a, b) => {
    if (a.company === DPI_MERCHANDISING_COMPANY) return -1;
    if (b.company === DPI_MERCHANDISING_COMPANY) return 1;
    return 0;
  });
}

function ensureDpiIncludesAngela(items: SpecialThanksEntry[]) {
  const dpiIndex = items.findIndex(
    (item) => item.company === DPI_MERCHANDISING_COMPANY,
  );
  if (dpiIndex === -1) return items;

  const dpi = items[dpiIndex];
  const names = dpi.names.includes(DPI_ANGELA_MCREYNOLDS)
    ? dpi.names
    : [DPI_ANGELA_MCREYNOLDS, ...dpi.names];

  return items.map((item, index) =>
    index === dpiIndex ? { ...item, names } : item,
  );
}

export function normalizeSpecialThanks(items: SpecialThanksEntry[]) {
  return ensureDpiIncludesAngela(sortSpecialThanksDpiFirst(items));
}

/** Default Special thanks for Project Contribution cases */
export const CONTRIBUTION_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "TriForce Sales, LLC",
    names: [
      "Michael Johnson",
      "David Smith",
      "James Brown",
      "Emily Johnson",
      "Sarah Williams",
    ],
  },
];

/** Default collaborators for Project Contribution cases */
export const CONTRIBUTION_COLLABORATORS: CollaboratorCredits = {
  names: [
    "Wei Zhang",
    "Hao Wang",
    "Qiang Li",
    "Yang Liu",
    "Jie Chen",
    "Lei Zhao",
    "Fan Yang",
    "Kai Huang",
    "Chen Wu",
    "Tao Zhou",
    "Jing Lin",
    "Yuxin Chen",
  ],
  partners: [
    {
      company: "Zhongshan Maotai Customized Craftsmanship Co., Ltd.",
      name: "Mr. Mao",
    },
  ],
};

const DEFAULT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Angela McReynolds"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Charlotte Tem"],
  },
  {
    company: "KindLucky Hong Kong International Limited",
    names: ["Eric Winn"],
  },
];

const DEFAULT_COLLABORATORS: CollaboratorCredits = {
  names: ["Jordan Hale", "Mei Chen"],
};

function ensureSgsLeadPartner(
  credits: CollaboratorCredits,
  name: string,
): CollaboratorCredits {
  const leadPartners = credits.leadPartners ?? [];
  if (leadPartners.some((item) => item.company === SGS_CREDIT_COMPANY)) {
    return credits;
  }
  return {
    ...credits,
    leadPartners: [
      ...leadPartners,
      { company: SGS_CREDIT_COMPANY, name },
    ],
  };
}

function applyInvolvementSgs(
  involvement: Involvement,
  credits: CollaboratorCredits,
): CollaboratorCredits {
  if (involvement === "end-to-end") {
    return ensureSgsLeadPartner(credits, END_TO_END_SGS_NAME);
  }
  if (involvement === "contribution") {
    return ensureSgsLeadPartner(credits, CONTRIBUTION_SGS_NAME);
  }
  return credits;
}

export function getProjectSpecialThanks(project: Project): SpecialThanksEntry[] {
  if (project.specialThanks && project.specialThanks.length > 0) {
    return sortSpecialThanksDpiFirst(project.specialThanks);
  }
  if (project.involvement === "contribution") {
    return normalizeSpecialThanks(CONTRIBUTION_SPECIAL_THANKS);
  }
  return normalizeSpecialThanks(DEFAULT_SPECIAL_THANKS);
}

export function getProjectCollaborators(project: Project): CollaboratorCredits {
  let credits: CollaboratorCredits;
  if (project.collaborators) {
    credits = project.collaborators;
  } else if (project.involvement === "contribution") {
    credits = CONTRIBUTION_COLLABORATORS;
  } else {
    credits = DEFAULT_COLLABORATORS;
  }
  const sgsInSpecialThanks = project.specialThanks?.some(
    (item) => item.company === SGS_CREDIT_COMPANY,
  );
  if (sgsInSpecialThanks) {
    return credits;
  }
  return applyInvolvementSgs(project.involvement, credits);
}

/** Resolve credits for a given involvement without a full project record */
export function defaultCreditsForInvolvement(involvement: Involvement): {
  specialThanks: SpecialThanksEntry[];
  collaborators: CollaboratorCredits;
} {
  if (involvement === "contribution") {
    return {
      specialThanks: normalizeSpecialThanks(CONTRIBUTION_SPECIAL_THANKS),
      collaborators: applyInvolvementSgs(
        involvement,
        CONTRIBUTION_COLLABORATORS,
      ),
    };
  }
  return {
    specialThanks: normalizeSpecialThanks(DEFAULT_SPECIAL_THANKS),
    collaborators: applyInvolvementSgs(involvement, DEFAULT_COLLABORATORS),
  };
}
