export type Material = "wood" | "metal" | "paper" | "resin" | "bundle";

export const materials: { id: Material | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wood", label: "Wood" },
  { id: "metal", label: "Metal" },
  { id: "paper", label: "Paper" },
  { id: "resin", label: "Resin" },
  { id: "bundle", label: "Bundle" },
];

export type Project = {
  slug: string;
  title: string;
  materials: Material[];
  summary: string;
  role: string[];
  coverImage: string;
  gallery?: string[];
  year: number;
  client?: string;
  featured: boolean;
  challenge: string;
  result: string;
};

export const projects: Project[] = [
  {
    slug: "walnut-desk-organizer",
    title: "Walnut desk organizer",
    materials: ["wood"],
    summary: "A modular walnut organizer developed from sketch through small-batch production.",
    role: ["product-development", "sample-development", "production-management"],
    coverImage: "/projects/placeholder-wood.svg",
    year: 2024,
    featured: true,
    challenge: "Need a clean desktop system that could be CNC-cut at scale without finishing issues.",
    result: "Approved sample in three rounds; first production run shipped on schedule.",
  },
  {
    slug: "brushed-steel-tray",
    title: "Brushed steel tray",
    materials: ["metal"],
    summary: "Precision metal tray with controlled surface finish for retail gift sets.",
    role: ["factory-sourcing", "factory-verification", "sample-development"],
    coverImage: "/projects/placeholder-metal.svg",
    year: 2024,
    featured: true,
    challenge: "Find a metal shop that could hold tolerance and consistent brushing.",
    result: "Verified factory, locked finish standard, and cleared pre-production sample.",
  },
  {
    slug: "folded-paper-mailer",
    title: "Folded paper mailer",
    materials: ["paper"],
    summary: "Structural paper mailer designed for unboxing and ship durability.",
    role: ["custom-packaging", "sample-development"],
    coverImage: "/projects/placeholder-paper.svg",
    year: 2023,
    featured: false,
    challenge: "Reduce plastic while keeping transit protection for fragile goods.",
    result: "Paper structure passed drop tests and replaced the previous poly mailer.",
  },
  {
    slug: "cast-resin-coaster",
    title: "Cast resin coaster",
    materials: ["resin"],
    summary: "Pigmented resin coaster set with controlled pour and edge finishing.",
    role: ["product-development", "sample-development", "production-management"],
    coverImage: "/projects/placeholder-resin.svg",
    year: 2025,
    featured: true,
    challenge: "Stabilize color batches and demolding defects across a gift SKU.",
    result: "Process notes and QC checkpoints cut defect rate before full run.",
  },
  {
    slug: "home-ritual-bundle",
    title: "Home ritual bundle",
    materials: ["bundle", "wood", "paper"],
    summary: "Multi-material gift bundle spanning wood goods and paper packaging.",
    role: ["product-development", "custom-packaging", "delivery-logistics"],
    coverImage: "/projects/placeholder-bundle.svg",
    year: 2025,
    featured: true,
    challenge: "Coordinate suppliers and pack-out so the set arrives retail-ready.",
    result: "Unified BOM, packaging, and delivery plan for the launch kit.",
  },
  {
    slug: "anodized-key-hook",
    title: "Anodized key hook",
    materials: ["metal"],
    summary: "Compact aluminum hook with anodized colorways for DTC launch.",
    role: ["factory-sourcing", "testing-reports", "production-management"],
    coverImage: "/projects/placeholder-metal.svg",
    year: 2023,
    featured: false,
    challenge: "Match color targets and validate mounting strength for wall install.",
    result: "Color standards locked; testing package cleared for launch markets.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(limit = 3) {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function filterProjectsByMaterial(material?: Material | "all" | null) {
  if (!material || material === "all") return projects;
  return projects.filter((project) => project.materials.includes(material));
}
