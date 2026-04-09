/**
 * Единые правила: оружие должно быть в порядке для экспедиций гильдии и сдачи по заказу NPC.
 */

import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { GUILD_WEAPON_MIN_DURABILITY_RATIO } from '@/lib/store-utils/constants'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import { isWorkbenchDispatchSessionActive } from '@/lib/workbench/workbench-expedition-guard'

const MIN_DURABILITY_RATIO_WITH_DAMAGE_TAGS = 0.5

export interface GuildWeaponServiceEligibilityContext {
  workbenchQueue?: readonly WorkbenchQueueItem[]
  /** Активные этапы верстака (ремонт / перековка из очереди). */
  repairTechniqueStageRun?: { weaponId: string; source?: string } | null
}

/** Причина блокировки или null, если можно отправлять / сдавать */
export function getWeaponGuildServiceBlockReason(
  weapon: CraftedWeaponV2,
  _repairBenchWeaponIds?: string[] | null,
  ctx?: GuildWeaponServiceEligibilityContext
): string | null {
  const queue = ctx?.workbenchQueue ?? []
  const sessionActive = isWorkbenchDispatchSessionActive(queue, ctx?.repairTechniqueStageRun ?? null)
  if (sessionActive) {
    const blocked = queue.some(
      (i) =>
        i.weaponId === weapon.id && (i.status === 'planned' || i.status === 'running')
    )
    if (blocked) {
      return 'Клинок в очереди или в работе на верстаке этой сессии — дождитесь окончания работы'
    }
  }
  const cur = weapon.currentDurability ?? weapon.stats?.durability ?? 0
  const maxD = weapon.stats?.maxDurability ?? 100
  const durabilityRatio = maxD > 0 ? cur / maxD : 0
  if (maxD > 0 && durabilityRatio < GUILD_WEAPON_MIN_DURABILITY_RATIO) {
    return 'Слишком низкая прочность — восстановите оружие во вкладке «Ремонт» кузницы'
  }
  if (
    (weapon.activeDamageTags?.length ?? 0) > 0 &&
    durabilityRatio < MIN_DURABILITY_RATIO_WITH_DAMAGE_TAGS
  ) {
    return 'Оружие с повреждениями можно отправлять только при прочности не ниже 50%'
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
