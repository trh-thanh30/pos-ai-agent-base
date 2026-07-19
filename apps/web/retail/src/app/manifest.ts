import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NexPOS - Retail',
    short_name: 'NexPOS',
    description: 'Phần mềm quản lý bán hàng giúp bạn quản lý khách hàng, hóa đơn, báo cáo, ...',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
