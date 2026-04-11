import { describe, expect, it } from 'vitest'
import { getAltarMaterialSourceTooltipText } from '@/lib/altar/altar-material-source-tooltip'

describe('getAltarMaterialSourceTooltipText', () => {
  it('mentions FF quest for artifact ids', () => {
    const t = getAltarMaterialSourceTooltipText('resonator_matrix')
    expect(t).toContain('Эхо забытой кузни')
  })

  it('lists expedition locations for iron ore', () => {
    const t = getAltarMaterialSourceTooltipText('iron_ore')
    expect(t.toLowerCase()).toContain('добывается')
  })

  it('falls back for ingots', () => {
    const t = getAltarMaterialSourceTooltipText('iron_alloy')
    expect(t).toMatch(/слиток|кузниц/i)
  })
})
