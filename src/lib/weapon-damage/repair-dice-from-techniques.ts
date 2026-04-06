/**
 * Маппинг выбранных техник починки на ось броска `RepairDiceProfile`.
 * Исходы кубика и стоимость опции броска берутся из `repair-system` через адаптер в `repair-utils`.
 */

import type { RepairDiceProfile } from '@/lib/weapon-damage/repair-dice-profile'
import { REPAIR_DICE_PROFILE_ORDER } from '@/lib/weapon-damage/repair-dice-profile'
import { SOUL_LEAK_G1_ENHANCEMENT_PLACEHOLDER_ID } from '@/data/weapon-damage/repair-g1-ids'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'

export { SOUL_LEAK_G1_ENHANCEMENT_PLACEHOLDER_ID } from '@/data/weapon-damage/repair-g1-ids'

/** @deprecated используйте `REPAIR_DICE_PROFILE_ORDER` */
export const REPAIR_TYPE_DICE_ORDER = REPAIR_DICE_PROFILE_ORDER

/** Какой профиль броска использовать при многоэтапном ремонте по техникам */
export function mapTechniqueIdsToRepairDiceProfile(techniqueIds: string[]): RepairDiceProfile {
  if (
    techniqueIds.length === 1 &&
    techniqueIds[0] === DURABILITY_MAINTENANCE_TECHNIQUE_ID
  ) {
    return 'standard'
  }
  if (
    techniqueIds.length === 1 &&
    techniqueIds[0] === SOUL_LEAK_G1_ENHANCEMENT_PLACEHOLDER_ID
  ) {
    return 'enhancement'
  }
  if (techniqueIds.some((id) => id === 'blade_soul_tending' || id === 'binding_relief')) {
    return 'restoration'
  }
  if (techniqueIds.length >= 2 || techniqueIds.includes('frost_crack_seal')) {
    return 'quality'
  }
  return 'standard'
}

/** @deprecated используйте `mapTechniqueIdsToRepairDiceProfile` */
export function mapTechniqueIdsToRepairTypeForDice(techniqueIds: string[]) {
  return mapTechniqueIdsToRepairDiceProfile(techniqueIds)
}
