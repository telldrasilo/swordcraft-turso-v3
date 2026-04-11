import type { MaterialNode } from '@/types/materials/material-core'

/**
 * Фаза **5.1** roadmap: сравнение узлов для сортировки списка ENC (tier → имя).
 * UI компонентов может переиспользовать; источник чисел — `economy.tier` каталога.
 */
export function compareMaterialNodesForEncyclopediaList(a: MaterialNode, b: MaterialNode): number {
  const ta = a.economy.tier
  const tb = b.economy.tier
  if (ta !== tb) return ta - tb
  return a.identity.name.localeCompare(b.identity.name, 'ru')
}
