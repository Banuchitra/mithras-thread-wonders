import type { NextConfig } from 'next';

// GitHub Pages serves the site under /<repo>; set NEXT_PUBLIC_BASE_PATH in CI. Empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Lets a phone on the same Wi-Fi open the dev site (scripts/dev-all.mjs sets this to the computer's LAN address).
  allowedDevOrigins: process.env.DEV_ORIGINS ? process.env.DEV_ORIGINS.split(',') : [],
};

export default config;
