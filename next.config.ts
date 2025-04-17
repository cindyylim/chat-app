import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
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
