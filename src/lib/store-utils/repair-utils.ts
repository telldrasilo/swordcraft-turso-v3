/**
 * Repair Utilities
 * Функции для системы ремонта оружия
 * Вынесено из game-store-composed.ts для уменьшения размера
 */

import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import {
  filterRepairOptionsByActiveDamageTags,
  intersectAllowedRepairDiceProfiles,
} from '@/lib/weapon-damage/filter-repair-by-damage-tags'
import type { RepairDiceProfile } from '@/lib/weapon-damage/repair-dice-profile'
import { REPAIR_DICE_PROFILE_ORDER } from '@/lib/weapon-damage/repair-dice-profile'
import type { WeaponRepairPlan } from '@/types/weapon-repair'
import type { WeaponTier } from '@/store/slices/craft-slice'
import type { CraftingCost } from '@/data/weapon-recipes'
import { getAvailableAmountForResourceKey, getResourceKeyForMaterial } from '@/lib/craft/inventory-check'
import type { CraftingCost as StoreCraftingCost, ResourceKey, Resources } from '@/store/slices/resources-slice'
import type {
  RepairOption,
  RepairType,
  ExecuteRepairResult,
  WeaponRepairCalc,
  RepairResult as RepairRollResult,
} from '@/data/repair-system'
import {
  getRepairOptions as calculateRepairOptions,
  executeRepair as executeWeaponRepairLogic,
  getSmithMastery,
} from '@/data/repair-system'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'

export {
  getRepairAutoPickMaterialMarkup,
  getWeaponAutoRepairGoldCost,
  getWeaponRepairPowerScore,
} from './repair-balance'

// ================================
// ТИПЫ
// ================================

export type WeaponForRepair = WeaponRepairCalc & { id?: string }

export interface RepairCosts {
  goldCost: number
  materials: Partial<Record<ResourceKey, number>>
}

const TIER_BY_INDEX: WeaponTier[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
]

// ================================
// V2 ↔ расчёт ремонта
// ================================

export function craftedWeaponV2ToWeaponRepairCalc(weapon: CraftedWeaponV2): WeaponRepairCalc {
  const n = Number(weapon.tier)
  const idx = Number.isFinite(n)
    ? Math.max(0, Math.min(5, Math.round(n) - 1))
    : 0
  const tier = TIER_BY_INDEX[idx] ?? 'common'

  const materials = {} as CraftingCost
  for (const m of weapon.materials) {
    const rk = getResourceKeyForMaterial(m.materialId)
    if (rk) {
      const key = rk as keyof CraftingCost
      materials[key] = (materials[key] ?? 0) + m.quantity
    }
  }

  return {
    tier,
    durability: weapon.currentDurability ?? weapon.stats.durability,
    maxDurability: weapon.stats.maxDurability,
    warSoul: weapon.warSoul,
    attack: weapon.stats.attack,
    epicMultiplier: weapon.epicMultiplier ?? 1,
    materials,
  }
}

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить опции ремонта для оружия
 */
export function getRepairOptionsForWeapon(
  weapon: WeaponRepairCalc,
  playerLevel: number,
  activeDamageTags?: ActiveDamageTagEntry[]
): RepairOption[] {
  const raw = calculateRepairOptions(weapon, playerLevel)
  return filterRepairOptionsByActiveDamageTags(raw, activeDamageTags ?? [])
}

/**
 * Стоимость опции ремонта для `spendCraftingCostWithStash` (материалы; золото в ремонте не используется).
 */
export function getRepairOptionCraftingCost(option: RepairOption): StoreCraftingCost {
  const cost: StoreCraftingCost = {}
  if (option.goldCost > 0) cost.gold = option.goldCost
  for (const [mat, amount] of Object.entries(option.materials)) {
    const n = amount || 0
    if (n > 0) {
      const k = mat as ResourceKey
      cost[k] = (cost[k] ?? 0) + n
    }
  }
  return cost
}

/**
 * Выполнить ремонт оружия (проверка ресурсов + бросок).
 * `materialStash`: каталожные id по `MATERIAL_TO_RESOURCE` (фаза 2 аудита — как крафт/плавка).
 */
export function executeRepair(
  weapon: WeaponRepairCalc,
  repairType: RepairType,
  playerLevel: number,
  resources: Partial<Record<ResourceKey, number>>,
  materialStash: Record<string, number> = {},
  activeDamageTags?: ActiveDamageTagEntry[]
): ExecuteRepairResult {
  const options = filterRepairOptionsByActiveDamageTags(
    calculateRepairOptions(weapon, playerLevel),
    activeDamageTags ?? []
  )
  const option = options.find(o => o.type === repairType)

  if (!option) {
    return { success: false, error: 'Опция ремонта недоступна' }
  }

  const inv = resources as Resources
  for (const [mat, amount] of Object.entries(option.materials)) {
    const resourceKey = mat as ResourceKey
    const need = amount || 0
    if (need <= 0) continue
    if (getAvailableAmountForResourceKey(inv, materialStash, resourceKey) < need) {
      return { success: false, error: `Недостаточно материалов: ${mat}` }
    }
  }

  const repairResult = executeWeaponRepairLogic(weapon, option, playerLevel)
  if (!repairResult.success) {
    return {
      success: false,
      error: repairResult.criticalFailure ? 'Критический провал ремонта' : 'Ремонт не удался',
      result: repairResult,
    }
  }
  return { success: true, result: repairResult }
}

/**
 * Материалы плана: для `durability_maintenance` — как у legacy «стандартного» ремонта
 * (зависят от рецепта и тира); иначе — сумма по реестру техник со скидкой мастера. Золото не используется.
 */
export function resolveWeaponRepairPlanEconomy(
  weapon: CraftedWeaponV2,
  plan: WeaponRepairPlan,
  playerLevel: number
): { gold: number; materials: Record<string, number> } {
  const mastery = getSmithMastery(Math.max(1, playerLevel))
  const onlyDurability =
    plan.techniqueIds.length === 1 && plan.techniqueIds[0] === DURABILITY_MAINTENANCE_TECHNIQUE_ID

  if (onlyDurability) {
    const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
    const options = filterRepairOptionsByActiveDamageTags(
      calculateRepairOptions(model, playerLevel),
      []
    )
    const std = options.find((o) => o.type === 'standard')
    if (std) {
      const materials: Record<string, number> = {}
      for (const [k, v] of Object.entries(std.materials)) {
        const n = Number(v)
        if (n > 0) materials[k] = n
      }
      return { gold: 0, materials }
    }
  }

  return applyMasteryDiscountToTechniquePlanCost(plan, mastery.discountPercent)
}

export {
  mapTechniqueIdsToRepairDiceProfile,
  mapTechniqueIdsToRepairTypeForDice,
} from '@/lib/weapon-damage/repair-dice-from-techniques'

/** Единый переход профиля броска к ключу таблиц в `repair-system` (литералы совпадают). */
export function repairDiceProfileToRepairType(profile: RepairDiceProfile): RepairType {
  return profile as RepairType
}

/** Подобрать допустимый профиль броска с учётом G1. */
export function pickRepairDiceProfileAllowedByTags(
  preferred: RepairDiceProfile,
  activeDamageTags: ActiveDamageTagEntry[]
): RepairDiceProfile {
  const allowed = intersectAllowedRepairDiceProfiles(activeDamageTags)
  if (allowed.size === 0) return preferred
  if (allowed.has(preferred)) return preferred
  const pIdx = Math.max(0, REPAIR_DICE_PROFILE_ORDER.indexOf(preferred))
  for (let i = pIdx; i < REPAIR_DICE_PROFILE_ORDER.length; i++) {
    const t = REPAIR_DICE_PROFILE_ORDER[i]
    if (allowed.has(t)) return t
  }
  for (let i = pIdx - 1; i >= 0; i--) {
    const t = REPAIR_DICE_PROFILE_ORDER[i]
    if (allowed.has(t)) return t
  }
  return [...allowed][0] ?? preferred
}

/** Подобрать допустимый тип ремонта для кубика с учётом G1 (обёртка над профилем броска). */
export function pickRepairTypeAllowedByTags(
  preferred: RepairType,
  activeDamageTags: ActiveDamageTagEntry[]
): RepairType {
  return repairDiceProfileToRepairType(
    pickRepairDiceProfileAllowedByTags(preferred as RepairDiceProfile, activeDamageTags)
  )
}

/** Округление вверх при наценке на план (авто-подбор техник) */
export function scaleMaterialCostRecord(
  materials: Record<string, number>,
  multiplier: number
): Record<string, number> {
  if (!Number.isFinite(multiplier) || multiplier <= 0 || multiplier === 1) return materials
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(materials)) {
    const n = Math.ceil(v * multiplier)
    if (n > 0) out[k] = n
  }
  return out
}

/** Скидка мастера на суммарную стоимость техник (как на материалы в getRepairOptions). Золото в ремонте не используется. */
export function applyMasteryDiscountToTechniquePlanCost(
  plan: WeaponRepairPlan,
  discountPercent: number
): { gold: number; materials: Record<string, number> } {
  const gold = 0
  const materials: Record<string, number> = {}
  for (const [k, v] of Object.entries(plan.mergedMaterials)) {
    const n = Math.max(0, Math.ceil(v * (1 - discountPercent / 100)))
    if (n > 0) materials[k] = n
  }
  return { gold, materials }
}

/**
 * Ремонт с проверкой материалов по **плану техник**, бросок — по опции выбранного `repairType`.
 */
/** Модификаторы броска ремонта (модель v2: неверная гипотеза осмотра) */
export type RepairExecutionRollModifiers = {
  /** Добавляется к baseSuccessChance опции (может быть отрицательным) */
  successChanceDelta?: number
}

export function executeRepairWithPlanCosts(
  weapon: WeaponRepairCalc,
  repairType: RepairType,
  playerLevel: number,
  resources: Partial<Record<ResourceKey, number>>,
  materialStash: Record<string, number> = {},
  activeDamageTags: ActiveDamageTagEntry[] | undefined,
  planMaterials: Record<string, number>,
  rollModifiers?: RepairExecutionRollModifiers
): ExecuteRepairResult {
  const options = filterRepairOptionsByActiveDamageTags(
    calculateRepairOptions(weapon, playerLevel),
    activeDamageTags ?? []
  )
  const option = options.find((o) => o.type === repairType)

  if (!option) {
    return { success: false, error: 'Опция ремонта недоступна для текущих повреждений' }
  }

  const inv = resources as Resources
  for (const [mat, amount] of Object.entries(planMaterials)) {
    const resourceKey = mat as ResourceKey
    const need = amount || 0
    if (need <= 0) continue
    if (getAvailableAmountForResourceKey(inv, materialStash, resourceKey) < need) {
      return { success: false, error: `Недостаточно материалов: ${mat}` }
    }
  }

  const delta = rollModifiers?.successChanceDelta ?? 0
  const optionForRoll =
    delta !== 0
      ? {
          ...option,
          baseSuccessChance: Math.min(100, Math.max(0, option.baseSuccessChance + delta)),
        }
      : option

  const repairResult = executeWeaponRepairLogic(weapon, optionForRoll, playerLevel)
  if (!repairResult.success) {
    return {
      success: false,
      error: repairResult.criticalFailure ? 'Критический провал ремонта' : 'Ремонт не удался',
      result: repairResult,
    }
  }
  return { success: true, result: repairResult }
}

/**
 * Рассчитать материалы для вычитания
 */
export function getMaterialDeductions(
  repairType: RepairType,
  weapon: WeaponRepairCalc,
  playerLevel: number,
  activeDamageTags?: ActiveDamageTagEntry[]
): Partial<Record<ResourceKey, number>> {
  const options = filterRepairOptionsByActiveDamageTags(
    calculateRepairOptions(weapon, playerLevel),
    activeDamageTags ?? []
  )
  const option = options.find(o => o.type === repairType)
  return option?.materials || {}
}

/**
 * Применить результат ремонта к упрощённой модели оружия (утилита)
 */
export function applyRepairToWeapon(
  weapon: WeaponForRepair,
  result: RepairRollResult
): WeaponForRepair {
  return {
    ...weapon,
    durability: Math.min(100, weapon.durability + result.durabilityRestored),
    maxDurability: result.maxDurabilityAfter,
    warSoul: Math.max(0, weapon.warSoul - result.soulLost),
    attack: Math.max(1, weapon.attack - result.attackLost),
    epicMultiplier: Math.max(1, weapon.epicMultiplier - result.epicLost),
  }
}
