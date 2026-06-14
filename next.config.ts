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
    "21.0.16.16",
    "preview-chat-115ba976-1f49-404a-a69d-0734743bb5f8.space-z.ai",
  ],

  // Ensure these packages are NOT bundled by Next.js - they need to run as-is in Node.js
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "cloudinary",
    "bcryptjs",
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
