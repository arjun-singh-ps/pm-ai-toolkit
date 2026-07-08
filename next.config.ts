import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // pdf-parse, xlsx, and mammoth must not be bundled by webpack — they use
  // Node.js-specific APIs (fs, Buffer, worker threads) and are only ever
  // called from server-side API routes. Marking them external tells Next.js
  // to require() them at runtime rather than bundle them.
  serverExternalPackages: ["pdf-parse", "xlsx", "mammoth"],
};

export default nextConfig;
