/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // 1. Disable Next 15 build worker threads (Keeps RAM under 1GB)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // 2. Disable heavy Webpack memory passes
  webpack: (config) => {
    config.cache = false;
    config.parallelism = 1;
    return config;
  },

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;