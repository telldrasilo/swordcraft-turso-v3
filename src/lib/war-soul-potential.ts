/**
 * Расчёт Soul Potential — множителя награды души войны за миссию.
 */

import type { MaterialAssignment, Technique, WeaponRecipe } from '@/types/craft-v2'
import { getMaterialAsLegacy } from '@/data/materials'
import {
  SOUL_EFFECT_STAT_MAX,
  SOUL_EFFECT_STAT_MIN,
  SOUL_MATERIAL_SCORE_SCALE,
  SOUL_PART_WEIGHT,
  SOUL_POTENTIAL_BASE,
  SOUL_POTENTIAL_MAX,
  SOUL_POTENTIAL_MIN,
  SOUL_SYNERGY_CAP,
  SOUL_TECHNIQUE_CONDUCTIVITY_K,
  SOUL_TECHNIQUE_SCORE_MAX,
  SOUL_TECHNIQUE_SCORE_MIN,
} from '@/data/war-soul-balance'
import { WAR_SOUL_SYNERGY_RULES } from '@/data/war-soul-synergies'

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Нормализация `weaponEffects.soulCapacity` для вклада в потенциал (0…1). */
export function normalizeSoulWeaponEffect(raw: number): number {
  const r = (raw - SOUL_EFFECT_STAT_MIN) / (SOUL_EFFECT_STAT_MAX - SOUL_EFFECT_STAT_MIN)
  return clamp(r, 0, 1)
}

function techniqueScoreFromTechniques(techniques: Technique[]): number {
  let sum = 0
  for (const t of techniques) {
    const c = t.effects.conductivityBonus
    if (c) sum += c
  }
  const raw = sum * SOUL_TECHNIQUE_CONDUCTIVITY_K
  return clamp(raw, SOUL_TECHNIQUE_SCORE_MIN, SOUL_TECHNIQUE_SCORE_MAX)
}

export interface SoulPotentialBreakdown {
  base: number
  materialScore: number
  synergyScore: number
  techniqueScore: number
  raw: number
  value: number
  /** id сработавших синергий */
  synergyIds: string[]
}

/**
 * Полный расчёт потенциала души по плану материалов и техникам.
 */
export function computeSoulPotentialDetail(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[]
): SoulPotentialBreakdown {
  const parts: Partial<Record<'blade' | 'guard' | 'grip' | 'pommel', string>> = {}
  const cats: Partial<Record<'blade' | 'guard' | 'grip' | 'pommel', string>> = {}

  let materialScore = 0
  for (const part of recipe.parts) {
    const pid = part.id as 'blade' | 'guard' | 'grip' | 'pommel'
    const assign = materials[part.id]
    if (!assign) continue
    const legacy = getMaterialAsLegacy(assign.materialId)
    if (!legacy) continue
    parts[pid] = assign.materialId
    cats[pid] = legacy.category
    const w = SOUL_PART_WEIGHT[part.id] ?? 0
    const soulFx = legacy.weaponEffects?.soulCapacity ?? 0
    materialScore += normalizeSoulWeaponEffect(soulFx) * w
  }
  materialScore *= SOUL_MATERIAL_SCORE_SCALE

  const synergyIds: string[] = []
  let synergyScore = 0
  for (const rule of WAR_SOUL_SYNERGY_RULES) {
    if (rule.test(parts, cats as Record<string, string | undefined>)) {
      synergyIds.push(rule.id)
      synergyScore += rule.bonus
    }
  }
  synergyScore = Math.min(synergyScore, SOUL_SYNERGY_CAP)

  const techniqueScore = techniqueScoreFromTechniques(techniques)
  const raw = SOUL_POTENTIAL_BASE + materialScore + synergyScore + techniqueScore
  const value = clamp(raw, SOUL_POTENTIAL_MIN, SOUL_POTENTIAL_MAX)

  return {
    base: SOUL_POTENTIAL_BASE,
    materialScore,
    synergyScore,
    techniqueScore,
    raw,
    value,
    synergyIds,
  }
}

export function computeSoulPotential(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[]
): number {
  return computeSoulPotentialDetail(recipe, materials, techniques).value
}
