/**
 * Доли исходов миссии для UI (согласовано с completeExpeditionFull:
 * сначала бросок успеха, при успехе — независимый бросок крита).
 */

export interface ExpeditionOutcomeSegments {
  /** Доля полосы: провал (%) */
  failPct: number
  /** Успех без крита (%) */
  successNoCritPct: number
  /** Критический успех (%) */
  critPct: number
}

export function getExpeditionOutcomeSegments(
  successChancePercent: number,
  critChancePercent: number
): ExpeditionOutcomeSegments {
  const s = Math.min(1, Math.max(0, successChancePercent / 100))
  const c = Math.min(1, Math.max(0, critChancePercent / 100))

  const fail = (1 - s) * 100
  const crit = s * c * 100
  const successNoCrit = s * (1 - c) * 100

  return {
    failPct: roundDisplay(fail),
    successNoCritPct: roundDisplay(successNoCrit),
    critPct: roundDisplay(crit),
  }
}

function roundDisplay(n: number): number {
  return Math.round(n * 10) / 10
}
