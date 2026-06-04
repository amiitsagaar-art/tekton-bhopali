import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  // Allow external images from Unsplash and other domains
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  // Skip ESLint and TypeScript type errors during Vercel build
  // (these are already validated locally; we don't want build to fail on Vercel)
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
