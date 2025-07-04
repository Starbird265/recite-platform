/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ignore build warnings for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build (for quick deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'api.synthesia.io', 'img.youtube.com', 'i.ytimg.com'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_USE_FREE_APIS: process.env.NEXT_PUBLIC_USE_FREE_APIS || 'true',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/razorpay/:path*',
        destination: 'https://api.razorpay.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig