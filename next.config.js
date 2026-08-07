/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // Disable Next 15 worker threads that cause heap overload
  experimental: {
    workerThreads: false,
    cpus: 1,
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