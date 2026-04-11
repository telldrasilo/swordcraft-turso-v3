import { describe, expect, it } from 'vitest'
import { getMaterialAcquisitionHintLines } from '@/lib/materials/material-acquisition-hints'

describe('material-acquisition-hints (ENC 5.1)', () => {
  it('tanned_leather: обработка и горн', () => {
    const lines = getMaterialAcquisitionHintLines('tanned_leather')
    expect(lines.some((l) => l.startsWith('Обработка:') && l.includes('кожи'))).toBe(true)
    expect(lines.some((l) => l.startsWith('Горн / переработка:'))).toBe(true)
  })

  it('processed_wood: горн (доски)', () => {
    const lines = getMaterialAcquisitionHintLines('processed_wood')
    expect(lines.some((l) => l.includes('Доски'))).toBe(true)
  })
})
