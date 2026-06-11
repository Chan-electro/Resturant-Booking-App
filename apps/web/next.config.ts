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
};

export default nextConfig;
