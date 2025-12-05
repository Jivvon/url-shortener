import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Fix Supabase types and remove this
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
