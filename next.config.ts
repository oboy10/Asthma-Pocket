import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot =
  typeof __dirname !== "undefined"
    ? path.resolve(__dirname)
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  webpack: (config) => {
    config.context = projectRoot;
    config.resolve = config.resolve ?? {};
    config.resolve.modules = [
      path.join(projectRoot, "node_modules"),
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : []),
    ];
    config.resolveLoader = config.resolveLoader ?? {};
    config.resolveLoader.modules = [
      path.join(projectRoot, "node_modules"),
      ...(Array.isArray(config.resolveLoader.modules) ? config.resolveLoader.modules : []),
    ];
    return config;
  },
};

export default nextConfig;
