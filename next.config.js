/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

