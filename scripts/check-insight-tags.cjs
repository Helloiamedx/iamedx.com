#!/usr/bin/env node
/**
 * Validates Insight tags across catalog (menu + filter) and MDX articles.
 *
 * Source of truth for menu/filter: content/insight-tags.json
 * Articles: content/insights/*.mdx frontmatter `tags`
 *
 * Usage: npm run check:insight-tags
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "content/insight-tags.json");
const insightsDir = path.join(root, "content/insights");

function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseFrontmatterTags(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];
  const front = match[1];
  const lines = front.split("\n");
  const tags = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (key !== "tags") continue;

    let value = line.slice(idx + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      tags.push(
        ...value
          .slice(1, -1)
          .split(",")
          .map((part) => part.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean),
      );
    } else if (value) {
      tags.push(
        ...value
          .split(",")
          .map((part) => part.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean),
      );
    } else {
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        i += 1;
        tags.push(lines[i].replace(/^\s*-\s+/, "").trim());
      }
    }
  }

  return tags;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const catalogLabels = catalog.groups.flatMap((group) => group.tags);
  const catalogBySlug = new Map(
    catalogLabels.map((label) => [slugify(label), label]),
  );
  const catalogByLabel = new Map(
    catalogLabels.map((label) => [label.toLowerCase(), label]),
  );

  const files = fs.existsSync(insightsDir)
    ? fs.readdirSync(insightsDir).filter((f) => f.endsWith(".mdx"))
    : [];

  const usedSlugs = new Set();
  const unknown = [];
  const untagged = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(insightsDir, file), "utf8");
    const rawTags = parseFrontmatterTags(raw);
    const resolved = [];

    for (const value of rawTags) {
      const key = slugify(value);
      const match =
        catalogByLabel.get(value.toLowerCase()) ??
        catalogBySlug.get(key) ??
        null;
      if (match) {
        resolved.push(match);
        usedSlugs.add(slugify(match));
      } else {
        unknown.push({ article: slug, tag: value });
      }
    }

    if (resolved.length === 0) {
      untagged.push({
        article: slug,
        rawTags,
        reason:
          rawTags.length === 0
            ? "frontmatter has no tags"
            : "all tags missing from catalog (deleted or renamed?)",
      });
    }
  }

  const unused = catalogLabels.filter(
    (label) => !usedSlugs.has(slugify(label)),
  );

  let failed = false;

  console.log("Insight tag check");
  console.log(`  Catalog: ${catalogLabels.length} tags in content/insight-tags.json`);
  console.log(`  Articles: ${files.length} in content/insights/`);
  console.log("");

  if (unknown.length > 0) {
    failed = true;
    console.log("✗ Unknown tags in articles (not in menu/filter catalog):");
    for (const item of unknown) {
      console.log(`    - ${item.article}: "${item.tag}"`);
    }
    console.log("  → Add them to content/insight-tags.json, or fix the MDX spelling.");
    console.log("");
  }

  if (untagged.length > 0) {
    failed = true;
    console.log("✗ Articles with no valid Insight tag:");
    for (const item of untagged) {
      const raw =
        item.rawTags.length > 0 ? ` (had: ${item.rawTags.join(", ")})` : "";
      console.log(`    - ${item.article}: ${item.reason}${raw}`);
    }
    console.log(
      "  → Remap those articles to an existing tag, or restore the deleted tag in the catalog.",
    );
    console.log("");
  }

  if (unused.length > 0) {
    console.log("⚠ Catalog tags unused by any article (still in menu/filter):");
    for (const label of unused) {
      console.log(`    - ${label}`);
    }
    console.log(
      "  → OK if intentional; remove from content/insight-tags.json if the tag is retired.",
    );
    console.log("");
  }

  if (!failed && unused.length === 0) {
    console.log("✓ Catalog, menu/filter, and articles are in sync.");
  } else if (!failed) {
    console.log("✓ No blocking errors (see unused-tag warnings above).");
  }

  process.exit(failed ? 1 : 0);
}

main();
