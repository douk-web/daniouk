import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/daniouk',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
