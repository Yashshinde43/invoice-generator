import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tslib: path.resolve(__dirname, "node_modules/tslib"),
    };
    // jsPDF uses canvas optionally; exclude it on server to avoid SSR errors
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }
    return config;
  },
};

export default nextConfig;
