import type { NextConfig } from "next";
import os from "node:os";

/**
 * LAN phone/tablet preview: Next 16 blocks /_next from unknown hosts.
 * Auto-collect this Mac’s private IPv4s so Wi‑Fi DHCP changes don’t break media.
 * Also proxies CDN through same origin in `rewrites` so media works on LAN.
 */
function lanDevHosts(): string[] {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);
  for (const infos of Object.values(os.networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family !== "IPv4" || info.internal) continue;
      hosts.add(info.address);
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevHosts(),
  async redirects() {
    return [
      {
        source: "/client",
        destination: "/",
        permanent: true,
      },
      {
        source: "/clients",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        /* Dev/LAN: phone only talks to this Mac; Mac fetches R2 */
        source: "/__assets/:path*",
        destination: "https://assets.iamedx.com/:path*",
      },
    ];
  },
  images: {
    /* Dev: skip server-side image fetch — sandbox/DNS often can’t resolve CDN */
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.iamedx.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pentagram-production.imgix.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
