import type { NextConfig } from "next";
import withPWA from "next-pwa";

const applyPWA = withPWA as unknown as (
  options: Parameters<typeof withPWA>[0]
) => (config: NextConfig) => NextConfig;

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "big-surprise-ab176c9ad8.media.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.media.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "big-surprise-ab176c9ad8.strapiapp.com",
        pathname: "/**",
      },
    ],
  },
  // Silence Next 16 Turbopack/webpack config mismatch.
  turbopack: {},
};

export default applyPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
