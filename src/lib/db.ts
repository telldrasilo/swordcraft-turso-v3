/**
 * Turso/libSQL клиент для SwordCraft
 * Прямое подключение без Prisma adapter
 */

import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as {
  turso: Client | undefined
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

function createDbClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    console.warn('[DB] TURSO_DATABASE_URL not found')
    return null
  }

  console.log('[DB] Connecting to Turso:', url.substring(0, 30) + '...')

  return createClient({
    url,
    authToken: authToken || undefined,
  })
}

async function initializeTables(db: Client): Promise<void> {
  if (globalForDb.tablesInitialized) return

  try {
    console.log('[DB] Creating tables if not exist...')

    const statements = CREATE_TABLES_SQL.split(';').filter(s => s.trim())

    for (const statement of statements) {
      const sql = statement.trim()
      if (sql) {
        await db.execute(sql)
      }
    }

    globalForDb.tablesInitialized = true
    console.log('[DB] Tables initialized successfully')
  } catch (error) {
    console.error('[DB] Failed to initialize tables:', error)
    throw error
  }
}

export function getDb(): Client | null {
  if (!globalForDb.turso) {
    globalForDb.turso = createDbClient()
  }
  return globalForDb.turso
}

// Инициализация таблиц при первом обращении
export async function initDb(): Promise<Client | null> {
  const db = getDb()
  if (db) {
    await initializeTables(db)
  }
  return db
}

export { createDbClient }
export type { Client }
