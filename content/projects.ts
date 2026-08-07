import { asset } from "@/lib/assets";

export type Material =
  | "wood"
  | "metal"
  | "resin"
  | "fabric"
  | "leather"
  | "paper";

export type Involvement =
  | "end-to-end"
  | "contribution"
  | "specialized";

export const materials: { id: Material | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wood", label: "Wood" },
  { id: "metal", label: "Metal" },
  { id: "resin", label: "Resin" },
  { id: "fabric", label: "Fabric" },
  { id: "leather", label: "Leather" },
  { id: "paper", label: "Paper" },
];

export const involvementFilters: {
  id: Involvement | "all";
  label: string;
}[] = [
  { id: "all", label: "All Projects" },
  { id: "end-to-end", label: "End-to-End Projects" },
  { id: "contribution", label: "Project Contribution" },
  { id: "specialized", label: "Specialized Services" },
];

export type Project = {
  slug: string;
  title: string;
  materials: Material[];
  /** IP franchise slugs, e.g. cyberpunk-2077 */
  ips: string[];
  /**
   * Right-side category chips under the cover (filterable later).
   * Featured lead: `A · B · C`. Two-column cards: `A, B, C`.
   */
  tags: string[];
  summary: string;
  /** Center meta line under the cover (falls back to summary) */
  tagline?: string;
  /** Case-cover hero line under the title (uppercase display) */
  headline?: string;
  /** Short line under the headline, e.g. "study what i did" */
  studySub?: string;
  role: string[];
  involvement: Involvement;
  coverImage: string;
  /** Intrinsic cover size — drives card aspect / relative scale */
  coverWidth: number;
  coverHeight: number;
  /** Case detail first-screen Vimeo (falls back to default demo reel) */
  heroVimeoId?: string;
  heroVimeoHash?: string;
  /** Case Background chapter — headline (uppercase, right column) */
  statementHeadline?: string;
  /** Case Background chapter — body paragraphs */
  overview?: string | string[];
  /** Case Challenges chapter */
  challengesHeadline?: string;
  challengesBody?: string | string[];
  /** Case Execution chapter */
  executionHeadline?: string;
  executionBody?: string | string[];
  /** Case Impact chapter */
  impactHeadline?: string;
  impactBody?: string | string[];
  gallery?: string[];
  year: number;
  client?: string;
  featured: boolean;
  challenge: string;
  result: string;
};

/** Full-width lead on /projects (Further-style meta bar) */
export type ProjectsFeaturedLead = {
  slug: string;
  title: string;
  tagline: string;
  categories: string[];
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
};

/** Two-column showcase covers — ~16:9 (3000×1687) */
export const SHOWCASE_COVER_W = 3000;
export const SHOWCASE_COVER_H = 1687;

export const projectsFeaturedLead: ProjectsFeaturedLead = {
  slug: "wimbledon",
  title: "Wimbledon",
  tagline: "Embodying the spirit of tennis\u2019 grandest stage",
  categories: ["Brand", "Sports & Fitness", "Europe"],
  coverImage:
    "https://cdn.prod.website-files.com/6849da698cb78e39e81215c3/6a4e1d09946021ea4d30670a_Artboard%201-100.jpg",
  coverWidth: 1920,
  coverHeight: 1080,
};

export const projects: Project[] = [
  {
    slug: "wimbledon",
    title: "Wimbledon",
    materials: ["fabric", "paper"],
    ips: [],
    tags: ["Brand", "Sports & Fitness", "Europe"],
    summary: "Embodying the spirit of tennis\u2019 grandest stage",
    tagline: "Embodying the spirit of tennis\u2019 grandest stage",
    headline: "Embodying the spirit of tennis\u2019 grandest stage",
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage:
      "https://cdn.prod.website-files.com/6849da698cb78e39e81215c3/6a4e1d09946021ea4d30670a_Artboard%201-100.jpg",
    coverWidth: 1920,
    coverHeight: 1080,
    year: 2025,
    client: "Wimbledon",
    featured: true,
    challenge:
      "Translate the Championships\u2019 heritage into tangible brand touchpoints.",
    result:
      "A cohesive physical experience system across brand, sport, and region.",
  },
  {
    slug: "hsbc-svns",
    title: "HSBC SVNS",
    materials: ["fabric", "paper"],
    ips: [],
    tags: ["Brand", "Sports & Fitness", "Global"],
    summary: "Transforming rugby into a global experience",
    tagline: "Transforming rugby into a global experience",
    headline: "Transforming rugby into a global festival experience",
    statementHeadline: "Transforming rugby into a global festival experience",
    overview: [
      "World Rugby HSBC Sevens Series is renowned as a destination for great sport and partying for those close to rugby. Our brief was to reimagine what the Series could become through a new brand vision, evolving Sevens from a rugby tournament into an iconic global festival experience for both fans and non-fans around the world. Positioning it as the go-to destination for sport, entertainment and culture.",
      "The tournament has one key thing that makes it different from anything else: Sevens is always following the sun. Taking place in summertime destinations across seven unforgettable months; from sun soaked days in Cape Town to buzz-filled nights in Dubai. The power of Seven doesn\u2019t stop here. It\u2019s inherent in the game itself, where teams are made up of seven players and matches are played over two, high-energy seven-minute halves. This became the inspiration for our strategic platform: Chase the sun. Live the rush.",
      "As part of this exploration, the brand positioning and unique festival format of entertainment, culture and sport was imagined through three experience principals: Sunrisers, Sungoers and Sunsetters, which help frame how different audiences could engage with the series, setting the vibe, bringing the energy and ensuring every HSBC SVNS event ends on a high.",
      "Once we had defined the brand strategy, we moved to naming. It was more an evolution than a complete reimagination. The name SVNS was proposed as a bold evolution of the Series name, keeping the brand recognition of the tournament while adding a playful energy that matches its new format.",
    ],
    challengesHeadline: "Turning a rugby series into a global festival",
    challengesBody: [
      "Placeholder challenges — the Series needed a sharper reason to care beyond the rugby faithful, without losing the heat that already made host cities feel electric.",
      "Placeholder challenges — scale across sun destinations also meant one brand system had to flex for day-to-night rituals, from Cape Town heat to Dubai nights.",
    ],
    executionHeadline: "Chase the sun. Live the rush.",
    executionBody: [
      "Placeholder execution — we locked the strategic platform, named the evolution to SVNS, and mapped three audience modes: Sunrisers, Sungoers, and Sunsetters.",
      "Placeholder execution — from there, identity, festival formats, and touchpoints were built to follow the sun across the season.",
    ],
    impactHeadline: "A festival brand with room to grow",
    impactBody: [
      "Placeholder impact — SVNS gave the Series a bolder voice and a clearer festival promise for fans and non-fans alike.",
      "Placeholder impact — the platform now frames how each host city can set the vibe, raise the energy, and close every event on a high.",
    ],
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage:
      "https://cdn.prod.website-files.com/6849da698cb78e39e81215c3/69b1911c10abf160ba841703_20.jpg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2025,
    client: "HSBC",
    featured: true,
    challenge:
      "Turn a multi-city rugby series into a coherent festival-scale brand experience.",
    result:
      "Unified physical and digital touchpoints across host venues and fan journeys.",
  },
  {
    slug: "eurostar",
    title: "Eurostar",
    materials: ["metal", "paper"],
    ips: [],
    tags: ["Brand", "Travel", "Europe"],
    summary: "High-speed journeys shaped into a tangible brand experience",
    tagline: "High-speed journeys shaped into a tangible brand experience",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage:
      "https://cdn.prod.website-files.com/6849da698cb78e39e81215c3/68a32ffc0479118d7db797a6_eurostar_featureimage%201-min.jpg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2025,
    client: "Eurostar",
    featured: true,
    challenge: "Extend a transit brand into memorable physical touchpoints.",
    result: "A cohesive feature system across journey and destination moments.",
  },
  {
    slug: "walnut-desk-organizer",
    title: "Walnut desk organizer",
    materials: ["wood"],
    ips: ["the-witcher"],
    tags: ["Wood", "The Witcher"],
    summary:
      "A modular walnut organizer developed from sketch through small-batch production.",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: "/projects/demo-portrait.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: true,
    challenge:
      "Need a clean desktop system that could be CNC-cut at scale without finishing issues.",
    result: "Approved sample in three rounds; first production run shipped on schedule.",
  },
  {
    slug: "brushed-steel-tray",
    title: "Brushed steel tray",
    materials: ["metal"],
    ips: ["halo-guardians", "destiny"],
    tags: ["Metal", "Halo", "Destiny"],
    summary:
      "Precision metal tray with controlled surface finish for retail gift sets.",
    role: [
      "factory-sourcing",
      "factory-verification",
      "sample-development",
    ],
    involvement: "contribution",
    coverImage: "/projects/demo-landscape.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: true,
    challenge: "Find a metal shop that could hold tolerance and consistent brushing.",
    result:
      "Verified factory, locked finish standard, and cleared pre-production sample.",
  },
  {
    slug: "folded-paper-mailer",
    title: "Folded paper mailer",
    materials: ["paper"],
    ips: ["starfield"],
    tags: ["Paper", "Starfield"],
    summary: "Structural paper mailer designed for unboxing and ship durability.",
    role: ["custom-packaging", "sample-development"],
    involvement: "specialized",
    coverImage: "/projects/demo-wide.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
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
    tags: ["Resin", "Cyberpunk 2077"],
    summary: "Pigmented resin coaster set with controlled pour and edge finishing.",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: "/projects/demo-square.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
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
    tags: ["Fabric", "Horizon", "Tomb Raider"],
    summary: "Durable fabric pouch with controlled stitch quality for travel SKUs.",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: "/projects/demo-tall.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
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
    tags: ["Leather", "The Elder Scrolls"],
    summary: "Small-batch leather folio with edge paint and hardware consistency.",
    role: [
      "factory-sourcing",
      "sample-development",
      "production-management",
    ],
    involvement: "contribution",
    coverImage: "/projects/demo-compact.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
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
  involvement?: Involvement | "all" | null;
}) {
  const material = options?.material;
  const ip = options?.ip;
  const involvement = options?.involvement;

  return projects.filter((project) => {
    const materialOk =
      !material || material === "all" || project.materials.includes(material);
    const ipOk = !ip || project.ips.includes(ip);
    const involvementOk =
      !involvement ||
      involvement === "all" ||
      project.involvement === involvement;
    return materialOk && ipOk && involvementOk;
  });
}

/** Related strip: other projects, stable shuffle by seed, capped. */
export function getRelatedProjects(
  excludeSlugs: string[],
  limit = 5,
): Project[] {
  const exclude = new Set(excludeSlugs);
  const pool = projects.filter((p) => !exclude.has(p.slug));
  const ranked = [...pool].sort((a, b) => {
    const ha = hashSlug(a.slug);
    const hb = hashSlug(b.slug);
    return ha - hb;
  });
  return ranked.slice(0, limit);
}

function hashSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** @deprecated use filterProjects */
export function filterProjectsByMaterial(material?: Material | "all" | null) {
  return filterProjects({ material });
}

/** Full-bleed projects hero (legacy static cover) */
export const projectsCoverImage = asset("/images/projects/project-hero.png");

/** Homeroll pool on CDN — filenames use spaces around the dash */
const HOMEROLL_IMAGE_COUNT = 12;
const HOMEROLL_SLOT_COUNT = 23;

export type ProjectsHeroRollItem = {
  id: string;
  src: string;
  href: string;
  alt: string;
};

/** Placeholder hrefs — swap when real project URLs land */
export const projectsHeroRoll: ProjectsHeroRollItem[] = Array.from(
  { length: HOMEROLL_SLOT_COUNT },
  (_, index) => {
    const imageNumber = (index % HOMEROLL_IMAGE_COUNT) + 1;
    const slug = projects[index % projects.length]?.slug ?? "wimbledon";
    return {
      id: `homeroll-${index + 1}`,
      src: asset(`/images/projects/homeroll - ${imageNumber}.jpg`),
      href: `/projects/${slug}`,
      alt: `Project highlight ${index + 1}`,
    };
  },
);

/** Cycling hero lines over the roll */
export const projectsHeroLines = [
  "Making Stories Tangible",
  "Beyond Manufacturing. Creating Experiences.",
  "From Concept to Production",
  "Details Define Excellence",
  "Your Vision. My Execution.",
  "From First Sketch to Final Shipment",
] as const;
