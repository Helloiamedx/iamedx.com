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
  /**
   * Index / Related card cover as muted looping video (wins over `coverImage`).
   * Use when the user supplies an mp4 for the outside card.
   */
  coverVideo?: string;
  /** Intrinsic cover size — drives card aspect / relative scale */
  coverWidth: number;
  coverHeight: number;
  /**
   * Case detail — first still under the hero.
   * Index `coverImage` must never be reused here; only set when the user
   * supplies a dedicated detail still.
   */
  galleryLeadImage?: string;
  /** Case detail first-screen still (used when no hero video) — not the index card cover */
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
  /**
   * Full-width videos after stills, in order.
   * When set, used instead of a single `afterCoverVideo`.
   */
  afterCoverVideos?: {
    primary: string;
    fallback?: string;
    alt: string;
    ratio?: string;
  }[];
  /**
   * Two-up row after stills / before `afterCoverVideos`: still left, video right.
   */
  afterCoverStillVideoPair?: {
    still: { src: string; alt: string };
    video: {
      primary: string;
      fallback?: string;
      alt: string;
    };
    /** CSS padding-bottom ratio per cell; default 100% */
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
   * `ratio` = CSS padding-bottom per cell (default 9:16 / 177.78% for social clips).
   */
  endVideoPair?: {
    left: { primary: string; fallback?: string; alt: string };
    right: { primary: string; fallback?: string; alt: string };
    ratio?: string;
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
  /** When set, featured media plays this muted loop instead of `coverImage` */
  coverVideo?: string;
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

/** Mass Effect Tali — grid / detail (no longer the projects featured lead) */
const FIRST_PROJECT_NAME = "Mass Effect Tali Companion Bundle";
const FIRST_PROJECT_SLUG = projectSlugFromName(FIRST_PROJECT_NAME);
const FIRST_PROJECT_COVER = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali Companion Bundle-hero.jpg",
);
/** Index card cover (featured lead uses NECROM Look Book Bundle) */
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
/** Detail page — closing full-width still (was first gallery row) */
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
};
const SECOND_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
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
  /* Lead still follows beforeEndRow — keep this row before trailing stills */
  afterIndex: 0,
};
const SECOND_PROJECT_AFTER_VIDEO_STILLS = [
  {
    src: SECOND_PROJECT_GALLERY_LEAD,
    alt: "Writing Bundle",
    ratio: "56.25%",
  },
];
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

/** 「第三个项目」— grid card under the featured lead */
const THIRD_PROJECT_NAME = "Horizon Zero Dawn The Thunderjaw Collection Statue";
/** CDN folder casing (covers / future gallery) — keep exact */
const THIRD_PROJECT_CDN_FOLDER =
  "Horizon zero dawn the thunderjaw collection statue";
const THIRD_PROJECT_SLUG = projectSlugFromName(THIRD_PROJECT_NAME);
const THIRD_PROJECT_COVER = projectCoverFromName(
  THIRD_PROJECT_CDN_FOLDER,
  "Horizon zero dawn the thunderjaw collection statue hero.jpg",
);
const THIRD_PROJECT_HERO_VIDEO = projectCoverFromName(
  THIRD_PROJECT_CDN_FOLDER,
  "Horizon Zero Dawn - The Machines- Thunderjaw.mp4",
);
const THIRD_PROJECT_TAGLINE =
  "Thunderjaw resin sculpture capturing the ultimate power of machine and battle.";

const THIRD_PROJECT_STILL = (n: 1 | 2 | 3 | 4 | 5 | 6, alt: string) => ({
  src: projectCoverFromName(
    THIRD_PROJECT_CDN_FOLDER,
    `Horizon Zero Dawn - The Machines- Thunderjaw${n}.jpg`,
  ),
  alt,
});

/** Detail gallery: 1 full → 2|3 → 4|5|6 → 8|Machines → unboxing */
const THIRD_PROJECT_GALLERY_LEAD = THIRD_PROJECT_STILL(1, "Thunderjaw 1").src;
const THIRD_PROJECT_AFTER_COVER_STILLS = {
  items: [
    THIRD_PROJECT_STILL(2, "Thunderjaw 2"),
    THIRD_PROJECT_STILL(3, "Thunderjaw 3"),
  ],
  ratio: "100%",
};
const THIRD_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      THIRD_PROJECT_STILL(4, "Thunderjaw 4"),
      THIRD_PROJECT_STILL(5, "Thunderjaw 5"),
      THIRD_PROJECT_STILL(6, "Thunderjaw 6"),
    ],
    ratio: "100%",
  },
];
/** Row 4: still 8 | Machines clip — then unboxing full-width */
const THIRD_PROJECT_AFTER_COVER_STILL_VIDEO_PAIR = {
  still: {
    src: projectCoverFromName(
      THIRD_PROJECT_CDN_FOLDER,
      "Horizon Zero Dawn - The Machines- Thunderjaw8.jpg",
    ),
    alt: "Thunderjaw 8",
  },
  video: {
    primary: projectCoverFromName(
      THIRD_PROJECT_CDN_FOLDER,
      "Horizon Zero Dawn - The Machines- Thunderjawshow.mp4",
    ),
    alt: "The Machines — Thunderjaw",
  },
  ratio: "100%",
} as const;
const THIRD_PROJECT_AFTER_COVER_VIDEOS = [
  {
    primary: projectCoverFromName(
      THIRD_PROJECT_CDN_FOLDER,
      "Unboxing - Horizon Zero Dawn Thunderjaw Collection and Collector's Edition Comparison.mp4",
    ),
    alt: "Thunderjaw Collection unboxing and Collector's Edition comparison",
    ratio: "56.25%",
  },
] as const;

/** 「第四个项目」— grid card under the featured lead */
const FOURTH_PROJECT_NAME =
  "The Elder Scrolls Online 10-Year Coin Shadowbox";
const FOURTH_PROJECT_SLUG = projectSlugFromName(FOURTH_PROJECT_NAME);
const FOURTH_PROJECT_COVER = projectCoverFromName(
  FOURTH_PROJECT_NAME,
  "cover.jpg",
);
const FOURTH_PROJECT_TAGLINE =
  "A 10th anniversary collectible designed to preserve the memories, stories, and connections built within The Elder Scrolls Online community.";
/** Detail hero — self-hosted intro clip (muted, loops from start) */
const FOURTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  FOURTH_PROJECT_NAME,
  "The Elder Scrolls Online 10-Year Coin Shadowboxintrude.mp4",
);

const FOURTH_PROJECT_STILL = (file: string, alt: string) => ({
  src: projectCoverFromName(FOURTH_PROJECT_NAME, file),
  alt,
});

/** Detail gallery: cover → 3 → 1|2 → 4|6|5 → drawing */
const FOURTH_PROJECT_GALLERY_LEAD = FOURTH_PROJECT_COVER;
const FOURTH_PROJECT_AFTER_COVER_STILLS = {
  items: [FOURTH_PROJECT_STILL("Coin Shadowbox3.jpg", "Coin Shadowbox 3")],
  ratio: "56.25%",
};
const FOURTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      FOURTH_PROJECT_STILL("Coin Shadowbox1.jpg", "Coin Shadowbox 1"),
      FOURTH_PROJECT_STILL("Coin Shadowbox2.jpg", "Coin Shadowbox 2"),
    ],
    ratio: "100%",
  },
  {
    items: [
      FOURTH_PROJECT_STILL("Coin Shadowbox4.jpg", "Coin Shadowbox 4"),
      FOURTH_PROJECT_STILL("Coin Shadowbox6.jpg", "Coin Shadowbox 6"),
      FOURTH_PROJECT_STILL("Coin Shadowbox5.jpg", "Coin Shadowbox 5"),
    ],
    ratio: "100%",
  },
];
const FOURTH_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(FOURTH_PROJECT_NAME, "drawing.mp4"),
  alt: "Drawing",
  ratio: "56.25%",
} as const;

/**
 * 「第一个项目」— full-width featured lead above the filter.
 * Index / featured cover and detail hero are separate clips.
 */
const FIFTH_PROJECT_NAME =
  "The Elder Scrolls Online NECROM Look Book Bundle";
const FIFTH_PROJECT_SLUG = projectSlugFromName(FIFTH_PROJECT_NAME);
const FIFTH_PROJECT_TAGLINE =
  "A physical tribute to the forbidden secrets of Apocrypha, bringing the Arcanist’s mystical power from Tamriel into a collectible experience.";
/** Outside card + featured lead cover */
const FIFTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  FIFTH_PROJECT_NAME,
  "The Elder Scrolls Online NECROM Look Book.mp4",
);
/** Case detail first-screen hero */
const FIFTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  FIFTH_PROJECT_NAME,
  "The Elder Scrolls Online NECROM Look hero.mp4",
);
/** Detail gallery — first full-width still under the hero */
const FIFTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  FIFTH_PROJECT_NAME,
  "The Elder Scrolls Online NECROM Look Book Bundlecover.jpg",
);
const FIFTH_PROJECT_STILL = (file: string, alt: string) => ({
  src: projectCoverFromName(FIFTH_PROJECT_NAME, file),
  alt,
});
/** Detail gallery row 2: 9 | 12 */
const FIFTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    FIFTH_PROJECT_STILL(
      "The Elder Scrolls Online NECROM Look Book Bundle - 9.jpg",
      "Look Book Bundle 9",
    ),
    FIFTH_PROJECT_STILL(
      "The Elder Scrolls Online NECROM Look Book Bundle - 12.jpg",
      "Look Book Bundle 12",
    ),
  ],
  ratio: "100%",
};
/** Detail gallery row 3: 7 | 6 | 8 */
const FIFTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      FIFTH_PROJECT_STILL(
        "The Elder Scrolls Online NECROM Look Book Bundle - 7.jpg",
        "Look Book Bundle 7",
      ),
      FIFTH_PROJECT_STILL(
        "The Elder Scrolls Online NECROM Look Book Bundle - 6.jpg",
        "Look Book Bundle 6",
      ),
      FIFTH_PROJECT_STILL(
        "The Elder Scrolls Online NECROM Look Book Bundle - 8.jpg",
        "Look Book Bundle 8",
      ),
    ],
    ratio: "100%",
  },
];
/** Detail gallery — closing full-width process clip */
const FIFTH_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(FIFTH_PROJECT_NAME, "developing.mp4"),
  alt: "Developing",
  ratio: "56.25%",
} as const;

/** 「第六个项目」— grid card; media only until copy is ready */
const SIXTH_PROJECT_NAME = "Ghost Recon Wildlands Statue";
const SIXTH_PROJECT_SLUG = projectSlugFromName(SIXTH_PROJECT_NAME);
/** Outside / filter card cover */
const SIXTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  SIXTH_PROJECT_NAME,
  "Ghost Recon Wildlands Statue5.mp4",
);
/** Case detail first-screen hero */
const SIXTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  SIXTH_PROJECT_NAME,
  "Ghost Recon Wildlands Statue6.mp4",
);
const SIXTH_PROJECT_STILL = (n: 1 | 2 | 3, alt: string) => ({
  src: projectCoverFromName(
    SIXTH_PROJECT_NAME,
    `Ghost Recon Wildlands Statue${n}.jpg`,
  ),
  alt,
});
/** Detail gallery: 1 full → 2|3 → 4|7 video pair */
const SIXTH_PROJECT_GALLERY_LEAD = SIXTH_PROJECT_STILL(1, "Statue 1").src;
const SIXTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    SIXTH_PROJECT_STILL(2, "Statue 2"),
    SIXTH_PROJECT_STILL(3, "Statue 3"),
  ],
  ratio: "100%",
};
const SIXTH_PROJECT_END_VIDEOS = {
  left: {
    primary: projectCoverFromName(
      SIXTH_PROJECT_NAME,
      "Ghost Recon Wildlands Statue4.mp4",
    ),
    alt: "Statue clip 4",
  },
  right: {
    primary: projectCoverFromName(
      SIXTH_PROJECT_NAME,
      "Ghost Recon Wildlands Statue7.mp4",
    ),
    alt: "Statue clip 7",
  },
  ratio: "100%",
} as const;

/** 「第七个项目」— grid card cover only until detail media / copy are ready */
const SEVENTH_PROJECT_NAME = "DC Comics Injustice 2 The Brainiac Statue";
/** CDN folder casing — keep exact */
const SEVENTH_PROJECT_CDN_FOLDER =
  "Dc comics injustice 2 the brainiac statue";
const SEVENTH_PROJECT_SLUG = projectSlugFromName(SEVENTH_PROJECT_NAME);
const SEVENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  SEVENTH_PROJECT_CDN_FOLDER,
  "Dc comics injustice 2 the brainiac statue.mp4",
);

/** 「第八个项目」— grid card cover only until detail media / copy are ready */
const EIGHTH_PROJECT_NAME = "Recore Collector's Edition Statue";
const EIGHTH_PROJECT_CDN_FOLDER = "Recore collector's edition statue";
const EIGHTH_PROJECT_SLUG = projectSlugFromName(EIGHTH_PROJECT_NAME);
const EIGHTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  EIGHTH_PROJECT_CDN_FOLDER,
  "Recore collector's edition statue.mp4",
);

export const projectsFeaturedLead: ProjectsFeaturedLead = {
  slug: FIFTH_PROJECT_SLUG,
  title: FIFTH_PROJECT_NAME,
  tagline: FIFTH_PROJECT_TAGLINE,
  categories: involvementTags("end-to-end"),
  coverImage: FIFTH_PROJECT_COVER_VIDEO,
  coverVideo: FIFTH_PROJECT_COVER_VIDEO,
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
    summary:
      "A collectible created to preserve the journey, memories, and connection players built with Tali’Zorah throughout the Mass Effect universe.",
    tagline:
      "A collectible created to preserve the journey, memories, and connection players built with Tali’Zorah throughout the Mass Effect universe.",
    headline:
      "A collectible created to preserve the journey, memories, and connection players built with Tali’Zorah throughout the Mass Effect universe.",
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
    featured: false,
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
    heroImage: SECOND_PROJECT_COVER,
    heroVideo: SECOND_PROJECT_HERO_VIDEO,
    afterCoverStills: SECOND_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: SECOND_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: SECOND_PROJECT_AFTER_COVER_VIDEO,
    afterVideoRow: SECOND_PROJECT_AFTER_VIDEO_ROW,
    afterVideoStills: SECOND_PROJECT_AFTER_VIDEO_STILLS,
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
  {
    slug: THIRD_PROJECT_SLUG,
    title: THIRD_PROJECT_NAME,
    materials: ["resin"],
    ips: ["horizon-zero-dawn"],
    tags: involvementTags("contribution"),
    summary: THIRD_PROJECT_TAGLINE,
    tagline: THIRD_PROJECT_TAGLINE,
    headline: THIRD_PROJECT_TAGLINE,
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "contribution",
    coverImage: THIRD_PROJECT_COVER,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: THIRD_PROJECT_GALLERY_LEAD,
    heroVideo: THIRD_PROJECT_HERO_VIDEO,
    afterCoverStills: THIRD_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: THIRD_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverStillVideoPair: THIRD_PROJECT_AFTER_COVER_STILL_VIDEO_PAIR,
    afterCoverVideos: [...THIRD_PROJECT_AFTER_COVER_VIDEOS],
    overview: [
      "Horizon Zero Dawn is an action role-playing game developed by Guerrilla Games and published by Sony Interactive Entertainment.",
      "Set in a post-apocalyptic world where humans live in tribal societies alongside powerful mechanical creatures, the story follows Aloy as she explores the origins of the machines and uncovers the history behind the collapse of the old civilization.",
      "This project was developed around one of the game’s most recognizable machines, the Thunderjaw, and was designed as a premium collectible set for fans of the Horizon Zero Dawn universe.",
      "The centerpiece was a highly detailed Thunderjaw statue measuring approximately 38 cm tall and 39 cm long, assembled from more than 200 individual parts.",
      "The complete set also included an exclusive world map, Aloy’s Focus earpiece, two lithograph art prints, and premium packaging.",
      "Bringing these different components together required the project to combine collectible statue production, accessory development, printed materials, and packaging into one consistent product experience that reflected the visual quality and identity of the original game.",
    ],
    challengesBody: [
      "Recreating the Thunderjaw in resin was no easy feat, especially given the machine’s highly detailed and complex design. The greatest challenge lay in striking the right balance between mechanical realism and artistic interpretation. Each component, from the massive hydraulic legs to the intricately layered body armor, required exceptional precision.",
      "The sculptors faced difficulties with the Thunderjaw’s interlocking parts, which had to fit together seamlessly while maintaining the dynamic posture that captures its readiness for battle.",
      "Another significant hurdle was its massive size—ensuring the model’s proportions were accurate without compromising stability. Resin, while strong, has limitations when it comes to supporting such weight across multiple small joints, like the articulated tail or the delicate weaponry along its back.",
      "The sculptors had to develop an internal structure to reinforce stability while keeping the overall model lightweight enough for display.",
      "The paintwork also presented its own challenges—replicating the weathered, metallic look of the machine while adding lifelike touches to the synthetic parts required advanced layering techniques and precise color matching.",
    ],
    executionBody: [
      "I supported the development and production of the Thunderjaw statue from 3D model breakdown through molding, painting, assembly, and final quality control.",
      "One of the key challenges was making sure each component could be produced accurately and assembled correctly without affecting the overall appearance or structural stability of the statue.",
      "I coordinated the production requirements for different sections, including the mechanical joints, armor panels, weapons, and display base.",
      "I also followed the painting and finishing process to ensure the different materials, metallic effects, weathering, and surface details remained consistent with the original in-game design.",
      "During final assembly, I focused on part fit, structural integrity, visual consistency, and overall finishing quality, helping identify and resolve issues before the completed statues moved to final inspection and packaging.",
    ],
    year: 2024,
    client: "Horizon Zero Dawn",
    featured: false,
    challenge:
      "Balance mechanical realism and artistic interpretation in a large multi-part resin Thunderjaw—fit, stability, and weathered metallic paint.",
    result:
      "A premium Thunderjaw collectible set spanning statue production, accessories, prints, and packaging.",
  },
  {
    slug: FOURTH_PROJECT_SLUG,
    title: FOURTH_PROJECT_NAME,
    materials: ["metal", "wood"],
    ips: ["the-elder-scrolls"],
    tags: involvementTags("specialized"),
    summary: FOURTH_PROJECT_TAGLINE,
    tagline: FOURTH_PROJECT_TAGLINE,
    headline: FOURTH_PROJECT_TAGLINE,
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "specialized",
    coverImage: FOURTH_PROJECT_COVER,
    coverWidth: 1920,
    coverHeight: 1080,
    galleryLeadImage: FOURTH_PROJECT_GALLERY_LEAD,
    heroVideo: FOURTH_PROJECT_HERO_VIDEO,
    afterCoverStills: FOURTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FOURTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: FOURTH_PROJECT_AFTER_COVER_VIDEO,
    overview: [
      "The Elder Scrolls Online (ESO) has built a unique community over the past 10 years, bringing together millions of players through shared adventures, friendships, and unforgettable experiences.",
      "Beyond the game itself, ESO has become a place where players from different backgrounds connect, support each other, and create their own stories. Many players describe the community as welcoming, inclusive, and more like a family built through years of shared experiences.",
      "To celebrate the 10th anniversary milestone, this project was created as a commemorative collectible featuring a premium coin display shadowbox. The goal was to transform the history and emotional connection behind the game into a physical collectible that players could display and preserve as a reminder of their journey throughout ESO’s decade-long legacy.",
    ],
    challengesBody: [
      "The main challenges of this project focused on precision assembly and the structural integration between the metal coins and the display panel.",
      "The first challenge was accurately assembling the 10 circular links that connect each coin around the display. Since the entire design relies on a balanced radial layout, even a small deviation in positioning could affect the symmetry of the artwork and reduce the premium appearance of the final collectible. Achieving consistent spacing and alignment across all connection points required careful control during the assembly process.",
      "The second challenge was finding a reliable way to secure the metal coins onto the back panel while maintaining a clean appearance. Traditional adhesive methods were not suitable because the connection area was extremely limited due to the thin edges of the surrounding links. Applying glue directly could easily cause overflow or visible residue, and once the adhesive spread onto the surface, it was difficult to remove without damaging the finish. A mounting solution was required that could provide strong fixation while preserving the clean, high-quality appearance expected from an anniversary collectible.",
    ],
    executionBody: [
      "To improve assembly accuracy, I developed custom positioning jigs to assist with the installation of the 10 circular links. Instead of relying only on manual alignment, the workers could first place the jig inside the frame, position each link according to the predefined locations, and then complete the fixation process. This reduced alignment errors and helped maintain the overall symmetry of the design during production.",
      "For the connection between the metal coins and the display panel, I redesigned the structure instead of using visible adhesive methods. The front panel was adjusted to a thinner structure, allowing screws to pass through the panel and secure the bottom of the circular links from behind. After assembly, the rear cover was installed to conceal the entire fixing structure. This solution maintained the three-dimensional appearance of the collectible while providing a stronger and cleaner assembly method without affecting the final presentation.",
    ],
    year: 2024,
    client: "The Elder Scrolls Online",
    featured: false,
    challenge:
      "Precision assembly of the radial coin links, and a clean structural mount for the metal coins without visible adhesive.",
    result: "",
  },
  {
    slug: FIFTH_PROJECT_SLUG,
    title: FIFTH_PROJECT_NAME,
    materials: ["paper", "metal", "fabric"],
    ips: ["the-elder-scrolls"],
    tags: involvementTags("end-to-end"),
    summary: FIFTH_PROJECT_TAGLINE,
    tagline: FIFTH_PROJECT_TAGLINE,
    headline: FIFTH_PROJECT_TAGLINE,
    studySub: "study what i did",
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: FIFTH_PROJECT_COVER_VIDEO,
    coverVideo: FIFTH_PROJECT_COVER_VIDEO,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: FIFTH_PROJECT_GALLERY_LEAD,
    heroVideo: FIFTH_PROJECT_HERO_VIDEO,
    afterCoverStills: FIFTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FIFTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: FIFTH_PROJECT_AFTER_COVER_VIDEO,
    overview: [
      "Inspired by the forbidden knowledge hidden within Apocrypha, The Elder Scrolls Online: Necrom Look Book Bundle was created as a collector’s piece that brings the mystery and magic of the Arcanist class from Tamriel into the real world. In the game’s universe, Arcanists draw their power from ancient secrets preserved within forgotten tomes, and this set was designed to transform that lore into a tangible collectible experience.",
      "The collection features a book-shaped display box inspired by the Arcanist’s tome of power, paired with an Ouroboros necklace featuring the iconic three-headed symbol from the world of The Elder Scrolls Online. Through the combination of storytelling, material selection, and craftsmanship, the set recreates the feeling of uncovering an ancient artifact — allowing fans to experience not only a physical collectible, but also a deeper connection to the atmosphere, lore, and magical identity of the Arcanist.",
    ],
    challengesBody: [
      "The main challenge of this project was managing the integration of multiple manufacturing processes within a single product while maintaining consistency and quality throughout production.",
      "The product combined several complex techniques, including digital printing for high-definition patterns and full-color reproduction, a temperature-sensitive color-changing process to enhance interactivity, hot stamping to create a premium finish, sticky mesh application to improve texture and layering, and embossing to strengthen the three-dimensional effect. Each process required precise control, and even a small inconsistency between different processes could affect the overall appearance and quality of the final product.",
      "Another challenge was ensuring that these different materials and processes could work together during mass production. Since each technique had its own production requirements and limitations, the difficulty was not only achieving the desired visual effect but also finding a reliable manufacturing solution that could remain stable and repeatable at scale.",
      "In addition, the project required exploring new material applications to enhance the collector experience. Using materials that were not commonly applied in this product category introduced additional challenges in terms of production feasibility, material compatibility, and quality control.",
    ],
    executionBody: [
      "I focused on turning the design into a stable and repeatable production solution before mass production began. Because the product involved multiple materials and processes — including hot stamping, digital printing, hand-applied mesh, embossing, and other finishing techniques — I planned the manufacturing sequence carefully and coordinated the different suppliers involved. The order of these processes was important, as an incorrect sequence could easily create more defects in the later stages of production.",
      "A major part of my work happened during sampling. I identified potential production problems early and repeatedly adjusted dimensions, tolerances, and design details based on the actual manufacturing results. Rather than waiting until mass production to solve these issues, I used the sampling stage to validate the key details and make the design more stable and suitable for production.",
      "I also explored a new material solution for the book box. The customer wanted the edges of the box to look and feel like layers of real paper, which could not be achieved through conventional printing alone. I introduced a material normally used in the interior decoration industry and worked out how it could be adapted to the structure and manufacturing requirements of this product.",
      "For the raised details along the book spine, I worked with the mold supplier to adjust the structure and determine the appropriate dimensions and height. The goal was to achieve a clear three-dimensional effect without putting too much stress on the surface material or causing damage during forming.",
      "I also carried out extensive assembly testing to determine how the internal box, outer book cover, and necklace could be integrated reliably. The necklace area was specifically redesigned so that it could be securely held inside the package while keeping the interior visually clean and reducing unnecessary supporting materials. This allowed the final presentation to remain simple and immersive without compromising assembly stability.",
    ],
    impactBody: [
      "Despite the amount of handwork and the complexity involved in production, the final product achieved a high level of detail and closely captured the look and character of the original in-game design. The craftsmanship and overall presentation were well received by fans of the character and the game.",
      "After launch, the product sold out quickly even at a retail price approaching $200. This strong market response gave the customer confidence in both the product concept and the production approach, leading them to move forward with the development of a second and third product in the same series.",
    ],
    year: 2024,
    client: "The Elder Scrolls Online",
    featured: true,
    challenge:
      "Integrate digital printing, color-changing finish, hot stamping, mesh, and embossing into one stable mass-production path.",
    result:
      "High-fidelity collectible that sold out near $200 retail, unlocking two follow-on products in the series.",
  },
  {
    slug: SIXTH_PROJECT_SLUG,
    title: SIXTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["ghost-recon"],
    tags: involvementTags("contribution"),
    summary: "",
    tagline: "",
    role: [],
    involvement: "contribution",
    coverImage: SIXTH_PROJECT_COVER_VIDEO,
    coverVideo: SIXTH_PROJECT_COVER_VIDEO,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: SIXTH_PROJECT_GALLERY_LEAD,
    heroVideo: SIXTH_PROJECT_HERO_VIDEO,
    afterCoverStills: SIXTH_PROJECT_AFTER_COVER_STILLS,
    endVideoPair: SIXTH_PROJECT_END_VIDEOS,
    year: 2024,
    featured: false,
    challenge: "",
    result: "",
  },
  {
    slug: SEVENTH_PROJECT_SLUG,
    title: SEVENTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["injustice"],
    tags: involvementTags("contribution"),
    summary: "",
    tagline: "",
    role: [],
    involvement: "contribution",
    coverImage: SEVENTH_PROJECT_COVER_VIDEO,
    coverVideo: SEVENTH_PROJECT_COVER_VIDEO,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: false,
    challenge: "",
    result: "",
  },
  {
    slug: EIGHTH_PROJECT_SLUG,
    title: EIGHTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["recore"],
    tags: involvementTags("contribution"),
    summary: "",
    tagline: "",
    role: [],
    involvement: "contribution",
    coverImage: EIGHTH_PROJECT_COVER_VIDEO,
    coverVideo: EIGHTH_PROJECT_COVER_VIDEO,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    year: 2024,
    featured: false,
    challenge: "",
    result: "",
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

/** Related strip: same involvement-tag projects only (stable order), capped. */
export function getRelatedProjects(
  excludeSlugs: string[],
  limit = 5,
  preferTags: string[] = [],
): Project[] {
  const exclude = new Set(excludeSlugs);
  const tags = new Set(preferTags.filter(Boolean));
  if (tags.size === 0) return [];

  const sameTag = projects.filter(
    (project) =>
      !exclude.has(project.slug) &&
      project.tags.some((tag) => tags.has(tag)),
  );
  const ranked = [...sameTag].sort((a, b) => {
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
