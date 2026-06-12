import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles build output automatically - no need for "standalone"
  // output: "standalone",  // REMOVED for Vercel compatibility

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Cloudinary image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
