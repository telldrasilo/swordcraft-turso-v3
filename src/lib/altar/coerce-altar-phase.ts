import type { AltarPhase } from '@/types/altar-construction'

/** Нормализация фазы из сейва/API (число или строка `"2"`). */
export function coerceAltarPhase(raw: unknown): AltarPhase | null {
  if (raw == null) return null
  const n = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw)
  if (!Number.isFinite(n)) return null
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n
  return null
}
