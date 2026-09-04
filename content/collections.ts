import {
  getProjectBySlug,
  projectSlugFromName,
} from "@/content/projects";
import type { Project } from "@/content/projects";
import { asset } from "@/lib/assets";

/** Consumer quote on collection detail — copy supplied per project when ready. */
export type CollectionTestimonial = {
  quote: string;
  name?: string;
  role?: string;
};

/** One project row on a collection detail page (first listed / earliest release at top). */
export type CollectionEntry = {
  slug: string;
  /** Game / IP name — collection detail heading */
  gameTitle: string;
  /** Game or IP context — shown below the title */
  gameInfo: string | string[];
  testimonial?: CollectionTestimonial;
};

/** One of the three portrait panels — optional auto-cycle frames. */
export type CollectionPanel = {
  /** Still(s); length ≥ 2 → auto-cycle at card hover speed (0.85s). */
  frames: string[];
};

/** Full-width collection break on `/projects` — multi-variant product family. */
export type ProjectCollection = {
  slug: string;
  /** Short internal label (e.g. messenger bag) */
  title: string;
  /** Large overlay headline on the three-up panel row */
  headline: string;
  /** Three portrait panels — left, center, right */
  panels: [CollectionPanel, CollectionPanel, CollectionPanel];
  /**
   * Projects in this collection, top → bottom = shelf order (earliest listed first).
   * Add new bag / banner / wooden-box projects here as they ship.
   */
  entries: CollectionEntry[];
};

/**
 * Collection detail (`/collections/[slug]` + Read more CTA).
 * When false: blocks nav and returns 404.
 */
export const COLLECTIONS_DETAIL_LIVE = true;

function panelFromProjectImages(
  primary: string,
  swap: string,
): CollectionPanel {
  return {
    frames: [
      asset(`images/projects/collection/${primary}`),
      asset(`images/projects/collection/${swap}`),
    ],
  };
}

/** Placeholder until per-project consumer quotes are supplied */
const COLLECTION_TESTIMONIAL_PLACEHOLDER: CollectionTestimonial = {
  quote:
    "Further had the talent to get into our heads and translate everything inside into a tangible, credible and powerfully emotional result, which everyone immediately fell in love with.",
};

const CYBERPUNK_BANNER_SLUG = projectSlugFromName("Cyberpunk 2077 Systems Banner");
const DRAGON_AGE_GREY_WARDENS_BANNER_SLUG = projectSlugFromName(
  "Dragon Age Grey Wardens Banner",
);
const MASS_EFFECT_TALI_SLUG = projectSlugFromName("Mass Effect Tali Companion Bundle");
const SKYRIM_MESSENGER_BAG_SLUG = projectSlugFromName(
  "Skyrim Dragon Hunter Messenger Bag",
);
const DRAGON_AGE_KEEPSAKE_BOX_SLUG = projectSlugFromName(
  "Dragon Age Dreadwolf Keepsake Box",
);
const DRAGON_AGE_MAGE_TEMPLAR_COIN_SLUG = projectSlugFromName(
  "Dragon Age Mage-Templar War Coin Set",
);
const FALLOUT_NCR_RANGER_COIN_SLUG = projectSlugFromName(
  "Fallout NCR Ranger Challenge Coin",
);
const FALLOUT_TOPS_CASINO_CHIP_SLUG = projectSlugFromName(
  "Fallout The Tops Casino Chip Collectible Coin",
);

const FALLOUT_GAME_INFO =
  "A post-apocalyptic role-playing series set in a retro-futuristic United States — where factions, vaults, and scavenged culture define life after the bombs.";

const PLACEHOLDER_QUOTE_NAMES = [
  "Shanna Holthaus",
  "Michelle Wu",
  "James Chen",
  "Elena Vasquez",
  "David Okonkwo",
  "Sarah Lindstrom",
] as const;

const PLACEHOLDER_QUOTE_ROLES = [
  "Merchandising Director",
  "Product Development Lead",
  "Brand Partnerships Manager",
  "Creative Operations Director",
  "Consumer Products Manager",
  "Licensing & Retail Lead",
] as const;

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Placeholder quote + deterministic stand-in name/role until real copy ships. */
export function resolveCollectionTestimonial(
  slug: string,
  partial?: CollectionTestimonial,
): CollectionTestimonial {
  const seed = hashSlug(slug);
  return {
    quote: partial?.quote ?? COLLECTION_TESTIMONIAL_PLACEHOLDER.quote,
    name:
      partial?.name ??
      PLACEHOLDER_QUOTE_NAMES[seed % PLACEHOLDER_QUOTE_NAMES.length]!,
    role:
      partial?.role ??
      PLACEHOLDER_QUOTE_ROLES[seed % PLACEHOLDER_QUOTE_ROLES.length]!,
  };
}

export const projectCollections: ProjectCollection[] = [
  {
    slug: "banner",
    title: "Banner",
    headline: "Defining New Banner Paradigm",
    panels: [
      panelFromProjectImages("11.jpg", "12.jpg"),
      panelFromProjectImages("21.jpg", "22.jpg"),
      panelFromProjectImages("31.jpg", "32.jpg"),
    ],
    entries: [
      {
        slug: CYBERPUNK_BANNER_SLUG,
        gameTitle: "Cyberpunk 2077",
        gameInfo:
          "An open-world action RPG set in Night City, built around a distinct futuristic aesthetic that extends naturally into physical merchandise and display pieces.",
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
      {
        slug: DRAGON_AGE_GREY_WARDENS_BANNER_SLUG,
        gameTitle: "Dragon Age",
        gameInfo:
          "A dark fantasy action RPG series set in Thedas — a world of magic, political intrigue, and characters whose choices leave lasting marks on the story.",
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
    ],
  },
  {
    slug: "messenger-bag",
    title: "Messenger Bag",
    headline: "Defining New Durable Bag",
    panels: [
      panelFromProjectImages("71.jpg", "72.jpg"),
      panelFromProjectImages("81.jpg", "82.jpg"),
      panelFromProjectImages("91.jpg", "92.jpg"),
    ],
    entries: [
      {
        slug: SKYRIM_MESSENGER_BAG_SLUG,
        gameTitle: "The Elder Scrolls V: Skyrim",
        gameInfo:
          "An open-world fantasy RPG set in the northern province of Skyrim — a world of dragons, ancient ruins, and rugged frontier culture.",
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
    ],
  },
  {
    slug: "wooden-box",
    title: "Wooden Box",
    headline: "Defining How Souvenirs Are Stored",
    panels: [
      panelFromProjectImages("41.jpg", "42.jpg"),
      panelFromProjectImages("51.jpg", "52.jpg"),
      panelFromProjectImages("61.jpg", "62.jpg"),
    ],
    entries: [
      {
        slug: MASS_EFFECT_TALI_SLUG,
        gameTitle: "Mass Effect",
        gameInfo:
          "A science-fiction action RPG series following Commander Shepard and their crew — including Tali'Zorah — across a galaxy of alliances, loyalty, and high-stakes decision-making.",
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
      {
        slug: DRAGON_AGE_KEEPSAKE_BOX_SLUG,
        gameTitle: "Dragon Age",
        gameInfo:
          "A dark fantasy action RPG series set in Thedas — a world of magic, political intrigue, and characters whose choices leave lasting marks on the story.",
        testimonial: {
          quote:
            "Really pretty! I loved the attention to detail on the hinges and metal on the corners, none of it is left plain. Feels quite sturdy as well!",
        },
      },
      {
        slug: DRAGON_AGE_MAGE_TEMPLAR_COIN_SLUG,
        gameTitle: "Dragon Age",
        gameInfo:
          "A dark fantasy action RPG series set in Thedas — a world of magic, political intrigue, and characters whose choices leave lasting marks on the story.",
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
    ],
  },
  {
    slug: "packaging",
    title: "Packaging",
    headline: "Redefining packaging through the details",
    panels: [
      panelFromProjectImages("101.jpg", "102.jpg"),
      panelFromProjectImages("201.jpg", "202.jpg"),
      panelFromProjectImages("301.jpg", "302.jpg"),
    ],
    entries: [
      {
        slug: FALLOUT_TOPS_CASINO_CHIP_SLUG,
        gameTitle: "Fallout",
        gameInfo: FALLOUT_GAME_INFO,
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
      {
        slug: FALLOUT_NCR_RANGER_COIN_SLUG,
        gameTitle: "Fallout",
        gameInfo: FALLOUT_GAME_INFO,
        testimonial: COLLECTION_TESTIMONIAL_PLACEHOLDER,
      },
    ],
  },
];

export function getCollectionBySlug(slug: string): ProjectCollection | undefined {
  return projectCollections.find((collection) => collection.slug === slug);
}

/** One collection per break index — no cycling once the list is exhausted. */
export function getCollectionForBreakIndex(
  index: number,
): ProjectCollection | null {
  return projectCollections[index] ?? null;
}

export type CollectionProjectRow = {
  project: Project;
  gameTitle: string;
  gameInfo: string[];
  testimonial: CollectionTestimonial;
};

function asGameInfoParagraphs(value: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

/** Resolve collection entries to live projects — skips missing slugs. */
export function getCollectionProjects(
  collection: ProjectCollection,
): CollectionProjectRow[] {
  return collection.entries.flatMap((entry) => {
    const project = getProjectBySlug(entry.slug);
    if (!project) return [];
    return [
      {
        project,
        gameTitle: entry.gameTitle,
        gameInfo: asGameInfoParagraphs(entry.gameInfo),
        testimonial: resolveCollectionTestimonial(
          entry.slug,
          entry.testimonial,
        ),
      },
    ];
  });
}
