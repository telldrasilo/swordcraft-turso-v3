/**
 * Реестр материалов модуля экспедиций.
 * Имена, описания и id синхронизированы с MaterialNode (materialById) проекта.
 */

import { allMaterials } from '@/data/materials/library'
import type { MaterialNode } from '@/types/materials/material-core'
import type { Material, MaterialCategory, Rarity } from '../../types'
import { LOCATION_REGISTRY } from '../locations'

function economyRarityToRarity(r: number): Rarity {
  if (r <= 35) return 'common'
  if (r <= 52) return 'uncommon'
  if (r <= 72) return 'rare'
  if (r <= 90) return 'epic'
  return 'legendary'
}

function materialNodeToCategory(node: MaterialNode): MaterialCategory {
  const cls = node.identity.class
  const tags = node.identity.tags
  if (cls === 'metal') return 'ingot'
  if (cls === 'wood') return 'wood'
  if (cls === 'leather') return 'leather'
  if (cls === 'mineral') {
    if (tags.includes('ore')) return 'ore'
    if (tags.includes('gem')) return 'gem'
    return 'stone'
  }
  if (cls === 'organic') return 'herb'
  if (cls === 'other') return 'special'
  return 'component'
}

const sourceLocationsByMaterialId: Map<string, string[]> = (() => {
  const map = new Map<string, Set<string>>()
  for (const loc of LOCATION_REGISTRY) {
    for (const res of loc.resources) {
      let ids = map.get(res.materialId)
      if (!ids) {
        ids = new Set()
        map.set(res.materialId, ids)
      }
      ids.add(loc.id)
    }
  }
  return new Map(
    [...map.entries()].map(([id, set]) => [id, [...set]])
  )
})()

function nodeToExpeditionMaterial(node: MaterialNode): Material {
  return {
    id: node.identity.id,
    name: node.identity.name,
    description: node.description,
    category: materialNodeToCategory(node),
    rarity: economyRarityToRarity(node.economy.rarity),
    sourceLocations: sourceLocationsByMaterialId.get(node.identity.id),
    icon: node.icon,
  }
}

/** Полный реестр: 1:1 с узлами библиотеки проекта */
export const MATERIAL_REGISTRY: Material[] = allMaterials.map(nodeToExpeditionMaterial)

export function getMaterialById(id: string): Material | undefined {
  return MATERIAL_REGISTRY.find((mat) => mat.id === id)
}

export function getMaterialsByRarity(rarity: Rarity): Material[] {
  return MATERIAL_REGISTRY.filter((mat) => mat.rarity === rarity)
}

export function getMaterialsByCategory(category: MaterialCategory): Material[] {
  return MATERIAL_REGISTRY.filter((mat) => mat.category === category)
}

export function getMaterialsForLocation(locationId: string): Material[] {
  return MATERIAL_REGISTRY.filter((mat) => mat.sourceLocations?.includes(locationId))
}

export function getMaterialName(materialId: string): string {
  return getMaterialById(materialId)?.name ?? materialId
}
