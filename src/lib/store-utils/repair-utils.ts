/**
 * Repair Utilities
 * Функции для системы ремонта оружия
 * Вынесено из game-store-composed.ts для уменьшения размера
 */

import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { WeaponTier } from '@/store/slices/craft-slice'
import type { CraftingCost } from '@/data/weapon-recipes'
import { getResourceKeyForMaterial } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { Worker } from '@/store/slices/workers-slice'
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
} from '@/data/repair-system'

// ================================
// ТИПЫ
// ================================

export type WeaponForRepair = WeaponRepairCalc & { id?: string }

export interface RepairCosts {
  goldCost: number
  materials: Partial<Record<ResourceKey, number>>
  staminaCost: number
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
// КОНСТАНТЫ
// ================================

const TIER_MULTIPLIERS: Record<string, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
  mythic: 8,
}

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
  blacksmith: Worker | null
): RepairOption[] {
  return calculateRepairOptions(weapon, blacksmith)
}

/**
 * Рассчитать стоимость ремонта
 */
export function calculateRepairCost(
  weapon: WeaponRepairCalc,
  playerLevel: number
): number {
  const durabilityLost = (weapon.maxDurability ?? 100) - (weapon.durability ?? 100)
  if (durabilityLost <= 0) return 0

  const tierMult = TIER_MULTIPLIERS[weapon.tier] || 1
  const baseCost = durabilityLost * tierMult
  const playerDiscount = Math.min(0.5, playerLevel * 0.05)

  return Math.floor(baseCost * (1 - playerDiscount))
}

/**
 * Рассчитать максимальный процент восстановления
 */
export function calculateMaxRepairPercent(playerLevel: number): number {
  const maxRepair = 50 + playerLevel * 5
  return Math.min(100, maxRepair)
}

/**
 * Проверить возможность ремонта
 */
export function canRepair(
  weapon: WeaponRepairCalc,
  gold: number,
  _resources: Partial<Record<ResourceKey, number>>,
  playerLevel: number
): { can: boolean; reason: string } {
  const currentDurability = weapon.durability ?? 100
  const maxDurability = weapon.maxDurability ?? 100

  if (currentDurability >= maxDurability) {
    return { can: false, reason: 'Оружие не требует ремонта' }
  }

  const cost = calculateRepairCost(weapon, playerLevel)
  if (gold < cost) {
    return { can: false, reason: 'Недостаточно золота' }
  }

  return { can: true, reason: '' }
}

/**
 * Выполнить ремонт оружия (проверка ресурсов + бросок)
 */
export function executeRepair(
  weapon: WeaponRepairCalc,
  repairType: RepairType,
  blacksmith: Worker | null,
  gold: number,
  resources: Partial<Record<ResourceKey, number>>
): ExecuteRepairResult {
  const options = calculateRepairOptions(weapon, blacksmith)
  const option = options.find(o => o.type === repairType)

  if (!option) {
    return { success: false, error: 'Опция ремонта недоступна' }
  }

  for (const [mat, amount] of Object.entries(option.materials)) {
    const resourceKey = mat as ResourceKey
    if ((resources[resourceKey] || 0) < (amount || 0)) {
      return { success: false, error: `Недостаточно материалов: ${mat}` }
    }
  }

  if (gold < option.goldCost) {
    return { success: false, error: 'Недостаточно золота' }
  }

  if (blacksmith && blacksmith.stamina < option.staminaCost) {
    return { success: false, error: 'У кузнеца недостаточно сил' }
  }

  const repairResult = executeWeaponRepairLogic(weapon, option, blacksmith)
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
  blacksmith: Worker | null
): Partial<Record<ResourceKey, number>> {
  const options = calculateRepairOptions(weapon, blacksmith)
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
