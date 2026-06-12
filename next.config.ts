import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles build output automatically - no need for "standalone"
  // output: "standalone",  // REMOVED for Vercel compatibility

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Allow cross-origin requests from preview panel
  allowedDevOrigins: [
    ".space-z.ai",
  ],

  // Ensure these packages are NOT bundled by Next.js - they need to run as-is in Node.js
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
  ],

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
