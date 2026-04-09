import { describe, expect, it } from 'vitest'
import { validateExpeditionStart } from '@/lib/expedition-start-validation'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { Adventurer, ActiveExpedition } from '@/types/guild'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

const expedition: ExpeditionTemplate = {
  id: 'e1',
  name: 'Test',
  description: '',
  icon: '🗺',
  type: 'scout',
  difficulty: 'easy',
  duration: 60,
  minGuildLevel: 1,
  minWeaponAttack: 10,
  failureChance: 10,
  weaponLossChance: 5,
  recommendedWeaponTypes: [],
  cost: { supplies: 1, deposit: 1 },
  reward: { baseGold: 50, baseWarSoul: 3 },
}

function adv(id: string, minAttack = 0): Adventurer {
  return {
    id,
    name: 'Hero',
    skill: 20,
    traits: [],
    uniqueBonuses: [],
    requirements: { minAttack },
    portrait: 0,
    expiresAt: 9_999_999,
    createdAt: 0,
  }
}

function weapon(
  id: string,
  attack: number,
  durability: number,
  extra?: {
    maxDurability?: number
    activeDamageTags?: CraftedWeaponV2['activeDamageTags']
    repairCondition?: CraftedWeaponV2['repairCondition']
  }
): CraftedWeaponV2 {
  const maxDurability = extra?.maxDurability ?? 100
  return {
    id,
    stats: { attack, maxDurability, durability },
    currentDurability: durability,
    activeDamageTags: extra?.activeDamageTags,
    repairCondition: extra?.repairCondition ?? 'ok',
  } as unknown as CraftedWeaponV2
}

describe('validateExpeditionStart', () => {
  it('allows valid combination', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 50),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(true)
    expect(r.reason).toBe('')
  })

  it('blocks when active expedition cap reached', () => {
    const active: ActiveExpedition[] = [
      {
        id: 'x1',
        expeditionId: 'e0',
        expeditionName: '',
        expeditionIcon: '',
        adventurerId: 'o1',
        adventurerName: '',
        weaponId: 'ow1',
        weaponName: '',
        weaponData: weapon('ow1', 10, 50),
        startedAt: 0,
        endsAt: 1,
        deposit: 0,
        suppliesCost: 0,
      },
    ]
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 50),
      guildLevel: 1,
      activeExpeditions: active,
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/лимит/i)
  })

  it('blocks low durability ratio', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 14, { maxDurability: 100 }),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/прочност/i)
  })

  it('allows visible damage tags when durability is at least 50%', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 60, {
        activeDamageTags: [{ tagId: 'physical_slash_chip', severity: 'light', appliedAt: 0 }],
      }),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(true)
    expect(r.reason).toBe('')
  })

  it('blocks visible damage tags when durability is below 50%', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 49, {
        activeDamageTags: [{ tagId: 'physical_slash_chip', severity: 'light', appliedAt: 0 }],
      }),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/50%/i)
  })

  it('blocks needsProperRepair', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 12, 100, { repairCondition: 'needsProperRepair' }),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/Ремонт|починк/i)
  })

  it('blocks weapon below expedition min attack', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w1', 8, 50),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/атака/i)
  })

  it('blocks weapon already on expedition', () => {
    const active: ActiveExpedition[] = [
      {
        id: 'x1',
        expeditionId: 'e0',
        expeditionName: '',
        expeditionIcon: '',
        adventurerId: 'o1',
        adventurerName: '',
        weaponId: 'w1',
        weaponName: '',
        weaponData: weapon('w1', 12, 50),
        startedAt: 0,
        endsAt: 1,
        deposit: 0,
        suppliesCost: 0,
      },
    ]
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a2'),
      weapon: weapon('w1', 12, 50),
      guildLevel: 10,
      activeExpeditions: active,
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/Оружие уже/i)
  })

  it('blocks adventurer already on expedition', () => {
    const active: ActiveExpedition[] = [
      {
        id: 'x1',
        expeditionId: 'e0',
        expeditionName: '',
        expeditionIcon: '',
        adventurerId: 'a1',
        adventurerName: '',
        weaponId: 'ow1',
        weaponName: '',
        weaponData: weapon('ow1', 12, 50),
        startedAt: 0,
        endsAt: 1,
        deposit: 0,
        suppliesCost: 0,
      },
    ]
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w2', 12, 50),
      guildLevel: 10,
      activeExpeditions: active,
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/Искатель уже/i)
  })

  it('blocks when below adventurer min attack requirement', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1', 20),
      weapon: weapon('w1', 15, 50),
      guildLevel: 3,
      activeExpeditions: [],
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/Искатель требует/i)
  })

  it('blocks weapon in active workbench session queue', () => {
    const r = validateExpeditionStart({
      expedition,
      adventurer: adv('a1'),
      weapon: weapon('w-bench', 12, 50),
      guildLevel: 3,
      activeExpeditions: [],
      workbenchEligibility: {
        workbenchQueue: [
          {
            kind: 'repair',
            queueItemId: 'q1',
            weaponId: 'w-bench',
            status: 'running',
            techniqueIds: [],
            queuedAt: 0,
          },
        ],
        repairTechniqueStageRun: { weaponId: 'w-bench', source: 'queue' },
      },
    })
    expect(r.can).toBe(false)
    expect(r.reason).toMatch(/верстак/i)
  })
})
