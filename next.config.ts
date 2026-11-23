import type { NextConfig } from 'next';

// GitHub Pages serves the site under /<repo>; set NEXT_PUBLIC_BASE_PATH in CI. Empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // No Next.js developer badge: it sat on top of the Save button when testing on a phone.
  devIndicators: false,
  // Lets a phone on the same Wi-Fi open the dev site (scripts/dev-all.mjs sets this to the computer's LAN address).
  allowedDevOrigins: process.env.DEV_ORIGINS ? process.env.DEV_ORIGINS.split(',') : [],
  // Development only: the site forwards /api/* to the local API on the same Mac, so the browser (Mac or phone)
  // only ever talks to the site — no cross-origin setup, and the API needn't be reachable on the network.
  ...(process.env.NODE_ENV === 'development'
    ? { rewrites: async () => [{ source: '/api/:path*', destination: 'http://127.0.0.1:8787/api/:path*' }] }
    : {}),
};

export default config;
