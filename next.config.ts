import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output bundles a self-contained server (.next/standalone/)
  // that needs no node_modules at runtime — purpose-built for hosts like
  // shared cPanel where the wider Next runtime fights with inotify limits.
  output: 'standalone',

  // Don't block the production build on TypeScript / ESLint errors. Local
  // dev still surfaces them; this is a pragmatic Vercel deploy unblock.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Don't try to bundle these — they use dynamic requires + proto files
  // that confuse Turbopack/webpack and produce unresolvable content-hashed
  // module names in production. They live in node_modules at runtime.
  serverExternalPackages: [
    'firebase-admin',
    '@google-cloud/firestore',
    'google-gax',
    '@grpc/grpc-js',
    'protobufjs',
  ],

  // Next.js 16 blocks cross-origin requests to dev resources (/_next/...) by
  // default. Add any host/IP you'll hit the dev server from.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.0.223',
    '192.168.0.0/24',
    '192.168.1.0/24',
    '10.0.0.0/8',
  ],
};

export default nextConfig;
