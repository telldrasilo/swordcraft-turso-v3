/**
 * Лут из шаблона события экспедиции: детерминированный выбор ветки choice + resolve эффектов.
 */

import type { EventTemplate, EventEffect } from '@/modules/expeditions/data/events/_event-template'
import type { Location } from '@/modules/expeditions/types'
import { resolveEventEffects } from '@/modules/expeditions'
import {
  CONTRACT_CONFIG,
  type ContractType,
} from '@/modules/expeditions/data/missions/_mission-template'
import type { ExpeditionDevBalanceTweaks } from '@/types/guild'

export interface ResolvedEventLoot {
  successChanceDelta: number
  bonusGold: number
  materialGrants: Array<{ materialId: string; quantity: number }>
}

/**
 * Те же множители, что при завершении миссии (договор + отладка), для превью в журнале.
 */
export function applyExpeditionModuleLootMultipliers(
  materialGrants: Array<{ materialId: string; quantity: number }>,
  bonusGold: number,
  contractType: ContractType,
  devBalance?: ExpeditionDevBalanceTweaks
): { materialGrants: Array<{ materialId: string; quantity: number }>; bonusGold: number } {
  const matContractMult = CONTRACT_CONFIG[contractType].materialFindMultiplier
  const matQtyMult = devBalance?.materialQuantityMultiplier ?? 1
  const matRareMult = devBalance?.materialRarityMultiplier ?? 1
  const eventGoldMult =
    devBalance?.eventGoldMultiplier ?? devBalance?.quantityMultiplier ?? 1

  const byId = new Map<string, number>()
  for (const g of materialGrants) {
    byId.set(g.materialId, (byId.get(g.materialId) ?? 0) + g.quantity)
  }

  const merged: Array<{ materialId: string; quantity: number }> = [...byId.entries()].map(
    ([materialId, quantity]) => ({
      materialId,
      quantity: Math.max(
        1,
        Math.floor(quantity * matContractMult * matQtyMult * matRareMult)
      ),
    })
  )

  return {
    materialGrants: merged,
    bonusGold: Math.floor(bonusGold * eventGoldMult),
  }
}

export function getEffectsForEventResolution(
  tpl: EventTemplate | undefined,
  seed: number
): EventEffect[] {
  if (!tpl) return []
  if (tpl.choices?.length) {
    let h = seed >>> 0
    for (let i = 0; i < tpl.id.length; i++) {
      h = (Math.imul(h, 31) + tpl.id.charCodeAt(i)) >>> 0
    }
    const idx = h % tpl.choices.length
    return tpl.choices[idx]?.effects ?? []
  }
  return tpl.effects ?? []
}

export function resolveTemplateLoot(
  tpl: EventTemplate | undefined,
  location: Location,
  seed: number
): ResolvedEventLoot {
  const effects = getEffectsForEventResolution(tpl, seed)
  if (effects.length === 0) {
    return { successChanceDelta: 0, bonusGold: 0, materialGrants: [] }
  }

  const resolved = resolveEventEffects(effects, location, seed)
  let successChanceDelta = 0
  let bonusGold = 0
  const materialGrants: Array<{ materialId: string; quantity: number }> = []

  for (const r of resolved) {
    if (r.type === 'modify_success_chance') {
      successChanceDelta += r.quantity
    }
    if (r.type === 'grant_resource' && r.resourceId === 'gold') {
      bonusGold += r.quantity
    }
    if (r.type === 'grant_material' && r.materialId) {
      materialGrants.push({
        materialId: r.materialId,
        quantity: Math.max(1, r.quantity),
      })
    }
  }

  return { successChanceDelta, bonusGold, materialGrants }
}
