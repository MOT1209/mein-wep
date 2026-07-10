/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served under /king2 on the main site (rashid-wep.vercel.app/king2) via a
  // Vercel rewrite. basePath auto-prefixes pages, API routes, _next assets,
  // next/link, next/image and NextAuth. (Raw fetch('/api/...') calls are NOT
  // auto-prefixed and are updated to '/king2/api/...' in the client code.)
  basePath: '/king2',
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  optimizeFonts: false,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:8001/:path*'
          : 'https://alking-ai-king2-1.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
