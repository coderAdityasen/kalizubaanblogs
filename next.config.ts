import type { NextConfig } from "next";
import { getSupabaseStorageHost, SUPABASE_PUBLIC_STORAGE_PATH, UNSPLASH_HOST } from "./lib/images";

const supabaseHost = getSupabaseStorageHost();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Uploaded covers get unique, timestamped file names, so an optimized copy
    // never goes stale. Supabase serves originals with `no-cache`, so without
    // this the optimizer would fall back to its 4-hour default.
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: `${SUPABASE_PUBLIC_STORAGE_PATH}**`,
              search: "",
            },
          ]
        : []),
      { protocol: "https", hostname: UNSPLASH_HOST, pathname: "/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
