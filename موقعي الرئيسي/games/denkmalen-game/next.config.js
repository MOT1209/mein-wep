/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/denkmalen',
  images: {
    // Static export - keep unoptimized but configure for future
    unoptimized: true,
    // Responsive image configuration (for when unoptimized is disabled)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow these remote patterns if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rashid-wep.vercel.app',
      },
    ],
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Performance optimizations
  experimental: {
    // Optimize imports for heavy packages to reduce bundle size
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
    ],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig
