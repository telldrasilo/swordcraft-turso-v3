/**
 * Нормализация полей крафта в облачном/офлайн сохранении (P2-Save-01).
 * Канонический процесс v2 живёт в craftV2Persisted; колонка activeCraft сериализует только ActiveCraftV2 | null.
 */

import { initialActiveCraft, type ActiveCraft } from '@/store/slices/craft-slice'
import type {
  ActiveCraftV2,
  CraftPlan,
  CraftedWeaponV2,
} from '@/types/craft-v2'

/** Снимок CraftV2Persisted для API/нормализации (совпадает с game-store-composed) */
export interface CraftV2PersistedLike {
  activeCraft: ActiveCraftV2 | null
  plan: CraftPlan | null
  completedWeapon: CraftedWeaponV2 | null
  stage: 'planning' | 'crafting' | 'completed'
  preview: unknown | null
  weaponName: unknown | null
}

export const defaultCraftV2Persisted: CraftV2PersistedLike = {
  activeCraft: null,
  plan: null,
  completedWeapon: null,
  stage: 'planning',
  preview: null,
  weaponName: null,
}

/** Признак объекта ActiveCraftV2 (этапы + план) в JSON */
export function isActiveCraftV2Shape(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    Array.isArray(o.stages) &&
    o.plan !== undefined &&
    typeof o.id === 'string' &&
    typeof o.status === 'string'
  )
}

/** Признак legacy ActiveCraft из craft-slice (прогресс-бар v1) */
export function isLegacySliceActiveCraftShape(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  if (isActiveCraftV2Shape(value)) return false
  return 'progress' in o && ('recipeId' in o || o['recipeId'] === null)
}

/**
 * Значение для колонки activeCraft: только ActiveCraftV2 | null (не legacy slice).
 */
export function normalizeActiveCraftColumn(
  rawActiveCraft: unknown,
  craftV2Persisted: unknown
): unknown {
  const fromV2 =
    craftV2Persisted &&
    typeof craftV2Persisted === 'object' &&
    craftV2Persisted !== null &&
    'activeCraft' in craftV2Persisted
      ? (craftV2Persisted as Record<string, unknown>).activeCraft
      : undefined
  if (fromV2 !== undefined && fromV2 !== null && isActiveCraftV2Shape(fromV2)) {
    return fromV2
  }
  if (rawActiveCraft !== undefined && rawActiveCraft !== null && isActiveCraftV2Shape(rawActiveCraft)) {
    return rawActiveCraft
  }
  return null
}

/** Слить загруженные данные craftV2Persisted; при старых сейвах поднять v2 из activeCraft */
export function mergeCraftV2PersistedFromSave(
  rawPersisted: unknown,
  rawActiveCraft: unknown
): CraftV2PersistedLike {
  const partial =
    typeof rawPersisted === 'object' && rawPersisted !== null
      ? (rawPersisted as Partial<CraftV2PersistedLike>)
      : {}
  const base: CraftV2PersistedLike = {
    ...defaultCraftV2Persisted,
    ...partial,
    activeCraft:
      partial.activeCraft !== undefined
        ? (partial.activeCraft as ActiveCraftV2 | null)
        : defaultCraftV2Persisted.activeCraft,
    plan:
      partial.plan !== undefined
        ? (partial.plan as CraftPlan | null)
        : defaultCraftV2Persisted.plan,
    completedWeapon:
      partial.completedWeapon !== undefined
        ? (partial.completedWeapon as CraftedWeaponV2 | null)
        : defaultCraftV2Persisted.completedWeapon,
    stage: partial.stage ?? defaultCraftV2Persisted.stage,
    preview: partial.preview !== undefined ? partial.preview : defaultCraftV2Persisted.preview,
    weaponName:
      partial.weaponName !== undefined ? partial.weaponName : defaultCraftV2Persisted.weaponName,
  }
  if (
    (base.activeCraft === null || base.activeCraft === undefined) &&
    isActiveCraftV2Shape(rawActiveCraft)
  ) {
    return { ...base, activeCraft: rawActiveCraft as ActiveCraftV2 }
  }
  return base
}

/** Восстановить legacy поле craft-slice при загрузке старого сейва */
export function mergeLegacyActiveCraftForSlice(raw: unknown): ActiveCraft {
  if (!isLegacySliceActiveCraftShape(raw)) return initialActiveCraft
  const o = raw as Record<string, unknown>
  return {
    ...initialActiveCraft,
    recipeId: (o['recipeId'] as string | null) ?? null,
    weaponName: typeof o['weaponName'] === 'string' ? o['weaponName'] : initialActiveCraft.weaponName,
    progress: typeof o['progress'] === 'number' ? o['progress'] : 0,
    startTime: typeof o['startTime'] === 'number' ? o['startTime'] : null,
    endTime: typeof o['endTime'] === 'number' ? o['endTime'] : null,
    quality: typeof o['quality'] === 'number' ? o['quality'] : 0,
  }
}
