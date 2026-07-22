import type { NextConfig } from 'next';
import { basePath } from './lib/basePath';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
