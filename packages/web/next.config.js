/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@perseo/shared'],
  experimental: {
    outputFileTracingIncludes: {
      '/api': ['./node_modules/**/*.json'],
    },
  },
};

module.exports = nextConfig;