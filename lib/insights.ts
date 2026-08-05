import fs from "fs";
import path from "path";

export type InsightMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type Insight = InsightMeta & {
  content: string;
};

const insightsDirectory = path.join(process.cwd(), "content/insights");

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  }

  return { data, body: match[2].trim() };
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
  const { data, body } = parseFrontmatter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
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
