/**
 * Фаза **3.1** (roadmap): I/O `processingOperations` ⊆ каталог реестра.
 */
import { describe, expect, it } from 'vitest'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { materialById } from '@/data/materials/library'

describe('MaterialProcessingTechnique.processingOperations (phase 3.1 draft)', () => {
  it('all inputMaterialIds and outputMaterialIds reference catalog nodes', () => {
    for (const t of allMaterialProcessingTechniques) {
      const ops = t.processingOperations
      if (!ops?.length) continue
      for (const op of ops) {
        for (const mid of Object.keys(op.inputMaterialIds ?? {})) {
          expect(materialById[mid], `technique ${t.id} op ${op.id}: unknown input ${mid}`).toBeDefined()
        }
        for (const mid of Object.keys(op.outputMaterialIds ?? {})) {
          expect(materialById[mid], `technique ${t.id} op ${op.id}: unknown output ${mid}`).toBeDefined()
        }
      }
    }
  })

  it('exemplar forge_basic_iron_smelt defines ordered operations', () => {
    const t = allMaterialProcessingTechniques.find((x) => x.id === 'forge_basic_iron_smelt')
    expect(t).toBeDefined()
    expect(t?.processingOperations?.length).toBe(1)
    expect(t?.processingOperations?.[0].id).toBe('forge_basic_iron_smelt_op0')
    expect(t?.processingOperations?.[0].order).toBe(0)
  })

  it('phase 3.2 batch: несколько техник плавки с operations', () => {
    const withOps = allMaterialProcessingTechniques.filter((x) => (x.processingOperations?.length ?? 0) > 0)
    expect(withOps.length).toBeGreaterThanOrEqual(12)
    const ids = new Set(withOps.map((x) => x.id))
    expect(ids.has('forge_basic_iron_smelt')).toBe(true)
    expect(ids.has('forge_fine_iron_smelt')).toBe(true)
    expect(ids.has('forge_basic_copper_smelt')).toBe(true)
    expect(ids.has('forge_basic_steel_smelt')).toBe(true)
    expect(ids.has('forge_basic_wood_planks')).toBe(true)
    expect(ids.has('forge_basic_stone_blocks')).toBe(true)
    expect(ids.has('forge_basic_leather_tan')).toBe(true)
  })

  it('phase 3.4 pilot: эталонная техника объявляет targetSemanticProcessRoles', () => {
    const t = allMaterialProcessingTechniques.find((x) => x.id === 'forge_basic_iron_smelt')
    expect(t?.targetSemanticProcessRoles).toEqual(['refining_smelting'])
  })

  const REFINING_SEMANTIC_ROLES = ['refining_smelting', 'refining_tanning'] as const

  it('phase 3.4: техники с operations объявляют refining_smelting или refining_tanning', () => {
    for (const t of allMaterialProcessingTechniques) {
      if (!(t.processingOperations?.length ?? 0)) continue
      const roles = t.targetSemanticProcessRoles ?? []
      expect(roles.length > 0, `technique ${t.id}: expected targetSemanticProcessRoles`).toBe(true)
      const ok = REFINING_SEMANTIC_ROLES.some((r) => roles.includes(r))
      expect(ok, `technique ${t.id}: need one of ${REFINING_SEMANTIC_ROLES.join(', ')}`).toBe(true)
    }
  })
})
