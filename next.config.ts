import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@google-analytics/data",
    "google-gax",
    "proto3-json-serializer",
    "protobufjs",
    "long",
  ],
  async redirects() {
    return [
      { source: "/about", destination: "/author", permanent: true },
    ];
  },
};

export default nextConfig;
