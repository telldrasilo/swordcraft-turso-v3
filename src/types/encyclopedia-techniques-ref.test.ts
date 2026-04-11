import { describe, expect, it } from 'vitest'
import { isValidEncyclopediaTechniqueRef } from '@/types/encyclopedia-techniques'

describe('isValidEncyclopediaTechniqueRef', () => {
  it('accepts valid ref', () => {
    expect(isValidEncyclopediaTechniqueRef({ kind: 'craft', id: 'basic_forging' })).toBe(true)
  })

  it('rejects wrong kind or empty id', () => {
    expect(isValidEncyclopediaTechniqueRef({ kind: 'nope', id: 'x' })).toBe(false)
    expect(isValidEncyclopediaTechniqueRef({ kind: 'repair', id: '' })).toBe(false)
    expect(isValidEncyclopediaTechniqueRef(null)).toBe(false)
    expect(isValidEncyclopediaTechniqueRef({ kind: 'craft' })).toBe(false)
  })
})
