import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Trace files from the monorepo root (pnpm workspace).
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
