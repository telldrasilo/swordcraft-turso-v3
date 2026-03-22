/**
 * Prisma Client для SwordCraft
 * Работает с Turso (libSQL) для облачного хранения данных
 * Автоматически создаёт таблицы при первом подключении
 */

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient, type Client } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  libsql: Client | undefined
  tablesInitialized: boolean
}

// SQL для создания таблиц
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS game_saves (
  id TEXT PRIMARY KEY,
  playerId TEXT UNIQUE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  fame INTEGER DEFAULT 0,
  resources TEXT DEFAULT '{}',
  statistics TEXT DEFAULT '{}',
  workers TEXT DEFAULT '[]',
  buildings TEXT DEFAULT '[]',
  maxWorkers INTEGER DEFAULT 3,
  activeCraft TEXT DEFAULT '{}',
  activeRefining TEXT DEFAULT '{}',
  weaponInventory TEXT DEFAULT '{"weapons":[]}',
  unlockedRecipes TEXT DEFAULT '{"weaponRecipes":["sword_iron","dagger_iron","sword_bronze","dagger_bronze","sword_copper","dagger_copper"],"refiningRecipes":[]}',
  recipeSources TEXT DEFAULT '[]',
  unlockedEnchantments TEXT DEFAULT '[]',
  guild TEXT DEFAULT '{}',
  knownAdventurers TEXT DEFAULT '[]',
  orders TEXT DEFAULT '{}',
  tutorial TEXT DEFAULT '{"isActive":true,"currentStep":0}',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  playTime INTEGER DEFAULT 0,
  saveVersion INTEGER DEFAULT 2
);

CREATE TABLE IF NOT EXISTS save_history (
  id TEXT PRIMARY KEY,
  gameSaveId TEXT,
  snapshot TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS save_history_gameSaveId_idx ON save_history(gameSaveId);
`

async function initializeTables(libsql: Client): Promise<void> {
  if (globalForPrisma.tablesInitialized) return

  try {
    console.log('[DB] Creating tables if not exist...')

    // Выполняем SQL по частям (libsql не поддерживает множественные statements)
    const statements = CREATE_TABLES_SQL.split(';').filter(s => s.trim())

    for (const statement of statements) {
      const sql = statement.trim()
      if (sql) {
        await libsql.execute(sql)
      }
    }

    globalForPrisma.tablesInitialized = true
    console.log('[DB] Tables initialized successfully')
  } catch (error) {
    console.error('[DB] Failed to initialize tables:', error)
    throw error
  }
}

function createPrismaClient() {
  // Получаем переменные окружения
  const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl) {
    console.warn('[DB] No database URL found')
    return null
  }

  // Проверяем, что URL выглядит как Turso/libSQL
  if (!databaseUrl.startsWith('libsql://') && !databaseUrl.startsWith('file:')) {
    console.warn('[DB] Invalid database URL format. Expected libsql:// or file:')
    return null
  }

  console.log('[DB] Connecting to:', databaseUrl.substring(0, 30) + '...')

  // Создаём libSQL клиент
  const libsql = createClient({
    url: databaseUrl,
    authToken: authToken || undefined,
  })

  // Сохраняем клиент для инициализации таблиц
  globalForPrisma.libsql = libsql

  // Создаём Prisma адаптер
  const adapter = new PrismaLibSQL(libsql)

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

  // Инициализируем таблицы асинхронно
  initializeTables(libsql).catch(err => {
    console.error('[DB] Table initialization failed:', err)
  })

  return prisma
}

// Экспортируем функцию для получения БД с проверкой
export function getDb(): PrismaClient | null {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Для обратной совместимости
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}

// Типы
export type { GameSave, SaveHistory } from '@prisma/client'
