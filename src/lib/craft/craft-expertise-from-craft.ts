/**
 * Прирост экспертизы материалов при завершённом крафте (фаза B2 roadmap).
 * Дельта убывает на высоких %; на 100% прироста нет.
 */

import type { MaterialKnowledge } from '@/types/materials/knowledge'

/** Минимальный заметный прирост (после округления). */
const MIN_DELTA = 0.25

/**
 * Чистая дельта экспертизы за одно успешное использование материала в крафте.
 */
export function computeCraftExpertiseGainDelta(currentExpertise: number): number {
  if (currentExpertise >= 100) return 0
  const room = 100 - currentExpertise
  const base = 1.2 + Math.min(1.8, room / 35)
  const diminishing = Math.max(0.28, 1 - currentExpertise / 125)
  const raw = base * diminishing
  const delta = Math.round(raw * 20) / 20
  return Math.max(0, Math.min(room, delta < MIN_DELTA ? 0 : delta))
}

export interface CraftExpertiseGainRow {
  materialId: string
  materialName: string
  before: number
  delta: number
  after: number
}

export interface CraftExpertiseFromCraftDeps {
  getExpertise: (materialId: string) => number
  addExpertise: (materialId: string, delta: number) => void
  getMaterialDisplayName: (materialId: string) => string
}

export type CraftExpertiseGainRowDeps = Pick<
  CraftExpertiseFromCraftDeps,
  'getExpertise' | 'getMaterialDisplayName'
>

/**
 * Строки прироста экспертизы без записи в store (для отложенного начисления вне updater'а React).
 */
export function buildCraftExpertiseGainRows(
  materials: Record<string, { materialId: string } | undefined>,
  deps: CraftExpertiseGainRowDeps
): CraftExpertiseGainRow[] {
  const seen = new Set<string>()
  const rows: CraftExpertiseGainRow[] = []
  for (const a of Object.values(materials)) {
    if (!a?.materialId || seen.has(a.materialId)) continue
    seen.add(a.materialId)
    const before = deps.getExpertise(a.materialId)
    const delta = computeCraftExpertiseGainDelta(before)
    if (delta <= 0) continue
    const after = Math.min(100, before + delta)
    rows.push({
      materialId: a.materialId,
      materialName: deps.getMaterialDisplayName(a.materialId),
      before,
      delta,
      after,
    })
  }
  return rows
}

export function applyCraftExpertiseGainRows(
  rows: CraftExpertiseGainRow[],
  addExpertise: (materialId: string, delta: number) => void
): void {
  for (const r of rows) {
    addExpertise(r.materialId, r.delta)
  }
}

/**
 * Начисляет экспертизу по уникальным материалам плана и возвращает строки для UI.
 * Вызывать один раз при завершении крафта (после успешного броска оружия).
 */
export function applyCraftExpertiseFromCompletedPlan(
  materials: Record<string, { materialId: string } | undefined>,
  deps: CraftExpertiseFromCraftDeps
): CraftExpertiseGainRow[] {
  const rows = buildCraftExpertiseGainRows(materials, deps)
  applyCraftExpertiseGainRows(rows, deps.addExpertise)
  return rows
}

export function computeCraftExpertiseGainsPreview(
  materials: Record<string, { materialId: string } | undefined>,
  knowledge: Record<string, MaterialKnowledge>
): { materialId: string; before: number; delta: number }[] {
  const seen = new Set<string>()
  const out: { materialId: string; before: number; delta: number }[] = []
  for (const a of Object.values(materials)) {
    if (!a?.materialId || seen.has(a.materialId)) continue
    seen.add(a.materialId)
    const before = knowledge[a.materialId]?.expertise ?? 0
    const delta = computeCraftExpertiseGainDelta(before)
    if (delta > 0) out.push({ materialId: a.materialId, before, delta })
  }
  return out
}
