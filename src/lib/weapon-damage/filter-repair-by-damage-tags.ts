/**
 * G1: фильтрация допустимых профилей броска ремонта (`RepairDiceProfile`) по активным видимым тегам.
 * В реестре тегов задаётся `allowedRepairTechniqueIds`: пустой список — без ограничения от тега
 * (все пять профилей); иначе — union профилей по `mapTechniqueIdsToRepairDiceProfile([id])` для каждого id.
 * Пересечение по всем тегам (неизвестный tagId не сужает набор).
 *
 * G2/G3 (подготовка / этапы для сложных случаев) — вне этого модуля; см. концепт §8.
 */

import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import type { RepairOption, RepairType } from '@/data/repair-system'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import type { RepairDiceProfile } from '@/lib/weapon-damage/repair-dice-profile'
import { ALL_REPAIR_DICE_PROFILES } from '@/lib/weapon-damage/repair-dice-profile'
import { mapTechniqueIdsToRepairDiceProfile } from '@/lib/weapon-damage/repair-dice-from-techniques'

function repairDiceProfilesForTagId(tagId: string): Set<RepairDiceProfile> {
  const def = getDamageTagById(tagId)
  if (!def?.allowedRepairTechniqueIds?.length) {
    return new Set(ALL_REPAIR_DICE_PROFILES)
  }
  return new Set(
    def.allowedRepairTechniqueIds.map((tid) => mapTechniqueIdsToRepairDiceProfile([tid]))
  )
}

/**
 * Пересечение допустимых профилей броска для всех активных тегов.
 * Пустой список тегов → все пять профилей (как без повреждений).
 */
export function intersectAllowedRepairDiceProfiles(
  activeDamageTags: ActiveDamageTagEntry[]
): Set<RepairDiceProfile> {
  if (!activeDamageTags.length) return new Set(ALL_REPAIR_DICE_PROFILES)

  let acc: Set<RepairDiceProfile> | null = null
  for (const entry of activeDamageTags) {
    const next = repairDiceProfilesForTagId(entry.tagId)
    if (acc === null) {
      acc = next
    } else {
      const narrowed = new Set<RepairDiceProfile>()
      for (const t of acc) {
        if (next.has(t)) narrowed.add(t)
      }
      acc = narrowed
    }
  }
  return acc ?? new Set(ALL_REPAIR_DICE_PROFILES)
}

/** Совместимость: то же пересечение, что `intersectAllowedRepairDiceProfiles` (литералы совпадают с RepairType). */
export function intersectAllowedRepairTypesForDice(
  activeDamageTags: ActiveDamageTagEntry[]
): Set<RepairType> {
  return intersectAllowedRepairDiceProfiles(activeDamageTags) as Set<RepairType>
}

/** @deprecated используйте intersectAllowedRepairDiceProfiles */
export const intersectAllowedRepairTypes = intersectAllowedRepairTypesForDice

/** Отфильтровать опции ремонта по G1. Пустое пересечение (ошибка данных) — вернуть исходный список. */
export function filterRepairOptionsByActiveDamageTags(
  options: RepairOption[],
  activeDamageTags: ActiveDamageTagEntry[]
): RepairOption[] {
  if (!activeDamageTags.length) return options
  const allowed = intersectAllowedRepairDiceProfiles(activeDamageTags)
  if (allowed.size === 0) return options
  const filtered = options.filter((o) => allowed.has(o.type as RepairDiceProfile))
  return filtered.length > 0 ? filtered : options
}
