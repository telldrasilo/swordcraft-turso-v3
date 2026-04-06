/**
 * Метаданные отображения оружия (качество, типы) — P2-Craft-03.
 * Не зависят от legacy weapon-recipes.ts; импортируйте отсюда UI и новый код.
 */

import type { QualityGrade, WeaponMaterial } from '@/store/slices/craft-slice'

/** Мост заказов/NPC: тег материала шаблона → канонический `materialId` боевой части Craft v2 (фаза A). */
const ORDER_WEAPON_MATERIAL_TO_CATALOG_ID: Record<WeaponMaterial, string> = {
  iron: 'iron_alloy',
  bronze: 'bronze',
  steel: 'steel',
  silver: 'silver_alloy',
  gold: 'gold_alloy',
  mithril: 'mithril_alloy',
}

const CANONICAL_ORDER_MATERIAL_IDS = new Set(Object.values(ORDER_WEAPON_MATERIAL_TO_CATALOG_ID))

/** Нормализация для §6.7: `WeaponMaterial` или уже канонический боевой id → один ключ сравнения. */
function canonicalOrderMaterialIdForLookup(tag: string): string | null {
  if (tag in ORDER_WEAPON_MATERIAL_TO_CATALOG_ID) {
    return ORDER_WEAPON_MATERIAL_TO_CATALOG_ID[tag as WeaponMaterial]
  }
  if (CANONICAL_ORDER_MATERIAL_IDS.has(tag)) return tag
  return null
}

export function catalogMaterialIdFromOrderWeaponMaterial(material: WeaponMaterial): string {
  return ORDER_WEAPON_MATERIAL_TO_CATALOG_ID[material]
}

/**
 * Заказ и легаси-строка рецепта (`weapon-recipes`): одно и то же оружие по материалу, если совпадают канонические id.
 */
export function weaponMaterialTagsAlignForOrders(a: string | undefined, b: string | undefined): boolean {
  if (a === b) return true
  if (a === undefined || b === undefined) return false
  const ia = canonicalOrderMaterialIdForLookup(a)
  const ib = canonicalOrderMaterialIdForLookup(b)
  if (ia !== null && ib !== null) return ia === ib
  return false
}

/**
 * Заказы хранят тег `WeaponMaterial`; Craft v2 кладёт в `hiddenTags` канонические `materialId` частей (напр. `iron_alloy`).
 */
export function hiddenTagsSatisfyOrderMaterial(
  hiddenTags: readonly string[],
  orderMaterial: string | undefined
): boolean {
  if (!orderMaterial) return true
  if (hiddenTags.includes(orderMaterial)) return true
  const canon = canonicalOrderMaterialIdForLookup(orderMaterial)
  if (canon && hiddenTags.includes(canon)) return true
  return false
}

export const qualityGrades: Record<
  QualityGrade,
  { name: string; min: number; max: number; multiplier: number; color: string }
> = {
  poor: { name: 'Плохое', min: 0, max: 25, multiplier: 0.6, color: 'text-red-400' },
  normal: { name: 'Обычное', min: 26, max: 50, multiplier: 1.0, color: 'text-stone-300' },
  good: { name: 'Хорошее', min: 51, max: 70, multiplier: 1.3, color: 'text-green-400' },
  excellent: { name: 'Отличное', min: 71, max: 85, multiplier: 1.6, color: 'text-blue-400' },
  masterwork: { name: 'Шедевр', min: 86, max: 95, multiplier: 2.0, color: 'text-purple-400' },
  legendary: { name: 'Легендарное', min: 96, max: 100, multiplier: 3.0, color: 'text-amber-400' },
}

export function getQualityGrade(quality: number): QualityGrade {
  if (quality <= 25) return 'poor'
  if (quality <= 50) return 'normal'
  if (quality <= 70) return 'good'
  if (quality <= 85) return 'excellent'
  if (quality <= 95) return 'masterwork'
  return 'legendary'
}

export const weaponTypeStats = {
  sword: { attackBase: 10, attackPerTier: 5, name: 'Меч', icon: '⚔️' },
  dagger: { attackBase: 6, attackPerTier: 3, name: 'Кинжал', icon: '🗡️' },
  axe: { attackBase: 14, attackPerTier: 7, name: 'Топор', icon: '🪓' },
  mace: { attackBase: 16, attackPerTier: 8, name: 'Булава', icon: '🔨' },
  spear: { attackBase: 12, attackPerTier: 6, name: 'Копьё', icon: '🔱' },
  hammer: { attackBase: 18, attackPerTier: 9, name: 'Молот', icon: '⚒️' },
  bow: { attackBase: 8, attackPerTier: 4, name: 'Лук', icon: '🏹' },
  staff: { attackBase: 7, attackPerTier: 3, name: 'Посох', icon: '🪄' },
}
