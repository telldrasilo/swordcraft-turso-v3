import { describe, it, expect } from 'vitest'
import { getDisplayCategory } from '@/types/materials/material-core'
import { coal } from '@/data/materials/library/fuels/coal'
import { wild_herbs } from '@/data/materials/library/organics/wild_herbs'
import { peat } from '@/data/materials/library/fuels/peat'
import { ironOre } from '@/data/materials/library/ores/iron_ore'

describe('getDisplayCategory (фаза 5 ENC)', () => {
  it('топливо по тегу fuel', () => {
    expect(getDisplayCategory(coal)).toBe('fuels')
  })

  it('торф: тег fuel важнее класса organic', () => {
    expect(getDisplayCategory(peat)).toBe('fuels')
  })

  it('травы: organic + herb', () => {
    expect(getDisplayCategory(wild_herbs)).toBe('herbs')
  })

  it('руда', () => {
    expect(getDisplayCategory(ironOre)).toBe('ores')
  })
})
