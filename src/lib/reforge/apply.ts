/**
 * Чистая логика перековки (шанс, списание души, эффекты).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE1.md §3
 */

import type { CraftedWeaponV2, WeaponReforgeState } from '@/types/craft-v2'
import type { WeaponLegacy } from '@/types/weapon-damage'
import { getWarSoulTier, resolveWarSoulProgressBarMax } from '@/data/war-soul-tiers'
import { isWarSoulPoolUncapped } from '@/data/war-soul-balance'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import { getPlannerUnlockedTechniqueIds } from '@/lib/craft/planner-unlocked-techniques'
import {
  getReforgeTechniqueById,
  type ReforgeTechniqueEntry,
} from '@/data/reforge/reforge-techniques-registry'
import { resolveBuffReforgeWarSoulCost, getBuffReforgeCostMultiplier } from '@/lib/reforge/reforge-buff-cost'

export type ReforgeFailReason =
  | 'no_weapon'
  | 'not_on_bench'
  | 'technique_not_found'
  | 'locked_guild'
  | 'locked_technique'
  | 'insufficient_war_soul'
  | 'insufficient_catalog_materials'
  | 'no_scars'
  | 'max_stacks'
  | 'all_scars_awakened'
  | 'scar_awakening_already_done'

export interface ReforgeBuffApplyDetails {
  buffPercentRolled: number
  statKind: 'attack' | 'maxDurability'
  attackBefore?: number
  attackAfter?: number
  maxDurabilityBefore?: number
  maxDurabilityAfter?: number
  warSoulSpent: number
  /** База из реестра до множителя тира души. */
  baseWarSoulCost?: number
  /** Множитель 1 + tier × REFORGE_BUFF_WAR_SOUL_COST_PER_TIER. */
  warSoulCostTierFactor?: number
}

export type ApplyReforgeResult =
  | {
      ok: true
      weapon: CraftedWeaponV2
      outcome: 'buff' | 'awaken_success' | 'awaken_fail'
      buff?: ReforgeBuffApplyDetails
      /** 0..1 для awaken */
      roll?: number
      chance?: number
    }
  | { ok: false; reason: ReforgeFailReason }

export interface ReforgeApplyContext {
  /** Уровень гильдии (условия перековки в данных). */
  guildLevel: number
  /** Уровень кузнеца — как в `getPlannerUnlockedTechniqueIds` (техники обработки по уровню). */
  playerLevel: number
  unlockedMaterialProcessingTechniqueIds: string[]
  /** Спец-техники, купленные у интенданта (`reforgeTier: specialized`). */
  unlockedReforgeTechniqueIds: string[]
}

/**
 * Техника обработки материала доступна для перековки, если она `unlockedByDefault` в реестре
 * или входит в эффективный список планировщика (уровень + сохранённые id).
 */
export function isMaterialProcessingUnlockedForReforge(
  materialProcessingTechniqueId: string,
  ctx: ReforgeApplyContext
): boolean {
  const t = getMaterialProcessingTechniqueById(materialProcessingTechniqueId)
  if (!t) return false
  const plannerIds = getPlannerUnlockedTechniqueIds({
    playerLevel: Math.max(1, ctx.playerLevel),
    unlockedMaterialProcessingTechniqueIds: ctx.unlockedMaterialProcessingTechniqueIds,
  })
  return t.unlockedByDefault || plannerIds.includes(materialProcessingTechniqueId)
}

export function isReforgeTechniqueUnlocked(
  technique: ReforgeTechniqueEntry,
  ctx: ReforgeApplyContext
): boolean {
  if (ctx.guildLevel < technique.minGuildLevel) return false

  if (technique.reforgeTier === 'specialized') {
    const bought = ctx.unlockedReforgeTechniqueIds?.includes(technique.id) === true
    if (bought) return true
    if (technique.sourceCraftTechniqueId) {
      return isMaterialProcessingUnlockedForReforge(technique.sourceCraftTechniqueId, ctx)
    }
    return false
  }

  if (technique.sourceCraftTechniqueId) {
    return isMaterialProcessingUnlockedForReforge(technique.sourceCraftTechniqueId, ctx)
  }
  return true
}

/** Кандидаты шрамов: ключ `physical:tagId` или `elemental:axis`, по убыванию веса. */
export function listScarCandidates(legacy: WeaponLegacy): { key: string; weight: number }[] {
  const out: { key: string; weight: number }[] = []
  for (const [tagId, w] of Object.entries(legacy.physicalScarWeights ?? {})) {
    if (typeof w === 'number' && w > 0) out.push({ key: `physical:${tagId}`, weight: w })
  }
  for (const [axis, w] of Object.entries(legacy.elementalScarWeights ?? {})) {
    if (typeof w === 'number' && w > 0) out.push({ key: `elemental:${axis}`, weight: w })
  }
  out.sort((a, b) => b.weight - a.weight)
  return out
}

/**
 * Доля «наполнения» души для модификатора шанса пробуждения.
 * При технически неограниченном пуле (`maxWarSoul` ≈ MAX_SAFE_INTEGER) отношение warSoul/maxWarSoul ≈ 0;
 * вместо этого нормализуем по порогу следующего тира (`resolveWarSoulProgressBarMax`), как в UI прогресса ДВ.
 */
export function computeAwakenPoolRatio(weapon: CraftedWeaponV2): number {
  if (isWarSoulPoolUncapped(weapon.maxWarSoul)) {
    const barMax = resolveWarSoulProgressBarMax(weapon.warSoul, weapon.maxWarSoul)
    return barMax > 0 ? Math.min(1, weapon.warSoul / barMax) : 0
  }
  const maxPool = weapon.maxWarSoul > 0 ? weapon.maxWarSoul : 1
  return Math.min(1, weapon.warSoul / maxPool)
}

export function computeAwakenScarChance(weapon: CraftedWeaponV2, technique: ReforgeTechniqueEntry): number {
  const base = technique.awakenBaseChance ?? 0.1
  const poolRatio = computeAwakenPoolRatio(weapon)
  const tier = getWarSoulTier(weapon.warSoul, weapon.maxWarSoul).tier
  const tierBonus = tier * 0.015
  return Math.min(0.9, base + poolRatio * 0.25 + tierBonus)
}

function mergeReforge(w: CraftedWeaponV2, patch: WeaponReforgeState): CraftedWeaponV2 {
  return {
    ...w,
    weaponReforge: {
      ...w.weaponReforge,
      ...patch,
    },
  }
}

function rollBuffPercent(technique: ReforgeTechniqueEntry, random: () => number): number {
  if (technique.buffPercentMin != null && technique.buffPercentMax != null) {
    const min = technique.buffPercentMin
    const max = technique.buffPercentMax
    return min + random() * (max - min)
  }
  return technique.buffPercentPerStack ?? 2
}

function applyBuffStatWithPercent(
  weapon: CraftedWeaponV2,
  technique: ReforgeTechniqueEntry,
  p: number
): CraftedWeaponV2 | { error: ReforgeFailReason } {
  const stat = technique.buffStat
  const maxStacks = technique.maxStacks ?? 5
  const wr = weapon.weaponReforge ?? {}

  if (stat === 'attack') {
    const stacks = wr.attackBonusStacks ?? 0
    if (stacks >= maxStacks) return { error: 'max_stacks' }
    const refBase = wr.attackRefBase ?? weapon.stats.attack
    const newAttack = Math.max(1, Math.round(weapon.stats.attack + (refBase * p) / 100))
    return mergeReforge(
      {
        ...weapon,
        stats: { ...weapon.stats, attack: newAttack },
      },
      {
        attackRefBase: refBase,
        attackBonusStacks: stacks + 1,
      }
    )
  }

  if (stat === 'maxDurability') {
    const stacks = wr.maxDurabilityBonusStacks ?? 0
    if (stacks >= maxStacks) return { error: 'max_stacks' }
    const refBase = wr.maxDurabilityRefBase ?? weapon.stats.maxDurability
    const oldMax = weapon.stats.maxDurability || 1
    const newMax = Math.max(1, Math.round(weapon.stats.maxDurability + (refBase * p) / 100))
    const scale = oldMax > 0 ? newMax / oldMax : 1
    const newDurabilityStat = Math.round(weapon.stats.durability * scale)
    const newCurrent = Math.min(newMax, Math.max(0, Math.round(weapon.currentDurability * scale)))
    return mergeReforge(
      {
        ...weapon,
        stats: {
          ...weapon.stats,
          maxDurability: newMax,
          durability: newDurabilityStat,
        },
        currentDurability: newCurrent,
      },
      {
        maxDurabilityRefBase: refBase,
        maxDurabilityBonusStacks: stacks + 1,
      }
    )
  }

  return { error: 'technique_not_found' }
}

/** Случайный непробуждённый шрам с учётом весов наследия. */
function pickRandomUnawakenedScarKey(
  legacy: WeaponLegacy,
  wr: WeaponReforgeState | undefined,
  random: () => number
): string | null {
  const awakened = wr?.awakenedScarKeys ?? {}
  const pool = listScarCandidates(legacy).filter((c) => !awakened[c.key])
  if (pool.length === 0) return null
  const total = pool.reduce((s, c) => s + c.weight, 0)
  if (total <= 0) return pool[0]?.key ?? null
  let r = random() * total
  for (const c of pool) {
    r -= c.weight
    if (r <= 0) return c.key
  }
  return pool[pool.length - 1].key
}

/**
 * Применить технику перековки к копии оружия (без проверки верстака).
 */
export function applyReforgeTechniquePure(
  weapon: CraftedWeaponV2,
  techniqueId: string,
  ctx: ReforgeApplyContext,
  random: () => number
): ApplyReforgeResult {
  const technique = getReforgeTechniqueById(techniqueId)
  if (!technique) return { ok: false, reason: 'technique_not_found' }
  if (!isReforgeTechniqueUnlocked(technique, ctx)) {
    return { ok: false, reason: technique.minGuildLevel > ctx.guildLevel ? 'locked_guild' : 'locked_technique' }
  }

  if (technique.reforgeType === 'buffStat') {
    const baseCost = technique.warSoulCost
    const spent = resolveBuffReforgeWarSoulCost(weapon, baseCost)
    const tierFactor = getBuffReforgeCostMultiplier(weapon.warSoul, weapon.maxWarSoul)
    if (weapon.warSoul < spent) {
      return { ok: false, reason: 'insufficient_war_soul' }
    }
    const attackBefore = weapon.stats.attack
    const maxDurabilityBefore = weapon.stats.maxDurability
    const p = rollBuffPercent(technique, random)
    const next = applyBuffStatWithPercent(weapon, technique, p)
    if ('error' in next) return { ok: false, reason: next.error }
    const withSoul: CraftedWeaponV2 = {
      ...next,
      warSoul: Math.max(0, next.warSoul - spent),
    }
    const statKind = technique.buffStat === 'maxDurability' ? 'maxDurability' : 'attack'
    const buff: ReforgeBuffApplyDetails = {
      buffPercentRolled: Math.round(p * 100) / 100,
      statKind,
      warSoulSpent: spent,
      baseWarSoulCost: baseCost,
      warSoulCostTierFactor: Math.round(tierFactor * 1000) / 1000,
    }
    if (statKind === 'attack') {
      buff.attackBefore = attackBefore
      buff.attackAfter = withSoul.stats.attack
    } else {
      buff.maxDurabilityBefore = maxDurabilityBefore
      buff.maxDurabilityAfter = withSoul.stats.maxDurability
    }
    return { ok: true, weapon: withSoul, outcome: 'buff', buff }
  }

  if (technique.reforgeType === 'awakenScar') {
    if (weapon.weaponReforge?.scarAwakeningCompleted) {
      return { ok: false, reason: 'scar_awakening_already_done' }
    }
    const candidates = listScarCandidates(weapon.weaponLegacy)
    if (candidates.length === 0) return { ok: false, reason: 'no_scars' }
    const key = pickRandomUnawakenedScarKey(weapon.weaponLegacy, weapon.weaponReforge, random)
    if (key == null) return { ok: false, reason: 'all_scars_awakened' }

    const spendsAll = technique.awakenSpendsAllWarSoul === true
    const spent = spendsAll ? weapon.warSoul : technique.warSoulCost
    if (spent <= 0 || weapon.warSoul < spent) {
      return { ok: false, reason: 'insufficient_war_soul' }
    }

    const chance = computeAwakenScarChance(weapon, technique)
    const roll = random()
    const baseSoul = Math.max(0, weapon.warSoul - spent)

    if (roll >= chance) {
      return {
        ok: true,
        weapon: { ...weapon, warSoul: baseSoul },
        outcome: 'awaken_fail',
        roll,
        chance,
      }
    }

    const awakened = { ...(weapon.weaponReforge?.awakenedScarKeys ?? {}), [key]: true }
    return {
      ok: true,
      weapon: mergeReforge(
        { ...weapon, warSoul: baseSoul },
        { awakenedScarKeys: awakened, scarAwakeningCompleted: true }
      ),
      outcome: 'awaken_success',
      roll,
      chance,
    }
  }

  return { ok: false, reason: 'technique_not_found' }
}
