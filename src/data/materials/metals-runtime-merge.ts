/**
 * **5.2:** единая точка, где legacy `metalMaterials` подменяются данными каталога в рантайме
 * (`adaptMaterialNodeToMaterial`), без дубля чисел для новых потребителей.
 */

import type { Material } from '@/types/craft-v2'
import { adaptMaterialNodeToMaterial } from '@/data/materials/adapter'
import { metalMaterials } from '@/data/materials/metals'
import { materialById } from '@/data/materials/library'

/** Список legacy-металлов для крафта: для каждого id из `metalMaterials` — `Material` из реестра, если узел есть. */
export function getMetalMaterialsRuntimeMerged(): Material[] {
  return metalMaterials.map((fallback) => {
    const node = materialById[fallback.id]
    if (node) return adaptMaterialNodeToMaterial(node)
    return fallback
  })
}

/** Один материал: каталог при наличии узла, иначе запись из `metalMaterials`. */
export function getMetalMaterialRuntimeMerged(id: string): Material | undefined {
  const node = materialById[id]
  if (node) return adaptMaterialNodeToMaterial(node)
  return metalMaterials.find((m) => m.id === id)
}
