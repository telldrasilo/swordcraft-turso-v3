/**
 * Хвост A roadmap: все materialId из маппинга крафта присутствуют в каталоге library.
 */
import { describe, expect, it } from 'vitest'
import { materialById } from '@/data/materials'
import { CRAFT_MAPPED_MATERIAL_IDS, CRAFT_ALLOY_MATERIAL_IDS } from '@/lib/craft/inventory-check'

describe('inventory-check catalog sync (phase A tail)', () => {
  it('every CRAFT_MAPPED_MATERIAL_ID exists in materialById', () => {
    const missing = CRAFT_MAPPED_MATERIAL_IDS.filter(id => !materialById[id])
    expect(missing, `missing library nodes: ${missing.join(', ')}`).toEqual([])
  })

  it('every CRAFT_ALLOY_MATERIAL_ID exists in materialById', () => {
    const missing = CRAFT_ALLOY_MATERIAL_IDS.filter(id => !materialById[id])
    expect(missing, `missing library nodes: ${missing.join(', ')}`).toEqual([])
  })
})
