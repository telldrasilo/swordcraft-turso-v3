import { describe, expect, it } from 'vitest'
import { collectReforgeRegistryCatalogMaterialIds } from '@/data/reforge/reforge-techniques-registry'
import { allTechniques } from '@/data/techniques'
import { materialById } from '@/data/materials'
import {
  collectCombatTechniqueRequiredCatalogMaterialIds,
  collectMaterialStudyTechniqueCatalogMaterialIds,
  collectRepairReforgeCatalogMaterialIds,
  findDuplicateRegistryMaterialIds,
  getRegistryMaterialIds,
  runMaterialCatalogContractChecks,
} from './material-catalog-contract'

describe('material-catalog-contract (MATERIALS_SINGLE_SOURCE_ROADMAP §8)', () => {
  it('реестр allMaterials без дубликатов id', () => {
    expect(findDuplicateRegistryMaterialIds(), 'duplicate ids').toEqual([])
    expect(getRegistryMaterialIds().size).toBeGreaterThan(0)
  })

  it('B ⊆ A: все сканеры только на id из реестра', () => {
    const violations = runMaterialCatalogContractChecks()
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  })

  it('0.2: catalogMaterialSpendIds перековки попадают в collectRepairReforgeCatalogMaterialIds', () => {
    const fromReforge = collectReforgeRegistryCatalogMaterialIds()
    expect(fromReforge).toContain('iron_alloy')
    expect(collectRepairReforgeCatalogMaterialIds()).toContain('iron_alloy')
  })

  it('0.2: catalogMaterialSpendIds ремонта (шаблоны) попадают в collectRepairReforgeCatalogMaterialIds', () => {
    expect(collectRepairReforgeCatalogMaterialIds()).toContain('iron')
  })

  it('0.2: material-study-techniques попадают в сканер контракта', () => {
    const ids = collectMaterialStudyTechniqueCatalogMaterialIds()
    expect(ids).toContain('coal')
    expect(ids).toContain('birch')
    expect(ids).toContain('basic_stone')
    expect(getRegistryMaterialIds().size).toBeGreaterThan(0)
    for (const id of ids) {
      expect(getRegistryMaterialIds().has(id), id).toBe(true)
    }
  })

  it('0.2: боевые техники — requiredMaterials только из реестра в collectCombatTechniqueRequiredCatalogMaterialIds', () => {
    const A = getRegistryMaterialIds()
    const collected = new Set(collectCombatTechniqueRequiredCatalogMaterialIds())
    for (const t of allTechniques) {
      for (const id of t.requiredMaterials ?? []) {
        if (materialById[id] != null) {
          expect(collected.has(id), `missing catalog id from technique ${t.id}: ${id}`).toBe(true)
          expect(A.has(id), id).toBe(true)
        }
      }
    }
    for (const id of collected) {
      expect(A.has(id), id).toBe(true)
    }
  })
})
