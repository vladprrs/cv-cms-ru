import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER ? "standalone" : undefined,

  env: {
    // In Docker: set via ARG/ENV in Dockerfile (build-time)
    // In dev: derived from TURSO_ADMIN_DB_URL presence
    NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED || (process.env.TURSO_ADMIN_DB_URL ? 'true' : ''),
  },

  images: {
    unoptimized: true,
  },

  // Server Actions work on Edge with Turso
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Redirects for deprecated pages (UI Redesign v2)
  async redirects() {
    return [
      {
        source: '/jobs',
        destination: '/app',
        permanent: true,
      },
      {
        source: '/jobs/:id',
        destination: '/app',
        permanent: true,
      },
      {
        source: '/highlights',
        destination: '/app',
        permanent: true,
      },
      {
        source: '/export',
        destination: '/app',
        permanent: true,
      },
      {
        source: '/backup',
        destination: '/settings',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
