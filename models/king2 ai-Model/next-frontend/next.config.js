/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/king2',
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  optimizeFonts: false,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://alking-ai-king2-1.onrender.com',
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://alking-ai-king2-1.onrender.com';
    return [
      {
        source: '/api/py/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:8001/:path*'
          : `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
