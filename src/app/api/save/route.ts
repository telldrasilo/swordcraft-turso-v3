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
import {
  SAVE_PAYLOAD_MAX_BYTES,
  saveRequestBodySchema,
} from '@/lib/save-payload-schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { isSaveAuthEnforced } from '@/lib/save-auth'
import { isCloudSaveEnabled } from '@/lib/cloud-save-feature'
import {
  defaultCraftV2Persisted,
  mergeCraftV2PersistedFromSave,
  normalizeActiveCraftColumn,
} from '@/lib/save-craft-normalize'
import {
  normalizeRepairBenchWeaponIdFromSave,
  normalizeRepairTechniqueStageRunFromSave,
} from '@/lib/normalize-repair-bench-from-save'
import { normalizeForgottenForgePersistFromSave } from '@/lib/normalize-forgotten-forge-persist'

// Демо-игрок для разработки (если не ENFORCE_SAVE_AUTH и не production)
const DEMO_PLAYER_ID = 'demo-player'

function cloudSaveDisabledResponse() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Cloud save is disabled (set NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true after configuring Turso)',
      cloudSaveDisabled: true,
    },
    { status: 503 }
  )
}

async function resolvePlayerId(request: NextRequest): Promise<string> {
  if (isSaveAuthEnforced()) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 })
    }
    return session.user.id
  }
  return request.headers.get('x-player-id') || DEMO_PLAYER_ID
}

// ================================
// GET - Загрузка сохранения
// ================================
export async function GET(request: NextRequest) {
  if (!isCloudSaveEnabled()) return cloudSaveDisabledResponse()
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

    let playerId: string
    try {
      playerId = await resolvePlayerId(request)
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500
      if (status === 401) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      throw e
    }

    const result = await db.execute({
      sql: 'SELECT * FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    if (result.rows.length === 0) {
      const newSave = await createNewSave(db, playerId)
      if (!newSave) {
        return NextResponse.json(
          { success: false, error: 'Failed to create save' },
          { status: 500 }
        )
      }
      console.warn('[Save API] Created new save for:', playerId)
      return NextResponse.json({
        success: true,
        data: formatSaveData(newSave as Record<string, unknown>),
        isNew: true,
      })
    }

    console.warn('[Save API] Loaded save for:', playerId)
    return NextResponse.json({
      success: true,
      data: formatSaveData(result.rows[0] as Record<string, unknown>),
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
  if (!isCloudSaveEnabled()) return cloudSaveDisabledResponse()
  try {
    const db = await initDb()

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        needsConfig: true,
      }, { status: 503 })
    }

    let playerId: string
    try {
      playerId = await resolvePlayerId(request)
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500
      if (status === 401) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      throw e
    }

    const contentLength = request.headers.get('content-length')
    if (contentLength != null && Number(contentLength) > SAVE_PAYLOAD_MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 }
      )
    }

    const text = await request.text()
    if (text.length > SAVE_PAYLOAD_MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 }
      )
    }

    let raw: unknown
    try {
      raw = JSON.parse(text) as unknown
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    const zodResult = saveRequestBodySchema.safeParse(raw)
    if (!zodResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid save payload',
          details: zodResult.error.issues,
        },
        { status: 400 }
      )
    }

    const validatedData = validateSaveData(zodResult.data as Record<string, unknown>)

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
          unlockedEnchantments = ?, unlockedMaterialProcessingTechniqueIds = ?, unlockedRepairTechniqueIds = ?, unlockedReforgeTechniqueIds = ?, guild = ?, knownAdventurers = ?,
          orders = ?, tutorial = ?, materialKnowledge = ?,
          materialStudySessions = ?, gameMessages = ?,
          materialStash = ?, craftV2Persisted = ?,
          playTime = ?, saveVersion = ?, repairBenchWeaponId = ?, repairTechniqueStageRun = ?,
          forgottenForgePersist = ?, updatedAt = ?
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
          JSON.stringify(validatedData.unlockedMaterialProcessingTechniqueIds),
          JSON.stringify(validatedData.unlockedRepairTechniqueIds),
          JSON.stringify(validatedData.unlockedReforgeTechniqueIds),
          JSON.stringify(validatedData.guild),
          JSON.stringify(validatedData.knownAdventurers),
          JSON.stringify(validatedData.orders),
          JSON.stringify(validatedData.tutorial),
          JSON.stringify(validatedData.materialKnowledge),
          JSON.stringify(validatedData.materialStudySessions),
          JSON.stringify(validatedData.gameMessages),
          JSON.stringify(validatedData.materialStash),
          JSON.stringify(validatedData.craftV2Persisted),
          validatedData.playTime,
          validatedData.saveVersion,
          validatedData.repairBenchWeaponId,
          validatedData.repairTechniqueStageRun == null
            ? null
            : JSON.stringify(validatedData.repairTechniqueStageRun),
          JSON.stringify(validatedData.forgottenForgePersist),
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
          recipeSources, unlockedEnchantments, unlockedMaterialProcessingTechniqueIds, unlockedRepairTechniqueIds, unlockedReforgeTechniqueIds, guild, knownAdventurers,
          orders, tutorial, materialKnowledge,
          materialStudySessions, gameMessages,
          materialStash, craftV2Persisted, playTime, saveVersion, repairBenchWeaponId, repairTechniqueStageRun,
          forgottenForgePersist, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
     
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
          JSON.stringify(validatedData.unlockedMaterialProcessingTechniqueIds),
          JSON.stringify(validatedData.unlockedRepairTechniqueIds),
          JSON.stringify(validatedData.unlockedReforgeTechniqueIds),
          JSON.stringify(validatedData.guild),
          JSON.stringify(validatedData.knownAdventurers),
          JSON.stringify(validatedData.orders),
          JSON.stringify(validatedData.tutorial),
          JSON.stringify(validatedData.materialKnowledge),
          JSON.stringify(validatedData.materialStudySessions),
          JSON.stringify(validatedData.gameMessages),
          JSON.stringify(validatedData.materialStash),
          JSON.stringify(validatedData.craftV2Persisted),
          validatedData.playTime,
          validatedData.saveVersion,
          validatedData.repairBenchWeaponId,
          validatedData.repairTechniqueStageRun == null
            ? null
            : JSON.stringify(validatedData.repairTechniqueStageRun),
          JSON.stringify(validatedData.forgottenForgePersist),
          now,
        ],
      })
    }

    console.warn(`[Save API] Saved for player ${playerId}`)

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
  if (!isCloudSaveEnabled()) return cloudSaveDisabledResponse()
  try {
    const db = await initDb()

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        needsConfig: true,
      }, { status: 503 })
    }

    let playerId: string
    try {
      playerId = await resolvePlayerId(request)
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500
      if (status === 401) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      throw e
    }

    const row = await db.execute({
      sql: 'SELECT id FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    const gameSaveId = row.rows[0]?.['id'] as string | undefined
    if (gameSaveId) {
      await db.execute({
        sql: 'DELETE FROM save_history WHERE gameSaveId = ?',
        args: [gameSaveId],
      })
    }

    await db.execute({
      sql: 'DELETE FROM game_saves WHERE playerId = ?',
      args: [playerId],
    })

    console.warn(`[Save API] Deleted save for player ${playerId}`)

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
  const weaponInventory = safeJsonParse(row['weaponInventory'] as string, {
    weapons: [],
  }) as { weapons?: { id?: string }[] }
  const weapons = weaponInventory.weapons ?? []
  const repairBenchWeaponId = normalizeRepairBenchWeaponIdFromSave(
    row['repairBenchWeaponId'],
    weapons
  )
  const rawRun = row['repairTechniqueStageRun']
  const parsedRun =
    rawRun != null && rawRun !== ''
      ? typeof rawRun === 'string'
        ? safeJsonParse(rawRun as string, null)
        : rawRun
      : null
  const repairTechniqueStageRun = normalizeRepairTechniqueStageRunFromSave(
    parsedRun,
    repairBenchWeaponId,
    weapons
  )

  return {
    id: row['id'],
    playerId: row['playerId'],
    level: row['level'],
    experience: row['experience'],
    fame: row['fame'],
    resources: safeJsonParse(row['resources'] as string, {}),
    statistics: safeJsonParse(row['statistics'] as string, {}),
    workers: safeJsonParse(row['workers'] as string, []),
    buildings: safeJsonParse(row['buildings'] as string, []),
    maxWorkers: row['maxWorkers'],
    activeCraft: safeJsonParse(row['activeCraft'] as string, {}),
    activeRefining: safeJsonParse(row['activeRefining'] as string, {}),
    weaponInventory,
    unlockedRecipes: safeJsonParse(row['unlockedRecipes'] as string, {
      weaponRecipes: [],
      refiningRecipes: [],
    }),
    recipeSources: safeJsonParse(row['recipeSources'] as string, []),
    unlockedEnchantments: safeJsonParse(row['unlockedEnchantments'] as string, []),
    unlockedMaterialProcessingTechniqueIds: safeJsonParse(
      row['unlockedMaterialProcessingTechniqueIds'] as string,
      []
    ),
    unlockedRepairTechniqueIds: safeJsonParse(row['unlockedRepairTechniqueIds'] as string, []),
    unlockedReforgeTechniqueIds: safeJsonParse(row['unlockedReforgeTechniqueIds'] as string, []),
    guild: safeJsonParse(row['guild'] as string, {}),
    knownAdventurers: safeJsonParse(row['knownAdventurers'] as string, []),
    orders: safeJsonParse(row['orders'] as string, {}),
    tutorial: safeJsonParse(row['tutorial'] as string, { isActive: true, currentStep: 0 }),
    materialKnowledge: safeJsonParse(row['materialKnowledge'] as string, {}),
    materialStudySessions: safeJsonParse(row['materialStudySessions'] as string, []),
    gameMessages: safeJsonParse(row['gameMessages'] as string, []),
    materialStash: safeJsonParse(row['materialStash'] as string, {}),
    craftV2Persisted: safeJsonParse(row['craftV2Persisted'] as string, defaultCraftV2Persisted),
    playTime: row['playTime'],
    saveVersion: row['saveVersion'],
    repairBenchWeaponId,
    repairTechniqueStageRun,
    forgottenForgePersist: normalizeForgottenForgePersistFromSave(
      (() => {
        const raw = row['forgottenForgePersist']
        if (raw == null || raw === '') return null
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw) as unknown
          } catch {
            return null
          }
        }
        return raw
      })()
    ),
    createdAt: row['createdAt'],
    updatedAt: row['updatedAt'],
    serverTimestamp: row['updatedAt'],
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
    totalExpeditions: 0,
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
      recipeSources, unlockedEnchantments, unlockedMaterialProcessingTechniqueIds, unlockedRepairTechniqueIds, unlockedReforgeTechniqueIds, guild, knownAdventurers,
      orders, tutorial, materialKnowledge,
      materialStudySessions, gameMessages,
      materialStash, craftV2Persisted, playTime, saveVersion, repairBenchWeaponId, repairTechniqueStageRun,
      forgottenForgePersist, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      '[]', '[]', '[]', '[]', '[]',
      JSON.stringify(initialGuild),
      '[]',
      '{}',
      '{"isActive":true,"currentStep":0}',
      '{}',
      '[]',
      '[]',
      '{}',
      JSON.stringify(defaultCraftV2Persisted),
      0, 2, null, null,
      null,
      now,
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
  const player = data['player'] as Record<string, unknown> | undefined

  const weaponInventoryRaw =
    (data['weaponInventory'] as { weapons?: { id?: string }[] } | undefined) || { weapons: [] }
  const weapons = weaponInventoryRaw.weapons ?? []

  const repairBenchWeaponId = normalizeRepairBenchWeaponIdFromSave(
    data['repairBenchWeaponId'],
    weapons
  )
  const repairTechniqueStageRun = normalizeRepairTechniqueStageRunFromSave(
    data['repairTechniqueStageRun'],
    repairBenchWeaponId,
    weapons
  )

  const craftV2Persisted = mergeCraftV2PersistedFromSave(
    data['craftV2Persisted'],
    data['activeCraft']
  )
  const activeCraftNormalized = normalizeActiveCraftColumn(data['activeCraft'], craftV2Persisted)

  return {
    player: {
      level: Math.max(1, Number(player?.['level']) || 1),
      experience: Math.max(0, Number(player?.['experience']) || 0),
      fame: Math.max(0, Number(player?.['fame']) || 0),
    },
    resources: (data['resources'] as Record<string, unknown>) || {},
    statistics: (data['statistics'] as Record<string, unknown>) || {},
    workers: (data['workers'] as unknown[]) || [],
    buildings: (data['buildings'] as unknown[]) || [],
    maxWorkers: Math.max(1, Number(data['maxWorkers']) || 3),
    activeCraft: activeCraftNormalized,
    craftV2Persisted,
    activeRefining: (data['activeRefining'] as Record<string, unknown>) || {},
    weaponInventory: (weaponInventoryRaw as Record<string, unknown>) || { weapons: [] },
    repairBenchWeaponId,
    repairTechniqueStageRun,
    unlockedRecipes: (data['unlockedRecipes'] as Record<string, unknown>) || { weaponRecipes: [], refiningRecipes: [] },
    recipeSources: (data['recipeSources'] as unknown[]) || [],
    unlockedEnchantments: (data['unlockedEnchantments'] as unknown[]) || [],
    unlockedMaterialProcessingTechniqueIds: Array.isArray(
      data['unlockedMaterialProcessingTechniqueIds']
    )
      ? (data['unlockedMaterialProcessingTechniqueIds'] as string[])
      : [],
    unlockedRepairTechniqueIds: Array.isArray(data['unlockedRepairTechniqueIds'])
      ? (data['unlockedRepairTechniqueIds'] as string[])
      : [],
    unlockedReforgeTechniqueIds: Array.isArray(data['unlockedReforgeTechniqueIds'])
      ? (data['unlockedReforgeTechniqueIds'] as string[])
      : [],
    guild: (data['guild'] as Record<string, unknown>) || {},
    knownAdventurers: (data['knownAdventurers'] as unknown[]) || [],
    orders: (data['orders'] as Record<string, unknown>) || {},
    tutorial: (data['tutorial'] as Record<string, unknown>) || { isActive: true, currentStep: 0 },
    materialKnowledge: (data['materialKnowledge'] as Record<string, unknown>) || {},
    materialStudySessions: Array.isArray(data['materialStudySessions'])
      ? data['materialStudySessions']
      : [],
    gameMessages: Array.isArray(data['gameMessages']) ? data['gameMessages'] : [],
    materialStash: normalizeMaterialStashPayload(data['materialStash']),
    playTime: Math.max(0, Number(data['playTime']) || 0),
    saveVersion: Number(data['saveVersion']) || 2,
    forgottenForgePersist: normalizeForgottenForgePersistFromSave(data['forgottenForgePersist']),
  }
}

function normalizeMaterialStashPayload(raw: unknown): Record<string, number> {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v)
    if (!Number.isFinite(n)) continue
    const q = Math.max(0, Math.floor(n))
    if (q > 0) out[k] = q
  }
  return out
}
