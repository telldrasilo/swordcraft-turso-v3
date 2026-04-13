import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Явный корень для Turbopack при вложенном `package-lock.json` в монорепо (dev без `--webpack`). */
  turbopack: {
    root: path.resolve(process.cwd()),
  },
}

export default nextConfig
