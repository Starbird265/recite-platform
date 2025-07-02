/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'api.synthesia.io'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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