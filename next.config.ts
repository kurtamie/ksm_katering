import type { NextConfig } from "next";
import withPWA from "next-pwa";

const applyPWA = withPWA as unknown as (
  options: Parameters<typeof withPWA>[0]
) => (config: NextConfig) => NextConfig;

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
