import { describe, expect, it } from 'vitest'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { initialGuildState } from '@/types/guild'
import {
  migrateCraftedWeaponV2DamageFields,
  normalizeWeaponDamageInMergedState,
} from './migrate-crafted-weapon-damage'

const baseWeapon = (): CraftedWeaponV2 => ({
  id: 'w1',
  recipeId: 'basic_sword',
  prefix: '',
  baseName: 'меч',
  suffix: '',
  fullName: 'меч',
  type: 'sword',
  tier: 1,
  materials: [],
  stats: {
    attack: 10,
    durability: 100,
    maxDurability: 100,
    weight: 1,
    balance: 50,
    soulCapacity: 10,
    repairPotential: 1,
    enchantSlots: 0,
    enchantPower: 0,
  },
  quality: 50,
  qualityGrade: 'common',
  qualityRank: 'C',
  warSoul: 0,
  maxWarSoul: 10,
  createdAt: 0,
  adventureCount: 0,
  sellPrice: 0,
  hiddenTags: [],
  combatMaterialId: 'iron',
  currentDurability: 100,
  epicMultiplier: 1,
  techniquesUsed: [],
  activeDamageTags: [],
  weaponLegacy: { hiddenMarks: [] },
  repairCondition: 'ok',
})

describe('migrateCraftedWeaponV2DamageFields', () => {
  it('добавляет дефолты, если полей не было', () => {
    const raw = { ...baseWeapon() } as Record<string, unknown>
    delete raw.activeDamageTags
    delete raw.weaponLegacy
    delete raw.repairCondition

    const out = migrateCraftedWeaponV2DamageFields(raw as unknown as CraftedWeaponV2)
    expect(out.activeDamageTags).toEqual([])
    expect(out.weaponLegacy.hiddenMarks).toEqual([])
    expect(out.repairCondition).toBe('ok')
  })

  it('нормализует скрытые маркеры и теги', () => {
    const out = migrateCraftedWeaponV2DamageFields({
      ...baseWeapon(),
      activeDamageTags: [
        { tagId: 'edge_chipping', severity: 'heavy' as const, sourceEventTemplateId: 'event_common_obstacle' },
      ],
      weaponLegacy: { hiddenMarks: ['mark_a'] },
      repairCondition: 'needsProperRepair',
    })
    expect(out.activeDamageTags[0]?.tagId).toBe('physical_slash_chip')
    expect(out.weaponLegacy.hiddenMarks).toEqual(['mark_a'])
    expect(out.repairCondition).toBe('needsProperRepair')
  })

  it('идемпотентен для уже полного оружия', () => {
    const w = baseWeapon()
    const once = migrateCraftedWeaponV2DamageFields(w)
    const twice = migrateCraftedWeaponV2DamageFields(once)
    expect(twice).toEqual(once)
  })

  it('нормализует наследие клинка и очередь авто-ремонта', () => {
    const out = migrateCraftedWeaponV2DamageFields({
      ...baseWeapon(),
      autoRepairReadyAt: 12345,
      weaponLegacy: {
        hiddenMarks: ['x'],
        bladeBondRepairCount: 2,
        deepInspectReadyAt: 50_000,
        lastDeepInspectAt: 99,
        deepInspectNotes: ['a', 'b'],
        deepInspectTagIds: ['physical_slash_chip'],
        autoRepairCompletedCount: 3,
        repairResolveCountByTagId: { physical_slash_chip: 2, physical_loose_fitting: 1 },
        archivedDamageTagIds: ['rust_spot'],
      },
    })
    expect(out.autoRepairReadyAt).toBe(12345)
    expect(out.weaponLegacy.bladeBondRepairCount).toBe(2)
    expect(out.weaponLegacy.deepInspectReadyAt).toBe(50_000)
    expect(out.weaponLegacy.lastDeepInspectAt).toBe(99)
    expect(out.weaponLegacy.deepInspectNotes).toEqual(['a', 'b'])
    expect(out.weaponLegacy.deepInspectTagIds).toEqual(['physical_slash_chip'])
    expect(out.weaponLegacy.autoRepairCompletedCount).toBe(3)
    expect(out.weaponLegacy.repairResolveCountByTagId).toEqual({
      physical_slash_chip: 2,
      physical_loose_fitting: 1,
    })
    expect(out.weaponLegacy.archivedDamageTagIds).toEqual(['rust_spot'])
  })

  it('нормализует счётчики диагностики §9.1.1 по тегам', () => {
    const out = migrateCraftedWeaponV2DamageFields({
      ...baseWeapon(),
      weaponLegacy: {
        hiddenMarks: [],
        repairDiagnosisPreciseCountByTagId: { edge_chipping: 1 },
        repairDiagnosisRiskyCountByTagId: { haft_loose: 2 },
        repairDiagnosisSkippedCountByTagId: { notch_deep: 0.9 },
      },
    })
    expect(out.weaponLegacy.repairDiagnosisPreciseCountByTagId).toEqual({ physical_slash_chip: 1 })
    expect(out.weaponLegacy.repairDiagnosisRiskyCountByTagId).toEqual({ physical_loose_fitting: 2 })
    expect(out.weaponLegacy.repairDiagnosisSkippedCountByTagId).toEqual({ physical_gouge_chunk: 0 })
  })

  it('нормализует autoRepairAwaitingForgeVisit', () => {
    const out = migrateCraftedWeaponV2DamageFields({
      ...baseWeapon(),
      autoRepairAwaitingForgeVisit: true as unknown as boolean,
    })
    expect(out.autoRepairAwaitingForgeVisit).toBe(true)
    const out2 = migrateCraftedWeaponV2DamageFields({ ...baseWeapon(), autoRepairAwaitingForgeVisit: false })
    expect(out2.autoRepairAwaitingForgeVisit).toBeUndefined()
  })
})

describe('normalizeWeaponDamageInMergedState', () => {
  it('обрабатывает inventory, guild и craftV2Persisted', () => {
    const raw = { ...baseWeapon() } as Record<string, unknown>
    delete raw.activeDamageTags
    delete raw.weaponLegacy
    delete raw.repairCondition

    const state = {
      weaponInventory: { weapons: [raw as unknown as CraftedWeaponV2] },
      guild: {
        ...initialGuildState,
        activeExpeditions: [
          {
            id: 'e1',
            expeditionId: 'x',
            expeditionName: 'x',
            expeditionIcon: 'x',
            adventurerId: 'a',
            adventurerName: 'a',
            weaponId: 'w',
            weaponName: 'w',
            weaponData: raw as unknown as CraftedWeaponV2,
            startedAt: 0,
            endsAt: 0,
            deposit: 0,
            suppliesCost: 0,
          },
        ],
        recoveryQuests: [
          {
            id: 'q1',
            lostWeaponId: 'w',
            lostWeaponData: raw as unknown as CraftedWeaponV2,
            originalExpeditionId: 'x',
            originalExpeditionName: 'x',
            cost: 0,
            duration: 0,
            status: 'available' as const,
          },
        ],
      },
      craftV2Persisted: { completedWeapon: raw as unknown as CraftedWeaponV2 },
    }

    normalizeWeaponDamageInMergedState(state)

    expect(state.weaponInventory.weapons[0]?.activeDamageTags).toEqual([])
    expect(state.guild.activeExpeditions[0]?.weaponData.activeDamageTags).toEqual([])
    expect(state.guild.recoveryQuests[0]?.lostWeaponData.repairCondition).toBe('ok')
    expect(state.craftV2Persisted?.completedWeapon?.weaponLegacy.hiddenMarks).toEqual([])
  })
})
