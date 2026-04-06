/**
 * Единая валидация старта экспедиции (store + UI).
 * Канон: кузнец не платит золотом за вход — проверки золота здесь нет.
 */

import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { Adventurer, ActiveExpedition } from '@/types/guild'
import { getMaxActiveExpeditions } from '@/types/guild'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { weaponAttack } from '@/lib/weapon-v2-helpers'
import { getWeaponGuildServiceBlockReason } from '@/lib/guild-weapon-service-eligibility'

export interface ValidateExpeditionStartInput {
  expedition: ExpeditionTemplate
  adventurer: Adventurer
  weapon: CraftedWeaponV2
  guildLevel: number
  activeExpeditions: ActiveExpedition[]
  /** Оружие на верстаке ремонта нельзя отправить в экспедицию */
  repairBenchWeaponId?: string | null
}

export interface ValidateExpeditionStartResult {
  can: boolean
  reason: string
}

export function validateExpeditionStart(
  input: ValidateExpeditionStartInput
): ValidateExpeditionStartResult {
  const { expedition, adventurer, weapon, guildLevel, activeExpeditions, repairBenchWeaponId } = input

  const maxActive = getMaxActiveExpeditions(guildLevel)
  if (activeExpeditions.length >= maxActive) {
    return { can: false, reason: `Достигнут лимит активных экспедиций (${maxActive})` }
  }

  const guildBlock = getWeaponGuildServiceBlockReason(weapon, repairBenchWeaponId ?? null)
  if (guildBlock) {
    return { can: false, reason: guildBlock }
  }

  const attack = weaponAttack(weapon)
  if (attack < expedition.minWeaponAttack) {
    return { can: false, reason: `Требуется атака ${expedition.minWeaponAttack}+` }
  }

  if (activeExpeditions.some((e) => e.weaponId === weapon.id)) {
    return { can: false, reason: 'Оружие уже в экспедиции' }
  }

  if (activeExpeditions.some((e) => e.adventurerId === adventurer.id)) {
    return { can: false, reason: 'Искатель уже в экспедиции' }
  }

  const minAttack = adventurer.requirements?.minAttack ?? 0
  if (attack < minAttack) {
    return { can: false, reason: `Искатель требует атаку ${minAttack}+` }
  }

  return { can: true, reason: '' }
}
