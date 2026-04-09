/**
 * Единый каталог интенданта гильдии: рецепты оружия и переработки за репутацию ранга.
 * Цены v1: из золота бывшего магазина кузницы (1 золото ≈ 1 очко репутации, минимум 5).
 */

import {
  intendantWeaponRecipePrices,
  intendantRefiningRecipePrices,
  type IntendantRarity,
  type IntendantRecipePrice,
} from '@/data/guild/intendant-pricing'
import { REPAIR_TECHNIQUE_REGISTRY } from '@/data/weapon-damage/repair-techniques-registry'
import type { RepairTechniqueDefinition } from '@/types/weapon-repair'
import {
  REFORGE_TECHNIQUES,
  type ReforgeTechniqueEntry,
} from '@/data/reforge/reforge-techniques-registry'

export type IntendantOfferKind =
  | 'weapon_recipe'
  | 'refining_recipe'
  | 'repair_technique'
  | 'craft_technique'
  | 'reforge_technique'

export interface IntendantOffer {
  id: string
  kind: IntendantOfferKind
  targetId: string
  costReputation: number
  minGuildLevel: number
  name: string
  description: string
  rarity: IntendantRarity
}

/** 1 золото бывшего магазина ≈ 1 реп. ранга; минимум 8 — чуть выше «мелочи» для баланса v2. */
function goldToReputation(gold: number | undefined): number {
  if (gold == null || gold <= 0) return 50
  return Math.max(8, Math.round(gold))
}

function minGuildLevelFromRecipe(rp: IntendantRecipePrice): number {
  const lv = rp.requiredLevel ?? 1
  return Math.max(1, Math.min(10, Math.ceil(lv / 5)))
}

const basicWeaponForms: IntendantOffer[] = [
  {
    id: 'intendant_basic_dagger',
    kind: 'weapon_recipe',
    targetId: 'basic_dagger',
    costReputation: 80,
    minGuildLevel: 1,
    name: 'Кинжал (базовая форма)',
    description: 'Чертёж простого кинжала. Раньше выдавался новичкам; теперь заказывается у интенданта.',
    rarity: 'common',
  },
  {
    id: 'intendant_basic_axe',
    kind: 'weapon_recipe',
    targetId: 'basic_axe',
    costReputation: 100,
    minGuildLevel: 1,
    name: 'Топор (базовая форма)',
    description: 'Базовая форма одноручного топора.',
    rarity: 'common',
  },
  {
    id: 'intendant_basic_mace',
    kind: 'weapon_recipe',
    targetId: 'basic_mace',
    costReputation: 100,
    minGuildLevel: 1,
    name: 'Булава (базовая форма)',
    description: 'Базовая форма булавы.',
    rarity: 'common',
  },
  {
    id: 'intendant_basic_spear',
    kind: 'weapon_recipe',
    targetId: 'basic_spear',
    costReputation: 100,
    minGuildLevel: 1,
    name: 'Копьё (базовая форма)',
    description: 'Базовая форма копья.',
    rarity: 'common',
  },
  {
    id: 'intendant_basic_hammer',
    kind: 'weapon_recipe',
    targetId: 'basic_hammer',
    costReputation: 100,
    minGuildLevel: 1,
    name: 'Молот (базовая форма)',
    description: 'Базовая форма боевого молота.',
    rarity: 'common',
  },
]

function fromWeaponPurchase(rp: IntendantRecipePrice, index: number): IntendantOffer {
  return {
    id: `intendant_weapon_${rp.recipeId}_purchase_${index}`,
    kind: 'weapon_recipe',
    targetId: rp.recipeId,
    costReputation: goldToReputation(rp.gold),
    minGuildLevel: minGuildLevelFromRecipe(rp),
    name: rp.name,
    description: rp.description,
    rarity: rp.rarity,
  }
}

function fromRefiningPurchase(rp: IntendantRecipePrice, index: number): IntendantOffer {
  return {
    id: `intendant_refining_${rp.recipeId}_purchase_${index}`,
    kind: 'refining_recipe',
    targetId: rp.recipeId,
    costReputation: goldToReputation(rp.gold),
    minGuildLevel: minGuildLevelFromRecipe(rp),
    name: rp.name,
    description: rp.description,
    rarity: rp.rarity,
  }
}

const weaponPurchase = intendantWeaponRecipePrices.map((p, i) => fromWeaponPurchase(p, i))

const refiningPurchase = intendantRefiningRecipePrices.map((p, i) => fromRefiningPurchase(p, i))

function repairTechniqueOfferFromDef(t: RepairTechniqueDefinition): IntendantOffer {
  const stageCount = t.stages.length
  return {
    id: `intendant_repair_${t.id}`,
    kind: 'repair_technique',
    targetId: t.id,
    costReputation: Math.max(70, Math.round(45 + stageCount * 20)),
    minGuildLevel: Math.max(1, Math.min(10, 1 + Math.floor(stageCount / 3))),
    name: t.name,
    description: t.description,
    rarity: stageCount >= 4 ? 'rare' : 'uncommon',
  }
}

const repairTechniqueOffers: IntendantOffer[] = REPAIR_TECHNIQUE_REGISTRY.filter(
  (t) => t.repairTier === 'specialized'
).map((t) => repairTechniqueOfferFromDef(t))

function craftTechniqueOffer(
  id: string,
  targetId: string,
  name: string,
  description: string,
  costReputation: number,
  minGuildLevel: number,
  rarity: IntendantRarity
): IntendantOffer {
  return {
    id,
    kind: 'craft_technique',
    targetId,
    name,
    description,
    costReputation,
    minGuildLevel,
    rarity,
  }
}

const craftTechniqueOffers: IntendantOffer[] = [
  craftTechniqueOffer(
    'intendant_craft_spirit_blessing',
    'spirit_blessing',
    'Благословение духов',
    'Ритуальная техника для проводки души и финальной стабилизации узла.',
    180,
    4,
    'rare'
  ),
  craftTechniqueOffer(
    'intendant_craft_master_balance',
    'master_balance',
    'Мастер-баланс',
    'Точная повторная балансировка конструкции и распределения нагрузки.',
    150,
    3,
    'uncommon'
  ),
]

/** Цена спец-перековки: от расхода ДВ и типа; awaken — фиксированный премиум. */
function reforgeTechniqueOfferFromEntry(t: ReforgeTechniqueEntry): IntendantOffer {
  const costReputation =
    t.reforgeType === 'awakenScar'
      ? 240
      : Math.max(95, Math.min(210, Math.round(t.warSoulCost / 2.5)))
  return {
    id: `intendant_reforge_${t.id}`,
    kind: 'reforge_technique',
    targetId: t.id,
    costReputation,
    minGuildLevel: Math.max(1, Math.min(10, t.minGuildLevel)),
    name: t.name,
    description: t.description,
    rarity: t.reforgeType === 'awakenScar' ? 'epic' : 'rare',
  }
}

const reforgeTechniqueOffers: IntendantOffer[] = REFORGE_TECHNIQUES.filter(
  (t) => t.reforgeTier === 'specialized'
).map((t) => reforgeTechniqueOfferFromEntry(t))

export const INTENDANT_OFFERS: IntendantOffer[] = [
  ...basicWeaponForms,
  ...weaponPurchase,
  ...refiningPurchase,
  ...repairTechniqueOffers,
  ...craftTechniqueOffers,
  ...reforgeTechniqueOffers,
]

export function getIntendantOfferById(id: string): IntendantOffer | undefined {
  return INTENDANT_OFFERS.find((o) => o.id === id)
}

/** Предложение интенданта по id техники ремонта (спец-техники в каталоге). */
export function getIntendantRepairTechniqueOffer(
  repairTechniqueId: string
): IntendantOffer | undefined {
  return INTENDANT_OFFERS.find(
    (o) => o.kind === 'repair_technique' && o.targetId === repairTechniqueId
  )
}

/** Предложение интенданта по id техники перековки (`reforge_*` из реестра). */
export function getIntendantReforgeTechniqueOffer(
  reforgeTechniqueId: string
): IntendantOffer | undefined {
  return INTENDANT_OFFERS.find(
    (o) => o.kind === 'reforge_technique' && o.targetId === reforgeTechniqueId
  )
}

export function getIntendantOffersByKind(kind: IntendantOfferKind | 'all'): IntendantOffer[] {
  if (kind === 'all') return INTENDANT_OFFERS
  return INTENDANT_OFFERS.filter((o) => o.kind === kind)
}
