import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/game-vault',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
