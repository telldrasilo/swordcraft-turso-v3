import { describe, expect, it } from 'vitest'
import { allMaterials, materialById } from '@/data/materials'
import { isBaseMetalSupersededByAlloyCatalogEntry } from '@/lib/materials/encyclopedia-base-metal-alloy-display'

/**
 * §10 MATERIALS_SINGLE_SOURCE_ROADMAP: пара «базовый металл + слиток» — оба узла в реестре,
 * без скрытого слияния id (UX дедуп только в списке ENC).
 */
describe('material economy: base metal and *_alloy pairs (§10)', () => {
  it('для каждой базы со слитком в каталоге узел *_alloy существует и класс metal', () => {
    for (const m of allMaterials) {
      if (!isBaseMetalSupersededByAlloyCatalogEntry(m, materialById)) continue
      const alloyId = `${m.identity.id}_alloy`
      const alloy = materialById[alloyId]
      expect(alloy, `ожидался узел слитка ${alloyId} для базы ${m.identity.id}`).toBeDefined()
      if (!alloy) continue
      expect(alloy.identity.class).toBe('metal')
    }
  })
})
