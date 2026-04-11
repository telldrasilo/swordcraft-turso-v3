import { describe, expect, it } from 'vitest'
import { materialById } from '@/data/materials'
import {
  isBaseMetalSupersededByAlloyCatalogEntry,
  resolveEncyclopediaFocusMaterialId,
} from '@/lib/materials/encyclopedia-base-metal-alloy-display'

describe('encyclopedia base metal vs *_alloy (single visible row per family)', () => {
  it('скрывает базу при наличии пары *_alloy в каталоге', () => {
    const iron = materialById.iron
    const copper = materialById.copper
    expect(iron).toBeDefined()
    expect(copper).toBeDefined()
    if (!iron || !copper) throw new Error('fixture: iron/copper nodes')
    expect(isBaseMetalSupersededByAlloyCatalogEntry(iron, materialById)).toBe(true)
    expect(isBaseMetalSupersededByAlloyCatalogEntry(copper, materialById)).toBe(true)
  })

  it('не скрывает слиток и металлы без пары *_alloy', () => {
    const alloy = materialById.iron_alloy
    const bronze = materialById.bronze
    const coldIron = materialById.cold_iron
    if (!alloy || !bronze || !coldIron) throw new Error('fixture: alloy/bronze/cold_iron')
    expect(isBaseMetalSupersededByAlloyCatalogEntry(alloy, materialById)).toBe(false)
    expect(isBaseMetalSupersededByAlloyCatalogEntry(bronze, materialById)).toBe(false)
    expect(isBaseMetalSupersededByAlloyCatalogEntry(coldIron, materialById)).toBe(false)
  })

  it('resolveEncyclopediaFocusMaterialId перенаправляет iron → iron_alloy', () => {
    expect(resolveEncyclopediaFocusMaterialId('iron', materialById)).toBe('iron_alloy')
    expect(resolveEncyclopediaFocusMaterialId('iron_alloy', materialById)).toBe('iron_alloy')
  })
})
