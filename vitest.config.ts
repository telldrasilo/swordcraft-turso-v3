import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/node_modules/**',
        'src/app/**',
        'src/components/**',
      ],
      thresholds: {
        // Пороги по include=src/lib/**/*.ts. При расширении coverage.include пересчитать метрики и обновить значения ниже.
        // Пороги по include=src/lib/**/*.ts (в отчёт входят непокрытые файлы lib → агрегат ~36% lines); с запасом
        lines: 34,
        statements: 33,
        branches: 18,
        functions: 29,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
