/**
 * Операции над weaponLegacy: нормализация, скрытые маркеры, снимок «осмотра».
 */

import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import type { ActiveDamageTagEntry, RepairDiagnosisTier, WeaponLegacy } from '@/types/weapon-damage'

export const REPAIR_LEGACY_RESONANCE_ID = 'repair_legacy_resonance' as const

export function emptyWeaponLegacy(): WeaponLegacy {
  return { hiddenMarks: [] }
}

/** Гарантирует массив hiddenMarks и копию объекта для безопасной мутации полей. */
export function ensureWeaponLegacy(raw: WeaponLegacy | undefined | null): WeaponLegacy {
  if (!raw || typeof raw !== 'object') return emptyWeaponLegacy()
  const hm = raw.hiddenMarks
  const hiddenMarks = Array.isArray(hm) ? hm.filter((x): x is string => typeof x === 'string') : []
  const repairResolveCountByTagId =
    raw.repairResolveCountByTagId && typeof raw.repairResolveCountByTagId === 'object'
      ? { ...raw.repairResolveCountByTagId }
      : undefined
  const archivedDamageTagIds = Array.isArray(raw.archivedDamageTagIds)
    ? raw.archivedDamageTagIds.filter((x): x is string => typeof x === 'string')
    : undefined
  const repairDiagnosisPreciseCountByTagId = mergeCountMap(raw.repairDiagnosisPreciseCountByTagId)
  const repairDiagnosisRiskyCountByTagId = mergeCountMap(raw.repairDiagnosisRiskyCountByTagId)
  const repairDiagnosisSkippedCountByTagId = mergeCountMap(raw.repairDiagnosisSkippedCountByTagId)
  const physicalScarWeights = mergeCountMap(raw.physicalScarWeights)
  const elementalScarWeights = mergeCountMap(raw.elementalScarWeights)
  return {
    ...raw,
    hiddenMarks,
    repairResolveCountByTagId,
    archivedDamageTagIds,
    repairDiagnosisPreciseCountByTagId,
    repairDiagnosisRiskyCountByTagId,
    repairDiagnosisSkippedCountByTagId,
    physicalScarWeights,
    elementalScarWeights,
  }
}

function mergeCountMap(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = Math.floor(v)
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** Инкремент счётчиков §9.1.1 по tier для снятых тегов */
export function incrementRepairDiagnosisCountsForTags(
  legacy: WeaponLegacy,
  tagIds: string[],
  tier: RepairDiagnosisTier
): WeaponLegacy {
  if (tagIds.length === 0) return legacy
  const base = ensureWeaponLegacy(legacy)
  const precise = { ...(base.repairDiagnosisPreciseCountByTagId ?? {}) }
  const risky = { ...(base.repairDiagnosisRiskyCountByTagId ?? {}) }
  const skipped = { ...(base.repairDiagnosisSkippedCountByTagId ?? {}) }
  for (const tid of tagIds) {
    if (tier === 'precise') precise[tid] = (precise[tid] ?? 0) + 1
    else if (tier === 'risky') risky[tid] = (risky[tid] ?? 0) + 1
    else skipped[tid] = (skipped[tid] ?? 0) + 1
  }
  return {
    ...base,
    repairDiagnosisPreciseCountByTagId: Object.keys(precise).length ? precise : undefined,
    repairDiagnosisRiskyCountByTagId: Object.keys(risky).length ? risky : undefined,
    repairDiagnosisSkippedCountByTagId: Object.keys(skipped).length ? skipped : undefined,
  }
}

export function appendHiddenMark(legacy: WeaponLegacy, markId: string): WeaponLegacy {
  if (legacy.hiddenMarks.includes(markId)) return legacy
  return { ...legacy, hiddenMarks: [...legacy.hiddenMarks, markId] }
}

/**
 * Тексты analysisHint и id тегов по активным повреждениям (для снимка при оплате осмотра).
 */
export function collectDeepInspectSnapshotFromTags(
  entries: ActiveDamageTagEntry[]
): { notes: string[]; tagIds: string[] } {
  const notes: string[] = []
  const tagIds: string[] = []
  for (const e of entries) {
    tagIds.push(e.tagId)
    const d = getDamageTagById(e.tagId)
    if (d?.analysisHint) notes.push(d.analysisHint)
  }
  return { notes, tagIds }
}
