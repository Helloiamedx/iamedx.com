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
  /**
   * Case detail — first still under the hero.
   * When set, replaces `coverImage` in the gallery only (index cards keep `coverImage`).
   */
  galleryLeadImage?: string;
  /** Case detail first-screen still (used when no hero video) */
  heroImage?: string;
  /**
   * Case detail first-screen self-hosted video (wins over YouTube / still).
   * Optional `heroVideoStart` / `heroVideoEnd` = segment in seconds (e.g. 79–401 = 1:19–6:41).
   * Prefer a pre-trimmed file and omit start/end when possible.
   */
  heroVideo?: string;
  heroVideoStart?: number;
  heroVideoEnd?: number;
  /**
   * Case detail first-screen YouTube background (wins over `heroImage`).
   * Prefer `heroVideo` when a CDN file exists.
   */
  heroYoutubeId?: string;
  heroYoutubeStart?: number;
  heroYoutubeEnd?: number;
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
/** Index card + featured lead — same asset */
const FIRST_PROJECT_FEATURED_COVER = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali Companion Bundle.jpg",
);
const FIRST_PROJECT_HERO = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali.jpg",
);
/** Self-hosted hero background — pre-trimmed clip (play from start, native loop) */
const FIRST_PROJECT_HERO_VIDEO = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Tali Remastered - Mass Effect 3 - 2018 (Video Spoil).mp4",
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

/** 「第二个项目」— grid card under the featured lead */
const SECOND_PROJECT_NAME = "Dragon Age Writing Bundle";
const SECOND_PROJECT_SLUG = projectSlugFromName(SECOND_PROJECT_NAME);
const SECOND_PROJECT_COVER = projectCoverFromName(
  SECOND_PROJECT_NAME,
  "VARRIC TETHRAS cover.jpg",
);
/** Detail page — first still under the hero */
const SECOND_PROJECT_GALLERY_LEAD = projectCoverFromName(
  SECOND_PROJECT_NAME,
  "dragon-age-writing-bundle-banner-v1.png",
);
const SECOND_PROJECT_HERO_VIDEO = projectCoverFromName(
  SECOND_PROJECT_NAME,
  "VARRIC TETHRAS-monologue.mp4",
);
const SECOND_PROJECT_TAGLINE =
  '"Get the captain," Donnen sighed. "We\'ve got a dead magistrate."';

const SECOND_PROJECT_AFTER_COVER_STILLS = {
  items: [
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h1.jpg",
      ),
      alt: "Collector box",
    },
  ],
  ratio: "56.25%",
};
const SECOND_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(
          SECOND_PROJECT_NAME,
          "dragon-age-writing-bundle-banner-h2.jpg",
        ),
        alt: "Detail 2",
      },
      {
        src: projectCoverFromName(
          SECOND_PROJECT_NAME,
          "dragon-age-writing-bundle-banner-h3.jpg",
        ),
        alt: "Detail 3",
      },
    ],
    ratio: "100%",
  },
  {
    items: [
      {
        src: projectCoverFromName(
          SECOND_PROJECT_NAME,
          "dragon-age-writing-bundle-banner-h4.jpg",
        ),
        alt: "Detail 4",
      },
      {
        src: projectCoverFromName(
          SECOND_PROJECT_NAME,
          "dragon-age-writing-bundle-banner-h5.jpg",
        ),
        alt: "Detail 5",
      },
    ],
    ratio: "100%",
  },
];
const SECOND_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(
    SECOND_PROJECT_NAME,
    "dragon-age-writing-bundle processing.mov",
  ),
  alt: "Processing",
  ratio: "56.25%",
} as const;
const SECOND_PROJECT_AFTER_VIDEO_ROW = {
  items: [
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h6.jpg",
      ),
      alt: "Detail 6",
    },
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h7.jpg",
      ),
      alt: "Detail 7",
    },
  ],
  ratio: "100%",
};
const SECOND_PROJECT_BEFORE_END_ROW = {
  items: [
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h8.jpg",
      ),
      alt: "Detail 8",
    },
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h9.jpg",
      ),
      alt: "Detail 9",
    },
    {
      src: projectCoverFromName(
        SECOND_PROJECT_NAME,
        "dragon-age-writing-bundle-banner-h10.jpg",
      ),
      alt: "Detail 10",
    },
  ],
  ratio: "100%",
};

export const projectsFeaturedLead: ProjectsFeaturedLead = {
  slug: FIRST_PROJECT_SLUG,
  title: FIRST_PROJECT_NAME,
  tagline: "Found your home with Tali?",
  categories: involvementTags("end-to-end"),
  coverImage: FIRST_PROJECT_FEATURED_COVER,
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
    coverImage: FIRST_PROJECT_FEATURED_COVER,
    coverWidth: 1920,
    coverHeight: 1080,
    galleryLeadImage: FIRST_PROJECT_COVER,
    heroImage: FIRST_PROJECT_HERO,
    /* Self-hosted Tali Remastered — pre-trimmed, muted loop from start */
    heroVideo: FIRST_PROJECT_HERO_VIDEO,
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
    slug: SECOND_PROJECT_SLUG,
    title: SECOND_PROJECT_NAME,
    materials: ["metal", "leather", "paper", "fabric"],
    ips: ["dragon-age"],
    tags: involvementTags("end-to-end"),
    summary: SECOND_PROJECT_TAGLINE,
    tagline: SECOND_PROJECT_TAGLINE,
    headline: SECOND_PROJECT_TAGLINE,
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: SECOND_PROJECT_COVER,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: SECOND_PROJECT_GALLERY_LEAD,
    heroImage: SECOND_PROJECT_COVER,
    heroVideo: SECOND_PROJECT_HERO_VIDEO,
    afterCoverStills: SECOND_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: SECOND_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: SECOND_PROJECT_AFTER_COVER_VIDEO,
    afterVideoRow: SECOND_PROJECT_AFTER_VIDEO_ROW,
    beforeEndRow: SECOND_PROJECT_BEFORE_END_ROW,
    overview: [
      "This project was a writing-themed collector’s gift set developed around Varric Tethras from Dragon Age.",
      "In the game, Varric is not only an adventurer, but also a writer and storyteller. Hard in Hightown is one of the works closely connected to his character. Based on that idea, the set was built around his identity as a writer, using items such as a quill, ink, notebook, ribbon, and metal details to turn that part of the game world into something fans could actually use and collect.",
      "The goal was not simply to put several merchandise items into one box. The different materials and production methods had to come together under the same visual language, so the whole set would feel like it belonged to the same character and the same world.",
    ],
    challengesBody: [
      "One of the biggest challenges was keeping the visual result consistent across different materials and production processes, while also meeting the quality and testing requirements of a collectible product.",
      "The first challenge was color consistency.",
      "The set mainly used gold, magenta, and black, but those colors had to appear across very different materials, including feathers, ribbon, leather, paper, and metal parts. The same color can look very different depending on the material, surface finish, and the way it reflects light.",
      "So it was not just a matter of finding the right supplier or giving everyone the same color reference. It required a lot of color matching, supplier coordination, and sample comparison to make sure all the parts still looked consistent when they were finally put together.",
      "The second challenge was the accuracy of the notebook cover.",
      "The leather cover went through processes such as embossing and foil stamping, which could cause some compression or deformation in the material. At the same time, several metal decorations, graphics, and text elements had to be placed accurately on the same surface.",
      "When so many details come together on one area, even a small shift can affect the final appearance. Keeping everything aligned through different production steps was one of the key challenges.",
      "The third challenge was testing and compliance.",
      "The set included many different materials, such as metal, leather, paper, feathers, ribbon, and ink. Ink in particular required extra attention. This meant the product involved several different testing requirements, and each material needed to be checked carefully to make sure the final product could pass the required tests and receive qualified reports.",
    ],
    executionBody: [
      "At the beginning of the project, I did not immediately start looking for materials or suppliers. I first focused on understanding what really made the design work.",
      "For me, the key was consistency. Even though the set was made up of many different parts, the customer should not open the box and feel like they were looking at a group of unrelated products. Everything needed to feel like it had been designed as one complete set from the beginning.",
      "Because of that, I treated color consistency, material coordination, and the overall premium look as the main standards throughout development. Material selection, sampling, and production decisions were all made around that direction.",
      "Color matching took a large amount of work.",
      "The same magenta had to appear on completely different materials such as feathers, ribbon, and leather. This was not something that could be solved by simply sending suppliers one color code.",
      "I collected physical samples from many suppliers, compared them side by side, and went through multiple rounds of screening and sampling. If there was no suitable stock color available, I arranged custom sampling and color adjustment until the different materials worked together visually.",
      "The important part was that I was not judging each component by itself. A color might look correct on its own but still feel wrong once it was placed next to another material. So the final decision was always based on how the whole set looked together.",
      "I also got involved in product testing early in the development process.",
      "I communicated with testing agencies such as SGS to understand exactly which tests were required and what the limits were. I then brought those requirements back to the suppliers during material selection and sampling.",
      "For example, if certain substances, parameters, or material contents had specific limits, I made those requirements clear before production started.",
      "The idea was not to finish the product first and then send it for testing to see whether it passed. I wanted to remove as many risks as possible during development, so suppliers could provide suitable materials from the beginning. This helped reduce the risk of rework, repeated testing, extra cost, and lost time.",
      "Another area I spent a lot of time on was how the components were fixed and presented inside the packaging.",
      "The first impression matters a lot for a collectible product. I did not want to use too many visible ties, clips, or supporting parts just to hold everything in place. Those solutions might make assembly easier, but they could also distract from the product itself.",
      "I tested and developed several assembly options, with a focus on fixing the products mainly from the back so that as little supporting structure as possible would be visible from the front.",
      "The final solution kept the components secure while still giving the customer a clean and complete view of the product when the box was opened.",
      "Overall, my role was to understand what the design was really trying to achieve, and then turn those ideas into practical requirements for materials, color, testing, and assembly.",
    ],
    impactBody: [
      "This project further demonstrated my ability to handle complex custom product development.",
      "Whether the same color needs to be matched across completely different materials, or different colors need to be achieved through different materials and processes, I can work through material sourcing, color matching, sampling, and production adjustments to keep everything within the same design language.",
      "For the client’s designers, this means they do not have to limit their ideas too early because of concerns about materials or manufacturing.",
      "Some effects may look difficult to achieve when they first appear in a design file, but that does not necessarily mean they cannot be made. Many of those ideas can be worked through during product development by finding the right materials, processes, and production solutions.",
      "For me, the value of this project was not only in delivering the final set. It was also about giving the client more confidence to explore their design ideas, knowing that I could help turn those ideas into real products.",
    ],
    year: 2024,
    client: "Dragon Age",
    featured: false,
    challenge:
      "Keep color, cover accuracy, and compliance consistent across feathers, ribbon, leather, paper, metal, and ink.",
    result:
      "A cohesive writing collectible—and more confidence for the client to explore design ideas into real products.",
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
    const slug = projects[index % projects.length]?.slug ?? FIRST_PROJECT_SLUG;
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
