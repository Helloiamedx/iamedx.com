import type { NextConfig } from "next";

/**
 * LAN phone/tablet preview: Next 16 blocks /_next from unknown hosts.
 * Keep this Mac’s current Wi‑Fi IP here (see `ipconfig getifaddr en0`).
 * Also proxies CDN through same origin in `rewrites` so media works on LAN.
 */
const LAN_DEV_HOSTS = [
  "192.168.2.44",
  "192.168.2.40",
  "localhost",
  "127.0.0.1",
];

const nextConfig: NextConfig = {
  allowedDevOrigins: LAN_DEV_HOSTS,
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
