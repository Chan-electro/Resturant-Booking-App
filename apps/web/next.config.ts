import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Unsplash (used for food photos)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Removed experimental optimizeCss as it crashes Tailwind v4 with Turbopack

  // Ensure CDN/proxy caches distinguish between HTML and RSC requests.
  // Without this, a cached RSC flight response can be served to normal
  // browser navigations, resulting in raw "$Sreact.fragment" text.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value: "RSC, Next-Router-State-Tree, Next-Router-Prefetch",
          },
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
