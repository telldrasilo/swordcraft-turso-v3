import { describe, expect, it } from 'vitest'
import type { MaterialNode } from '@/types/materials/material-core'
import { materialsByClass } from '@/data/materials'
import {
  metalsCollection,
  woodsCollection,
  leathersCollection,
  organicsCollection,
  specialMaterialsCollection,
} from '@/data/materials/collections'

function idSet(nodes: MaterialNode[]): Set<string> {
  return new Set(nodes.map((m) => m.identity.id))
}

describe('materialsByClass vs collections (пакет 1.4)', () => {
  it('metal / wood / leather / organic / other совпадают с коллекциями', () => {
    expect(idSet(materialsByClass.metal)).toEqual(idSet(metalsCollection))
    expect(idSet(materialsByClass.wood)).toEqual(idSet(woodsCollection))
    expect(idSet(materialsByClass.leather)).toEqual(idSet(leathersCollection))
    expect(idSet(materialsByClass.organic)).toEqual(idSet(organicsCollection))
    expect(idSet(materialsByClass.other)).toEqual(idSet(specialMaterialsCollection))
  })
})
