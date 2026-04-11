import { describe, expect, it } from 'vitest'
import {
  adaptMaterialNodeToMaterial,
  getMaterialAsLegacy,
} from '@/data/materials/adapter'
import { materialById } from '@/data/materials/library'
import { metalMaterials } from '@/data/materials/metals'
import { getMetalMaterialsRuntimeMerged, getMetalMaterialRuntimeMerged } from '@/data/materials/metals-runtime-merge'

describe('metals runtime merge (5.2)', () => {
  it('merged list matches catalog adaptation for every metalMaterials id', () => {
    const merged = getMetalMaterialsRuntimeMerged()
    expect(merged.length).toBe(metalMaterials.length)
    for (let i = 0; i < metalMaterials.length; i++) {
      const id = metalMaterials[i].id
      expect(merged[i].id).toBe(id)
      const node = materialById[id]
      expect(node, id).toBeDefined()
      if (!node) continue
      expect(merged[i]).toEqual(adaptMaterialNodeToMaterial(node))
    }
  })

  it('getMetalMaterialRuntimeMerged', () => {
    const m = getMetalMaterialRuntimeMerged('iron_alloy')
    expect(m).toBeDefined()
    expect(m?.id).toBe('iron_alloy')
    expect(m).toEqual(adaptMaterialNodeToMaterial(materialById.iron_alloy))
  })

  it('getMaterialAsLegacy совпадает с getMetalMaterialRuntimeMerged для всех id metalMaterials', () => {
    for (const row of metalMaterials) {
      expect(getMaterialAsLegacy(row.id)).toEqual(getMetalMaterialRuntimeMerged(row.id))
    }
  })

  it('каждый merged-металл с каталогом даёт стабильный id (потребители — getMetalMaterialsRuntimeMerged)', () => {
    for (const m of getMetalMaterialsRuntimeMerged()) {
      expect(m.id).toBeTruthy()
      expect(getMetalMaterialRuntimeMerged(m.id)?.id).toBe(m.id)
    }
  })
})
