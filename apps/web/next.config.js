/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/round-app',
  assetPrefix: '/round-app',
  reactStrictMode: true,
  transpilePackages: ['@round/shared'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  async redirects() {
    return []
  },
}
module.exports = nextConfig
