/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;