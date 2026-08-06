import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fs", "path", "os"],
  middlewareClientMaxBodySize: "50mb",
};

export default nextConfig;
