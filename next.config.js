/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    webpackMemoryOptimizations: true,
  },
}

module.exports = nextConfig