/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // 1. DISABLE WEBPACK RAM CACHING (Saves ~2GB of build memory)
  webpack: (config) => {
    config.cache = false;
    return config;
  },

  // 2. Disable heavy build-time checks
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;