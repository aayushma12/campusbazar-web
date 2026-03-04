import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local backend
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
      // Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      // AWS S3
      { protocol: 'https', hostname: '*.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com', pathname: '/**' },
      // Placeholder
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
