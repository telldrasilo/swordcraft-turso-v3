/**
 * Прелюдия **5.2**: legacy `metalMaterials` должны иметь узел в каталоге (`materialById`).
 */
import { describe, expect, it } from 'vitest'
import { metalMaterials } from '@/data/materials/metals'
import { materialById } from '@/data/materials/library'

describe('metalMaterials vs materialRegistry (phase 5.2 prelude)', () => {
  it('every metalMaterials[].id exists in materialById', () => {
    for (const m of metalMaterials) {
      expect(
        materialById[m.id],
        `metalMaterials id "${m.id}" missing in catalog — закрыть в пакете 5.2`
      ).toBeDefined()
    }
  })
})
