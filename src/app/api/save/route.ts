/**
 * API для сохранения и загрузки игры
 * Использует Turso/libSQL напрямую
 *
 * POST /api/save - сохранить игру
 * GET /api/save - загрузить игру
 * DELETE /api/save - удалить сохранение (сбросить прогресс)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'
import { randomUUID } from 'crypto'

// Демо-игрок для разработки (без авторизации)
const DEMO_PLAYER_ID = 'demo-player'

// ================================
// GET - Загрузка сохранения
// ================================
export async function GET(request: NextRequest) {
  try {
    const db = await initDb()

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        details: 'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set',
        needsConfig: true,
      }, { status: 503 })
    }

    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID

    const result = await db.execute({
      sql: 'SELECT * FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    if (result.rows.length === 0) {
      const newSave = await createNewSave(db, playerId)
      console.log('[Save API] Created new save for:', playerId)
      return NextResponse.json({
        success: true,
        data: formatSaveData(newSave),
        isNew: true,
      })
    }

    console.log('[Save API] Loaded save for:', playerId)
    return NextResponse.json({
      success: true,
      data: formatSaveData(result.rows[0]),
      isNew: false,
    })
  } catch (error) {
    console.error('[Save API] Load error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: 'Failed to load save',
      details: errorMessage,
    }, { status: 500 })
  }
}

// ================================
// POST - Сохранение игры
// ================================
export async function POST(request: NextRequest) {
  try {
    const db = await initDb()

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        needsConfig: true,
      }, { status: 503 })
    }

    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID
    const body = await request.json()

    const validatedData = validateSaveData(body)

    // Проверяем, существует ли сохранение
    const existing = await db.execute({
      sql: 'SELECT id FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    const now = new Date().toISOString()

    if (existing.rows.length > 0) {
      // Обновляем
      await db.execute({
        sql: `UPDATE game_saves SET
          level = ?, experience = ?, fame = ?,
          resources = ?, statistics = ?, workers = ?, buildings = ?,
          maxWorkers = ?, activeCraft = ?, activeRefining = ?,
          weaponInventory = ?, unlockedRecipes = ?, recipeSources = ?,
          unlockedEnchantments = ?, guild = ?, knownAdventurers = ?,
          orders = ?, tutorial = ?, playTime = ?, saveVersion = ?, updatedAt = ?
        WHERE playerId = ?`,
        args: [
          validatedData.player.level,
          validatedData.player.experience,
          validatedData.player.fame,
          JSON.stringify(validatedData.resources),
          JSON.stringify(validatedData.statistics),
          JSON.stringify(validatedData.workers),
          JSON.stringify(validatedData.buildings),
          validatedData.maxWorkers,
          JSON.stringify(validatedData.activeCraft),
          JSON.stringify(validatedData.activeRefining),
          JSON.stringify(validatedData.weaponInventory),
          JSON.stringify(validatedData.unlockedRecipes),
          JSON.stringify(validatedData.recipeSources),
          JSON.stringify(validatedData.unlockedEnchantments),
          JSON.stringify(validatedData.guild),
          JSON.stringify(validatedData.knownAdventurers),
          JSON.stringify(validatedData.orders),
          JSON.stringify(validatedData.tutorial),
          validatedData.playTime,
          validatedData.saveVersion,
          now,
          playerId,
        ],
      })
    } else {
      // Создаём новое
      await db.execute({
        sql: `INSERT INTO game_saves (
          id, playerId, level, experience, fame,
          resources, statistics, workers, buildings, maxWorkers,
          activeCraft, activeRefining, weaponInventory, unlockedRecipes,
          recipeSources, unlockedEnchantments, guild, knownAdventurers,
          orders, tutorial, playTime, saveVersion, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          playerId,
          validatedData.player.level,
          validatedData.player.experience,
          validatedData.player.fame,
          JSON.stringify(validatedData.resources),
          JSON.stringify(validatedData.statistics),
          JSON.stringify(validatedData.workers),
          JSON.stringify(validatedData.buildings),
          validatedData.maxWorkers,
          JSON.stringify(validatedData.activeCraft),
          JSON.stringify(validatedData.activeRefining),
          JSON.stringify(validatedData.weaponInventory),
          JSON.stringify(validatedData.unlockedRecipes),
          JSON.stringify(validatedData.recipeSources),
          JSON.stringify(validatedData.unlockedEnchantments),
          JSON.stringify(validatedData.guild),
          JSON.stringify(validatedData.knownAdventurers),
          JSON.stringify(validatedData.orders),
          JSON.stringify(validatedData.tutorial),
          validatedData.playTime,
          validatedData.saveVersion,
          now,
        ],
      })
    }

    console.log(`[Save API] Saved for player ${playerId}`)

    return NextResponse.json({
      success: true,
      savedAt: now,
    })
  } catch (error) {
    console.error('[Save API] Save error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: 'Failed to save',
      details: errorMessage,
    }, { status: 500 })
  }
}

// ================================
// DELETE - Удаление сохранения (сброс)
// ================================
export async function DELETE(request: NextRequest) {
  try {
    const db = await initDb()

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        needsConfig: true,
      }, { status: 503 })
    }

    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID

    await db.execute({
      sql: 'DELETE FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    await db.execute({
      sql: 'DELETE FROM save_history WHERE gameSaveId = ?',
      args: [playerId],
    })

    console.log(`[Save API] Deleted save for player ${playerId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Save API] Delete error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: 'Failed to delete save',
      details: errorMessage,
    }, { status: 500 })
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function formatSaveData(row: Record<string, unknown>) {
  return {
    id: row.id,
    playerId: row.playerId,
    level: row.level,
    experience: row.experience,
    fame: row.fame,
    resources: safeJsonParse(row.resources as string, {}),
    statistics: safeJsonParse(row.statistics as string, {}),
    workers: safeJsonParse(row.workers as string, []),
    buildings: safeJsonParse(row.buildings as string, []),
    maxWorkers: row.maxWorkers,
    activeCraft: safeJsonParse(row.activeCraft as string, {}),
    activeRefining: safeJsonParse(row.activeRefining as string, {}),
    weaponInventory: safeJsonParse(row.weaponInventory as string, { weapons: [] }),
    unlockedRecipes: safeJsonParse(row.unlockedRecipes as string, {
      weaponRecipes: [],
      refiningRecipes: [],
    }),
    recipeSources: safeJsonParse(row.recipeSources as string, []),
    unlockedEnchantments: safeJsonParse(row.unlockedEnchantments as string, []),
    guild: safeJsonParse(row.guild as string, {}),
    knownAdventurers: safeJsonParse(row.knownAdventurers as string, []),
    orders: safeJsonParse(row.orders as string, {}),
    tutorial: safeJsonParse(row.tutorial as string, { isActive: true, currentStep: 0 }),
    playTime: row.playTime,
    saveVersion: row.saveVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function safeJsonParse(str: string | null | undefined, fallback: unknown) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

async function createNewSave(db: ReturnType<typeof getDb>, playerId: string) {
  const initialResources = {
    gold: 100,
    wood: 20,
    stone: 10,
    iron: 5,
    coal: 5,
    copper: 0,
    tin: 0,
    silver: 0,
    goldOre: 0,
    mithril: 0,
    soulEssence: 0,
    planks: 0,
    stoneBlocks: 0,
    copperIngot: 0,
    tinIngot: 0,
    bronzeIngot: 0,
    ironIngot: 0,
    steelIngot: 0,
    silverIngot: 0,
    goldIngot: 0,
    mithrilIngot: 0,
  }

  const initialStatistics = {
    totalCrafts: 0,
    totalRefines: 0,
    totalGoldEarned: 0,
    totalWorkersHired: 0,
    playTime: 0,
    weaponsSold: 0,
    recipesUnlocked: 6,
    ordersCompleted: 0,
    weaponsSacrificed: 0,
    enchantmentsApplied: 0,
  }

  const initialGuild = {
    level: 1,
    glory: 0,
    adventurers: [],
    activeExpeditions: [],
    recoveryQuests: [],
    history: [],
    adventurerRefreshAt: Date.now(),
  }

  const now = new Date().toISOString()
  const id = randomUUID()

  await db!.execute({
    sql: `INSERT INTO game_saves (
      id, playerId, level, experience, fame,
      resources, statistics, workers, buildings, maxWorkers,
      activeCraft, activeRefining, weaponInventory, unlockedRecipes,
      recipeSources, unlockedEnchantments, guild, knownAdventurers,
      orders, tutorial, playTime, saveVersion, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      playerId,
      1, 0, 0,
      JSON.stringify(initialResources),
      JSON.stringify(initialStatistics),
      '[]', '[]', 3,
      '{}', '{}',
      '{"weapons":[]}',
      '{"weaponRecipes":["sword_iron","dagger_iron","sword_bronze","dagger_bronze","sword_copper","dagger_copper"],"refiningRecipes":[]}',
      '[]', '[]',
      JSON.stringify(initialGuild),
      '[]',
      '{}',
      '{"isActive":true,"currentStep":0}',
      0, 2, now,
    ],
  })

  // Возвращаем созданный save
  const result = await db!.execute({
    sql: 'SELECT * FROM game_saves WHERE id = ?',
    args: [id],
  })

  return result.rows[0]
}

function validateSaveData(data: Record<string, unknown>) {
  const player = data.player as Record<string, unknown> | undefined

  return {
    player: {
      level: Math.max(1, Number(player?.level) || 1),
      experience: Math.max(0, Number(player?.experience) || 0),
      fame: Math.max(0, Number(player?.fame) || 0),
    },
    resources: (data.resources as Record<string, unknown>) || {},
    statistics: (data.statistics as Record<string, unknown>) || {},
    workers: (data.workers as unknown[]) || [],
    buildings: (data.buildings as unknown[]) || [],
    maxWorkers: Math.max(1, Number(data.maxWorkers) || 3),
    activeCraft: (data.activeCraft as Record<string, unknown>) || {},
    activeRefining: (data.activeRefining as Record<string, unknown>) || {},
    weaponInventory: (data.weaponInventory as Record<string, unknown>) || { weapons: [] },
    unlockedRecipes: (data.unlockedRecipes as Record<string, unknown>) || { weaponRecipes: [], refiningRecipes: [] },
    recipeSources: (data.recipeSources as unknown[]) || [],
    unlockedEnchantments: (data.unlockedEnchantments as unknown[]) || [],
    guild: (data.guild as Record<string, unknown>) || {},
    knownAdventurers: (data.knownAdventurers as unknown[]) || [],
    orders: (data.orders as Record<string, unknown>) || {},
    tutorial: (data.tutorial as Record<string, unknown>) || { isActive: true, currentStep: 0 },
    playTime: Math.max(0, Number(data.playTime) || 0),
    saveVersion: Number(data.saveVersion) || 2,
  }
}
