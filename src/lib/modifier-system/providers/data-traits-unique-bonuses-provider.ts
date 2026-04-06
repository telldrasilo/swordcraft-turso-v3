/**
 * Черты из каталога `adventurer-traits` (поле `adventurer.traits`) и уникальные бонусы
 * из `unique-bonuses` — в расчёт экспедиции v2 через модификаторы.
 *
 * Отличие от `personality-traits-provider`: там личностные черты (primary/secondary);
 * здесь — набор «ролевых» черт данных extended-искателя.
 */

import type { Modifier, ModifierContext, ModifierProvider } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import {
  getTraitById,
  type TraitEffectType,
} from '@/data/adventurer-traits'
import { uniqueBonuses as uniqueBonusCatalog } from '@/data/unique-bonuses'
import type { UniqueBonus as CatalogUniqueBonus } from '@/data/unique-bonuses'
import type { AdventurerExtended } from '@/types/adventurer-extended'

const TRAIT_EFFECT_TYPES = new Set<TraitEffectType>([
  'success_rate',
  'bonus_chance',
  'wear',
  'soul_points',
  'duration',
  'magic',
  'weapon_loss',
])

function traitEffectRows(adventurer: AdventurerExtended): Array<{
  effectType: TraitEffectType
  value: number
  name: string
  icon: string
  description: string
  traitId: string
}> {
  const out: Array<{
    effectType: TraitEffectType
    value: number
    name: string
    icon: string
    description: string
    traitId: string
  }> = []

  for (const row of adventurer.traits) {
    const catalog = getTraitById(row.id)
    if (catalog) {
      out.push({
        effectType: catalog.effect.type,
        value: catalog.effect.value,
        name: catalog.name,
        icon: catalog.icon,
        description: catalog.description,
        traitId: catalog.id,
      })
      continue
    }
    for (const [key, val] of Object.entries(row.effects ?? {})) {
      if (typeof val !== 'number') continue
      if (!TRAIT_EFFECT_TYPES.has(key as TraitEffectType)) continue
      out.push({
        effectType: key as TraitEffectType,
        value: val,
        name: row.name,
        icon: row.icon,
        description: row.description,
        traitId: row.id,
      })
    }
  }

  return out
}

function resolveCatalogUniqueBonuses(
  bonuses: AdventurerExtended['uniqueBonuses']
): CatalogUniqueBonus[] {
  return bonuses
    .map((b) => uniqueBonusCatalog.find((u) => u.id === b.id))
    .filter((u): u is CatalogUniqueBonus => u != null)
}

export const dataTraitsUniqueBonusesProvider: ModifierProvider = {
  name: 'dataTraitsUniqueBonuses',
  priority: 22,

  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer } = context
    const pid = adventurer.id
    const modPriority = 22

    for (const row of traitEffectRows(adventurer)) {
      const { effectType, value, name, icon, description, traitId } = row
      const sid = `advtrait_${traitId}_${pid}`

      switch (effectType) {
        case 'success_rate':
          modifiers.push(
            ModifierBuilder.create(`${sid}_success`)
              .source('adventurerTrait', traitId, name, icon, description)
              .target('successChance')
              .add(value)
              .priority(modPriority)
              .build()
          )
          break
        case 'bonus_chance': {
          const goldPart = Math.round(value * 0.55)
          const critPart = Math.round(value * 0.45)
          if (goldPart !== 0) {
            modifiers.push(
              ModifierBuilder.create(`${sid}_gold`)
                .source('adventurerTrait', traitId, name, icon, `${description} (золото)`)
                .target('gold')
                .add(goldPart)
                .priority(modPriority)
                .build()
            )
          }
          if (critPart !== 0) {
            modifiers.push(
              ModifierBuilder.create(`${sid}_crit`)
                .source('adventurerTrait', traitId, name, icon, `${description} (крит.)`)
                .target('critChance')
                .add(critPart)
                .priority(modPriority)
                .build()
            )
          }
          break
        }
        case 'wear':
          modifiers.push(
            ModifierBuilder.create(`${sid}_wear`)
              .source('adventurerTrait', traitId, name, icon, description)
              .target('weaponWear')
              .add(value)
              .priority(modPriority)
              .build()
          )
          break
        case 'soul_points':
          modifiers.push(
            ModifierBuilder.create(`${sid}_ws`)
              .source('adventurerTrait', traitId, name, icon, description)
              .target('warSoul')
              .add(value)
              .priority(modPriority)
              .build()
          )
          break
        case 'duration': {
          const succ = Math.round(-value / 5)
          if (succ !== 0) {
            modifiers.push(
              ModifierBuilder.create(`${sid}_dur`)
                .source('adventurerTrait', traitId, name, icon, description)
                .target('successChance')
                .add(succ)
                .priority(modPriority)
                .build()
            )
          }
          break
        }
        case 'magic':
          modifiers.push(
            ModifierBuilder.create(`${sid}_magic`)
              .source('adventurerTrait', traitId, name, icon, description)
              .target('successChance')
              .add(Math.round(value / 2))
              .priority(modPriority)
              .build()
          )
          break
        case 'weapon_loss':
          modifiers.push(
            ModifierBuilder.create(`${sid}_wloss`)
              .source('adventurerTrait', traitId, name, icon, description)
              .target('weaponLossChance')
              .add(value)
              .priority(modPriority)
              .build()
          )
          break
        default:
          break
      }
    }

    for (const bonus of resolveCatalogUniqueBonuses(adventurer.uniqueBonuses)) {
      const e = bonus.effect
      const baseId = `uniq_${bonus.id}_${pid}`

      if (e.goldBonus) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_gold`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, bonus.description)
            .target('gold')
            .add(e.goldBonus)
            .priority(modPriority)
            .build()
        )
      }
      if (e.soulBonus) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_ws`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, bonus.description)
            .target('warSoul')
            .add(e.soulBonus)
            .priority(modPriority)
            .build()
        )
      }
      if (e.successBonus) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_succ`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, bonus.description)
            .target('successChance')
            .add(e.successBonus)
            .priority(modPriority)
            .build()
        )
      }
      if (e.critChance) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_crit`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, bonus.description)
            .target('critChance')
            .add(e.critChance)
            .priority(modPriority)
            .build()
        )
      }
      if (e.wearReduction) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_wear`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, 'Снижение износа оружия')
            .target('weaponWear')
            .add(-e.wearReduction)
            .priority(modPriority)
            .build()
        )
      }
      if (e.lossChanceReduction) {
        const lossMod = -Math.min(20, Math.round(e.lossChanceReduction * 0.25))
        if (lossMod !== 0) {
          modifiers.push(
            ModifierBuilder.create(`${baseId}_loss`)
              .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, 'Снижение риска потери оружия')
              .target('weaponLossChance')
              .add(lossMod)
              .priority(modPriority)
              .build()
          )
        }
      }
      if (e.durationReduction) {
        const succ = Math.round(e.durationReduction / 8)
        if (succ !== 0) {
          modifiers.push(
            ModifierBuilder.create(`${baseId}_dur`)
              .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, 'Скорость маршрута')
              .target('successChance')
              .add(succ)
              .priority(modPriority)
              .build()
          )
        }
      }
      if (e.resourceChance) {
        const tinyGold = Math.round(e.resourceChance * 0.12)
        if (tinyGold !== 0) {
          modifiers.push(
            ModifierBuilder.create(`${baseId}_res`)
              .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, 'Находки (прогноз золота)')
              .target('gold')
              .add(tinyGold)
              .priority(modPriority)
              .build()
          )
        }
      }
      const essenceLine = (e.essenceGuaranteed ?? 0) * 3 + (e.essenceChance ? 2 : 0)
      if (essenceLine > 0) {
        modifiers.push(
          ModifierBuilder.create(`${baseId}_glory`)
            .source('uniqueBonus', bonus.id, bonus.name, bonus.icon, 'Эссенция / слава гильдии')
            .target('glory')
            .add(essenceLine)
            .priority(modPriority)
            .build()
        )
      }
    }

    return modifiers
  },
}

modifierRegistry.register(dataTraitsUniqueBonusesProvider)
