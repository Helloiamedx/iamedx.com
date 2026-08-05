import fs from "fs";
import path from "path";
import { findInsightTag, insightTags } from "@/content/nav";

export type InsightMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  /** Canonical tag slugs from frontmatter, matched to Insights mega menu */
  tags: string[];
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

    data[key] = value;
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
      known.get(value.toLowerCase()) ?? known.get(slug) ?? (findInsightTag(slug) ? slug : null);
    if (match && !resolved.includes(match)) resolved.push(match);
  }
  return resolved;
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
