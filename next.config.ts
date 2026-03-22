import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Игнорируем проблемные файлы libsql на сервере
      config.resolve.alias = {
        ...config.resolve.alias,
        // Используем @libsql/client напрямую вместо вложенного в prisma
        '@libsql/client': require.resolve('@libsql/client'),
      }
    }
    return config
  },
  // Внешние зависимости для serverless
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
};

export default nextConfig;
