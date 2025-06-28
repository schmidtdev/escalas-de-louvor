import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()'
          }
        ],
      },
    ];
  },
  // Configuração específica para produção na Vercel
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
};

export default nextConfig;
