/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "utfs.io",
        port: "",
        pathname: "/a/8jiyvthxbb/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**", // Match all paths under /u/
      },
    ],
  },
};

module.exports = nextConfig;
