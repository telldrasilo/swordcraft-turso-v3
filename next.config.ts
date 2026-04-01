import type { NextConfig } from "next";

/**
 * NextAuth v4 (`node_modules/next-auth/utils/detect-origin.js`): если нет `VERCEL`
 * и нет `AUTH_TRUST_HOST`, в качестве origin берётся только `NEXTAUTH_URL`.
 * Без `.env` колбэки/CSRF ломаются → редирект на `/api/auth/error`.
 * В development задаём разумные значения по умолчанию (см. `.env.example`).
 */
if (process.env.NODE_ENV !== "production") {
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
  if (process.env.AUTH_TRUST_HOST !== "false") {
    process.env.AUTH_TRUST_HOST = "true";
  }
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
};

export default nextConfig;
