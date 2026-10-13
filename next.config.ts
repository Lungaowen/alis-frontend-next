import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/alis-frontend-next",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
