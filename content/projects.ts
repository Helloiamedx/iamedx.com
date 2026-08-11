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

/** Card chip + filter pill label for an involvement id */
export function getInvolvementLabel(id: Involvement): string {
  return (
    involvementFilters.find((item) => item.id === id)?.label ?? id
  );
}

/** Tags always mirror involvement — Brand / Travel chips are retired */
export function involvementTags(id: Involvement): string[] {
  return [getInvolvementLabel(id)];
}

export type Project = {
  slug: string;
  title: string;
  materials: Material[];
  /** IP franchise slugs, e.g. cyberpunk-2077 */
  ips: string[];
  /**
   * Category chips under the cover — must match involvement filter labels:
   * End-to-End Projects | Project Contribution | Specialized Services.
   * Prefer `involvementTags(involvement)` when authoring.
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
  /** Case detail first-screen still (replaces default hero video when set) */
  heroImage?: string;
  /** Case detail first-screen Vimeo (falls back to default demo reel) */
  heroVimeoId?: string;
  heroVimeoHash?: string;
  /** Case Background chapter — headline (legacy / optional) */
  statementHeadline?: string;
  /** Case Background chapter — body paragraphs */
  overview?: string | string[];
  /** Case Challenge chapter */
  challengesHeadline?: string;
  challengesBody?: string | string[];
  /** Case What I did chapter */
  executionHeadline?: string;
  executionBody?: string | string[];
  /** Case Outcome chapter */
  impactHeadline?: string;
  impactBody?: string | string[];
  gallery?: string[];
  /**
   * Still(s) directly under the first gallery still (row 2).
   * One item → full-width; multiple → equal columns in one row.
   * Video (`afterCoverVideo`) follows as the next row.
   */
  afterCoverStills?: {
    items: { src: string; alt: string }[];
    /** CSS padding-bottom ratio per cell / full frame */
    ratio?: string;
  };
  /** Extra still rows after `afterCoverStills`, before the process video. */
  afterCoverExtraRows?: {
    items: { src: string; alt: string }[];
    ratio?: string;
  }[];
  /**
   * Full-width video under the after-cover stills (or under cover if no stills).
   * Prefer original URL as `primary`; CDN backup as `fallback` when provided.
   */
  afterCoverVideo?: {
    primary: string;
    fallback?: string;
    alt: string;
    /** CSS padding-bottom ratio; default 16:9 */
    ratio?: string;
  };
  /** Full-width stills after the process video (each item = one row). */
  afterVideoStills?: { src: string; alt: string; ratio?: string }[];
  /**
   * Multi-up stills after the process video (2–3 equal columns).
   * `afterIndex` = how many `afterVideoStills` come before this row (default: all → end).
   */
  afterVideoRow?: {
    items: { src: string; alt: string }[];
    ratio?: string;
    afterIndex?: number;
  };
  /** Still row just above the closing video pair (second-to-last). */
  beforeEndRow?: {
    items: { src: string; alt: string }[];
    ratio?: string;
  };
  /**
   * Optional closing two-up videos on the case page.
   * Each side tries `primary` first; `fallback` only when the user supplies a CDN mp4.
   */
  endVideoPair?: {
    left: { primary: string; fallback?: string; alt: string };
    right: { primary: string; fallback?: string; alt: string };
  };
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

/** Slug from project display name — keeps `/projects/[slug]` in sync with the title */
export function projectSlugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * CDN cover path follows the project folder name:
 * `/images/projects/{Project Name}/{Project Name}.jpg`
 */
export function projectCoverFromName(
  name: string,
  fileName = `${name}.jpg`,
) {
  const folder = encodeURIComponent(name);
  const file = encodeURIComponent(fileName);
  return asset(`/images/projects/${folder}/${file}`);
}

/** 「第一个项目」— name drives title, slug, and cover URL */
const FIRST_PROJECT_NAME = "Mass Effect Tali Companion Bundle";
const FIRST_PROJECT_SLUG = projectSlugFromName(FIRST_PROJECT_NAME);
const FIRST_PROJECT_COVER = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali Companion Bundle-hero.jpg",
);
const FIRST_PROJECT_HERO = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali.jpg",
);
const FIRST_PROJECT_AFTER_COVER_STILLS = {
  items: [
    {
      src: projectCoverFromName(
        FIRST_PROJECT_NAME,
        "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle color1.jpg",
      ),
      alt: "Color 1",
    },
    {
      src: projectCoverFromName(
        FIRST_PROJECT_NAME,
        "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle color2.jpg",
      ),
      alt: "Color 2",
    },
  ],
  ratio: "100%",
};
const FIRST_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(
          FIRST_PROJECT_NAME,
          "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle woodenbox2.jpg",
        ),
        alt: "Wooden box 2",
      },
      {
        src: projectCoverFromName(
          FIRST_PROJECT_NAME,
          "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle woodenbox1.jpg",
        ),
        alt: "Wooden box 1",
      },
      {
        src: projectCoverFromName(
          FIRST_PROJECT_NAME,
          "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle woodenbox4.jpg",
        ),
        alt: "Wooden box 4",
      },
    ],
    ratio: "100%",
  },
];
const FIRST_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(FIRST_PROJECT_NAME, "Processing.mp4"),
  alt: "Processing",
  ratio: "56.25%",
} as const;
const FIRST_PROJECT_AFTER_VIDEO_STILLS = [
  {
    src: projectCoverFromName(
      FIRST_PROJECT_NAME,
      "Mass Effect Tali Companion Bundle overview.jpg",
    ),
    alt: "Overview",
    ratio: "56.25%",
  },
];
const FIRST_PROJECT_AFTER_VIDEO_ROW = {
  items: [
    {
      src: projectCoverFromName(
        FIRST_PROJECT_NAME,
        "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle Statue3.jpg",
      ),
      alt: "Statue 3",
    },
    {
      src: projectCoverFromName(
        FIRST_PROJECT_NAME,
        "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle Statue1.jpg",
      ),
      alt: "Statue 1",
    },
    {
      src: projectCoverFromName(
        FIRST_PROJECT_NAME,
        "Mass Effect Tali Companion Bundle Mass Effect Tali Companion Bundle Statue2.jpg",
      ),
      alt: "Statue 2",
    },
  ],
  ratio: "100%",
  afterIndex: 1,
};
const FIRST_PROJECT_END_VIDEOS = {
  left: {
    primary:
      "https://www.tiktok.com/@forever_normandy/video/7535653105963224333?is_from_webapp=1&sender_device=pc",
    fallback: projectCoverFromName(
      FIRST_PROJECT_NAME,
      "Tali companion bundle unboxing.mp4",
    ),
    alt: "Tali companion bundle unboxing",
  },
  right: {
    primary:
      "https://www.tiktok.com/@forever_normandy/video/7539356566965718327?is_from_webapp=1&sender_device=pc",
    fallback: projectCoverFromName(
      FIRST_PROJECT_NAME,
      "Garrus companion bundle unboxing.mp4",
    ),
    alt: "Garrus companion bundle unboxing",
  },
} as const;

export const projectsFeaturedLead: ProjectsFeaturedLead = {
  slug: FIRST_PROJECT_SLUG,
  title: FIRST_PROJECT_NAME,
  tagline: "Found your home with Tali?",
  categories: involvementTags("end-to-end"),
  coverImage: FIRST_PROJECT_COVER,
  coverWidth: 1920,
  coverHeight: 1080,
};

export const projects: Project[] = [
  {
    slug: FIRST_PROJECT_SLUG,
    title: FIRST_PROJECT_NAME,
    materials: ["wood", "resin", "metal", "paper"],
    ips: ["mass-effect"],
    tags: involvementTags("end-to-end"),
    summary: "Found your home with Tali?",
    tagline: "Found your home with Tali?",
    headline: "Found your home with Tali?",
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: FIRST_PROJECT_COVER,
    coverWidth: 1920,
    coverHeight: 1080,
    heroImage: FIRST_PROJECT_HERO,
    afterCoverStills: FIRST_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FIRST_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: FIRST_PROJECT_AFTER_COVER_VIDEO,
    afterVideoStills: FIRST_PROJECT_AFTER_VIDEO_STILLS,
    afterVideoRow: FIRST_PROJECT_AFTER_VIDEO_ROW,
    endVideoPair: FIRST_PROJECT_END_VIDEOS,
    overview: [
      "This project was a character-themed collectible set based on the Mass Effect IP. It was designed to bring the character to life through several physical components and create a complete collectible experience. The set included a wooden display box, a resin sculpture, a metal necklace, and a themed letter. Different materials and manufacturing processes had to be brought together while keeping the overall look and quality consistent.",
      "The set was developed around the Mass Effect character Tali’Zorah. The goal was to turn the original IP design into a product that could actually be manufactured at scale, combining woodworking, resin casting, metal accessories, and other production processes into one finished collectible set.",
    ],
    challengesBody: [
      "The main challenges were around the surface finish of the wooden box and the structure of the sculpture.",
      "The wooden box had several visual requirements. The client wanted it to look metallic even though the actual material was wood, so the surface finish had to create a convincing metal-like appearance.",
      "Color consistency after laser engraving was another major issue. Because wood naturally contains moisture, the heat from laser engraving burns the surface and makes the engraved areas much darker, sometimes almost black, while the untouched areas keep the original wood color. This meant there was already a clear color difference before painting. The final finish had to hide this difference while still creating the metallic appearance the client wanted.",
      "The client also did not want the engraved areas to look completely flat. They wanted more texture and depth. Since the engraving pattern and laser path had already been defined, we had to find a way to create the required texture within the existing design, while also controlling the density and direction of the pattern.",
      "The sculpture had a different challenge: cost. Producing the whole sculpture as one piece would have made manufacturing much more expensive. We needed to find a structure that could reduce production cost without losing the detail and overall collectible quality of the sculpture.",
    ],
    executionBody: [
      "I started by looking at the coating material itself and worked with the factory to test and adjust different aluminum silver pigments. After several rounds of testing, we found a formula that gave the surface the metallic appearance we wanted and added it to the coating process.",
      "The aluminum pigment also had enough coverage to hide the dark areas created by laser engraving. At the same time, the metal particles created natural, uneven reflections across the surface. This not only solved the color difference between the engraved and non-engraved areas, but also gave the wooden box an aged-metal look. The final sample actually looked better than we originally expected.",
      "For the texture inside the engraved areas, I contacted the laser equipment manufacturer and asked them to help modify the engraving program. We added several different filling patterns within the existing laser path and tested how each one looked. This allowed us to create the line and grain effect the client wanted while keeping the original design unchanged.",
      "For the sculpture, I worked with the engineering team to break the original structure into several separately producible parts. We then tested the manufacturability of each part and the stability of the final assembly. The point was not simply to split the sculpture into pieces, but to make sure those pieces could be put back together securely without noticeably affecting the original appearance or details. Through this structural and assembly testing, we found a production method that reduced cost while keeping the final result intact.",
    ],
    impactBody: [
      "The final result was quite different from most similar products on the market at the time. Although the main material was wood, the surface treatment gave it a convincing metal-like appearance. It moved away from the look of a traditional wooden box and allowed the client to achieve a much more premium finish at a relatively low manufacturing cost.",
      "The product was also very competitive in price and sold quickly after launch. The result gave the client enough confidence to continue developing another two or three products using a similar approach.",
    ],
    year: 2024,
    client: "Mass Effect",
    featured: true,
    challenge:
      "Deliver a metal-like wooden box finish and a lower-cost sculpture structure without losing collectible quality.",
    result:
      "A premium metallic wood finish at competitive cost, with strong sell-through and follow-on SKUs.",
  },
  {
    slug: "wimbledon",
    title: "Wimbledon",
    materials: ["fabric", "paper"],
    ips: [],
    tags: involvementTags("end-to-end"),
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
    featured: false,
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
    tags: involvementTags("end-to-end"),
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
    tags: involvementTags("end-to-end"),
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
    tags: involvementTags("end-to-end"),
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
    tags: involvementTags("contribution"),
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
    tags: involvementTags("specialized"),
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
    tags: involvementTags("end-to-end"),
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
    tags: involvementTags("end-to-end"),
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
    tags: involvementTags("contribution"),
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
  /* —— Placeholder seeds for involvement filter density (swap when real work lands) —— */
  {
    slug: "anodized-phone-stand",
    title: "Anodized phone stand",
    materials: ["metal"],
    ips: ["halo-guardians"],
    tags: involvementTags("contribution"),
    summary: "CNC stand with locked anodize color across three finish lots.",
    tagline: "CNC stand with locked anodize color across three finish lots",
    role: ["factory-sourcing", "sample-development"],
    involvement: "contribution",
    coverImage: "/projects/demo-landscape.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2025,
    featured: true,
    challenge: "Hold anodize hue between sample and volume without re-quoting finish.",
    result: "Verified shop, locked color standard, cleared PP sample.",
  },
  {
    slug: "injection-clip-set",
    title: "Injection clip set",
    materials: ["resin"],
    ips: ["destiny"],
    tags: involvementTags("contribution"),
    summary: "Small clip family with shared tooling and consistent gate finish.",
    tagline: "Shared tooling with consistent gate finish across SKUs",
    role: ["factory-verification", "sample-development"],
    involvement: "contribution",
    coverImage: "/projects/demo-square.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: true,
    challenge: "Keep clip snap force in range when cavity count increases.",
    result: "Process window documented; first run passed pull tests.",
  },
  {
    slug: "soft-touch-lid-insert",
    title: "Soft-touch lid insert",
    materials: ["fabric", "paper"],
    ips: [],
    tags: involvementTags("contribution"),
    summary: "Lid insert with soft-touch wear check before holiday volume.",
    tagline: "Soft-touch wear check before holiday volume",
    role: ["sample-development", "production-management"],
    involvement: "contribution",
    coverImage: "/projects/demo-wide.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2025,
    featured: false,
    challenge: "Soft-touch looked premium on day one and scuffed by week two.",
    result: "Finish stack revised; abrasion standard added to QC sheet.",
  },
  {
    slug: "die-cut-sleeve-system",
    title: "Die-cut sleeve system",
    materials: ["paper"],
    ips: ["starfield"],
    tags: involvementTags("specialized"),
    summary: "Structural sleeve for retail sets with transit crush resistance.",
    tagline: "Retail sleeve with transit crush resistance",
    role: ["custom-packaging"],
    involvement: "specialized",
    coverImage: "/projects/demo-wide.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: true,
    challenge: "Reduce plastic while keeping corner protection on long-haul cartons.",
    result: "Paper structure passed drop tests and replaced poly wrap.",
  },
  {
    slug: "foam-fitment-kit",
    title: "Foam fitment kit",
    materials: ["fabric"],
    ips: ["tomb-raider"],
    tags: involvementTags("specialized"),
    summary: "Custom foam kit for fragile gift sets across two carton sizes.",
    tagline: "Custom foam kit across two carton sizes",
    role: ["custom-packaging", "sample-development"],
    involvement: "specialized",
    coverImage: "/projects/demo-compact.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2025,
    featured: true,
    challenge: "One foam CAD had to flex for US and EU carton footprints.",
    result: "Shared cut nest; both cartons cleared ISTA sample.",
  },
  {
    slug: "label-and-stamp-pack",
    title: "Label and stamp pack",
    materials: ["paper"],
    ips: [],
    tags: involvementTags("specialized"),
    summary: "Pad-print and label package for a three-SKU accessory launch.",
    tagline: "Pad-print and label package for a three-SKU launch",
    role: ["custom-packaging"],
    involvement: "specialized",
    coverImage: "/projects/demo-portrait.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2023,
    featured: false,
    challenge: "Logo sharpness drifted after heat and handling on dark finishes.",
    result: "Ink and stamp sequence locked with reject photo library.",
  },
  {
    slug: "travel-bottle-tray",
    title: "Travel bottle tray",
    materials: ["metal", "fabric"],
    ips: ["horizon-zero-dawn"],
    tags: involvementTags("end-to-end"),
    summary: "End-to-end tray from sketch through first carton for a travel brand.",
    tagline: "From sketch through first carton for a travel brand",
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
    challenge: "Balance weight, felt lining, and MOQ without losing the gift feel.",
    result: "Approved construction; first run shipped on the launch calendar.",
  },
  {
    slug: "ceramic-sample-board",
    title: "Ceramic sample board",
    materials: ["resin"],
    ips: ["cyberpunk-2077"],
    tags: involvementTags("end-to-end"),
    summary: "Finish board used to freeze glaze ranges before steel is cut.",
    tagline: "Freeze glaze ranges before steel is cut",
    role: ["product-development", "sample-development"],
    involvement: "end-to-end",
    coverImage: "/projects/demo-square.svg",
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: true,
    challenge: "Marketing wanted three glazes; tooling could only protect two.",
    result: "Board forced a dated freeze; two glazes shipped with clear QC.",
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

/** Projects hero roll pool on CDN — projectsroll1…22 (mostly .jpg; a few .jpeg) */
const PROJECTS_ROLL_COUNT = 22;
/** These four were uploaded as `.jpeg`, not `.jpg` — requesting .jpg 404s */
const PROJECTS_ROLL_JPEG = new Set([7, 8, 10, 11]);

export type ProjectsHeroRollItem = {
  id: string;
  src: string;
  href: string;
  alt: string;
};

/** Placeholder hrefs — swap when real project URLs land */
export const projectsHeroRoll: ProjectsHeroRollItem[] = Array.from(
  { length: PROJECTS_ROLL_COUNT },
  (_, index) => {
    const imageNumber = index + 1;
    const slug = projects[index % projects.length]?.slug ?? "wimbledon";
    const ext = PROJECTS_ROLL_JPEG.has(imageNumber) ? "jpeg" : "jpg";
    return {
      id: `projectsroll-${imageNumber}`,
      src: asset(`/images/projects/projectsroll${imageNumber}.${ext}`),
      href: `/projects/${slug}`,
      alt: `Project highlight ${imageNumber}`,
    };
  },
);

/** Cycling hero lines over the roll — each entry is one or more display rows */
export const projectsHeroLines = [
  ["Making Stories Tangible"],
  ["Beyond Manufacturing", "Creating Experiences"],
  ["From Concept to Production"],
  ["Details Define Excellence"],
  ["Your Vision", "My Execution"],
  ["From First Sketch", "to Final Shipment"],
] as const;
