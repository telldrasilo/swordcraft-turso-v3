import { describe, expect, it } from 'vitest'
import { getReforgeTechniqueById } from '@/data/reforge/reforge-techniques-registry'
import { buildReforgeCatalogMaterialDebit } from '@/lib/reforge/reforge-catalog-spend'

describe('buildReforgeCatalogMaterialDebit (0.2 stash spend)', () => {
  it('buff attack 01 требует iron_alloy', () => {
    const t = getReforgeTechniqueById('reforge_buff_attack_01')
    expect(t).toBeDefined()
    if (!t) return
    expect(buildReforgeCatalogMaterialDebit(t)).toEqual({ iron_alloy: 1 })
  })

  it('техника без catalogMaterialSpendIds даёт пустой дебет', () => {
    const t = getReforgeTechniqueById('reforge_awaken_scar_01')
    expect(t).toBeDefined()
    if (!t) return
    expect(buildReforgeCatalogMaterialDebit(t)).toEqual({})
  })

  it('buff max durability 01 и attack 02 — iron_alloy', () => {
    const a = getReforgeTechniqueById('reforge_buff_max_durability_01')
    const b = getReforgeTechniqueById('reforge_buff_attack_02')
    expect(a && b).toBeTruthy()
    if (!a || !b) return
    expect(buildReforgeCatalogMaterialDebit(a)).toEqual({ iron_alloy: 1 })
    expect(buildReforgeCatalogMaterialDebit(b)).toEqual({ iron_alloy: 1 })
  })

  it('buff max durability 02 — steel', () => {
    const t = getReforgeTechniqueById('reforge_buff_max_durability_02')
    expect(t).toBeDefined()
    if (!t) return
    expect(buildReforgeCatalogMaterialDebit(t)).toEqual({ steel: 1 })
  })
})
