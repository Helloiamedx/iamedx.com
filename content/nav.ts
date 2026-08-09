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

function projectInvolvementLink(
  id: "all" | "end-to-end" | "contribution" | "specialized",
  label: string,
): MegaLink {
  return {
    label,
    slug: id,
    href: id === "all" ? "/projects" : `/projects?involvement=${id}`,
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

/** @deprecated Materials explore removed from mega — kept for legacy filters */
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
    id: "manufacturing-market-insights",
    title: "Manufacturing & Market",
    tags: [
      "Quality Control",
      "Manufacturing",
      "Product Development",
      "Brand & Product Strategy",
      "Market Perspective",
      "Supply Chain Operations",
      "Factory Partnerships",
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

/** Projects mega — same involvement filters as /projects pills (no column title) */
export const projectsMega: MegaColumn[] = [
  {
    id: "project-involvement",
    title: "",
    description: "",
    links: [
      projectInvolvementLink("all", "All Projects"),
      projectInvolvementLink("end-to-end", "End-to-End Projects"),
      projectInvolvementLink("contribution", "Project Contribution"),
      projectInvolvementLink("specialized", "Specialized Services"),
    ],
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
      "Product Quality Concerns?",
      "Supplier Reliability Concerns?",
      "Inconsistent Product Quality?",
      "High Manufacturing Costs?",
      "Export Compliance Risks?",
      "China Operations Challenges?",
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
    title: "",
    description: "",
    links: [
      "Who I Am",
      "How I Work",
      "Why Choose Me",
      "My Experience",
    ].map(aboutSectionLink),
  },
];

/** Insights mega — flat list, no group headings */
export const insightsMega: MegaColumn[] = [
  {
    id: "manufacturing-market-insights",
    title: "",
    description: "",
    links: insightTags.map((tag) => ({
      label: tag.label,
      slug: tag.slug,
      href: `/insights?tag=${tag.slug}`,
    })),
  },
];

export const primaryNav: NavItem[] = [
  { href: "/services", label: "Services", mega: servicesMega },
  { href: "/projects", label: "Projects", mega: projectsMega },
  { href: "/insights", label: "Insights", mega: insightsMega },
  { href: "/about", label: "About", mega: aboutMega },
];

export const contactCta = {
  href: "/contact",
  label: "Email",
} as const;

/**
 * WhatsApp click-to-chat. Digits only with country code (no + / spaces).
 * Example: "8613812345678" → https://wa.me/8613812345678
 */
export const whatsAppPhone = "2332616010";
export const whatsAppDisplay = "(233) 261-6010";

export const whatsAppCta = {
  href: `https://wa.me/${whatsAppPhone}`,
  label: "WhatsApp",
} as const;

/** WeChat ID */
export const weChatId = "Helloiamedx";

export const weChatCta = {
  href: "/contact",
  label: "WeChat",
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
  email: "hi@iamedx.com",
  emailHref: "mailto:hi@iamedx.com",
} as const;

/** Phone — E.164 digits without + */
export const phoneNumber = "8618867760045";
export const phoneDisplay = "(086)18867760045";

export const phoneCta = {
  href: `tel:+${phoneNumber}`,
  label: "Phone",
} as const;

/** Footer — Pentagram-style inquiry row */
export const footerHelpTitle = "Let Me Help You";

/** Footer contact channels: label column + value column */
export const footerChannels = [
  {
    label: "WhatsApp",
    value: whatsAppDisplay,
    href: whatsAppCta.href,
    external: true,
  },
  {
    label: "WeChat",
    value: weChatId,
    href: weChatCta.href,
    external: false,
  },
  {
    label: "Email",
    value: contactInfo.email,
    href: contactInfo.emailHref,
    external: false,
  },
  {
    label: "Phone",
    value: phoneDisplay,
    href: phoneCta.href,
    external: false,
  },
] as const;

/**
 * Footer About — same line as the old lead / “I create…” copy.
 */
export const footerAboutCopy =
  "I create products and experiences that drive remarkable change through radical collaboration.";

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

/** Footer content layer (reference layout) */
export const footerLeadCopy =
  "I create products and experiences that drive remarkable change through radical collaboration.";

/** Block above the thanks rule */
export const footerAssistTitle = "Looking for assistance?";

export const footerAssistCopy =
  "Whether you need support with product development, supplier management, quality control, or any other aspect of manufacturing, I’m here to provide the assistance you need.";

/** Large mid-footer line — rendered uppercase via CSS */
export const footerThanksLine = "Thanks for your trust";

/** Bottom-right note above HELLOIAMEDX */
export const footerPaymentsNote = "Personal Payments Accepted";

export type FooterNavColumn = {
  id: string;
  label: string;
  links: { label: string; href: string }[];
};

/**
 * Footer link columns — few → many (About · Projects · Insights · Services).
 */
export const footerNavColumns: FooterNavColumn[] = [
  {
    id: "about",
    label: "About",
    links: aboutMega[0]?.links.map((link) => ({
      label: link.label,
      href: link.href,
    })) ?? [],
  },
  {
    id: "projects",
    label: "Projects",
    links: projectsMega.flatMap((column) =>
      column.links.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    ),
  },
  {
    id: "insights",
    label: "Insights",
    links: insightsMega.flatMap((column) =>
      column.links.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    ),
  },
  {
    id: "services",
    label: "Services",
    links:
      servicesMega
        .find((column) => column.id === "work-with-me")
        ?.links.map((link) => ({
          label: link.label,
          href: link.href,
        })) ?? [],
  },
];

/**
 * Portrait marquee placeholders — swap `src` when real vertical clips arrive.
 * Paths resolve via `asset()`.
 */
export const footerMarqueeVideos = [
  {
    id: "demo-1",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
  {
    id: "demo-2",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
  {
    id: "demo-3",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
  {
    id: "demo-4",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
  {
    id: "demo-5",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
  {
    id: "demo-6",
    src: "videos/Turning Ideas Into Products.mp4",
    label: "Turning ideas into products",
  },
] as const;

/** @deprecated Legacy tagline — kept for backups only */
export const footerTagline =
  "Driven by loyalty, transparency, and a commitment to exceed expectations, I help clients build highly tailored supply chain.";

/**
 * @deprecated Legacy mega columns for old footer scroll layout.
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
