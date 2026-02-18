const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@geoforce/engine"],
  
  // Package optimizasyonları - tree-shaking ve bundle küçültme
  experimental: {
    optimizePackageImports: [
      "recharts",
      "lucide-react",
      "@geoforce/engine",
    ],
  },
  
  // Görsel optimizasyonu
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Production'da compression
  compress: true,
  
  // Compiler optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Strict mode
  reactStrictMode: true,
  
  // Output optimizasyonu
  poweredByHeader: false,
};

module.exports = withNextIntl(nextConfig);
