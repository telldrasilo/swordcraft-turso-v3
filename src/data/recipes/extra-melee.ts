/**
 * Шаблоны крафта v2 для типов mace / spear / hammer (в allRecipes нет «basic_*» для них — клонируем близкие формы).
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { swordRecipes } from './swords'
import { axeRecipes } from './melee'

const longSword = swordRecipes.find((r) => r.id === 'long_sword')
const basicAxe = axeRecipes.find((r) => r.id === 'basic_axe')
const battleAxe = axeRecipes.find((r) => r.id === 'battle_axe')

function pickLongSword(): WeaponRecipe {
  const b = longSword ?? swordRecipes[0]
  return structuredClone(b)
}

function pickAxe(): WeaponRecipe {
  const b = basicAxe ?? axeRecipes[0]
  return structuredClone(b)
}

function pickHammerAxe(): WeaponRecipe {
  const b = battleAxe ?? basicAxe ?? axeRecipes[0]
  return structuredClone(b)
}

export type ExtraMeleeKind = 'mace' | 'spear' | 'hammer'

/** Клон шаблона под тип оружия для строк линейки iron/bronze/… */
export function getMeleeTemplate(kind: ExtraMeleeKind): WeaponRecipe {
  const recipe =
    kind === 'spear'
      ? pickLongSword()
      : kind === 'mace'
        ? pickAxe()
        : pickHammerAxe()

  recipe.id = `__template_${kind}`
  recipe.type = kind
  if (kind === 'spear') {
    recipe.name = 'копьё'
    recipe.description = 'Копьё с металлическим наконечником и древком'
    recipe.baseStats = {
      ...recipe.baseStats,
      attackBase: 45,
      durabilityBase: 62,
      weightBase: 2.2,
      soulCapacityBase: 48,
    }
  } else if (kind === 'mace') {
    recipe.name = 'булава'
    recipe.description = 'Ударное оружие с массивной головкой'
    recipe.baseStats = {
      ...recipe.baseStats,
      attackBase: 48,
      durabilityBase: 72,
      weightBase: 3.4,
      soulCapacityBase: 42,
    }
  } else {
    recipe.name = 'молот'
    recipe.description = 'Тяжёлый боевой молот'
    recipe.baseStats = {
      ...recipe.baseStats,
      attackBase: 68,
      durabilityBase: 78,
      weightBase: 4.3,
      soulCapacityBase: 52,
    }
  }
  return recipe
}
