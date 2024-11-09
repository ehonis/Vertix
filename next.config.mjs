/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'utfs.io',
        port: '',
        pathname: '/a/8jiyvthxbb/**',
      },
    ],
  },
};

export default nextConfig;
