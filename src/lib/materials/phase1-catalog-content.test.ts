/**
 * Фаза 1: минимальная полнота `summary` / `description` для всего канона `allMaterials`.
 * Экспедиционный дроп дополнительно проверяется в `expedition-material-content.test.ts` (тот же порог).
 */

import { describe, it, expect } from 'vitest'
import { allMaterials } from '@/data/materials/library'
import { PHASE1_MIN_BASIC_LEN, PHASE1_MIN_DESC_LEN } from '@/lib/materials/phase1-content-thresholds'

describe('full catalog MaterialNode text content (phase 1)', () => {
  it('unique identity.id across allMaterials', () => {
    const ids = allMaterials.map((m) => m.identity.id)
    expect(new Set(ids).size, 'duplicate id in allMaterials').toBe(ids.length)
  })

  it(`summary.basic length >= ${PHASE1_MIN_BASIC_LEN} and description >= ${PHASE1_MIN_DESC_LEN}`, () => {
    for (const node of allMaterials) {
      const id = node.identity.id
      const basic = node.summary?.basic ?? ''
      const desc = node.description ?? ''
      expect(basic.length, `${id}: summary.basic too short`).toBeGreaterThanOrEqual(PHASE1_MIN_BASIC_LEN)
      expect(desc.length, `${id}: description too short`).toBeGreaterThanOrEqual(PHASE1_MIN_DESC_LEN)
    }
  })

  it('economy.tier and rarity in sane range', () => {
    for (const node of allMaterials) {
      const id = node.identity.id
      expect(node.economy.tier, id).toBeGreaterThanOrEqual(1)
      expect(node.economy.tier, id).toBeLessThanOrEqual(5)
      expect(node.economy.rarity, id).toBeGreaterThanOrEqual(0)
      expect(node.economy.rarity, id).toBeLessThanOrEqual(200)
    }
  })
})
