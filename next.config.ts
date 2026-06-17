import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles build output automatically - no need for "standalone"
  // output: "standalone",  // REMOVED for Vercel compatibility

  reactStrictMode: true,

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

  // Turbopack: treat non-JS files as raw text to prevent
  // "Unknown module type" / "Parsing ecmascript failed" errors when Turbopack
  // scans node_modules (e.g. @libsql/client/README.md, @libsql/hrana-client/LICENSE).
  // This happens because libsql uses dynamic `require(`@libsql/${target}`)` for
  // native bindings, so Turbopack eagerly scans ALL files in those packages.
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      'LICENSE': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      'LICENSE.*': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
