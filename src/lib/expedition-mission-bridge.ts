/**
 * Миссия модуля `expeditions` → {@link ExpeditionTemplate} для калькулятора v2.
 * Базовые золото / War Soul / длительность / затраты — детерминированно из ScalableValue
 * (без RNG из `calculateValue`, чтобы превью и UI были стабильны).
 */

import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { getLocationById } from '@/modules/expeditions/data/locations'
import { EXPEDITION_DIFFICULTY_BALANCE } from '@/lib/expedition-difficulty-balance'
import type {
  MissionDifficulty,
  MissionRarity,
  MissionTemplate,
  MissionType,
  ScalableValue,
} from '@/modules/expeditions/data/missions/_mission-template'

function resolvedScalableBase(
  scalable: ScalableValue,
  difficulty: MissionDifficulty,
  rarity: MissionRarity
): number {
  const diffLevel = { easy: 0, normal: 1, hard: 2, extreme: 3 }[difficulty]
  const rarityLevel = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }[rarity]
  return scalable.base + scalable.perDifficulty * diffLevel + scalable.perRarity * rarityLevel
}

function missionIcon(type: MissionType): string {
  const icons: Record<MissionType, string> = {
    hunt: '⚔️',
    scout: '🔭',
    clear: '🏰',
    gather: '🌿',
    rescue: '🆘',
    delivery: '📜',
    escort: '🛡️',
    investigate: '🔍',
  }
  return icons[type]
}

export function missionModuleToCalculatorTemplate(mission: MissionTemplate): ExpeditionTemplate {
  const d = mission.difficulty
  const r = mission.rarity
  const { type } = mission
  const duration = Math.max(60, Math.round(resolvedScalableBase(mission.duration, d, r)))
  const baseGold = Math.max(1, Math.round(resolvedScalableBase(mission.reward.gold, d, r)))
  const baseWarSoul = Math.max(1, Math.round(resolvedScalableBase(mission.reward.warSoul, d, r)))
  const supplies = Math.max(0, Math.round(resolvedScalableBase(mission.cost.supplies, d, r)))
  const deposit = Math.max(0, Math.round(resolvedScalableBase(mission.cost.deposit, d, r)))
  const minWeaponAttack = mission.requirements?.minWeaponAttack ?? 5
  const recommendedWeaponTypes = mission.requirements?.recommendedWeaponTypes ?? ['sword']
  const b = EXPEDITION_DIFFICULTY_BALANCE[d]
  const loc = getLocationById(mission.locationId)

  return {
    id: mission.id,
    name: mission.name,
    description: mission.description,
    moduleObjective: mission.objective,
    moduleLocationName: loc?.name,
    moduleLocationId: mission.locationId,
    moduleClientName: mission.client?.name,
    icon: missionIcon(type),
    type,
    difficulty: d,
    duration,
    cost: { supplies, deposit },
    reward: { baseGold, baseWarSoul },
    minGuildLevel: mission.requirements?.minGuildLevel ?? 1,
    failureChance: b.failureChance,
    weaponLossChance: b.weaponLossChance,
    recommendedWeaponTypes,
    minWeaponAttack,
    enemyTypes: mission.enemies?.types ?? [],
  }
}
