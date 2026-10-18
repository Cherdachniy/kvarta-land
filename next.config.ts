import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Миграции читаются с диска при первом подключении к базе — кладём их в функцию
  outputFileTracingIncludes: {
    "/api/lead": ["./db/migrations/*.sql"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
