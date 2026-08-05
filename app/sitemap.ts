import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { getInsightSlugs } from "@/lib/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://iamedx.com";
  const staticRoutes = ["", "/projects", "/services", "/about", "/insights", "/contact"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: new Date(),
    })),
    ...getInsightSlugs().map((slug) => ({
      url: `${base}/insights/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
