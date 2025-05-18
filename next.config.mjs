import bundleAnalyzer from '@next/bundle-analyzer';
import mdx from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin();

const withMDX = mdx({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [];
  },
  env: {
    NEXT_PUBLIC_PROJECT_ID: process.env.PROJECT_ID,
  },
  publicRuntimeConfig: {
    // ... existing code ...
  },
  experimental: {
    mdxRs: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  poweredByHeader: false,
  compress: true,
};

// Make sure experimental mdx flag is enabled
const configWithMDX = {
  ...nextConfig,
  experimental: {
    mdxRs: true,
    staleTimes: nextConfig.experimental.staleTimes,
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX(configWithMDX)));
