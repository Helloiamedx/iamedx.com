import {
  type CollaboratorCredits,
  type SpecialThanksEntry,
  SGS_CREDIT_COMPANY,
  WOODEN_BOX_COLLABORATORS,
  WOODEN_BOX_SPECIAL_THANKS,
} from "@/content/projectCredits";
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
  /**
   * Index / Related card hover — three stills cycled on pointer hover.
   * When set (length 3), wins over the placeholder color cycle.
   */
  coverHoverStills?: [string, string, string];
  /** Intrinsic cover size — drives card aspect / relative scale */
  coverWidth: number;
  coverHeight: number;
  /**
   * Case detail — first still under the hero.
   * Index `coverImage` must never be reused here; only set when the user
   * supplies a dedicated detail still.
   */
  galleryLeadImage?: string;
  /** Case detail — padding-bottom ratio for `galleryLeadImage` (default 16:9). */
  galleryLeadRatio?: string;
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
  /** Case panel — Special thanks (company + one or more names) */
  specialThanks?: SpecialThanksEntry[];
  /** Case credits — collaborator names (+ optional company rows) */
  collaborators?: CollaboratorCredits;
  gallery?: string[];
  /**
   * Still(s) directly under the first gallery still (row 2).
   * One item → full-width; multiple → equal columns in one row.
   * Video (`afterCoverVideo`) follows as the next row.
   */
  afterCoverStills?: {
    items: { src: string; alt: string; ratio?: string }[];
    /** CSS padding-bottom ratio per cell; omit for native asset dimensions */
    ratio?: string;
  };
  /** Extra still rows after `afterCoverStills`, before the process video. */
  afterCoverExtraRows?: {
    items: { src: string; alt: string; ratio?: string }[];
    /** Omit for native asset dimensions */
    ratio?: string;
    /** Column `fr` weights (e.g. `[2, 1]` → ⅔ | ⅓) */
    columnWidths?: number[];
    /**
     * Paired stills with the same native height — lock row height so left/right
     * align; requires `columnWidths` + `rowAspect` (see `caseSplitRowAspect`).
     */
    equalRowHeight?: boolean;
    /** CSS `aspect-ratio` for equal-height split rows (width / height). */
    rowAspect?: string;
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
  /**
   * When both `afterCoverStillVideoPair` and `afterCoverExtraRows` are set,
   * render the still+video row before the extra still rows (default: after).
   */
  afterCoverStillVideoBeforeExtraRows?: boolean;
  /**
   * Two-up row after `afterCoverStills`, before `afterCoverExtraRows`:
   * video left, video right.
   */
  afterCoverVideoPair?: {
    left: { primary: string; fallback?: string; alt: string };
    right: { primary: string; fallback?: string; alt: string };
    ratio?: string;
  };
  /** Full-width stills after the process video (each item = one row). */
  afterVideoStills?: { src: string; alt: string; ratio?: string }[];
  /**
   * Multi-up stills after the process video (2–3 equal columns).
   * `afterIndex` = how many `afterVideoStills` come before this row (default: all → end).
   */
  afterVideoRow?: {
    items: { src: string; alt: string; ratio?: string }[];
    ratio?: string;
    afterIndex?: number;
  };
  /** Still row just above the closing video pair (second-to-last). */
  beforeEndRow?: {
    items: { src: string; alt: string; ratio?: string }[];
    ratio?: string;
  };
  /** Still row after `beforeEndRow` — last gallery stills before end videos. */
  afterEndRow?: {
    items: { src: string; alt: string; ratio?: string }[];
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
  /** Still row after `endVideoPair` (e.g. closing photo pair under process clips). */
  afterEndVideoPairRow?: {
    items: { src: string; alt: string; ratio?: string }[];
    ratio?: string;
  };
  /**
   * Optional full-width closing video — always the last gallery row,
   * after `endVideoPair` and any stills added above.
   */
  endVideo?: {
    primary: string;
    fallback?: string;
    alt: string;
    /** CSS padding-bottom ratio; default 16:9 */
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
  /** Hover cycle stills — same recipe as filter cards */
  coverHoverStills?: [string, string, string];
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

/** Equal-height split row — `columnWidths` + left still native width / height. */
export function caseSplitRowAspect(
  columnWidths: number[],
  leadNativeWidth: number,
  sharedNativeHeight: number,
) {
  const sum = columnWidths.reduce((total, weight) => total + weight, 0);
  const leadWeight = columnWidths[0];
  return `${(sum * leadNativeWidth) / leadWeight} / ${sharedNativeHeight}`;
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
const FIRST_PROJECT_COVER_VIDEO = projectCoverFromName(
  FIRST_PROJECT_NAME,
  "Mass Effect Tali Companion Bundle.mp4",
);
const FIRST_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    FIRST_PROJECT_NAME,
    "Mass Effect Tali Companion Bundle hover1.jpg",
  ),
  projectCoverFromName(
    FIRST_PROJECT_NAME,
    "Mass Effect Tali Companion Bundle hover2.jpg",
  ),
  projectCoverFromName(
    FIRST_PROJECT_NAME,
    "Mass Effect Tali Companion Bundle hover3.jpg",
  ),
] as [string, string, string];
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

const FIRST_PROJECT_SPECIAL_THANKS = WOODEN_BOX_SPECIAL_THANKS;

const FIRST_PROJECT_COLLABORATORS = WOODEN_BOX_COLLABORATORS;

/** 「第二个项目」— grid card under the featured lead */
const SECOND_PROJECT_NAME = "Dragon Age Writing Bundle";
const SECOND_PROJECT_SLUG = projectSlugFromName(SECOND_PROJECT_NAME);
const SECOND_PROJECT_COVER = projectCoverFromName(
  SECOND_PROJECT_NAME,
  "VARRIC TETHRAS cover.jpg",
);
const SECOND_PROJECT_COVER_VIDEO = projectCoverFromName(
  SECOND_PROJECT_NAME,
  "Dragon Age Writing Bundle.mp4",
);
const SECOND_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    SECOND_PROJECT_NAME,
    "Dragon Age Writing Bundle hover1.jpg",
  ),
  projectCoverFromName(
    SECOND_PROJECT_NAME,
    "Dragon Age Writing Bundle hover2.jpg",
  ),
  projectCoverFromName(
    SECOND_PROJECT_NAME,
    "Dragon Age Writing Bundle hover3.jpg",
  ),
] as [string, string, string];
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

const SECOND_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Michelle Wu"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Cola Li", "Susan Hu", "Grace Yang"],
  },
];

const SECOND_PROJECT_COLLABORATORS: CollaboratorCredits = {
  names: ["Zhang Wei", "Li Hao", "Chen Yu", "Wang Zihan"],
};

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
/** Index / filter card cover loop — not detail hero */
const THIRD_PROJECT_COVER_VIDEO = projectCoverFromName(
  THIRD_PROJECT_CDN_FOLDER,
  "video.mp4",
);
const THIRD_PROJECT_HERO_VIDEO = projectCoverFromName(
  THIRD_PROJECT_CDN_FOLDER,
  "Horizon Zero Dawn - The Machines- Thunderjaw.mp4",
);
const THIRD_PROJECT_TAGLINE =
  "Thunderjaw resin sculpture capturing the ultimate power of machine and battle.";

const THIRD_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    THIRD_PROJECT_CDN_FOLDER,
    "Horizon Zero Dawn - The Machines- Thunderjaw-1.jpg",
  ),
  projectCoverFromName(
    THIRD_PROJECT_CDN_FOLDER,
    "Horizon Zero Dawn - The Machines- Thunderjaw-2.jpg",
  ),
  projectCoverFromName(
    THIRD_PROJECT_CDN_FOLDER,
    "Horizon Zero Dawn - The Machines- Thunderjaw-3.jpg",
  ),
] as [string, string, string];

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
/** Index / featured card cover loop */
const FOURTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  FOURTH_PROJECT_NAME,
  "The Elder Scrolls Online 10-Year Coin Shadow box.mp4",
);
const FOURTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    FOURTH_PROJECT_NAME,
    "The Elder Scrolls Online 10-Year Coin Shadowbox1.jpg",
  ),
  projectCoverFromName(
    FOURTH_PROJECT_NAME,
    "The Elder Scrolls Online 10-Year Coin Shadowbox2.jpg",
  ),
  projectCoverFromName(
    FOURTH_PROJECT_NAME,
    "The Elder Scrolls Online 10-Year Coin Shadowbox3.jpg",
  ),
] as [string, string, string];
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
const FIFTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    FIFTH_PROJECT_NAME,
    "The Elder Scrolls Online NECROM Look Book Bundle hover1.jpg",
  ),
  projectCoverFromName(
    FIFTH_PROJECT_NAME,
    "The Elder Scrolls Online NECROM Look Book Bundle hover2.jpg",
  ),
  projectCoverFromName(
    FIFTH_PROJECT_NAME,
    "The Elder Scrolls Online NECROM Look Book Bundle hover3.jpg",
  ),
] as [string, string, string];
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

const FIFTH_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Angela McReynolds", "Michelle Wu", "Nikki Petraitis"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Karyn Leung", "Susan Hu", "Charlotte Tam"],
  },
  {
    company: "Wenzhou Dabenying Stationery Co., Ltd.",
    names: ["Mr Ling", "Minghao Zhou", "Zhihao Wu", "Yifan Huang"],
  },
];

const FIFTH_PROJECT_COLLABORATORS: CollaboratorCredits = {
  names: [
    "Wei Zhang",
    "Hao Chen",
    "Jun Wang",
    "Lei Liu",
    "Tao Xu",
    "Jing Li",
    "Yuxin Zhao",
    "Mengyao Chen",
  ],
};

/** 「第六个项目」— grid card; media only until copy is ready */
const SIXTH_PROJECT_NAME = "Ghost Recon Wildlands Statue";
const SIXTH_PROJECT_SLUG = projectSlugFromName(SIXTH_PROJECT_NAME);
/** Outside / filter card cover */
const SIXTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  SIXTH_PROJECT_NAME,
  "Ghost Recon Wildlands Statue10.mp4",
);
/** Case detail first-screen hero */
const SIXTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  SIXTH_PROJECT_NAME,
  "Ghost Recon Wildlands Statue6.mp4",
);
const SIXTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    SIXTH_PROJECT_NAME,
    "Ghost Recon Wildlands Statue1.jpg",
  ),
  projectCoverFromName(SIXTH_PROJECT_NAME, "hover2.jpg"),
  projectCoverFromName(SIXTH_PROJECT_NAME, "hover1.jpg"),
] as [string, string, string];
const SIXTH_PROJECT_TAGLINE =
  "Capture the squad leader in a crouched tactical pose with realistic gear, weathered details, and a rugged battlefield-inspired base.";
const SIXTH_PROJECT_STILL = (n: 1 | 2 | 3, alt: string) => ({
  src: projectCoverFromName(
    SIXTH_PROJECT_NAME,
    `Ghost Recon Wildlands Statue${n}.jpg`,
  ),
  alt,
});
/** Detail gallery: 1 full → 2|3 → 1|2|3 → video.mp4 */
const SIXTH_PROJECT_GALLERY_LEAD = SIXTH_PROJECT_STILL(1, "Statue 1").src;
const SIXTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    SIXTH_PROJECT_STILL(2, "Statue 2"),
    SIXTH_PROJECT_STILL(3, "Statue 3"),
  ],
  ratio: "100%",
};
const SIXTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(SIXTH_PROJECT_NAME, "1.jpg"),
        alt: "Statue detail 1",
      },
      {
        src: projectCoverFromName(SIXTH_PROJECT_NAME, "2.jpg"),
        alt: "Statue detail 2",
      },
      {
        src: projectCoverFromName(SIXTH_PROJECT_NAME, "3.jpg"),
        alt: "Statue detail 3",
      },
    ],
    ratio: "100%",
  },
];
const SIXTH_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(SIXTH_PROJECT_NAME, "video.mp4"),
  alt: "Statue clip",
  /* Native 1920×800 — do not force square / stretch */
  ratio: `${(800 / 1920) * 100}%`,
};

/** 「第七个项目」— DC Comics Injustice 2 The Brainiac Statue */
const SEVENTH_PROJECT_NAME = "DC Comics Injustice 2 The Brainiac Statue";
/** CDN folder casing — keep exact */
const SEVENTH_PROJECT_CDN_FOLDER =
  "Dc comics injustice 2 the brainiac statue";
const SEVENTH_PROJECT_SLUG = projectSlugFromName(SEVENTH_PROJECT_NAME);
const SEVENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  SEVENTH_PROJECT_CDN_FOLDER,
  "Dc comics injustice 2 the brainiac statue.mp4",
);
/** Case detail first-screen hero */
const SEVENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  SEVENTH_PROJECT_CDN_FOLDER,
  "Dc comics injustice 2 the brainiac video.mp4",
);
const SEVENTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  SEVENTH_PROJECT_CDN_FOLDER,
  "Dc comics injustice 2 the brainiac statue hover1.jpg",
);
const SEVENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    SEVENTH_PROJECT_CDN_FOLDER,
    "Dc comics injustice 2 the brainiac statue hover1.jpg",
  ),
  projectCoverFromName(
    SEVENTH_PROJECT_CDN_FOLDER,
    "Dc comics injustice 2 the brainiac statue hover2.jpg",
  ),
  projectCoverFromName(
    SEVENTH_PROJECT_CDN_FOLDER,
    "Dc comics injustice 2 the brainiac statue hover3.jpg",
  ),
] as [string, string, string];
const SEVENTH_PROJECT_TAGLINE =
  "Bringing Brainiac's iconic presence from Injustice 2 into a premium collectible statue, this project recreated the legendary DC villain with his signature armor, mechanical tentacles, and imposing battlefield stance.";
const SEVENTH_PROJECT_STILL = (n: 1 | 2 | 3 | 4 | 5 | 6, alt: string) => ({
  src: projectCoverFromName(
    SEVENTH_PROJECT_CDN_FOLDER,
    `Dc comics injustice 2 the brainiac statue${n}.jpg`,
  ),
  alt,
});
const SEVENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    SEVENTH_PROJECT_STILL(1, "Brainiac statue 1"),
    SEVENTH_PROJECT_STILL(2, "Brainiac statue 2"),
  ],
  ratio: "100%",
};
const SEVENTH_PROJECT_AFTER_COVER_STILL_VIDEO_PAIR = {
  still: SEVENTH_PROJECT_STILL(3, "Brainiac statue 3"),
  video: {
    primary: projectCoverFromName(
      SEVENTH_PROJECT_CDN_FOLDER,
      "Dc comics injustice 2 the brainiac statue11.mp4",
    ),
    alt: "Brainiac statue clip",
  },
  ratio: "100%",
} as const;
const SEVENTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(SEVENTH_PROJECT_CDN_FOLDER, "22.jpg"),
        alt: "Brainiac statue 22",
      },
      SEVENTH_PROJECT_STILL(6, "Brainiac statue 6"),
      {
        src: projectCoverFromName(SEVENTH_PROJECT_CDN_FOLDER, "3333.jpg"),
        alt: "Brainiac statue 3333",
      },
    ],
    ratio: "100%",
  },
];

/** 「第八个项目」— grid card cover only until detail media / copy are ready */
const EIGHTH_PROJECT_NAME = "Recore Collector's Edition Statue";
const EIGHTH_PROJECT_CDN_FOLDER = "Recore collector's edition statue";
const EIGHTH_PROJECT_SLUG = projectSlugFromName(EIGHTH_PROJECT_NAME);
const EIGHTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  EIGHTH_PROJECT_CDN_FOLDER,
  "Recore collector's edition statue.mp4",
);
/** Case detail first-screen hero */
const EIGHTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  EIGHTH_PROJECT_CDN_FOLDER,
  "Recore Collector's Edition Statue.mp4.mp4",
);
const EIGHTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    EIGHTH_PROJECT_CDN_FOLDER,
    "Recore Collector's Edition Statue1.jpg",
  ),
  projectCoverFromName(
    EIGHTH_PROJECT_CDN_FOLDER,
    "Recore Collector's Edition Statue2.jpg",
  ),
  projectCoverFromName(
    EIGHTH_PROJECT_CDN_FOLDER,
    "Recore Collector's Edition Statue31.jpg",
  ),
] as [string, string, string];

const EIGHTH_PROJECT_STILL = (n: 1 | 2 | 3 | 4 | 5, alt: string) => ({
  src: projectCoverFromName(
    EIGHTH_PROJECT_CDN_FOLDER,
    `Recore Collector's Edition Statue-${n}.jpg`,
  ),
  alt,
});

/** Detail gallery: 1 full → -1|-2 → 1mp4|2mp4 → 3|4|5 */
const EIGHTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  EIGHTH_PROJECT_CDN_FOLDER,
  "Recore Collector's Edition Statue1.jpg",
);
const EIGHTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    EIGHTH_PROJECT_STILL(1, "Recore statue 1"),
    EIGHTH_PROJECT_STILL(2, "Recore statue 2"),
  ],
  ratio: "100%",
};
const EIGHTH_PROJECT_AFTER_COVER_VIDEO_PAIR = {
  left: {
    primary: projectCoverFromName(
      EIGHTH_PROJECT_CDN_FOLDER,
      "Recore Collector's Edition Statue1.mp4",
    ),
    alt: "Recore statue clip 1",
  },
  right: {
    primary: projectCoverFromName(
      EIGHTH_PROJECT_CDN_FOLDER,
      "Recore Collector's Edition Statue2.mp4",
    ),
    alt: "Recore statue clip 2",
  },
  ratio: "100%",
} as const;
const EIGHTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      EIGHTH_PROJECT_STILL(3, "Recore statue 3"),
      EIGHTH_PROJECT_STILL(4, "Recore statue 4"),
      EIGHTH_PROJECT_STILL(5, "Recore statue 5"),
    ],
    ratio: "100%",
  },
];

/** 「第九个项目」— grid card cover only until detail media / copy are ready */
const NINTH_PROJECT_NAME =
  "Halo 5 Guardians Limited Edition Collectors Statue";
const NINTH_PROJECT_SLUG = projectSlugFromName(NINTH_PROJECT_NAME);
const NINTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  NINTH_PROJECT_NAME,
  "video.mp4",
);
const NINTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(NINTH_PROJECT_NAME, "1.jpg"),
  projectCoverFromName(NINTH_PROJECT_NAME, "2.jpg"),
  projectCoverFromName(NINTH_PROJECT_NAME, "3.jpg"),
] as [string, string, string];
/** Case detail first-screen hero */
const NINTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  NINTH_PROJECT_NAME,
  "video1.mp4",
);
/** Detail gallery lead still */
const NINTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  NINTH_PROJECT_NAME,
  "1.jpg",
);
/** Detail gallery: lead → 21|22 → 31|32|33 → l1|r2 → endVideo last */
const NINTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    {
      src: projectCoverFromName(NINTH_PROJECT_NAME, "21.jpg"),
      alt: "Halo statue 21",
    },
    {
      src: projectCoverFromName(NINTH_PROJECT_NAME, "22.jpg"),
      alt: "Halo statue 22",
    },
  ],
  ratio: "100%",
};
const NINTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(NINTH_PROJECT_NAME, "31.jpg"),
        alt: "Halo statue 31",
      },
      {
        src: projectCoverFromName(NINTH_PROJECT_NAME, "32.jpg"),
        alt: "Halo statue 32",
      },
      {
        src: projectCoverFromName(NINTH_PROJECT_NAME, "33.jpg"),
        alt: "Halo statue 33",
      },
    ],
    ratio: "100%",
  },
  {
    items: [
      {
        src: projectCoverFromName(NINTH_PROJECT_NAME, "l1.jpg"),
        alt: "Halo statue left",
      },
      {
        src: projectCoverFromName(NINTH_PROJECT_NAME, "r2.jpg"),
        alt: "Halo statue right",
      },
    ],
    ratio: `${(2000 / 1500) * 100}%`,
  },
];
const NINTH_PROJECT_END_VIDEO = {
  primary: projectCoverFromName(NINTH_PROJECT_NAME, "video2.mp4"),
  alt: "Halo statue clip",
  /* Native 1920×800 */
  ratio: `${(800 / 1920) * 100}%`,
};
const NINTH_PROJECT_TAGLINE =
  "A commemorative Halo 5: Guardians statue featuring Master Chief and Spartan Locke in a dynamic face-off, created as the centerpiece of the Limited Collector’s Edition.";

/** 「第十个项目」— grid card cover + hover stills; detail media / copy TBD */
const TENTH_PROJECT_NAME = "Gears of War Fenix Statue Figure";
const TENTH_PROJECT_SLUG = projectSlugFromName(TENTH_PROJECT_NAME);
const TENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  TENTH_PROJECT_NAME,
  "video.mp4",
);
const TENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(TENTH_PROJECT_NAME, "111.jpg"),
  projectCoverFromName(TENTH_PROJECT_NAME, "222.jpg"),
  projectCoverFromName(TENTH_PROJECT_NAME, "333.jpg"),
] as [string, string, string];
/** Case detail first-screen hero */
const TENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  TENTH_PROJECT_NAME,
  "video2.mp4",
);
/** Detail gallery lead still */
const TENTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  TENTH_PROJECT_NAME,
  "111.jpg",
);
/** Detail gallery row 2 — 3l | 3r (native 1500×2000 per cell) */
const TENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    {
      src: projectCoverFromName(TENTH_PROJECT_NAME, "3l.jpg"),
      alt: "JD Fenix bike statue left",
    },
    {
      src: projectCoverFromName(TENTH_PROJECT_NAME, "3r.jpg"),
      alt: "JD Fenix bike statue right",
    },
  ],
  ratio: `${(2000 / 1500) * 100}%`,
};
/** Detail gallery row 3 — 22l; row 4 — 22r */
const TENTH_PROJECT_LANDSCAPE_RATIO = `${(800 / 1920) * 100}%`;
const TENTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(TENTH_PROJECT_NAME, "22l.jpg"),
        alt: "JD Fenix bike statue detail left",
      },
    ],
    ratio: TENTH_PROJECT_LANDSCAPE_RATIO,
  },
  {
    items: [
      {
        src: projectCoverFromName(TENTH_PROJECT_NAME, "22r.jpg"),
        alt: "JD Fenix bike statue detail right",
      },
    ],
    ratio: TENTH_PROJECT_LANDSCAPE_RATIO,
  },
];
/** Detail gallery — always last row */
const TENTH_PROJECT_END_VIDEO = {
  primary: projectCoverFromName(TENTH_PROJECT_NAME, "video3.mp4"),
  alt: "JD Fenix bike statue clip",
};
const TENTH_PROJECT_TAGLINE =
  "A Gears of War 4 Collector’s Edition statue featuring JD Fenix with his armored bike, combining character, vehicle, and battlefield weathering into one detailed combat scene.";

/** 「第十一个项目」— Specialized; card cover + hover stills */
const ELEVENTH_PROJECT_NAME = "Fallout Tunnel Snakes Rule Patch";
/** CDN folder casing — keep exact */
const ELEVENTH_PROJECT_CDN_FOLDER = "Fallout tunnel snakes rule patch";
const ELEVENTH_PROJECT_SLUG = projectSlugFromName(ELEVENTH_PROJECT_NAME);
const ELEVENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  ELEVENTH_PROJECT_CDN_FOLDER,
  "Fallout tunnel snakes rule patch.mp4",
);
const ELEVENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  ELEVENTH_PROJECT_CDN_FOLDER,
  "Fallout tunnel snakes rule patch hero.mp4",
);
const ELEVENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(
    ELEVENTH_PROJECT_CDN_FOLDER,
    "Fallout tunnel snakes rule patch1.jpg",
  ),
  projectCoverFromName(
    ELEVENTH_PROJECT_CDN_FOLDER,
    "Fallout tunnel snakes rule patch2.jpg",
  ),
  projectCoverFromName(
    ELEVENTH_PROJECT_CDN_FOLDER,
    "Fallout tunnel snakes rule patch3.jpg",
  ),
] as [string, string, string];

const ELEVENTH_PROJECT_STILL = (n: 1 | 2 | 3, alt: string) => ({
  src: projectCoverFromName(
    ELEVENTH_PROJECT_CDN_FOLDER,
    `Fallout tunnel snakes rule patch-${n}.jpg`,
  ),
  alt,
});

/** Detail gallery: 1 full → 2|3 → 11 full */
const ELEVENTH_PROJECT_GALLERY_LEAD = ELEVENTH_PROJECT_STILL(
  1,
  "Tunnel Snakes patch 1",
).src;
const ELEVENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    ELEVENTH_PROJECT_STILL(2, "Tunnel Snakes patch 2"),
    ELEVENTH_PROJECT_STILL(3, "Tunnel Snakes patch 3"),
  ],
  ratio: "100%",
};
const ELEVENTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      {
        src: projectCoverFromName(
          ELEVENTH_PROJECT_CDN_FOLDER,
          "Fallout tunnel snakes rule patch11.jpg",
        ),
        alt: "Tunnel Snakes patch 11",
      },
    ],
    ratio: "56.25%",
  },
];

const ELEVENTH_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Michelle Wu"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Andy Sun", "Hugo"],
  },
];

const ELEVENTH_PROJECT_COLLABORATORS: CollaboratorCredits = {
  names: ["Mr. Li"],
};

/** 「第十二个项目」— End-to-End; card cover + hover stills */
const TWELFTH_PROJECT_NAME = "Cyberpunk 2077 Systems Banner";
/** CDN folder — keep exact (double space before Banner) */
const TWELFTH_PROJECT_CDN_FOLDER = "Cyberpunk 2077 Systems  Banner";
const TWELFTH_PROJECT_SLUG = projectSlugFromName(TWELFTH_PROJECT_NAME);
const TWELFTH_PROJECT_TAGLINE =
  "It brings the game's futuristic atmosphere into a physical display piece, giving fans a way to personalize their own space with recognizable Cyberpunk aesthetics.";
const TWELFTH_PROJECT_COVER = projectCoverFromName(
  TWELFTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);
const TWELFTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  TWELFTH_PROJECT_CDN_FOLDER,
  "video.mp4",
);
const TWELFTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  TWELFTH_PROJECT_CDN_FOLDER,
  "video2.mp4",
);
const TWELFTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(TWELFTH_PROJECT_CDN_FOLDER, "1.jpg"),
  projectCoverFromName(TWELFTH_PROJECT_CDN_FOLDER, "2.jpg"),
  projectCoverFromName(TWELFTH_PROJECT_CDN_FOLDER, "3.jpg"),
] as [string, string, string];

const TWELFTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  TWELFTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);

const TWELFTH_PROJECT_STILL = (fileName: string, alt: string) => ({
  src: projectCoverFromName(TWELFTH_PROJECT_CDN_FOLDER, fileName),
  alt,
});

/** Detail gallery row 2 — 2L | 2R (native asset dimensions) */
const TWELFTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    TWELFTH_PROJECT_STILL("2l.jpg", "Cyberpunk 2077 Systems Banner 2L"),
    TWELFTH_PROJECT_STILL("2r.jpg", "Cyberpunk 2077 Systems Banner 2R"),
  ],
};

/** Detail gallery row 3 — 4 | 5 | 6 */
const TWELFTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      TWELFTH_PROJECT_STILL("4.jpg", "Cyberpunk 2077 Systems Banner 4"),
      TWELFTH_PROJECT_STILL("5.jpg", "Cyberpunk 2077 Systems Banner 5"),
      TWELFTH_PROJECT_STILL("6.jpg", "Cyberpunk 2077 Systems Banner 6"),
    ],
  },
];

const TWELFTH_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Michelle Wu"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Karyn Leung", "Susan Hu"],
  },
];

const TWELFTH_PROJECT_COLLABORATORS: CollaboratorCredits = {
  names: ["Mr. Chen Hua Xing"],
};

const TWELFTH_PROJECT_OVERVIEW = [
  "This project was developed as a Cyberpunk 2077–inspired wall banner, designed to bring the visual language of Night City into fans’ personal spaces. The product combines thick felt, screen-printed graphics, and a Velcro panel to create a functional piece of merchandise for decorating a gaming setup or personal den.",
];

const TWELFTH_PROJECT_CHALLENGES_BODY = [
  "The first challenge was achieving the right weight balance. The banner was made from three separate felt panels in black, yellow, and cyan, each with a different shape and size. Because the panels had different weights, even a small imbalance could cause the finished banner to tilt when hung.",
  "The second challenge was the printing alignment. Each panel had different graphics and printing positions, and the graphics needed to remain visible and properly aligned after the three pieces were stitched together. Even small stitching tolerances could affect the final result, so the printing positions had to be carefully considered in advance.",
  "The third challenge was the rough texture of the felt itself. The uneven surface made detailed printing difficult, especially for small text. Large graphics were easier to print because their larger areas could cover the underlying texture, while smaller text could easily become distorted or lose definition.",
];

const TWELFTH_PROJECT_EXECUTION_BODY = [
  "To solve the weight balance issue, I calculated the weight of each individual panel and adjusted the material distribution accordingly. By selectively adding or reducing material in different areas, I was able to achieve a balanced structure so the finished banner would hang vertically without tilting.",
  "For the printing alignment, I created multiple prototypes to test the relationship between the printing positions and the stitching process. By studying stitching tolerances and potential overlaps, I identified the safer printing areas before moving into final sampling. This allowed me to validate the details early while keeping development and sampling costs under control.",
  "To improve the printing quality on the rough felt surface, I developed a pre-treatment process. I applied a thin adhesive base layer to the printing areas first, creating a smoother and more even surface before printing. This was particularly important for the small text, while the same treatment was also applied to the larger graphics to achieve a more consistent finish.",
];

const TWELFTH_PROJECT_IMPACT_BODY = [
  "The final banner achieved a stable, balanced hanging position while maintaining the intended layered design and detailed graphics. The improved printing process also ensured that both large graphics and small text remained clear despite the rough felt surface.",
  "The product performed very well commercially and sold out quickly, demonstrating strong demand from fans.",
];

/** 「第十三个项目」— End-to-End; card cover + hover stills */
const THIRTEENTH_PROJECT_NAME =
  "The Elder Scrolls Online Forgotten Daedric Prince Statue";
const THIRTEENTH_PROJECT_CDN_FOLDER = THIRTEENTH_PROJECT_NAME;
const THIRTEENTH_PROJECT_SLUG = projectSlugFromName(THIRTEENTH_PROJECT_NAME);
const THIRTEENTH_PROJECT_TAGLINE =
  "A limited-edition The Elder Scrolls Online statue bringing Ithelia, the forgotten Daedric Prince, back to life through intricate sculpting, hand-painted details, and her iconic Threads of Fate.";
const THIRTEENTH_PROJECT_COVER = projectCoverFromName(
  THIRTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);
const THIRTEENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  THIRTEENTH_PROJECT_CDN_FOLDER,
  "video.mp4",
);
const THIRTEENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  THIRTEENTH_PROJECT_CDN_FOLDER,
  "video1.mp4",
);
const THIRTEENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "1.jpg"),
  projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "2.jpg"),
  projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "3.jpg"),
] as [string, string, string];
/** Detail gallery lead still — 1920×1080 */
const THIRTEENTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  THIRTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);
const THIRTEENTH_PROJECT_LANDSCAPE_RATIO = `${(1080 / 1920) * 100}%`;
/** 1500×2000 portrait pair cells */
const THIRTEENTH_PROJECT_PORTRAIT_RATIO = `${(2000 / 1500) * 100}%`;
/** Detail gallery row 2 — 3L | 3R */
const THIRTEENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "3L.jpg"),
      alt: "Ithelia statue left",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "3R.jpg"),
      alt: "Ithelia statue right",
    },
  ],
  ratio: THIRTEENTH_PROJECT_PORTRAIT_RATIO,
};
const THIRTEENTH_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(
    THIRTEENTH_PROJECT_CDN_FOLDER,
    "The Elder Scrolls Online Forgotten Daedric Prince Statue.mp4",
  ),
  alt: "Ithelia statue process clip",
  ratio: THIRTEENTH_PROJECT_LANDSCAPE_RATIO,
};
/** Detail gallery row 4 — 5 | 6 | 7 (1200×1200 each) */
const THIRTEENTH_PROJECT_AFTER_VIDEO_ROW = {
  items: [
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "5.jpg"),
      alt: "Ithelia statue 5",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "6.jpg"),
      alt: "Ithelia statue 6",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "7.jpg"),
      alt: "Ithelia statue 7",
    },
  ],
  ratio: "100%",
};
/** Detail gallery row 5 — 7 | 8 | 9 (1200×1200 each) */
const THIRTEENTH_PROJECT_BEFORE_END_ROW = {
  items: [
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "7.jpg"),
      alt: "Ithelia statue 7",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "8.jpg"),
      alt: "Ithelia statue 8",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "9.jpg"),
      alt: "Ithelia statue 9",
    },
  ],
  ratio: "100%",
};
/** Detail gallery row 6 — 2L | 2R (1800×1800 each) */
const THIRTEENTH_PROJECT_AFTER_END_ROW = {
  items: [
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "2L.jpg"),
      alt: "Ithelia statue detail left",
    },
    {
      src: projectCoverFromName(THIRTEENTH_PROJECT_CDN_FOLDER, "2R.jpg"),
      alt: "Ithelia statue detail right",
    },
  ],
  ratio: "100%",
};

const THIRTEENTH_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: [
      "Angela McReynolds",
      "Michelle Wu",
      "Nikki Petraitis",
      "Daisy Grice",
      "Hayley Cumming",
      "Emilia Gribbin",
      "Diane Dear",
      "Adam Witton",
      "Kirsty Deacon",
      "Hayden Shields",
      "Jonathan Reed",
    ],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: [
      "Charlotte Tam",
      "Cola Li",
      "Susan Hu",
      "Grace Yang",
      "Karyn Leung",
      "Andy Sun",
      "Hugo",
      "Candy",
    ],
  },
  {
    company: "Dongguan Bo Hong Plastic Products Co., Ltd.",
    names: [
      "Mr. Peng",
      "Chen Yu",
      "Liu Yang",
      "Zhao Kai",
      "Xu Jie",
      "Lin Chen",
    ],
  },
];

const THIRTEENTH_PROJECT_COLLABORATORS: CollaboratorCredits = {
  leadPartners: [
    { company: SGS_CREDIT_COMPANY, name: "XIAOPENG LI" },
  ],
  names: ["Zhang Wei", "Li Ming", "Wang Hao"],
};

/** 「第十四个项目」— End-to-End; card cover + hover stills */
const FOURTEENTH_PROJECT_NAME = "Skyrim Dragon Hunter Messenger Bag";
const FOURTEENTH_PROJECT_CDN_FOLDER = FOURTEENTH_PROJECT_NAME;
const FOURTEENTH_PROJECT_SLUG = projectSlugFromName(FOURTEENTH_PROJECT_NAME);
const FOURTEENTH_PROJECT_TAGLINE =
  "A rugged Dragon Hunter messenger bag combining cowhide leather and canvas, featuring embossed dragon artwork, antiqued metal hardware, and a practical multi-pocket interior designed for everyday carry.";
const FOURTEENTH_PROJECT_COVER = projectCoverFromName(
  FOURTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);
const FOURTEENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  FOURTEENTH_PROJECT_CDN_FOLDER,
  "video12.mp4",
);
const FOURTEENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  FOURTEENTH_PROJECT_CDN_FOLDER,
  "video1.mp4",
);
const FOURTEENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(FOURTEENTH_PROJECT_CDN_FOLDER, "1.jpg"),
  projectCoverFromName(FOURTEENTH_PROJECT_CDN_FOLDER, "2.jpg"),
  projectCoverFromName(FOURTEENTH_PROJECT_CDN_FOLDER, "3.jpg"),
] as [string, string, string];
/** Detail gallery — first row still (index card cover stays separate) */
const FOURTEENTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  FOURTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);

const FOURTEENTH_PROJECT_STILL = (fileName: string, alt: string) => ({
  src: projectCoverFromName(FOURTEENTH_PROJECT_CDN_FOLDER, fileName),
  alt,
});

/** Detail gallery row 2 — 1L | 1R (native asset dimensions — omit ratio) */
const FOURTEENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    FOURTEENTH_PROJECT_STILL("1L.jpg", "Skyrim Dragon Hunter messenger bag 1L"),
    FOURTEENTH_PROJECT_STILL("1r.jpg", "Skyrim Dragon Hunter messenger bag 1R"),
  ],
};

/** Detail gallery rows 3–7 */
const FOURTEENTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      FOURTEENTH_PROJECT_STILL("2l.jpg", "Skyrim Dragon Hunter messenger bag 2L"),
      FOURTEENTH_PROJECT_STILL("2m.jpg", "Skyrim Dragon Hunter messenger bag 2M"),
      FOURTEENTH_PROJECT_STILL("2r.jpg", "Skyrim Dragon Hunter messenger bag 2R"),
    ],
  },
  {
    items: [
      FOURTEENTH_PROJECT_STILL("3l.jpg", "Skyrim Dragon Hunter messenger bag 3L"),
      FOURTEENTH_PROJECT_STILL("3r.jpg", "Skyrim Dragon Hunter messenger bag 3R"),
    ],
  },
  {
    items: [
      FOURTEENTH_PROJECT_STILL("4f.jpg", "Skyrim Dragon Hunter messenger bag 4"),
    ],
  },
  {
    items: [
      FOURTEENTH_PROJECT_STILL("5l.jpg", "Skyrim Dragon Hunter messenger bag 5L"),
      FOURTEENTH_PROJECT_STILL("5m.jpg", "Skyrim Dragon Hunter messenger bag 5M"),
      FOURTEENTH_PROJECT_STILL("5r.jpg", "Skyrim Dragon Hunter messenger bag 5R"),
    ],
  },
  {
    items: [
      FOURTEENTH_PROJECT_STILL("6l.jpg", "Skyrim Dragon Hunter messenger bag 6L"),
      FOURTEENTH_PROJECT_STILL("6r.jpg", "Skyrim Dragon Hunter messenger bag 6R"),
    ],
  },
];

const FOURTEENTH_PROJECT_SPECIAL_THANKS: SpecialThanksEntry[] = [
  {
    company: "DPI Merchandising Inc.",
    names: ["Michelle Wu"],
  },
  {
    company: "Best Link (USA) Corp. Ltd.",
    names: ["Karyn Leung"],
  },
  {
    company: SGS_CREDIT_COMPANY,
    names: ["Liu Xinyu"],
  },
];

const FOURTEENTH_PROJECT_COLLABORATORS: CollaboratorCredits = {
  names: ["Mr. Chen Hua Xing"],
};

const FOURTEENTH_PROJECT_OVERVIEW = [
  "This project was one of the new product categories DPI Merchandising Inc. wanted to explore, using elements from Dragon Age to develop an IP-inspired messenger bag. The initial order quantity was only 300 units, making supplier sourcing and product development particularly challenging.",
];

const FOURTEENTH_PROJECT_CHALLENGES_BODY = [
  "The biggest challenge was turning a very vague product idea into a design that genuinely belonged to the game and its character. At the same time, the project had a limited budget and an initial order of only 300 units, making it difficult to find a supplier willing to develop a genuine leather product at the required quality and quantity.",
];

const FOURTEENTH_PROJECT_EXECUTION_BODY = [
  "I started with extensive product and game research rather than jumping straight into the design. I played the game myself to understand its world, visual style, and the character's story, while also researching more than 20 potential messenger bag styles. For each direction, I evaluated the estimated budget, prototyping time, and delivery timeline, and analyzed why the style, functionality, and overall look would fit the game and character.",
  "Based on this research, I defined a vintage, aged aesthetic with brown tones that matched the game's visual language. I then developed the final bag design around this direction and worked through the material selection, focusing on genuine leather while balancing its appearance, quality, and cost. I also helped identify a suitable supplier who was willing to take on the relatively small initial order while meeting the required quality standards.",
];

const FOURTEENTH_PROJECT_IMPACT_BODY = [
  "The bag quickly gained popularity among customers and fans and sold through rapidly. The initial order was conservatively set at 300 units, but strong demand led to repeated increases, eventually reaching 2,000 units.",
  "The success of this product also gave the client a proven design direction. Using the same style, materials, and manufacturing approach as the foundation, they went on to develop several other products in the same product line.",
];

/** 「第十五个项目」— End-to-End; wooden-box collection */
const FIFTEENTH_PROJECT_NAME = "Dragon Age Dreadwolf Keepsake Box";
const FIFTEENTH_PROJECT_CDN_FOLDER = FIFTEENTH_PROJECT_NAME;
const FIFTEENTH_PROJECT_SLUG = projectSlugFromName(FIFTEENTH_PROJECT_NAME);
const FIFTEENTH_PROJECT_TAGLINE =
  "A Solas-inspired keepsake box designed to preserve precious memories from Dragon Age.";
const FIFTEENTH_PROJECT_COVER = projectCoverFromName(
  FIFTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);
const FIFTEENTH_PROJECT_COVER_VIDEO = projectCoverFromName(
  FIFTEENTH_PROJECT_CDN_FOLDER,
  "video1.mp4",
);
const FIFTEENTH_PROJECT_HERO_VIDEO = projectCoverFromName(
  FIFTEENTH_PROJECT_CDN_FOLDER,
  "video.mp4",
);
const FIFTEENTH_PROJECT_HOVER_STILLS = [
  projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "1.jpg"),
  projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "2.jpg"),
  projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "3.jpg"),
] as [string, string, string];

const FIFTEENTH_PROJECT_GALLERY_LEAD = projectCoverFromName(
  FIFTEENTH_PROJECT_CDN_FOLDER,
  "1.jpg",
);

const FIFTEENTH_PROJECT_STILL = (fileName: string, alt: string) => ({
  src: projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, fileName),
  alt,
});

/** Detail gallery row 2 — 2L | 2R */
const FIFTEENTH_PROJECT_AFTER_COVER_STILLS = {
  items: [
    FIFTEENTH_PROJECT_STILL("2l.jpg", "Dragon Age Dreadwolf Keepsake Box 2L"),
    FIFTEENTH_PROJECT_STILL("2r.jpg", "Dragon Age Dreadwolf Keepsake Box 2R"),
  ],
};

/** Detail gallery rows 3–4 */
const FIFTEENTH_PROJECT_AFTER_COVER_EXTRA_ROWS = [
  {
    items: [
      FIFTEENTH_PROJECT_STILL("3l.jpg", "Dragon Age Dreadwolf Keepsake Box 3L"),
      FIFTEENTH_PROJECT_STILL("3m.jpg", "Dragon Age Dreadwolf Keepsake Box 3M"),
      FIFTEENTH_PROJECT_STILL("3r.jpg", "Dragon Age Dreadwolf Keepsake Box 3R"),
    ],
  },
  {
    items: [
      FIFTEENTH_PROJECT_STILL("4l.jpg", "Dragon Age Dreadwolf Keepsake Box 4L"),
      FIFTEENTH_PROJECT_STILL("4r.jpg", "Dragon Age Dreadwolf Keepsake Box 4R"),
    ],
  },
];

/** Detail gallery row 5 — full-width process clip */
const FIFTEENTH_PROJECT_AFTER_COVER_VIDEO = {
  primary: projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "5f.mov"),
  alt: "Dragon Age Dreadwolf Keepsake Box process",
  ratio: "56.25%",
} as const;

/** Detail gallery row 6 — 6L | 6R */
const FIFTEENTH_PROJECT_END_VIDEO_PAIR = {
  left: {
    primary: projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "6l.mp4"),
    alt: "Dragon Age Dreadwolf Keepsake Box 6L",
  },
  right: {
    primary: projectCoverFromName(FIFTEENTH_PROJECT_CDN_FOLDER, "6r.mp4"),
    alt: "Dragon Age Dreadwolf Keepsake Box 6R",
  },
  ratio: "100%",
} as const;

/** Detail gallery row 7 — 7L | 7R */
const FIFTEENTH_PROJECT_AFTER_END_VIDEO_PAIR_ROW = {
  items: [
    FIFTEENTH_PROJECT_STILL("7l.jpg", "Dragon Age Dreadwolf Keepsake Box 7L"),
    FIFTEENTH_PROJECT_STILL("7r.jpg", "Dragon Age Dreadwolf Keepsake Box 7R"),
  ],
};

const FIFTEENTH_PROJECT_OVERVIEW = [
  "This project was developed as a Dragon Age-inspired keepsake box featuring Solas. Designed to preserve fans’ precious memories, the box combines laser-etched artwork, metallic gold printing, antique hardware, and a green velvet interior to create an ornate, character-driven collectible piece.",
];

const FIFTEENTH_PROJECT_CHALLENGES_BODY = [
  "The biggest challenge was the amount of hardware involved. Each piece had to match the original design in style, size, and color, while also fitting the overall proportions of the box.",
  "The gold-painted character details created another challenge. The edges had to be painted precisely without staining the surrounding areas, making the process highly sensitive to positioning and brush control.",
  "The box also had to maintain a stable weight balance. If the lid was too heavy, opening it could cause the entire box to tip backward.",
];

const FIFTEENTH_PROJECT_EXECUTION_BODY = [
  "I spent several days sourcing off-the-shelf hardware that closely matched the design, then coordinated the sizes and finishes with suppliers. I tested different combinations and used the hardware dimensions to optimize the overall box size before bulk purchasing.",
  "Instead of committing to a large hardware order immediately, I built samples first to verify how each component looked and fitted on the box. This allowed me to adjust the box dimensions and avoid hardware that looked too small or disproportionate.",
  "I worked with the factory through multiple trials to identify a safe edge width for the gold-painted areas, giving workers more room for error and improving the yield. I also developed a simple painting template that worked together with the brush, helping workers apply the gold more accurately.",
  "To prevent the lid from making the box tip backward, I adjusted the weight distribution. I used heavier hardware on the lower section and added a bottom plate to increase the base weight and improve stability.",
];

const FIFTEENTH_PROJECT_IMPACT_BODY = [
  "The final box maintained the visual proportions of the original design while using commercially available hardware. Through early sampling, hardware optimization, process testing, and structural adjustments, I helped turn a design-heavy concept into a stable and production-ready collectible box.",
];

/** Default / home lead — End-to-End featured (NECROM Look Book Bundle) */
export const projectsFeaturedLead: ProjectsFeaturedLead = {
  slug: FIFTH_PROJECT_SLUG,
  title: FIFTH_PROJECT_NAME,
  tagline: FIFTH_PROJECT_TAGLINE,
  categories: involvementTags("end-to-end"),
  coverImage: FIFTH_PROJECT_COVER_VIDEO,
  coverVideo: FIFTH_PROJECT_COVER_VIDEO,
  coverHoverStills: FIFTH_PROJECT_HOVER_STILLS,
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
    coverVideo: FIRST_PROJECT_COVER_VIDEO,
    coverHoverStills: FIRST_PROJECT_HOVER_STILLS,
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
    specialThanks: FIRST_PROJECT_SPECIAL_THANKS,
    collaborators: FIRST_PROJECT_COLLABORATORS,
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
    coverVideo: SECOND_PROJECT_COVER_VIDEO,
    coverHoverStills: SECOND_PROJECT_HOVER_STILLS,
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
    specialThanks: SECOND_PROJECT_SPECIAL_THANKS,
    collaborators: SECOND_PROJECT_COLLABORATORS,
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
    coverVideo: THIRD_PROJECT_COVER_VIDEO,
    coverHoverStills: THIRD_PROJECT_HOVER_STILLS,
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
    coverVideo: FOURTH_PROJECT_COVER_VIDEO,
    coverHoverStills: FOURTH_PROJECT_HOVER_STILLS,
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
    coverHoverStills: FIFTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: FIFTH_PROJECT_GALLERY_LEAD,
    heroVideo: FIFTH_PROJECT_HERO_VIDEO,
    afterCoverStills: FIFTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FIFTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: FIFTH_PROJECT_AFTER_COVER_VIDEO,
    specialThanks: FIFTH_PROJECT_SPECIAL_THANKS,
    collaborators: FIFTH_PROJECT_COLLABORATORS,
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
    summary: SIXTH_PROJECT_TAGLINE,
    tagline: SIXTH_PROJECT_TAGLINE,
    role: [],
    involvement: "contribution",
    coverImage: SIXTH_PROJECT_COVER_VIDEO,
    coverVideo: SIXTH_PROJECT_COVER_VIDEO,
    coverHoverStills: SIXTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    galleryLeadImage: SIXTH_PROJECT_GALLERY_LEAD,
    heroVideo: SIXTH_PROJECT_HERO_VIDEO,
    afterCoverStills: SIXTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: SIXTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: SIXTH_PROJECT_AFTER_COVER_VIDEO,
    overview: [
      "This project was a collectible statue of Nomad, the team leader from Tom Clancy’s Ghost Recon Wildlands, developed by Ubisoft in collaboration with TriForce.",
      "Standing approximately 12 inches (30 cm) tall, the statue captures Nomad in a crouched tactical pose with his weapon drawn, positioned on a rugged rocky base inspired by the environments of the game.",
      "The base features the iconic Ghost insignia, while the overall sculpt and paintwork focus on realistic military equipment, layered tactical gear, and weathered surface details to reflect the grounded visual style of Ghost Recon Wildlands.",
    ],
    challengesBody: [
      "One of the main challenges was the structure and assembly of such a complex pose. Nomad is crouching while carrying a large backpack, weapons, and multiple pieces of tactical equipment. With so many parts positioned around the body, we needed to carefully consider how the figure should be broken down, how the backpack and legs should be supported, how the figure should connect to the base, and how smaller parts such as weapons and accessories could be protected from deformation or breakage.",
      "Another challenge was material allocation. The body, weapons, backpack, tactical gear, and smaller accessories all had different requirements for rigidity, flexibility, detail, and durability. Rather than using one material throughout the entire product, we needed to select and combine PVC, resin, ABS, and metal based on the function of each part while balancing appearance, strength, and production cost.",
      "Paint and weathering were also important challenges. The visual quality of the statue depended less on strong colors and more on the relationship between skin tones, clothing, tactical equipment, weapons, dirt, and the rocky environment. Weathering needed to look natural and irregular, but at the same time it had to be controlled well enough to remain consistent during mass production.",
    ],
    executionBody: [
      "I participated in reviewing the part breakdown and structural solutions for the figure, including the backpack attachment, leg support, connection to the base, and reinforcement of weapons and smaller components. Where necessary, we adjusted vulnerable areas to improve production and transportation stability without noticeably affecting the original design.",
      "I also took part in discussions around material selection, assigning PVC, resin, ABS, and metal to different components based on their requirements for detail, strength, flexibility, and cost.",
      "A major part of my involvement was reviewing the master sample and defining the visual standard for production. This included color references, skin tones, clothing weathering, equipment wear, and dirt effects. I worked with the factory to adjust areas where the weathering appeared too heavy or too light, helping turn a naturally irregular visual effect into a more controlled and repeatable production standard.",
    ],
    impactBody: [
      "The final product was able to retain a high level of tactical detail while achieving stable mass production and consistent assembly across the figure, backpack, weapons, and smaller components.",
      "Visually, Nomad’s crouched tactical pose, layered equipment, and battlefield weathering were preserved well in the final statue. Although different materials and finishing methods were used across the figure, clothing, weapons, equipment, and rocky base, the final result maintained a consistent and realistic military style.",
    ],
    year: 2024,
    featured: false,
    challenge:
      "Solve complex crouch assembly, mixed PVC/resin/ABS/metal allocation, and controlled battlefield weathering for mass production.",
    result:
      "Stable mass production with consistent assembly, while preserving Nomad’s tactical detail and realistic military weathering.",
  },
  {
    slug: SEVENTH_PROJECT_SLUG,
    title: SEVENTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["injustice"],
    tags: involvementTags("contribution"),
    summary: SEVENTH_PROJECT_TAGLINE,
    tagline: SEVENTH_PROJECT_TAGLINE,
    role: [],
    involvement: "contribution",
    coverImage: SEVENTH_PROJECT_COVER_VIDEO,
    coverVideo: SEVENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: SEVENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: SEVENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: SEVENTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: SEVENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverStillVideoPair: SEVENTH_PROJECT_AFTER_COVER_STILL_VIDEO_PAIR,
    afterCoverExtraRows: SEVENTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverStillVideoBeforeExtraRows: true,
    overview: [
      "This project was part of the Injustice 2 Versus Collection, with Brainiac released alongside Batman as a paired collectible set designed to recreate the confrontation between the two characters.",
      "Brainiac was the more visually complex figure of the pair, especially because of the six large mechanical tentacles extending from his back. These tentacles played a major role in creating the size, presence, and threatening appearance needed for the character to stand against Batman as part of the same display.",
      "To achieve the right visual quality, the tentacles needed to be made from metal. However, due to cost limitations, the body and base could not use the same material, which introduced additional challenges around weight balance and structural stability.",
    ],
    challengesBody: [
      "The first challenge was weight distribution. The six metal tentacles were concentrated behind the character, while the body and base were made from lighter materials. Once fully assembled, the center of gravity shifted backward, making the statue more likely to lean or become unstable.",
      "The second challenge was the facial expression. Most of Brainiac’s face is covered by mechanical armor, leaving the eyes as one of the few areas capable of communicating his cold and threatening personality. Because the eye area is so small, even minor differences in the pupils, highlights, or surrounding shadows could make the character look lifeless. Final market feedback reflected this issue, with one reviewer describing the eyes as relatively flat and dull compared with the character’s appearance in the game.",
    ],
    executionBody: [
      "To solve the balance issue, I avoided changing the material of the entire body or base, as this would have significantly increased the cost. Instead, I proposed adding hidden metal counterweights to the rear section of the base.",
      "This allowed us to redistribute the overall weight and lower the center of gravity with minimal additional cost, helping the statue remain stable even after all six metal tentacles were installed.",
      "For the facial expression, we also worked on the eyes and surrounding details to strengthen Brainiac’s threatening appearance. However, looking back at the final result, I believe this part could have been handled better. The eyes did not fully capture the intensity and character presence we originally wanted.",
    ],
    impactBody: [
      "Structurally, the additional counterweights successfully improved the balance of the statue without requiring a major change in materials or a significant increase in production cost.",
      "Overall feedback on the sculpt, mechanical details, and paintwork was positive. The reviewer particularly appreciated the leg sculpt and the overall appearance, noting that Brainiac still came across as dangerous and threatening. She also described the overall sculpt and paintwork as very strong.",
      "The eyes, however, remained one of the weaker parts of the final product. I agree with that feedback and believe there was still room for improvement.",
      "For me, this project was a good reminder that successful product development is not only about solving structural and cost problems. In character collectibles, very small details—especially around the face and eyes—can have a major impact on whether the character truly feels alive.",
    ],
    year: 2024,
    featured: false,
    challenge:
      "Balance six metal tentacles against a lighter body and base, while preserving Brainiac’s threatening presence in a small eye area.",
    result:
      "Hidden base counterweights stabilized the statue at minimal cost; sculpt and paint were well received, though the eyes still fell short of the intended intensity.",
  },
  {
    slug: EIGHTH_PROJECT_SLUG,
    title: EIGHTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["recore"],
    tags: involvementTags("contribution"),
    summary:
      "Bringing the world of ReCore into reality, this collectible statue captures the journey of Joule Adams and her robotic companion Mack, transforming an iconic in-game moment into a premium physical experience for fans.",
    tagline:
      "Bringing the world of ReCore into reality, this collectible statue captures the journey of Joule Adams and her robotic companion Mack, transforming an iconic in-game moment into a premium physical experience for fans.",
    role: [],
    involvement: "contribution",
    coverImage: EIGHTH_PROJECT_COVER_VIDEO,
    coverVideo: EIGHTH_PROJECT_COVER_VIDEO,
    coverHoverStills: EIGHTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: EIGHTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: EIGHTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: EIGHTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverVideoPair: EIGHTH_PROJECT_AFTER_COVER_VIDEO_PAIR,
    afterCoverExtraRows: EIGHTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    overview: [
      "ReCore is an action-adventure game developed by Comcept and Armature Studio, published by Microsoft Studios. Set on the distant planet of Far Eden, the game follows Joule Adams, one of the last remaining human colonists, as she awakens from cryosleep and discovers a world devastated by unknown events.",
      "Alongside her robotic companion Mack, a loyal CoreBot designed to assist humanity’s survival, Joule begins exploring the abandoned planet and uncovering the secrets behind the failed colonization mission.",
      "To celebrate this unique sci-fi adventure, the Collector’s Edition introduced a detailed statue featuring Joule and Mack — bringing the bond between human and machine from the digital world into a physical collectible experience.",
    ],
    challengesBody: [
      "The biggest challenge of this project was balancing the visual proportion and structural stability of the collectible, especially around the relationship between Joule and her robotic companion Mack.",
      "During the early development stage, we went through multiple iterations to find the most suitable proportion between the characters. The goal was to make their interaction feel natural while ensuring the overall composition looked balanced from different viewing angles.",
      "However, the biggest challenge came from Mack’s complex mechanical structure. Many of its upper components were relatively heavy, while the supporting structures underneath were small and delicate. We needed to carefully evaluate the material selection, reinforcement methods, and structural design to improve stability without affecting the original appearance.",
      "In addition, the small mechanical parts created difficulties during assembly, as some components were fragile and could easily break during handling. This required continuous refinement of the structure and assembly process to ensure the final product could achieve both the desired level of detail and reliable production quality.",
    ],
    executionBody: [
      "A large part of my work focused on improving Mack’s structure without changing the appearance of the original design.",
      "For the leg structure, we found a way to use the blue energy cables that were already part of Mack’s design as additional support. Instead of adding an obvious reinforcement piece, we integrated the support into these existing visual elements, helping the legs carry the weight of the upper body while keeping the original look intact.",
      "Another issue was the small mechanical components, which could easily break during assembly. I suggested adding a thin resin-based reinforcement coating to some of the more fragile parts before assembly. This gave the components additional surface strength and made them less likely to break during handling and installation, while adding very little visible thickness to the parts.",
    ],
    impactBody: [
      "The statue became a key component of the ReCore Collector’s Edition, helping extend the game experience beyond the digital world.",
      "By transforming Joule and Mack’s partnership into a physical collectible, the project gave fans a tangible way to connect with the characters and preserve a memorable part of the ReCore universe.",
    ],
    year: 2024,
    featured: false,
    challenge:
      "Balance character proportion and Mack’s top-heavy mechanical structure without compromising detail or assembly reliability.",
    result:
      "A stable Collector’s Edition centerpiece that brought Joule and Mack’s partnership into a physical collectible for fans.",
  },
  {
    slug: NINTH_PROJECT_SLUG,
    title: NINTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["halo-guardians"],
    tags: involvementTags("contribution"),
    summary: NINTH_PROJECT_TAGLINE,
    tagline: NINTH_PROJECT_TAGLINE,
    role: [],
    involvement: "contribution",
    coverImage: NINTH_PROJECT_COVER_VIDEO,
    coverVideo: NINTH_PROJECT_COVER_VIDEO,
    coverHoverStills: NINTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: NINTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: NINTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: NINTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: NINTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    endVideo: NINTH_PROJECT_END_VIDEO,
    overview: [
      "This project was part of the Halo 5: Guardians Limited Collector’s Edition, released for Xbox One in collaboration with Microsoft, 343 Industries, and TriForce.",
      "The centerpiece of the collector’s edition was a commemorative statue featuring Master Chief and Spartan Locke, presented together in a large environmental display base. The composition was designed around the tension between the two central characters of Halo 5: Guardians, with both figures shown in dynamic combat-ready poses.",
      "The collector’s edition also included a SteelBook case, a Metal Earth Guardian model, classified orders and dossiers for Blue Team and Fireteam Osiris, as well as additional digital content and game-related bonuses.",
    ],
    challengesBody: [
      "The biggest challenge came before tooling.",
      "The body poses could still be adjusted during development, but the final sense of tension depended heavily on small changes in head angle and viewing direction. Even a minor shift could make one character appear to be looking in the wrong direction and weaken the relationship between the two figures.",
      "Once the tooling was finalized, changing these poses would become much more expensive.",
      "So the challenge was to determine the final body positions, head angles, and sightlines before tooling, while keeping the adjustment process as efficient and low-cost as possible.",
    ],
    executionBody: [
      "To make the viewing direction easier to evaluate, I introduced a directional projection method using infrared light.",
      "The light was projected from the rear of each character’s head toward the front, allowing us to visualize the direction the character was effectively facing. Instead of relying only on subjective visual judgment, we could use the projected direction as a clear reference when adjusting the head angle and overall pose.",
      "By placing both characters back into the full scene and repeatedly comparing their projected sightlines with the intended combat composition, we were able to fine-tune the poses before finalizing the tooling.",
      "This gave us a simple and low-cost way to test different viewing directions without repeatedly modifying production molds.",
    ],
    impactBody: [
      "The final composition created a clearer relationship between the two characters: Master Chief appears to be advancing forward while Spartan Locke provides side coverage, helping the two figures read as part of the same combat moment rather than as two separate statues.",
      "More importantly, the key poses and viewing directions were confirmed before tooling, reducing the risk of expensive mold changes later in development.",
      "This project reinforced one important lesson for me: in a multi-character statue, where a character is looking can be just as important as how accurately the character is sculpted. A very small change in head angle can completely change the story of the scene.",
    ],
    year: 2024,
    featured: false,
    challenge:
      "Lock body poses, head angles, and sightlines before tooling without costly trial-and-error mold changes.",
    result:
      "Infrared sightline checks confirmed the Chief–Locke combat composition before tooling, avoiding expensive late pose revisions.",
  },
  {
    slug: TENTH_PROJECT_SLUG,
    title: TENTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["gears-of-war"],
    tags: involvementTags("contribution"),
    summary: TENTH_PROJECT_TAGLINE,
    tagline: TENTH_PROJECT_TAGLINE,
    role: [],
    involvement: "contribution",
    coverImage: TENTH_PROJECT_COVER_VIDEO,
    coverVideo: TENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: TENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: TENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: TENTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: TENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: TENTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    endVideo: TENTH_PROJECT_END_VIDEO,
    overview: [
      "This project was the JD Fenix Bike Statue created for the Gears of War 4 Collector’s Edition.",
      "The statue captures JD Fenix alongside a heavily armored military motorcycle, combining the character, vehicle, weaponry, and environmental base into a single battlefield scene. The overall direction focused on the gritty visual language of Gears of War, with heavy mechanical structures, worn tactical equipment, and extensive weathering used to communicate a vehicle and character shaped by repeated combat.",
    ],
    challengesBody: [
      "One of the main challenges was integrating the character naturally with such a large and mechanically complex vehicle. JD’s body, hands, legs, weapon, and equipment all needed to interact correctly with the bike, while the final pose still had to feel natural and believable rather than appearing as though the figure had simply been placed on top of the vehicle.",
      "The motorcycle itself also contained a large number of mechanical details, including suspension components, exposed structures, tires, weapons, and armored panels. These elements required careful part breakdown and structural consideration to preserve detail while remaining practical for molding, assembly, and mass production.",
      "Another major challenge was the weathering. The character, bike, weapon, and base all needed different surface treatments, but they still had to feel as though they belonged to the same battlefield environment. The challenge was to make dirt, wear, scratches, and battle damage look natural while keeping those effects controlled and repeatable during production.",
    ],
    executionBody: [
      "I participated in reviewing the structural breakdown and assembly of the statue, particularly the relationship between JD and the motorcycle. This included evaluating the character’s contact points with the bike, the stability of the overall pose, the connection between major components, and the reinforcement of smaller or more vulnerable mechanical parts.",
      "I also worked with the factory on material and production decisions for different components, balancing detail, structural strength, manufacturability, and cost across the character, vehicle, weapon, and smaller mechanical parts.",
      "A major part of my involvement was the master sample and finishing review. I helped define the visual standard for the olive-green vehicle body, metallic mechanical components, character clothing, armor, dirt, scratches, and battle damage. I also reviewed the intensity and placement of weathering effects, asking the factory to increase or reduce certain areas so that the final production would retain the gritty, war-worn appearance without becoming visually inconsistent or overdone.",
    ],
    impactBody: [
      "The final statue successfully brought the character and vehicle together as one complete scene rather than two separate elements. JD’s posture, weapon, and interaction with the motorcycle created a believable relationship between the character and the machine, while the detailed mechanical structure remained clearly visible throughout the final product.",
      "The combination of armor wear, dirt, scratches, exposed mechanical details, and environmental textures also helped maintain the distinctive gritty visual style of Gears of War 4.",
      "From a production perspective, the project retained a high level of mechanical and surface detail while achieving a structure that could be consistently assembled and reproduced in mass production.",
    ],
    year: 2024,
    featured: false,
    challenge:
      "Integrate JD Fenix with a complex motorcycle while balancing mechanical detail, structural practicality, and consistent battlefield weathering across production.",
    result:
      "A cohesive combat scene that united character, vehicle, and weathering at production-ready detail for the Gears of War 4 Collector’s Edition.",
  },
  {
    slug: ELEVENTH_PROJECT_SLUG,
    title: ELEVENTH_PROJECT_NAME,
    materials: ["fabric"],
    ips: ["fallout"],
    tags: involvementTags("specialized"),
    summary:
      "A custom embroidered patch inspired by Fallout’s iconic Tunnel Snakes gang, bringing an in-game faction symbol into a collectible physical product.",
    tagline:
      "A custom embroidered patch inspired by Fallout’s iconic Tunnel Snakes gang, bringing an in-game faction symbol into a collectible physical product.",
    role: [],
    involvement: "specialized",
    coverImage: ELEVENTH_PROJECT_COVER_VIDEO,
    coverVideo: ELEVENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: ELEVENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: ELEVENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: ELEVENTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: ELEVENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: ELEVENTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    overview: [
      "Inspired by Fallout’s infamous Tunnel Snakes gang, this patch is more than a design—it’s a tribute to rebellion. Known for their motto \"Tunnel Snakes Rule,\" Butch and his gang have been the embodiment of toughness and loyalty. Whether you’re reliving the adventures of Vault 101 or making your mark in the world, this patch lets you carry that untamed spirit wherever you go. Wear it with pride, but as Butch would say, \"you gotta be hard\" to live up to it!",
    ],
    challengesBody: [
      "The main challenge of this embroidered patch was achieving accurate reproduction of a highly detailed and complex design.",
      "The product contained multiple color areas with intricate graphic elements. If the patch was produced using a standard embroidery approach without further analysis, many details could lose their definition, and the final result would not fully match the original design intent.",
      "Before production, the artwork needed to be carefully analyzed and divided into different sections. This included identifying which areas required the highest level of detail and visual emphasis; determining the appropriate stitch density for each section; and selecting the most suitable filling techniques based on the characteristics of each graphic element.",
      "The key challenge was finding the right balance between design accuracy, embroidery techniques, and manufacturing feasibility to achieve the best possible visual result within the limitations of the production process.",
    ],
    executionBody: [
      "To improve the final outcome, I focused on both understanding the embroidery process and improving communication with the factory.",
      "First, I studied the fundamentals of embroidery production and worked closely with experienced embroidery technicians on-site to understand how different stitch types, stitch densities, and filling methods affect the final appearance. I then applied this knowledge to optimize the production approach.",
      "Second, I carefully divided the artwork into different sections digitally and created detailed production guidelines for the factory. These materials clearly explained the processing requirements, visual priorities, and expected effects for each area of the design.",
      "This approach helped the factory better understand the client’s expectations, reduced potential misunderstandings during production, and improved the overall quality and accuracy of the final embroidered patch.",
    ],
    specialThanks: ELEVENTH_PROJECT_SPECIAL_THANKS,
    collaborators: ELEVENTH_PROJECT_COLLABORATORS,
    year: 2024,
    featured: false,
    challenge: "",
    result: "",
  },
  {
    slug: TWELFTH_PROJECT_SLUG,
    title: TWELFTH_PROJECT_NAME,
    materials: ["fabric"],
    ips: ["cyberpunk-2077"],
    tags: involvementTags("end-to-end"),
    summary: TWELFTH_PROJECT_TAGLINE,
    tagline: TWELFTH_PROJECT_TAGLINE,
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: TWELFTH_PROJECT_COVER,
    coverVideo: TWELFTH_PROJECT_COVER_VIDEO,
    coverHoverStills: TWELFTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: TWELFTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: TWELFTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: TWELFTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: TWELFTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    specialThanks: TWELFTH_PROJECT_SPECIAL_THANKS,
    collaborators: TWELFTH_PROJECT_COLLABORATORS,
    overview: TWELFTH_PROJECT_OVERVIEW,
    challengesBody: TWELFTH_PROJECT_CHALLENGES_BODY,
    executionBody: TWELFTH_PROJECT_EXECUTION_BODY,
    impactBody: TWELFTH_PROJECT_IMPACT_BODY,
    year: 2024,
    client: "Cyberpunk 2077",
    featured: false,
    challenge:
      "Balance three differently weighted felt panels, keep print alignment after stitching, and print clean detail on rough felt.",
    result:
      "A stable hanging banner with clear layered graphics that sold out quickly.",
  },
  {
    slug: THIRTEENTH_PROJECT_SLUG,
    title: THIRTEENTH_PROJECT_NAME,
    materials: ["resin"],
    ips: ["the-elder-scrolls"],
    tags: involvementTags("end-to-end"),
    summary: THIRTEENTH_PROJECT_TAGLINE,
    tagline: THIRTEENTH_PROJECT_TAGLINE,
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: THIRTEENTH_PROJECT_COVER,
    coverVideo: THIRTEENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: THIRTEENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: THIRTEENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: THIRTEENTH_PROJECT_GALLERY_LEAD,
    galleryLeadRatio: THIRTEENTH_PROJECT_LANDSCAPE_RATIO,
    afterCoverStills: THIRTEENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverVideo: THIRTEENTH_PROJECT_AFTER_COVER_VIDEO,
    afterVideoRow: THIRTEENTH_PROJECT_AFTER_VIDEO_ROW,
    beforeEndRow: THIRTEENTH_PROJECT_BEFORE_END_ROW,
    afterEndRow: THIRTEENTH_PROJECT_AFTER_END_ROW,
    specialThanks: THIRTEENTH_PROJECT_SPECIAL_THANKS,
    collaborators: THIRTEENTH_PROJECT_COLLABORATORS,
    overview: [
      "Ithelia, the forgotten Daedric Prince, has finally been remembered. Known as the Mistress of the Untraveled Road, she commands the Threads of Fate, bending reality to her will. Once hidden as Hermaeus Mora's best-kept secret, her existence was erased even from the memories of the other Daedric Princes.",
      "To bring her story back to life, Bethesda Gear Store created The Elder Scrolls Online Forgotten Daedric Prince Statue. Limited to just 3,300 pieces worldwide, this collectible recreates Ithelia with her intricate crystal wings, detailed costume, and the iconic Threads of Fate. The hand-painted polyresin statue also includes a Letter of Authenticity, making it a true collector's piece for fans of The Elder Scrolls Online.",
    ],
    challengesBody: [
      "The main challenge was achieving a translucent crystal effect on the wings without making the material look like ordinary painted plastic. The design required a gradual transition from deeper blue and purple at the outer edges to lighter, more transparent tones toward the center, with small silver accents to enhance the reflective crystal appearance. However, applying too much paint or using an overly concentrated color would cover the natural transparency of the clear material and make the wings look opaque, flat, and visually heavy.",
    ],
    executionBody: [
      "I worked with the factory to adjust the coloring process instead of relying on conventional full-surface painting. I separated the color areas and controlled the paint density layer by layer, keeping the central areas lighter to preserve transparency while gradually increasing the color toward the edges.",
      "I also tested different color concentrations on crystal samples before moving to production, comparing the transparency and color transition under different lighting conditions. Based on the results, I adjusted the paint ratio and spraying coverage until the blue and purple tones could be seen without covering the crystal's natural depth and reflections.",
      "This allowed us to achieve the layered crystal appearance shown in the final product while keeping the wings visually transparent rather than simply painted.",
    ],
    year: 2024,
    client: "The Elder Scrolls Online",
    featured: false,
    challenge: "",
    result: "",
  },
  {
    slug: FOURTEENTH_PROJECT_SLUG,
    title: FOURTEENTH_PROJECT_NAME,
    materials: ["leather", "fabric"],
    ips: ["the-elder-scrolls"],
    tags: involvementTags("end-to-end"),
    summary: FOURTEENTH_PROJECT_TAGLINE,
    tagline: FOURTEENTH_PROJECT_TAGLINE,
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: FOURTEENTH_PROJECT_COVER,
    coverVideo: FOURTEENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: FOURTEENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: FOURTEENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: FOURTEENTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: FOURTEENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FOURTEENTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    specialThanks: FOURTEENTH_PROJECT_SPECIAL_THANKS,
    collaborators: FOURTEENTH_PROJECT_COLLABORATORS,
    overview: FOURTEENTH_PROJECT_OVERVIEW,
    challengesBody: FOURTEENTH_PROJECT_CHALLENGES_BODY,
    executionBody: FOURTEENTH_PROJECT_EXECUTION_BODY,
    impactBody: FOURTEENTH_PROJECT_IMPACT_BODY,
    year: 2024,
    client: "Skyrim",
    featured: false,
    challenge:
      "Turn an open brief into a game-authentic leather bag at small-run scale and limited budget.",
    result:
      "Sold through from 300 to 2,000 units and established a repeatable product line direction.",
  },
  {
    slug: FIFTEENTH_PROJECT_SLUG,
    title: FIFTEENTH_PROJECT_NAME,
    materials: ["wood", "metal", "fabric"],
    ips: ["dragon-age"],
    tags: involvementTags("end-to-end"),
    summary: FIFTEENTH_PROJECT_TAGLINE,
    tagline: FIFTEENTH_PROJECT_TAGLINE,
    role: [
      "product-development",
      "sample-development",
      "production-management",
    ],
    involvement: "end-to-end",
    coverImage: FIFTEENTH_PROJECT_COVER,
    coverVideo: FIFTEENTH_PROJECT_COVER_VIDEO,
    coverHoverStills: FIFTEENTH_PROJECT_HOVER_STILLS,
    coverWidth: SHOWCASE_COVER_W,
    coverHeight: SHOWCASE_COVER_H,
    heroVideo: FIFTEENTH_PROJECT_HERO_VIDEO,
    galleryLeadImage: FIFTEENTH_PROJECT_GALLERY_LEAD,
    afterCoverStills: FIFTEENTH_PROJECT_AFTER_COVER_STILLS,
    afterCoverExtraRows: FIFTEENTH_PROJECT_AFTER_COVER_EXTRA_ROWS,
    afterCoverVideo: FIFTEENTH_PROJECT_AFTER_COVER_VIDEO,
    endVideoPair: FIFTEENTH_PROJECT_END_VIDEO_PAIR,
    afterEndVideoPairRow: FIFTEENTH_PROJECT_AFTER_END_VIDEO_PAIR_ROW,
    specialThanks: WOODEN_BOX_SPECIAL_THANKS,
    collaborators: WOODEN_BOX_COLLABORATORS,
    overview: FIFTEENTH_PROJECT_OVERVIEW,
    challengesBody: FIFTEENTH_PROJECT_CHALLENGES_BODY,
    executionBody: FIFTEENTH_PROJECT_EXECUTION_BODY,
    impactBody: FIFTEENTH_PROJECT_IMPACT_BODY,
    year: 2024,
    client: "Dragon Age",
    featured: false,
    challenge:
      "Match design-heavy hardware, keep gold paint edges clean, and stop the box tipping when the lid opens.",
    result:
      "A proportionally faithful, stable collectible box ready for production with commercially available hardware.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/**
 * Featured lead by involvement filter on `/projects`.
 * `all` uses the End-to-End lead. Only change a lead when the user asks.
 */
const PROJECTS_FEATURED_LEAD_BY_INVOLVEMENT: Record<
  Involvement | "all",
  string
> = {
  /* All / End-to-End — NECROM Look Book Bundle */
  all: FIFTH_PROJECT_SLUG,
  "end-to-end": FIFTH_PROJECT_SLUG,
  /* Project Contribution — Horizon Zero Dawn Thunderjaw */
  contribution: THIRD_PROJECT_SLUG,
  /* Specialized — 10-Year Coin Shadowbox until user picks another */
  specialized: FOURTH_PROJECT_SLUG,
};

function projectToFeaturedLead(project: Project): ProjectsFeaturedLead {
  return {
    slug: project.slug,
    title: project.title,
    tagline: project.tagline ?? project.summary,
    categories: involvementTags(project.involvement),
    coverImage: project.coverImage,
    coverVideo: project.coverVideo,
    coverHoverStills: project.coverHoverStills,
    coverWidth: project.coverWidth,
    coverHeight: project.coverHeight,
  };
}

/** Resolve the full-width lead for the active involvement filter on `/projects`. */
export function getProjectsFeaturedLead(
  involvement: Involvement | "all" = "all",
): ProjectsFeaturedLead {
  const slug =
    PROJECTS_FEATURED_LEAD_BY_INVOLVEMENT[involvement] ??
    PROJECTS_FEATURED_LEAD_BY_INVOLVEMENT.all;
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) return projectsFeaturedLead;
  return projectToFeaturedLead(project);
}

export function getFeaturedProjects(limit = 3) {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function filterProjects(options?: {
  material?: Material | "all" | null;
  ip?: string | null;
  involvement?: Involvement | "all" | Involvement[] | null;
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
      (Array.isArray(involvement)
        ? involvement.length === 0 ||
          involvement.includes(project.involvement)
        : project.involvement === involvement);
    return materialOk && ipOk && involvementOk;
  });
}

const INVOLVEMENT_IDS: Involvement[] = ["end-to-end", "contribution", "specialized"];

/** Parsed involvement filter — `all` or one-or-more involvement ids (excludes `all` pill id). */
export type InvolvementSelection = Involvement[] | "all";

export function parseInvolvementSelection(value?: string): InvolvementSelection {
  if (!value || value === "all") return "all";
  const ids = [
    ...new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter((part): part is Involvement =>
          INVOLVEMENT_IDS.includes(part as Involvement),
        ),
    ),
  ];
  if (ids.length === 0 || ids.length === INVOLVEMENT_IDS.length) return "all";
  return ids;
}

export function involvementSelectionCount(selection: InvolvementSelection): number {
  return selection === "all" ? 0 : selection.length;
}

/** Single involvement → featured lead key; multi / all → `all` lead. */
export function featuredLeadInvolvementKey(
  selection: InvolvementSelection,
): Involvement | "all" {
  if (selection === "all" || selection.length !== 1) return "all";
  return selection[0];
}

export function buildInvolvementQueryValue(
  selection: InvolvementSelection,
): string | null {
  if (selection === "all" || selection.length === 0) return null;
  if (selection.length === INVOLVEMENT_IDS.length) return null;
  return selection.join(",");
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
