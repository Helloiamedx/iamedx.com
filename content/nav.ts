export type MegaLink = {
  label: string;
  slug: string;
  href: string;
};

export type MegaColumn = {
  id: string;
  title: string;
  description: string;
  links: MegaLink[];
};

export type NavItem = {
  href: string;
  label: string;
  /** Present when this item has an Apple-style mega dropdown */
  mega?: MegaColumn[];
};

export type InsightTag = {
  label: string;
  slug: string;
  groupId: string;
};

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function serviceTopicLink(label: string): MegaLink {
  const slug = slugify(label);
  return {
    label,
    slug,
    href: `/services/topics/${slug}`,
  };
}

function projectIpLink(label: string): MegaLink {
  const slug = slugify(label);
  return {
    label,
    slug,
    href: `/projects?ip=${slug}`,
  };
}

function projectMaterialLink(label: string): MegaLink {
  const slug = slugify(label);
  return {
    label,
    slug,
    href: `/projects?material=${slug}`,
  };
}

function insightTagLink(label: string): MegaLink {
  const slug = slugify(label);
  return {
    label,
    slug,
    href: `/insights?tag=${slug}`,
  };
}

export const projectIps = [
  "Cyberpunk 2077",
  "The Witcher",
  "The Elder Scrolls",
  "Fallout",
  "Doom",
  "Battlefield",
  "Destiny",
  "Monster Hunter",
  "Gears of War",
  "Halo Guardians",
  "Tomb Raider",
  "Mass Effect",
  "Dragon Age",
  "Ghost Recon",
  "Hitman",
  "Starfield",
  "Horizon Zero Dawn",
  "Guild Wars",
  "Injustice",
  "Dead Space",
] as const;

export const projectMaterialLabels = [
  "Wood",
  "Metal",
  "Resin",
  "Fabric",
  "Leather",
  "Paper",
] as const;

/** Canonical insight tags used in mega menu + MDX frontmatter */
export const insightTagGroups = [
  {
    id: "manufacturing-insights",
    title: "Manufacturing Insights",
    tags: [
      "Manufacturing Processes",
      "Product Development",
      "Quality Control",
    ],
  },
  {
    id: "supply-chain-business-insights",
    title: "Supply Chain & Business Insights",
    tags: [
      "China Manufacturing",
      "Brand & Product Strategy",
      "Market Perspective",
    ],
  },
] as const;

export const insightTags: InsightTag[] = insightTagGroups.flatMap((group) =>
  group.tags.map((label) => ({
    label,
    slug: slugify(label),
    groupId: group.id,
  })),
);

export const projectsMega: MegaColumn[] = [
  {
    id: "explore-by-ip",
    title: "Explore projects by IP",
    description: "",
    links: projectIps.map(projectIpLink),
  },
  {
    id: "explore-by-material",
    title: "Explore projects by material",
    description: "",
    links: projectMaterialLabels.map(projectMaterialLink),
  },
];

export const servicesMega: MegaColumn[] = [
  {
    id: "work-with-me",
    title: "Work With Me",
    description: "Who I can be for your business",
    links: [
      "Product Inspector",
      "Factory Auditor",
      "Product Development Partner",
      "Manufacturing Representative",
      "Sourcing Specialist",
      "Procurement Partner",
      "Production Coordinator",
      "Compliance Support Partner",
      "Packaging Development Partner",
      "Logistics Coordinator",
    ].map(serviceTopicLink),
  },
  {
    id: "facing-a-challenge",
    title: "Facing a Challenge?",
    description: "What problem are you solving?",
    links: [
      "Worried About Product Quality?",
      "Unsure About a Supplier?",
      "Quality Is Not Consistent?",
      "Need Better Manufacturing Costs?",
      "Samples Are Not Ready for Mass Production?",
      "Worried About Export Compliance?",
      "Need More Control Over China Operations?",
    ].map(serviceTopicLink),
  },
  {
    id: "what-are-you-building",
    title: "What Are You Building?",
    description: "What are you creating?",
    links: [
      "Building a Supply Chain in China",
      "Launching a New Product",
      "Expanding Your Product Line",
      "Creating Custom Products",
      "Starting a Dropshipping Business",
      "Developing Small-Batch Products",
    ].map(serviceTopicLink),
  },
];

function aboutSectionLink(label: string): MegaLink {
  const slug = slugify(label);
  return {
    label,
    slug,
    href: `/about#${slug}`,
  };
}

export const aboutMega: MegaColumn[] = [
  {
    id: "get-to-know-edward",
    title: "Get to Know Edward",
    description: "",
    links: [
      "Who I Am",
      "How I Work",
      "Why Choose Me",
      "My Experience",
    ].map(aboutSectionLink),
  },
];

export const insightsMega: MegaColumn[] = insightTagGroups.map((group) => ({
  id: group.id,
  title: group.title,
  description: "",
  links: group.tags.map(insightTagLink),
}));

export const primaryNav: NavItem[] = [
  { href: "/services", label: "Services", mega: servicesMega },
  { href: "/projects", label: "Projects", mega: projectsMega },
  { href: "/insights", label: "Insights", mega: insightsMega },
  { href: "/about", label: "About", mega: aboutMega },
];

export const contactCta = {
  href: "/contact",
  label: "Contact",
} as const;

/** External social / office — Facebook & TikTok use site until profiles are ready */
export const linkedInHref = "https://www.linkedin.com/in/edwardadvance/";
export const facebookHref = "https://iamedx.com";
export const tiktokHref = "https://iamedx.com";
export const siteHref = "https://iamedx.com";

export const officeInfo = {
  eyebrow: "iamedx HQ",
  address:
    "No. 880 Longjin Avenue, Qianku Town, Cangnan County, Wenzhou City, Zhejiang Province, China",
  mapsHref: "https://maps.app.goo.gl/5snACoZbxVXQ3NRdA",
} as const;

export const contactInfo = {
  eyebrow: "Contact",
  email: "hello@iamedx.com",
  emailHref: "mailto:hello@iamedx.com",
} as const;

export const mobileNavLinks = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
] as const;

export const mobileSocialLinks = [
  { label: "LinkedIn", href: linkedInHref },
  { label: "Facebook", href: facebookHref },
  { label: "TikTok", href: tiktokHref },
] as const;

export const mobileContactCta = {
  href: "/contact",
  label: "Get in touch",
} as const;

/** Footer top-left positioning line */
export const footerTagline =
  "Driven by loyalty, transparency, and a commitment to exceed expectations, I help clients build highly tailored supply chain.";

/**
 * Footer menu columns — order drives the 4+4 top-right layout.
 * Edit the source megas only; this list stays in sync.
 */
export const footerLinkColumns = [
  ...servicesMega,
  ...projectsMega,
  ...insightsMega,
  ...aboutMega,
];

export function findServiceTopic(slug: string) {
  for (const column of servicesMega) {
    const link = column.links.find((item) => item.slug === slug);
    if (link) {
      return { column, link };
    }
  }
  return null;
}

export function findInsightTag(slug: string) {
  return insightTags.find((tag) => tag.slug === slug) ?? null;
}
