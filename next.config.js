/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // FORCE NEXT.JS 15 TO USE 1 CPU WORKER (Stops memory multiplication)
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
  },

  // Disable Webpack RAM Caching
  webpack: (config) => {
    config.cache = false;
    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;