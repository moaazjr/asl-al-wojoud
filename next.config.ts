import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/author", permanent: true },
    ];
  },
};

export default nextConfig;
