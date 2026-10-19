import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ativa compressao Gzip/Brotli para todas as respostas
  compress: true,

  // Remove cabecalho X-Powered-By para seguranca e reducao de overhead
  poweredByHeader: false,

  // Otimizacao de imagens de alta performance (WebP e AVIF)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 dias de cache para imagens
  },

  // Tree-shaking e reducao de bundle para pacotes pesados
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'zustand',
    ],
  },

  // Headers de cache estatico para acelerar navegacao
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
