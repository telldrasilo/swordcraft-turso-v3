/**
 * Короткие подписи видимых повреждений для инвентаря и итогов миссии.
 */

import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

export function getActiveDamageTagLabels(
  weapon: CraftedWeaponV2,
  maxLabels = 2
): { labels: string[]; total: number; more: number } {
  const entries = weapon.activeDamageTags ?? []
  const total = entries.length
  const labels: string[] = []
  for (let i = 0; i < Math.min(maxLabels, entries.length); i++) {
    const e = entries[i]
    if (!e) continue
    labels.push(getDamageTagById(e.tagId)?.label ?? e.tagId)
  }
  return { labels, total, more: Math.max(0, total - maxLabels) }
}
