import type { NextConfig } from "next";

/**
 * NextAuth v4 (`node_modules/next-auth/utils/detect-origin.js`): если нет `VERCEL`
 * и нет `AUTH_TRUST_HOST`, в качестве origin берётся только `NEXTAUTH_URL`.
 * Без `.env` колбэки/CSRF ломаются → редирект на `/api/auth/error`.
 * В development задаём разумные значения по умолчанию (см. `.env.example`).
 */
if (process.env.NODE_ENV !== "production") {
  /**
   * URL для NextAuth: в `npm run dev` скрипт next-dev.cjs выставляет NEXTAUTH_URL
   * с фактическим портом (3000 или fallback 3001…). Здесь — только запасной дефолт.
   */
  const devPort = process.env.PORT || "3000";
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = `http://localhost:${devPort}`;
  }
  if (process.env.AUTH_TRUST_HOST !== "false") {
    process.env.AUTH_TRUST_HOST = "true";
  }
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  /**
   * Меньше отдельных чанков на каждую иконку lucide — снижает шанс «битых» ссылок на chunk
   * после смены порта/stale `.next` (см. `scripts/next-dev.cjs`, `npm run dev:clean`).
   */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
