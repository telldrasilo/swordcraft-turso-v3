import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialResources } from '@/store/slices/resources-slice'
import { buildRepairCrossSlice } from './repair-cross-slice'
import {
  DURABILITY_MAINTENANCE_TECHNIQUE_ID,
} from '@/data/weapon-damage/repair-techniques-registry'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

afterEach(() => {
  vi.restoreAllMocks()
})

function mockState(over: Partial<ReturnType<typeof baseState>> = {}) {
  return { ...baseState(), ...over }
}

function baseState() {
  return {
    unlockedRepairTechniqueIds: [] as string[],
    repairBenchWeaponId: null as string | null,
    repairBenchTechniqueDraft: null as { weaponId: string; techniqueIds: string[] } | null,
    repairTechniqueStageRun: null as import('@/store/slices/craft-slice').RepairTechniqueStageRunState | null,
    weaponInventory: { weapons: [] as import('@/types/craft-v2').CraftedWeaponV2[] },
    player: { level: 1 },
    resources: { ...initialResources },
    materialStash: {} as Record<string, number>,
    spendResource: vi.fn(() => true),
    spendCraftingCostWithStash: vi.fn(() => true),
    canAfford: vi.fn(() => true),
  }
}

describe('buildRepairCrossSlice', () => {
  it('executeWeaponRepairByTechniques returns error when weapon missing', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockState())
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques('no_such', [DURABILITY_MAINTENANCE_TECHNIQUE_ID])
    expect(r.success).toBe(false)
    expect(r.error).toBe('Оружие не найдено')
  })

  it('getRepairOptions returns empty when weapon missing', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockState())
    const { getRepairOptions } = buildRepairCrossSlice(set, get)
    expect(getRepairOptions('none')).toEqual([])
  })

  it('executeWeaponRepairByTechniques rejects wrong technique when no visible tags', () => {
    const set = vi.fn()
    const weapon = {
      id: 'w1',
      recipeId: 'basic_sword',
      activeDamageTags: [],
      currentDurability: 50,
      tier: 1,
      materials: [{ partId: 'blade', materialId: 'iron', materialName: 'Железо', quantity: 2 }],
      stats: { durability: 50, maxDurability: 100, attack: 10 },
    } as unknown as CraftedWeaponV2
    const get = vi.fn(() =>
      mockState({
        weaponInventory: { weapons: [weapon] },
      })
    )
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques('w1', ['edge_truing'])
    expect(r.success).toBe(false)
    expect(r.error).toMatch(/восстановления прочности/i)
  })

  it('executeWeaponRepairByTechniques with durability maintenance repairs durability when no tags', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const set = vi.fn()
    const weapon = {
      id: 'w1',
      recipeId: 'basic_sword',
      prefix: '',
      baseName: 'меч',
      suffix: '',
      fullName: 'меч',
      type: 'sword',
      activeDamageTags: [],
      currentDurability: 50,
      tier: 1,
      materials: [{ partId: 'blade', materialId: 'iron', materialName: 'Железо', quantity: 2 }],
      stats: {
        durability: 50,
        maxDurability: 100,
        attack: 10,
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
      sellPrice: 10,
      hiddenTags: [],
      combatMaterialId: 'iron',
      epicMultiplier: 1,
      techniquesUsed: [],
      weaponLegacy: { hiddenMarks: [] },
      repairCondition: 'ok',
    } as CraftedWeaponV2
    const get = vi.fn(() =>
      mockState({
        weaponInventory: { weapons: [weapon] },
        resources: {
          ...initialResources,
          gold: 5000,
          ironIngot: 80,
          coal: 80,
        },
      })
    )
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques('w1', [DURABILITY_MAINTENANCE_TECHNIQUE_ID])
    expect(r.success).toBe(true)
    expect(set).toHaveBeenCalled()
  })

  function weaponWithEdgeChipping(): CraftedWeaponV2 {
    return {
      id: 'w_tag',
      recipeId: 'basic_sword',
      prefix: '',
      baseName: 'меч',
      suffix: '',
      fullName: 'меч',
      type: 'sword',
      activeDamageTags: [
        {
          tagId: 'physical_slash_chip',
          severity: 'heavy',
          sourceEventTemplateId: 'event_common_obstacle',
        },
      ],
      currentDurability: 80,
      tier: 1,
      materials: [{ partId: 'blade', materialId: 'iron', materialName: 'Железо', quantity: 2 }],
      stats: {
        durability: 80,
        maxDurability: 100,
        attack: 10,
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
      sellPrice: 10,
      hiddenTags: [],
      combatMaterialId: 'iron',
      epicMultiplier: 1,
      techniquesUsed: [],
      weaponLegacy: { hiddenMarks: [] },
      repairCondition: 'needsProperRepair',
    } as CraftedWeaponV2
  }

  it('executeWeaponRepairByTechniques: manual precise увеличивает repairDiagnosisPreciseCountByTagId', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = weaponWithEdgeChipping()
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
      resources: {
        ...initialResources,
        gold: 5000,
        ironIngot: 80,
        coal: 80,
      },
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques(
      'w_tag',
      ['edge_truing'],
      {
        diagnosis: {
          mode: 'manual_inspection',
          hypothesisByTagId: { physical_slash_chip: true },
        },
      }
    )
    expect(r.success).toBe(true)
    expect(set).toHaveBeenCalled()
    const updater = set.mock.calls[0][0] as (s: typeof state) => unknown
    const next = updater(state) as typeof state
    const w = next.weaponInventory.weapons.find((x) => x.id === 'w_tag')
    expect(w?.weaponLegacy?.repairDiagnosisPreciseCountByTagId?.physical_slash_chip).toBe(1)
  })

  it('executeWeaponRepairByTechniques: manual risky увеличивает repairDiagnosisRiskyCountByTagId', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = weaponWithEdgeChipping()
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
      resources: {
        ...initialResources,
        gold: 5000,
        ironIngot: 80,
        coal: 80,
      },
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques(
      'w_tag',
      ['edge_truing'],
      {
        diagnosis: {
          mode: 'manual_inspection',
          hypothesisByTagId: { physical_slash_chip: false },
        },
      }
    )
    expect(r.success).toBe(true)
    const updater = set.mock.calls[0][0] as (s: typeof state) => unknown
    const next = updater(state) as typeof state
    const w = next.weaponInventory.weapons.find((x) => x.id === 'w_tag')
    expect(w?.weaponLegacy?.repairDiagnosisRiskyCountByTagId?.physical_slash_chip).toBe(1)
  })

  it('executeWeaponRepairByTechniques: auto_pick пишет skipped в мету диагностики', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = weaponWithEdgeChipping()
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
      resources: {
        ...initialResources,
        gold: 5000,
        ironIngot: 80,
        coal: 80,
      },
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { executeWeaponRepairByTechniques } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepairByTechniques('w_tag', ['edge_truing'], {
      diagnosis: { mode: 'auto_pick' },
      materialCostMultiplier: 1.5,
    })
    expect(r.success).toBe(true)
    const updater = set.mock.calls[0][0] as (s: typeof state) => unknown
    const next = updater(state) as typeof state
    const w = next.weaponInventory.weapons.find((x) => x.id === 'w_tag')
    expect(w?.weaponLegacy?.repairDiagnosisSkippedCountByTagId?.physical_slash_chip).toBe(1)
  })

  it('claimWeaponAutoRepair: skipped диагностика по снятым тегам и списание золота', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = weaponWithEdgeChipping()
    const spendResource = vi.fn(() => true)
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
      spendResource,
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { claimWeaponAutoRepair } = buildRepairCrossSlice(set, get)
    const r = claimWeaponAutoRepair('w_tag')
    expect(r.success).toBe(true)
    expect(spendResource).toHaveBeenCalled()
    expect(set).toHaveBeenCalled()
    const updater = set.mock.calls[0][0] as (s: typeof state) => unknown
    const next = updater(state) as typeof state
    const w = next.weaponInventory.weapons.find((x) => x.id === 'w_tag')
    expect(w?.weaponLegacy?.repairDiagnosisSkippedCountByTagId?.physical_slash_chip).toBe(1)
    expect(w?.activeDamageTags).toEqual([])
  })

  it('claimWeaponAutoRepair: нехватка золота', () => {
    const weapon = weaponWithEdgeChipping()
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
      canAfford: vi.fn(() => false),
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { claimWeaponAutoRepair } = buildRepairCrossSlice(set, get)
    const r = claimWeaponAutoRepair('w_tag')
    expect(r.success).toBe(false)
    expect(r.error).toMatch(/золот/i)
    expect(set).not.toHaveBeenCalled()
  })

  it('claimWeaponAutoRepair: блок при ожидании захода в кузницу', () => {
    const weapon = {
      ...weaponWithEdgeChipping(),
      autoRepairAwaitingForgeVisit: true,
    }
    const state = mockState({
      weaponInventory: { weapons: [weapon] },
    })
    const get = vi.fn(() => state)
    const set = vi.fn()
    const { claimWeaponAutoRepair } = buildRepairCrossSlice(set, get)
    const r = claimWeaponAutoRepair('w_tag')
    expect(r.success).toBe(false)
    expect(set).not.toHaveBeenCalled()
  })
})
