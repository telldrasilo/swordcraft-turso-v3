import { describe, expect, it } from 'vitest'
import { TIER_NUMBER_TO_STRING } from '@/lib/store-utils/constants'

describe('TIER_NUMBER_TO_STRING', () => {
  it('maps numeric tier 1 to common', () => {
    expect(TIER_NUMBER_TO_STRING[1]).toBe('common')
  })

  it('maps tier 6 to mythic', () => {
    expect(TIER_NUMBER_TO_STRING[6]).toBe('mythic')
  })
})
