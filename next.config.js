/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // Disable Image Build Worker Overhead
  images: {
    unoptimized: true,
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