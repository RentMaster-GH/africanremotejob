/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable memory-heavy browser source maps in production
  productionBrowserSourceMaps: false,

  // Prevent Next.js 15 from spawning multiple RAM-heavy build workers
  experimental: {
    webpackBuildWorker: false,
  },

  // Skip ESLint and TypeScript checks during build to save memory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;