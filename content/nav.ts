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

function topicLink(label: string): MegaLink {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    label,
    slug,
    href: `/services/topics/${slug}`,
  };
}

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
    ].map(topicLink),
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
    ].map(topicLink),
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
    ].map(topicLink),
  },
];

export const primaryNav: NavItem[] = [
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services", mega: servicesMega },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
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
