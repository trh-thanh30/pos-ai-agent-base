/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@repo/design-system'],
  experimental: {
    externalDir: true,
    optimizePackageImports: [
      '@repo/design-system',
      'lucide-react',
      '@tabler/icons-react',
      '@mantine/core',
      '@mantine/hooks',
    ],
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
      {
        hostname: 'localhost',
        protocol: 'http',
        port: '19000',
      },
      {
        hostname: 'localhost',
        protocol: 'http',
        port: '3000',
      },
      {
        hostname: 'localhost',
        protocol: 'http',
        port: '',
      },
    ],
  },
};

export default nextConfig;
