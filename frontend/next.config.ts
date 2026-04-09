import type { NextConfig } from "next";
import path from "path";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://firebasestorage.googleapis.com https://*.googleapis.com https://*.google.com;
  font-src 'self' data:;
  connect-src 'self' https://firebasestorage.googleapis.com https://*.googleapis.com https://*.google.com;
  frame-ancestors 'none';
  form-action 'self';
`;

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
