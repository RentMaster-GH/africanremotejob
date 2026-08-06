/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    webpackMemoryOptimizations: true,
    cpus: 1,
  },
}

export default nextConfig