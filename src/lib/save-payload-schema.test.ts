import { describe, expect, it } from 'vitest'
import {
  assertSaveJsonBounds,
  saveRequestBodySchema,
  SAVE_PAYLOAD_MAX_BYTES,
} from '@/lib/save-payload-schema'

describe('saveRequestBodySchema', () => {
  it('accepts minimal valid save object', () => {
    const r = saveRequestBodySchema.safeParse({
      player: { level: 5, experience: 100, fame: 0 },
      resources: { gold: 50 },
    })
    expect(r.success).toBe(true)
  })

  it('accepts craftV2Persisted and materialKnowledge', () => {
    const r = saveRequestBodySchema.safeParse({
      player: { level: 1 },
      craftV2Persisted: { stage: 'planning' },
      materialKnowledge: { iron: { expertise: 1 } },
    })
    expect(r.success).toBe(true)
  })

  it('accepts repairBenchWeaponId string or null', () => {
    expect(
      saveRequestBodySchema.safeParse({ repairBenchWeaponId: 'weapon-uuid-1' }).success
    ).toBe(true)
    expect(saveRequestBodySchema.safeParse({ repairBenchWeaponId: null }).success).toBe(true)
  })

  it('rejects non-object root', () => {
    const r = saveRequestBodySchema.safeParse([])
    expect(r.success).toBe(false)
  })

  it('rejects workers array exceeding max length', () => {
    const r = saveRequestBodySchema.safeParse({
      workers: Array.from({ length: 2500 }, () => ({})),
    })
    expect(r.success).toBe(false)
  })

  it('rejects deeply nested payload', () => {
    let deep: Record<string, unknown> = { x: 1 }
    for (let i = 0; i < 20; i++) {
      deep = { nest: deep }
    }
    const r = saveRequestBodySchema.safeParse({ resources: deep })
    expect(r.success).toBe(false)
  })

  it('rejects saveVersion out of int range', () => {
    const r = saveRequestBodySchema.safeParse({ saveVersion: 1_000_000 })
    expect(r.success).toBe(false)
  })

  it('rejects negative playTime', () => {
    const r = saveRequestBodySchema.safeParse({ playTime: -1 })
    expect(r.success).toBe(false)
  })

  it('rejects maxWorkers above cap', () => {
    const r = saveRequestBodySchema.safeParse({ maxWorkers: 5000 })
    expect(r.success).toBe(false)
  })

  it('rejects buildings array exceeding max length', () => {
    const r = saveRequestBodySchema.safeParse({
      buildings: Array.from({ length: 600 }, () => ({})),
    })
    expect(r.success).toBe(false)
  })

  it('rejects non-array workers when present', () => {
    const r = saveRequestBodySchema.safeParse({ workers: { not: 'array' } })
    expect(r.success).toBe(false)
  })
})

describe('assertSaveJsonBounds', () => {
  it('allows reasonable tree', () => {
    expect(() =>
      assertSaveJsonBounds({ a: [1, { b: 2 }], c: 'ok' })
    ).not.toThrow()
  })

  it('throws on excessive depth', () => {
    let deep: unknown = 1
    for (let i = 0; i < 25; i++) {
      deep = { k: deep }
    }
    expect(() => assertSaveJsonBounds(deep)).toThrow('deep')
  })

  it('throws on excessive node count', () => {
    const wide: unknown[] = Array.from({ length: 26_000 }, () => 1)
    expect(() => assertSaveJsonBounds(wide)).toThrow('large')
  })
})

describe('SAVE_PAYLOAD_MAX_BYTES', () => {
  it('is 2 MiB', () => {
    expect(SAVE_PAYLOAD_MAX_BYTES).toBe(2 * 1024 * 1024)
  })
})
