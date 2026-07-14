/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@repo/design-system', '@pos/web-main'],
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'upload.wikimedia.org',
        protocol: 'https',
      },
      {
        hostname: 'i.pinimg.com',
        protocol: 'https',
      },
      {
        hostname: 'down-vn.img.susercontent.com',
        protocol: 'https',
      },
      {
        hostname: 'img.freepik.com',
        protocol: 'https',
      },
      {
        hostname: 'img.vietqr.io',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
