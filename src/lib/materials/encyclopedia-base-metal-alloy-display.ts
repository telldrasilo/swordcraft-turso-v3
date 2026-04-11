import type { MaterialNode } from '@/types/materials/material-core'

/**
 * В каталоге базовый металл (`iron`, `copper`, …) и слиток (`*_alloy`) — разные узлы.
 * Для игрока в энциклопедии остаётся одна строка на семейство: слиток (канон склада / префиксов).
 */
export function isBaseMetalSupersededByAlloyCatalogEntry(
  node: MaterialNode,
  materialById: Record<string, MaterialNode | undefined>,
): boolean {
  if (node.identity.class !== 'metal') return false
  const id = node.identity.id
  if (id.endsWith('_alloy')) return false
  return materialById[`${id}_alloy`] !== undefined
}

/** Навигация в ENC: фокус на скрытую базу ведёт к видимому слитку. */
export function resolveEncyclopediaFocusMaterialId(
  materialId: string,
  materialById: Record<string, MaterialNode | undefined>,
): string {
  const node = materialById[materialId]
  if (!node) return materialId
  if (isBaseMetalSupersededByAlloyCatalogEntry(node, materialById)) {
    return `${materialId}_alloy`
  }
  return materialId
}
