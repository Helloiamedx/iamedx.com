import fs from "fs";
import path from "path";
import { findInsightTag, insightTags } from "@/content/nav";

/** Temporary Pentagram covers until real insight photography lands */
export const INSIGHT_PLACEHOLDER_COVERS = [
  "https://pentagram-production.imgix.net/29028e04-d2be-4029-9ab2-cf9f91af8060/MW_DeBijloke_02.png?auto=compress%2Cformat&fit=min&fm=jpg&q=80&rect=0%2C0%2C3000%2C1688&w=1500&crop=1&dpr=2&fit=crop&h=844&s=a23c32369893c8d21fae1de7c12fff0c",
  "https://pentagram-production.imgix.net/29028e04-d2be-4029-9ab2-cf9f91af8060/MW_DeBijloke_03.png?auto=compress%2Cformat&fit=min&fm=jpg&q=80&rect=0%2C0%2C3000%2C1687&w=1500&crop=1&dpr=2&fit=crop&h=844&s=4dc891bbba717d72d7b2994ca6305373",
] as const;

export const INSIGHT_COVER_W = 3000;
export const INSIGHT_COVER_H = 1687;

export type InsightMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  /** Canonical tag slugs from frontmatter, matched to Insights mega menu */
  tags: string[];
  /** Cover URL — falls back to rotating placeholders when omitted */
  coverImage: string;
};

export type Insight = InsightMeta & {
  content: string;
};

const insightsDirectory = path.join(process.cwd(), "content/insights");

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  tags: string[];
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, tags: [], body: raw };

  const front = match[1];
  const data: Record<string, string> = {};
  const tagValues: string[] = [];

  const lines = front.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (key === "tags") {
      if (value.startsWith("[") && value.endsWith("]")) {
        tagValues.push(
          ...value
            .slice(1, -1)
            .split(",")
            .map((part) => part.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean),
        );
      } else if (value) {
        tagValues.push(
          ...value
            .split(",")
            .map((part) => part.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean),
        );
      } else {
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
          i += 1;
          tagValues.push(lines[i].replace(/^\s*-\s+/, "").trim());
        }
      }
      continue;
    }

    data[key] = value.replace(/^["']|["']$/g, "");
  }

  const tags = normalizeTags(tagValues);
  return { data, tags, body: match[2].trim() };
}

function normalizeTags(values: string[]) {
  const known = new Map(insightTags.map((tag) => [tag.slug, tag.slug]));
  for (const tag of insightTags) {
    known.set(tag.label.toLowerCase(), tag.slug);
  }

  const resolved: string[] = [];
  for (const value of values) {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const match =
      known.get(value.toLowerCase()) ??
      known.get(slug) ??
      (findInsightTag(slug) ? slug : null);
    if (match && !resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

function placeholderCoverForSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % INSIGHT_PLACEHOLDER_COVERS.length;
  }
  return INSIGHT_PLACEHOLDER_COVERS[hash] ?? INSIGHT_PLACEHOLDER_COVERS[0];
}

export function getInsightSlugs() {
  if (!fs.existsSync(insightsDirectory)) return [];
  return fs
    .readdirSync(insightsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getInsightBySlug(slug: string): Insight | null {
  const fullPath = path.join(insightsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, tags, body } = parseFrontmatter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    tags,
    coverImage: data.coverImage || placeholderCoverForSlug(slug),
    content: body,
  };
}

export function getAllInsights(): InsightMeta[] {
  return getInsightSlugs()
    .map((slug) => {
      const insight = getInsightBySlug(slug);
      if (!insight) return null;
      const { content: _content, ...meta } = insight;
      return meta;
    })
    .filter((insight): insight is InsightMeta => insight !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getInsightsByTag(tagSlug?: string | null) {
  const all = getAllInsights();
  if (!tagSlug) return all;
  return all.filter((insight) => insight.tags.includes(tagSlug));
}

export function getInsightTagLabels(tagSlugs: string[]) {
  return tagSlugs
    .map((slug) => findInsightTag(slug)?.label ?? slug)
    .filter(Boolean);
}

/** Related strip: other insights, stable shuffle by seed, capped. */
export function getRelatedInsights(
  excludeSlugs: string[],
  limit = 2,
): InsightMeta[] {
  const exclude = new Set(excludeSlugs);
  const pool = getAllInsights().filter((insight) => !exclude.has(insight.slug));
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
