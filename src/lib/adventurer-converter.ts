/**
 * Конвертер между старой и новой системой искателей
 * Обеспечивает совместимость при миграции
 */

import type { Adventurer } from '@/types/guild'
import type { AdventurerExtended, AdventurerIdentity, CombatStats, Personality, AdventurerTrait as ExtendedTrait } from '@/types/adventurer-extended'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { TraitEffectType } from '@/data/adventurer-traits'

const TRAIT_EFFECT_TYPES: readonly TraitEffectType[] = [
  'success_rate', 'bonus_chance', 'wear', 'soul_points', 'duration', 'magic', 'weapon_loss',
] as const

function toTraitEffectType(t: string): TraitEffectType {
  return (TRAIT_EFFECT_TYPES as readonly string[]).includes(t) ? (t as TraitEffectType) : 'success_rate'
}
import { generateExtendedAdventurer } from './adventurer-generator-extended'

/**
 * Конвертирует старый Adventurer в новый AdventurerExtended
 * Использует генерацию недостающих полей на основе имеющихся данных
 */
export function convertToExtended(adventurer: Adventurer): AdventurerExtended {
  // Парсим имя
  const nameParts = adventurer.name.split(' ')
  const firstName = nameParts[0] || 'Неизвестный'
  const lastName = nameParts.slice(1).join(' ') || undefined

  // Определяем пол по имени (простая эвристика)
  const femaleNames = ['Мира', 'Астрид', 'Эльза', 'Сильвия', 'Лира', 'Хельга', 'Тория', 'Аня', 'Мария', 'Елена']
  const gender = femaleNames.some(n => firstName.includes(n)) ? 'female' : 'male'

  // Генерируем расширенную версию с сидом на основе ID
  const extended = generateExtendedAdventurer(1) // Базовый уровень

  // Переопределяем поля из старого формата
  const identity: AdventurerIdentity = {
    firstName,
    lastName,
    nickname: undefined, // Можно добавить генерацию прозвищ
    gender,
    portraitId: Math.floor(Math.random() * 100),
  }

  // Боевые характеристики из старого формата
  const combat: CombatStats = {
    level: Math.max(1, Math.floor(adventurer.skill / 10)), // Примерный уровень
    rarity: 'common', // Старый формат не имеет редкости
    power: Math.floor(adventurer.skill * 0.8),
    precision: Math.floor(adventurer.skill * 0.6),
    endurance: Math.floor(adventurer.skill * 0.7),
    luck: Math.floor(adventurer.skill * 0.5),
    combatStyle: extended.combat.combatStyle, // Берём из сгенерированного
    preferredWeapons: [],
    avoidedWeapons: [],
  }

  // Личность из старого формата (если есть черты)
  const personality: Personality = {
    primaryTrait: extended.personality.primaryTrait,
    secondaryTrait: extended.personality.secondaryTrait,
    riskTolerance: extended.personality.riskTolerance,
    motivations: extended.personality.motivations,
    socialTags: extended.personality.socialTags,
  }

  // Конвертируем черты в формат extended
  const convertedTraits: ExtendedTrait[] = adventurer.traits?.map(t => {
    // Преобразуем effect в effects Record
    const effects: Record<string, number> = {}
    if (t.effect) {
      effects[t.effect.type] = t.effect.value
    }
    
    return {
      id: t.id,
      name: t.name,
      icon: t.icon || '⭐',
      description: t.description || '',
      effects,
    }
  }) || []

  return {
    id: adventurer.id,
    identity,
    combat,
    personality,
    traits: convertedTraits,
    uniqueBonuses: [],
    strengths: extended.strengths,
    weaknesses: extended.weaknesses,
    requirements: {
      minAttack: adventurer.requirements?.minAttack ?? 0,
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 часа
  }
}

/**
 * Конвертирует AdventurerExtended обратно в старый формат Adventurer
 * Для совместимости с существующим кодом
 */
export function convertToLegacy(extended: AdventurerExtended, skillOverride?: number): Adventurer {
  // Формируем полное имя
  const nameParts = [extended.identity.firstName]
  if (extended.identity.lastName) nameParts.push(extended.identity.lastName)
  const name = nameParts.join(' ')

  // Рассчитываем skill на основе боевых характеристик
  const skill = skillOverride ?? Math.floor(
    (extended.combat.power + extended.combat.precision + extended.combat.endurance + extended.combat.luck) / 4
  )

  // Конвертируем черты обратно в старый формат
  const convertedTraits = extended.traits.map(t => {
    // Преобразуем effects Record в effect
    const effectTypes = Object.keys(t.effects || {})
    const firstEffectType = effectTypes[0] || 'success_rate'
    const firstEffectValue = t.effects?.[firstEffectType] ?? 0
    
    return {
      id: t.id,
      name: t.name,
      icon: t.icon,
      description: t.description,
      effect: {
        type: toTraitEffectType(firstEffectType),
        value: firstEffectValue,
      },
      rarity: 'common' as const,
    }
  })

  return {
    id: extended.id,
    name,
    skill,
    traits: convertedTraits,
    uniqueBonuses: [],
    requirements: {
      minAttack: extended.requirements.minAttack,
    },
    portrait: extended.identity.portraitId,
    createdAt: extended.createdAt,
    hiredAt: Date.now(),
    expiresAt: extended.expiresAt,
  }
}

/** Срез шаблона экспедиции для UI подбора искателей (в т.ч. AdventurerCardV2) */
export interface RecruitmentExpeditionView {
  id: string
  name: string
  difficulty: ExpeditionTemplate['difficulty']
  type: ExpeditionTemplate['type']
  baseGold: number
  baseWarSoul: number
  duration: number
  successChance: number
  failureChance: number
  /** Износ оружия за экспедицию (упрощённая метка для UI) */
  weaponWear: number
  weaponLossChance: number
  minWeaponAttack: number
  minGuildLevel: number
}

/**
 * Создаёт отображение экспедиции для RecruitmentInterface
 */
export function mapExpeditionForRecruitment(
  expedition: ExpeditionTemplate
): RecruitmentExpeditionView {
  return {
    id: expedition.id,
    name: expedition.name,
    difficulty: expedition.difficulty,
    type: expedition.type,
    baseGold: expedition.reward.baseGold,
    baseWarSoul: expedition.reward.baseWarSoul,
    duration: expedition.duration,
    successChance: Math.max(0, 100 - expedition.failureChance),
    failureChance: expedition.failureChance,
    weaponWear: 10,
    weaponLossChance: expedition.weaponLossChance,
    minWeaponAttack: expedition.minWeaponAttack,
    minGuildLevel: expedition.minGuildLevel,
  }
}

/**
 * Создаёт отображение оружия для RecruitmentInterface
 */
export function mapWeaponForRecruitment(weapon: {
  id: string
  name: string
  attack: number
  durability: number
}) {
  return {
    id: weapon.id,
    name: weapon.name,
    attack: weapon.attack,
    durability: weapon.durability,
  }
}
