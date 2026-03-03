/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for Docker builds
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },
}

export default nextConfig
