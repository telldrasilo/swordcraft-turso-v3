import { describe, expect, it } from 'vitest'
import { getExpeditionOutcomeSegments } from '@/lib/expedition-outcome-segments'

describe('getExpeditionOutcomeSegments', () => {
  it('80% success, 10% crit of success → 20 fail, 72 ok, 8 crit', () => {
    const r = getExpeditionOutcomeSegments(80, 10)
    expect(r.failPct).toBe(20)
    expect(r.critPct).toBe(8)
    expect(r.successNoCritPct).toBe(72)
    expect(r.failPct + r.successNoCritPct + r.critPct).toBeCloseTo(100, 5)
  })

  it('100% success, 50% crit → 0 fail, 50 ok, 50 crit', () => {
    const r = getExpeditionOutcomeSegments(100, 50)
    expect(r.failPct).toBe(0)
    expect(r.successNoCritPct).toBe(50)
    expect(r.critPct).toBe(50)
  })

  it('0% success → all failure', () => {
    const r = getExpeditionOutcomeSegments(0, 25)
    expect(r.failPct).toBe(100)
    expect(r.successNoCritPct).toBe(0)
    expect(r.critPct).toBe(0)
  })
})
