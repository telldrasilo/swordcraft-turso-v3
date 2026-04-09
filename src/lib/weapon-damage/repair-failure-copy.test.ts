import { describe, expect, it } from 'vitest'
import type { RepairResult, WeaponRepairCalc } from '@/data/repair-system'
import { describeTechniqueRepairFailureMessage } from '@/lib/weapon-damage/repair-failure-copy'

const calc = (tier: WeaponRepairCalc['tier']): WeaponRepairCalc => ({
  tier,
  durability: 50,
  maxDurability: 100,
  warSoul: 0,
  attack: 10,
  epicMultiplier: 1,
  materials: {},
})

const baseFail = (critical: boolean): RepairResult => ({
  success: false,
  durabilityRestored: 0,
  maxDurabilityBefore: 100,
  maxDurabilityAfter: 100,
  soulLost: 0,
  attackLost: 0,
  epicLost: 0,
  criticalFailure: critical,
})

describe('describeTechniqueRepairFailureMessage', () => {
  it('critical + workbench mentions finale', () => {
    const msg = describeTechniqueRepairFailureMessage({
      repairCalc: calc('common'),
      roll: baseFail(true),
      opts: undefined,
      activeTagIds: [],
      workbenchQueueFinale: true,
    })
    expect(msg).toContain('Финальная закалка')
  })

  it('wrong hypothesis takes priority over tier', () => {
    const msg = describeTechniqueRepairFailureMessage({
      repairCalc: calc('mythic'),
      roll: baseFail(false),
      opts: {
        diagnosis: {
          mode: 'manual_inspection',
          hypothesisByTagId: { crack: false },
        },
      },
      activeTagIds: ['crack'],
      workbenchQueueFinale: false,
    })
    expect(msg).toContain('Осмотр ошибся')
  })

  it('epic tier penalty line when no other specific reason', () => {
    const msg = describeTechniqueRepairFailureMessage({
      repairCalc: calc('epic'),
      roll: baseFail(false),
      opts: undefined,
      activeTagIds: [],
      workbenchQueueFinale: false,
    })
    expect(msg).toContain('высокого класса')
  })
})
