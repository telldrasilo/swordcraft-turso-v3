/**
 * Валидация тела POST /api/save (Zod).
 * Согласуйте с validateSaveData в route.ts при добавлении полей БД.
 */

import { z } from 'zod'

/** Максимальный размер JSON-тела сохранения (байты) */
export const SAVE_PAYLOAD_MAX_BYTES = 2 * 1024 * 1024

/** Входящий объект сохранения до нормализации validateSaveData */
export const saveRequestBodySchema = z
  .object({
    player: z.record(z.string(), z.unknown()).optional(),
    resources: z.unknown().optional(),
    statistics: z.unknown().optional(),
    workers: z.unknown().optional(),
    buildings: z.unknown().optional(),
    maxWorkers: z.coerce.number().finite().optional(),
    activeCraft: z.unknown().optional(),
    activeRefining: z.unknown().optional(),
    weaponInventory: z.unknown().optional(),
    unlockedRecipes: z.unknown().optional(),
    recipeSources: z.unknown().optional(),
    unlockedEnchantments: z.unknown().optional(),
    guild: z.unknown().optional(),
    knownAdventurers: z.unknown().optional(),
    orders: z.unknown().optional(),
    tutorial: z.unknown().optional(),
    materialKnowledge: z.unknown().optional(),
    playTime: z.coerce.number().finite().optional(),
    saveVersion: z.coerce.number().finite().optional(),
  })
  .passthrough()

export type SaveRequestBody = z.infer<typeof saveRequestBodySchema>
