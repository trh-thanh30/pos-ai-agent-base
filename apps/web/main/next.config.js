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
  images: {
    remotePatterns: [
      {
        hostname: 'app.easyposs.vn',
        protocol: 'https',
      },
      {
        hostname: 'scontent.fhan2-4.fna.fbcdn.net',
        protocol: 'https',
      },
      {
        hostname: 'scontent.fhan15-2.fna.fbcdn.net',
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
  experimental: {
    optimizePackageImports: [
      '@repo/design-system',
      'lucide-react',
      '@tabler/icons-react',
      '@mantine/core',
      '@mantine/hooks',
    ],
  },
};

export default nextConfig;
