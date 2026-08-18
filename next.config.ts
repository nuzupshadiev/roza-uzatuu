import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Keeps the build rooted in this repository even inside a templates monorepo. */
  turbopack: { root: path.resolve(".") },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
