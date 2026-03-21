const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 runs `next build` with Turbopack by default. The previous webpack
  // `resolve.alias` for `@` must live under `turbopack.resolveAlias` so the
  // bundler can resolve `@/…` imports (see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname),
    },
  },
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
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
