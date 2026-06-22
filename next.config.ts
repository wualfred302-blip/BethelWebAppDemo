import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
