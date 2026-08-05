export type Material =
  | "wood"
  | "metal"
  | "resin"
  | "fabric"
  | "leather"
  | "paper";

export const materials: { id: Material | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wood", label: "Wood" },
  { id: "metal", label: "Metal" },
  { id: "resin", label: "Resin" },
  { id: "fabric", label: "Fabric" },
  { id: "leather", label: "Leather" },
  { id: "paper", label: "Paper" },
];

export type Project = {
  slug: string;
  title: string;
  materials: Material[];
  /** IP franchise slugs, e.g. cyberpunk-2077 */
  ips: string[];
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
    ips: ["the-witcher"],
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
    ips: ["halo-guardians", "destiny"],
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
    ips: ["starfield"],
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
    ips: ["cyberpunk-2077", "doom"],
    summary: "Pigmented resin coaster set with controlled pour and edge finishing.",
    role: ["product-development", "sample-development", "production-management"],
    coverImage: "/projects/placeholder-resin.svg",
    year: 2025,
    featured: true,
    challenge: "Stabilize color batches and demolding defects across a gift SKU.",
    result: "Process notes and QC checkpoints cut defect rate before full run.",
  },
  {
    slug: "woven-carry-pouch",
    title: "Woven carry pouch",
    materials: ["fabric"],
    ips: ["horizon-zero-dawn", "tomb-raider"],
    summary: "Durable fabric pouch with controlled stitch quality for travel SKUs.",
    role: ["product-development", "sample-development", "production-management"],
    coverImage: "/projects/placeholder-fabric.svg",
    year: 2025,
    featured: true,
    challenge: "Lock fabric hand-feel and seam strength across colorways.",
    result: "Approved construction package and first production QC plan.",
  },
  {
    slug: "tooled-leather-folio",
    title: "Tooled leather folio",
    materials: ["leather"],
    ips: ["the-elder-scrolls", "dragon-age"],
    summary: "Small-batch leather folio with edge paint and hardware consistency.",
    role: ["factory-sourcing", "sample-development", "production-management"],
    coverImage: "/projects/placeholder-leather.svg",
    year: 2024,
    featured: false,
    challenge: "Match leather grade and tooling depth across suppliers.",
    result: "Selected tannery partner and cleared pre-production sample set.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(limit = 3) {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function filterProjects(options?: {
  material?: Material | "all" | null;
  ip?: string | null;
}) {
  const material = options?.material;
  const ip = options?.ip;

  return projects.filter((project) => {
    const materialOk =
      !material || material === "all" || project.materials.includes(material);
    const ipOk = !ip || project.ips.includes(ip);
    return materialOk && ipOk;
  });
}

/** @deprecated use filterProjects */
export function filterProjectsByMaterial(material?: Material | "all" | null) {
  return filterProjects({ material });
}
