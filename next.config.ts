import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/author", permanent: true },
      { source: "/contact", destination: "/ask", permanent: true },
    ];
  },
};

export default nextConfig;
