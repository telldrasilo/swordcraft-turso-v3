/**
 * Единые правила: оружие должно быть в порядке для экспедиций гильдии и сдачи по заказу NPC.
 */

import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { GUILD_WEAPON_MIN_DURABILITY_RATIO } from '@/lib/store-utils/constants'

/** Причина блокировки или null, если можно отправлять / сдавать */
export function getWeaponGuildServiceBlockReason(
  weapon: CraftedWeaponV2,
  repairBenchWeaponId?: string | null
): string | null {
  if (repairBenchWeaponId && weapon.id === repairBenchWeaponId) {
    return 'Оружие на верстаке ремонта — сначала завершите ремонт или верните клинок в инвентарь'
  }
  const cur = weapon.currentDurability ?? weapon.stats?.durability ?? 0
  const maxD = weapon.stats?.maxDurability ?? 100
  if (maxD > 0 && cur / maxD < GUILD_WEAPON_MIN_DURABILITY_RATIO) {
    return 'Слишком низкая прочность — восстановите оружие во вкладке «Ремонт» кузницы'
  }
  if ((weapon.activeDamageTags?.length ?? 0) > 0) {
    return 'Есть видимые повреждения — сначала вкладка «Ремонт» в кузнице'
  }
  const rc = weapon.repairCondition ?? 'ok'
  if (rc === 'needsProperRepair') {
    return 'Нужна полноценная починка — сначала вкладка «Ремонт»'
  }
  if (rc === 'temporaryPatch') {
    return 'Нужна полноценная починка (временная заплатка) — сначала «Ремонт»'
  }
  return null
}
