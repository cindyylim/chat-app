import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/api/auth/callback',
        destination: '/auth/callback',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
