import { describe, expect, it } from 'vitest'
import { saveRequestBodySchema, SAVE_PAYLOAD_MAX_BYTES } from '@/lib/save-payload-schema'

describe('saveRequestBodySchema', () => {
  it('accepts minimal valid save object', () => {
    const r = saveRequestBodySchema.safeParse({
      player: { level: 5, experience: 100, fame: 0 },
      resources: { gold: 50 },
    })
    expect(r.success).toBe(true)
  })

  it('rejects non-object root', () => {
    const r = saveRequestBodySchema.safeParse([])
    expect(r.success).toBe(false)
  })
})

describe('SAVE_PAYLOAD_MAX_BYTES', () => {
  it('is 2 MiB', () => {
    expect(SAVE_PAYLOAD_MAX_BYTES).toBe(2 * 1024 * 1024)
  })
})
