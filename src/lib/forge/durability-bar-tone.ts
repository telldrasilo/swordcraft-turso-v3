/**
 * Тон полосы и подписи прочности — те же пороги, что в weapon-inventory-card:
 * >50% — «зелёный», >25% — «жёлтый», иначе красный.
 */

export function durabilityPercentValue(current: number, maxDurability: number): number {
  if (maxDurability <= 0) return 100
  return Math.round(Math.min(100, Math.max(0, (current / maxDurability) * 100)))
}

export function durabilityBarFillClass(percent: number): string {
  if (percent > 50) return 'bg-green-500'
  if (percent > 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

/** Класс текста для чисел прочности (как `durabilityColor` в карточке). */
export function durabilityLabelTextClass(percent: number): string {
  if (percent > 50) return 'text-green-400'
  if (percent > 25) return 'text-yellow-400'
  return 'text-red-400'
}
