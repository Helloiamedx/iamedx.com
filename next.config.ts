import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* LAN preview (iPad etc.) — allow this Mac’s LAN host for /_next dev assets */
  allowedDevOrigins: ["192.168.2.40", "localhost", "127.0.0.1"],
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
  images: {
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
