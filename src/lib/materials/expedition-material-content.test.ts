/**
 * Фаза 1: минимальная полнота текста у MaterialNode, которые выпадают в экспедициях.
 */

import { describe, it, expect } from 'vitest'
import { materialById } from '@/data/materials/library'
import { LOCATION_REGISTRY } from '@/modules/expeditions/data/locations'
import { MISSION_REGISTRY } from '@/modules/expeditions/data/missions'
import { PHASE1_MIN_BASIC_LEN, PHASE1_MIN_DESC_LEN } from '@/lib/materials/phase1-content-thresholds'

function collectExpeditionLootMaterialIds(): Set<string> {
  const s = new Set<string>()
  for (const loc of LOCATION_REGISTRY) {
    for (const r of loc.resources) {
      s.add(r.materialId)
    }
  }
  for (const mission of MISSION_REGISTRY) {
    const resources = mission.resources
    if (!resources) continue
    for (const r of resources) {
      s.add(r.materialId)
    }
  }
  return s
}

describe('expedition droppable MaterialNode content (phase 1)', () => {
  const lootIds = [...collectExpeditionLootMaterialIds()].sort()

  it('every expedition loot id resolves to MaterialNode', () => {
    for (const id of lootIds) {
      expect(materialById[id], `missing node: ${id}`).toBeDefined()
    }
  })

  it(`summary.basic length >= ${PHASE1_MIN_BASIC_LEN} and description >= ${PHASE1_MIN_DESC_LEN}`, () => {
    for (const id of lootIds) {
      const node = materialById[id]
      expect(node, id).toBeDefined()
      if (node === undefined) throw new Error(`missing node: ${id}`)
      const basic = node.summary?.basic ?? ''
      const desc = node.description ?? ''
      expect(basic.length, `${id}: summary.basic too short`).toBeGreaterThanOrEqual(PHASE1_MIN_BASIC_LEN)
      expect(desc.length, `${id}: description too short`).toBeGreaterThanOrEqual(PHASE1_MIN_DESC_LEN)
    }
  })

  it('economy.tier and rarity in sane range', () => {
    for (const id of lootIds) {
      const node = materialById[id]
      expect(node, id).toBeDefined()
      if (node === undefined) throw new Error(`missing node: ${id}`)
      expect(node.economy.tier, id).toBeGreaterThanOrEqual(1)
      expect(node.economy.tier, id).toBeLessThanOrEqual(5)
      expect(node.economy.rarity, id).toBeGreaterThanOrEqual(0)
      expect(node.economy.rarity, id).toBeLessThanOrEqual(200)
    }
  })
})
