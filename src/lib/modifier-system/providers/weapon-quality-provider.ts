/**
 * Провайдер модификаторов качества оружия (QualityRank)
 * S → +10% success, +15% warSoul
 * A → +7% success, +10% warSoul
 * B → +5% success, +7% warSoul
 * C → +3% success, +4% warSoul
 * D → +1% success, +2% warSoul
 * F → -2% success, -5% warSoul
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'

// Бонусы от ранга качества
const qualityRankBonuses: Record<string, { success: number; warSoul: number; label: string }> = {
  S: { success: 10, warSoul: 15, label: 'Легендарное' },
  A: { success: 7, warSoul: 10, label: 'Эпическое' },
  B: { success: 5, warSoul: 7, label: 'Редкое' },
  C: { success: 3, warSoul: 4, label: 'Необычное' },
  D: { success: 1, warSoul: 2, label: 'Обычное' },
  F: { success: -2, warSoul: -5, label: 'Низкое' },
}

export const weaponQualityProvider: ModifierProvider = {
  name: 'weaponQuality',
  priority: 25, // Применяется после базовых, но перед специальными

  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { weapon } = context

    const qualityRank = weapon.qualityRank
    if (!qualityRank) return modifiers

    const bonuses = qualityRankBonuses[qualityRank]
    if (!bonuses) return modifiers

    const { success, warSoul, label } = bonuses

    // Модификатор успеха от качества оружия
    if (success !== 0) {
      modifiers.push(
        ModifierBuilder.create(`weapon_quality_${weapon.id}`)
          .source('weapon', 'qualityRank', 'Качество оружия', '🏆',
            `${label} качество (${qualityRank}) ${success > 0 ? 'повышает' : 'снижает'} шанс успеха`)
          .target('successChance')
          .add(success)
          .priority(25)
          .build()
      )
    }

    // Модификатор душ войны от качества оружия
    if (warSoul !== 0) {
      modifiers.push(
        ModifierBuilder.create(`weapon_quality_ws_${weapon.id}`)
          .source('weapon', 'qualityRank', 'Качество оружия', '✨',
            `${label} качество (${qualityRank}) ${warSoul > 0 ? 'увеличивает' : 'снижает'} добычу душ`)
          .target('warSoul')
          .add(warSoul)
          .priority(25)
          .build()
      )
    }

    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(weaponQualityProvider)
