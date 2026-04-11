import { describe, expect, it } from 'vitest'
import {
  getCatalogOutputMaterialIdsForProcessingTechnique,
  getMaterialIdToProcessingTechniqueIds,
  getProcessingTechniqueIdsProducingMaterial,
} from '@/lib/materials/material-processing-output-index'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'

describe('material-processing-output-index (roadmap §10)', () => {
  it('targetCatalogMaterialIds ⊆ выходов техники', () => {
    for (const tech of allMaterialProcessingTechniques) {
      const outputs = new Set(getCatalogOutputMaterialIdsForProcessingTechnique(tech))
      for (const target of tech.targetCatalogMaterialIds) {
        expect(
          outputs.has(target),
          `technique ${tech.id}: target ${target} не среди выходов (${[...outputs].join(', ')})`
        ).toBe(true)
      }
    }
  })

  it('обратимость: каждый выход индексирует технику', () => {
    for (const tech of allMaterialProcessingTechniques) {
      for (const mid of getCatalogOutputMaterialIdsForProcessingTechnique(tech)) {
        expect(
          getProcessingTechniqueIdsProducingMaterial(mid).includes(tech.id),
          `material ${mid} должен ссылать на ${tech.id}`
        ).toBe(true)
      }
    }
  })

  it('снимки: iron_alloy, tanned_leather, processed_wood', () => {
    expect(getProcessingTechniqueIdsProducingMaterial('iron_alloy')).toContain('forge_basic_iron_smelt')
    expect(getProcessingTechniqueIdsProducingMaterial('tanned_leather')).toContain(
      'forge_basic_leather_tan'
    )
    expect(getProcessingTechniqueIdsProducingMaterial('processed_wood')).toContain(
      'forge_basic_wood_planks'
    )
  })

  it('кеш getMaterialIdToProcessingTechniqueIds идемпотентен по ссылке', () => {
    const a = getMaterialIdToProcessingTechniqueIds()
    const b = getMaterialIdToProcessingTechniqueIds()
    expect(a).toBe(b)
  })
})
