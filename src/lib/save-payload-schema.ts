/**
 * Валидация тела POST /api/save (Zod).
 * Согласуйте с validateSaveData в route.ts при добавлении полей БД.
 */

import { z } from 'zod'

/** Максимальный размер JSON-тела сохранения (байты) */
export const SAVE_PAYLOAD_MAX_BYTES = 2 * 1024 * 1024

const MAX_JSON_DEPTH = 14
const MAX_JSON_NODES = 25_000

function walkJson(
  value: unknown,
  depth: number,
  stats: { maxDepth: number; nodes: number }
): void {
  stats.nodes += 1
  if (stats.nodes > MAX_JSON_NODES) {
    throw new Error('JSON too large')
  }
  stats.maxDepth = Math.max(stats.maxDepth, depth)
  if (depth > MAX_JSON_DEPTH) {
    throw new Error('JSON too deep')
  }
  if (value === null || typeof value !== 'object') {
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, depth + 1, stats)
    }
  } else {
    for (const k of Object.keys(value as object)) {
      walkJson((value as Record<string, unknown>)[k], depth + 1, stats)
    }
  }
}

export function assertSaveJsonBounds(root: unknown): void {
  const stats = { maxDepth: 0, nodes: 0 }
  walkJson(root, 0, stats)
}

const looseRecord = z.record(z.string(), z.unknown())

const playerShapeSchema = z
  .object({
    level: z.coerce.number().int().min(1).max(999_999).optional(),
    experience: z.coerce.number().finite().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
    fame: z.coerce.number().finite().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  })
  .strict()

/** Для тестов и расширенной валидации */
export const playerPayloadSchema = playerShapeSchema.optional()

/** Входящий объект сохранения до нормализации validateSaveData */
export const saveRequestBodySchema = z
  .object({
    timestamp: z.coerce.number().finite().optional(),
    player: z.union([playerShapeSchema, looseRecord]).optional(),
    resources: z.unknown().optional(),
    materialStash: z.unknown().optional(),
    statistics: z.unknown().optional(),
    workers: z.unknown().optional(),
    buildings: z.unknown().optional(),
    maxWorkers: z.coerce.number().int().min(1).max(999).optional(),
    activeCraft: z.unknown().optional(),
    activeRefining: z.unknown().optional(),
    weaponInventory: z.unknown().optional(),
    unlockedRecipes: z.unknown().optional(),
    recipeSources: z.unknown().optional(),
    unlockedEnchantments: z.unknown().optional(),
    unlockedMaterialProcessingTechniqueIds: z.unknown().optional(),
    unlockedRepairTechniqueIds: z.unknown().optional(),
    unlockedReforgeTechniqueIds: z.unknown().optional(),
    guild: z.unknown().optional(),
    knownAdventurers: z.unknown().optional(),
    orders: z.unknown().optional(),
    tutorial: z.unknown().optional(),
    materialKnowledge: z.unknown().optional(),
    materialStudySessions: z.unknown().optional(),
    gameMessages: z.unknown().optional(),
    craftV2Persisted: z.unknown().optional(),
    playTime: z.coerce.number().finite().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
    saveVersion: z.coerce.number().int().min(1).max(999_999).optional(),
    /** Слот верстака ремонта (id оружия или null) */
    repairBenchWeaponId: z.union([z.string().min(1), z.null()]).optional(),
    /** Активный прогон этапов ремонта (после `validateSaveData` нормализуется на сервере) */
    repairTechniqueStageRun: z.unknown().optional(),
    /** Квест «Эхо забытой кузни» + архивариус (облако / Turso) */
    forgottenForgePersist: z.unknown().optional(),
  })
  .superRefine((data, ctx) => {
    try {
      assertSaveJsonBounds(data)
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: e instanceof Error ? e.message : 'Invalid JSON structure',
      })
    }

    const arr = (label: string, v: unknown, max: number) => {
      if (v === undefined) return
      if (!Array.isArray(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [label], message: 'Expected array' })
        return
      }
      if (v.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [label],
          message: `Array exceeds max length ${max}`,
        })
      }
    }

    arr('workers', data.workers, 2000)
    arr('buildings', data.buildings, 500)
    arr('knownAdventurers', data.knownAdventurers, 2000)
    arr('recipeSources', data.recipeSources, 10_000)
    arr('unlockedEnchantments', data.unlockedEnchantments, 5000)
    arr('unlockedMaterialProcessingTechniqueIds', data.unlockedMaterialProcessingTechniqueIds, 500)
    arr('unlockedRepairTechniqueIds', data.unlockedRepairTechniqueIds, 500)
    arr('unlockedReforgeTechniqueIds', data.unlockedReforgeTechniqueIds, 500)
    arr('materialStudySessions', data.materialStudySessions, 500)
    arr('gameMessages', data.gameMessages, 500)
  })

export type SaveRequestBody = z.infer<typeof saveRequestBodySchema>
