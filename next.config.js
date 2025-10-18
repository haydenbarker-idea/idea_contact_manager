/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static optimization - run as dynamic server
  output: 'standalone',
  // Skip build errors for now to get standalone working
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable static page generation
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig

