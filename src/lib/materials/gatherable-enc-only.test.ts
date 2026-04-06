import { describe, expect, it } from 'vitest'
import { worldResourceNodes } from '@/data/materials/library/world-resource-nodes'
import { materialById } from '@/data/materials'
import { getResourceKeyForMaterial } from '@/lib/craft/inventory-check'
import {
  GATHERABLE_ENC_ONLY_MATERIAL_IDS,
  isGatherableEncOnlyMaterialId,
} from '@/lib/materials/gatherable-enc-only'

describe('gatherable ENC-only registry (TD-INV-2)', () => {
  it('нет дубликатов и стабильная длина (сверка с §4.1 аудита)', () => {
    const set = new Set(GATHERABLE_ENC_ONLY_MATERIAL_IDS)
    expect(set.size).toBe(GATHERABLE_ENC_ONLY_MATERIAL_IDS.length)
    /** После TD-INV-2 реестр пуст; новые немапящиеся id — TD-DOC-1. */
    expect(set.size).toBe(0)
  })

  it('каждый id есть в каталоге', () => {
    for (const id of GATHERABLE_ENC_ONLY_MATERIAL_IDS) {
      expect(materialById[id]).toBeDefined()
    }
  })

  it('ни один ENC-only id не мапится на ResourceKey', () => {
    for (const id of GATHERABLE_ENC_ONLY_MATERIAL_IDS) {
      expect(getResourceKeyForMaterial(id)).toBeNull()
    }
  })

  it('каждый добываемый узел — либо с маппингом, либо ENC-only (взаимоисключение)', () => {
    for (const node of worldResourceNodes) {
      const id = node.identity.id
      const mapped = getResourceKeyForMaterial(id) != null
      const encOnly = isGatherableEncOnlyMaterialId(id)
      expect(mapped || encOnly, `id ${id} должен быть в MATERIAL_TO_RESOURCE или в ENC-only`).toBe(
        true
      )
      expect(mapped && encOnly, `id ${id} не может быть одновременно`).toBe(false)
    }
  })
})
