/**
 * Система ремонта оружия для SwordCraft
 * 
 * Ключевые принципы:
 * - Ремонт требует материалы (те же, что использовались при крафте)
 * - Мастерство починки зависит от **уровня персонажа игрока** (кузнец = игрок)
 * - Ремонт несёт риски: потеря maxDurability, души, эпичности
 * - Разные типы ремонта для разных ситуаций
 */

import type { CraftingCost, WeaponTier } from './weapon-recipes'

/** Поля оружия для расчёта ремонта (совместимо с v2 инвентарём) */
export interface WeaponRepairCalc {
  tier: WeaponTier
  durability: number
  maxDurability: number
  warSoul: number
  attack: number
  epicMultiplier: number
  materials: CraftingCost
}

// ================================
// ТИПЫ
// ================================

export type RepairType = 'quick' | 'standard' | 'quality' | 'restoration' | 'enhancement'

export interface RepairOption {
  type: RepairType
  name: string
  description: string
  icon: string
  materials: CraftingCost
  goldCost: number
  durabilityRestore: number // Сколько прочности восстанавливает
  maxDurabilityLoss: number // % потери макс. прочности
  soulLossPercent: number // % потери души войны
  attackLossChance: number // Шанс временной потери атаки
  attackLossPercent: number // % потери атаки если случилась
  epicLossPercent: number // % потери эпичности
  baseSuccessChance: number // Базовый шанс успеха (с учётом мастерства в getRepairOptions)
}

export interface RepairResult {
  success: boolean
  durabilityRestored: number
  maxDurabilityBefore: number
  maxDurabilityAfter: number
  soulLost: number
  attackLost: number
  epicLost: number
  criticalFailure: boolean // Критический провал (оружие повреждено)
}

// Результат выполнения ремонта из стора (включает ошибки валидации)
export interface ExecuteRepairResult {
  success: boolean
  error?: string
  result?: RepairResult
}

// ================================
// УРОВНИ МАСТЕРСТВА КУЗНЕЦА (расширенные для айдлера)
// ================================

export interface SmithMasteryLevel {
  level: number
  rank: string
  name: string
  successBonus: number       // Бонус к шансу успеха
  maxDurLossReduction: number // Снижение потери maxDurability
  soulLossReduction: number   // Снижение потери души
  epicLossReduction: number   // Снижение потери эпичности
  attackPreservation: number  // Шанс сохранить атаку
  discountPercent: number     // Скидка на материалы
  canRestoreMaxDur: boolean   // Может восстановить maxDurability
  canEnhance: boolean         // Может улучшить оружие при ремонте
  description: string
}

/**
 * 20 уровней мастерства; индекс берётся из `getSmithMastery` по уровню персонажа игрока.
 */
export const SMITH_MASTERY_LEVELS: SmithMasteryLevel[] = [
  {
    level: 1,
    rank: 'novice',
    name: 'Новичок',
    successBonus: -15,
    maxDurLossReduction: 0,
    soulLossReduction: 0,
    epicLossReduction: 0,
    attackPreservation: 0,
    discountPercent: 0,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Только учится держать молот. Высокий риск повредить оружие.'
  },
  {
    level: 2,
    rank: 'novice',
    name: 'Ученик I',
    successBonus: -10,
    maxDurLossReduction: 0,
    soulLossReduction: 0,
    epicLossReduction: 0,
    attackPreservation: 5,
    discountPercent: 0,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Начинает понимать основы ковки.'
  },
  {
    level: 3,
    rank: 'novice',
    name: 'Ученик II',
    successBonus: -5,
    maxDurLossReduction: 5,
    soulLossReduction: 0,
    epicLossReduction: 0,
    attackPreservation: 10,
    discountPercent: 0,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Может чинить простое оружие с минимальными рисками.'
  },
  {
    level: 4,
    rank: 'apprentice',
    name: 'Подмастерье I',
    successBonus: 0,
    maxDurLossReduction: 10,
    soulLossReduction: 5,
    epicLossReduction: 0,
    attackPreservation: 15,
    discountPercent: 5,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Базовые навыки ремонта освоены.'
  },
  {
    level: 5,
    rank: 'apprentice',
    name: 'Подмастерье II',
    successBonus: 5,
    maxDurLossReduction: 15,
    soulLossReduction: 10,
    epicLossReduction: 5,
    attackPreservation: 20,
    discountPercent: 5,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Стабильный ремонт большинства оружия.'
  },
  {
    level: 6,
    rank: 'apprentice',
    name: 'Подмастерье III',
    successBonus: 8,
    maxDurLossReduction: 20,
    soulLossReduction: 15,
    epicLossReduction: 10,
    attackPreservation: 25,
    discountPercent: 10,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Ремонт с минимальной потерей качества.'
  },
  {
    level: 7,
    rank: 'journeyman',
    name: 'Ремесленник I',
    successBonus: 12,
    maxDurLossReduction: 25,
    soulLossReduction: 20,
    epicLossReduction: 15,
    attackPreservation: 30,
    discountPercent: 10,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Опытный мастер, способный на качественный ремонт.'
  },
  {
    level: 8,
    rank: 'journeyman',
    name: 'Ремесленник II',
    successBonus: 15,
    maxDurLossReduction: 30,
    soulLossReduction: 25,
    epicLossReduction: 20,
    attackPreservation: 35,
    discountPercent: 15,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Может восстановить атаку оружия после неудачного ремонта.'
  },
  {
    level: 9,
    rank: 'journeyman',
    name: 'Ремесленник III',
    successBonus: 18,
    maxDurLossReduction: 35,
    soulLossReduction: 30,
    epicLossReduction: 25,
    attackPreservation: 40,
    discountPercent: 15,
    canRestoreMaxDur: false,
    canEnhance: false,
    description: 'Высокое качество ремонта, минимальные потери.'
  },
  {
    level: 10,
    rank: 'expert',
    name: 'Эксперт I',
    successBonus: 22,
    maxDurLossReduction: 40,
    soulLossReduction: 35,
    epicLossReduction: 30,
    attackPreservation: 50,
    discountPercent: 20,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Может восстановить максимальную прочность.'
  },
  {
    level: 11,
    rank: 'expert',
    name: 'Эксперт II',
    successBonus: 25,
    maxDurLossReduction: 45,
    soulLossReduction: 40,
    epicLossReduction: 35,
    attackPreservation: 55,
    discountPercent: 20,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Мастер с безупречной репутацией.'
  },
  {
    level: 12,
    rank: 'expert',
    name: 'Эксперт III',
    successBonus: 28,
    maxDurLossReduction: 50,
    soulLossReduction: 45,
    epicLossReduction: 40,
    attackPreservation: 60,
    discountPercent: 25,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Ремонт практически без потерь.'
  },
  {
    level: 13,
    rank: 'master',
    name: 'Мастер I',
    successBonus: 32,
    maxDurLossReduction: 55,
    soulLossReduction: 50,
    epicLossReduction: 45,
    attackPreservation: 65,
    discountPercent: 25,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Истинный мастер своего дела.'
  },
  {
    level: 14,
    rank: 'master',
    name: 'Мастер II',
    successBonus: 35,
    maxDurLossReduction: 60,
    soulLossReduction: 55,
    epicLossReduction: 50,
    attackPreservation: 70,
    discountPercent: 30,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Способен чинить легендарное оружие без потерь.'
  },
  {
    level: 15,
    rank: 'master',
    name: 'Мастер III',
    successBonus: 38,
    maxDurLossReduction: 65,
    soulLossReduction: 60,
    epicLossReduction: 55,
    attackPreservation: 75,
    discountPercent: 30,
    canRestoreMaxDur: true,
    canEnhance: false,
    description: 'Ремонт реставрационного качества.'
  },
  {
    level: 16,
    rank: 'grandmaster',
    name: 'Грандмастер I',
    successBonus: 42,
    maxDurLossReduction: 70,
    soulLossReduction: 65,
    epicLossReduction: 60,
    attackPreservation: 80,
    discountPercent: 35,
    canRestoreMaxDur: true,
    canEnhance: true,
    description: 'Может улучшать оружие при ремонте.'
  },
  {
    level: 17,
    rank: 'grandmaster',
    name: 'Грандмастер II',
    successBonus: 45,
    maxDurLossReduction: 75,
    soulLossReduction: 70,
    epicLossReduction: 65,
    attackPreservation: 85,
    discountPercent: 35,
    canRestoreMaxDur: true,
    canEnhance: true,
    description: 'Легендарный мастер, известный по всей стране.'
  },
  {
    level: 18,
    rank: 'grandmaster',
    name: 'Грандмастер III',
    successBonus: 48,
    maxDurLossReduction: 80,
    soulLossReduction: 75,
    epicLossReduction: 70,
    attackPreservation: 90,
    discountPercent: 40,
    canRestoreMaxDur: true,
    canEnhance: true,
    description: 'Почти идеальный ремонт.'
  },
  {
    level: 19,
    rank: 'legendary',
    name: 'Легенда I',
    successBonus: 52,
    maxDurLossReduction: 85,
    soulLossReduction: 80,
    epicLossReduction: 75,
    attackPreservation: 95,
    discountPercent: 40,
    canRestoreMaxDur: true,
    canEnhance: true,
    description: 'Имя, которое знают во всех королевствах.'
  },
  {
    level: 20,
    rank: 'legendary',
    name: 'Легенда II',
    successBonus: 55,
    maxDurLossReduction: 90,
    soulLossReduction: 85,
    epicLossReduction: 80,
    attackPreservation: 100,
    discountPercent: 50,
    canRestoreMaxDur: true,
    canEnhance: true,
    description: 'Величайший кузнец эпохи. Ремонт без потерь, шанс улучшения.'
  },
]

const SMITH_MASTERY_DEFAULT: SmithMasteryLevel = SMITH_MASTERY_LEVELS[0]!

/**
 * Мастерство починки по уровню персонажа игрока (кузнец = игрок).
 * Индекс мастерства: min(20, max(1, floor(level / 2.5))) — уровень 50 → мастерство 20.
 */
export function getSmithMastery(playerLevel: number): SmithMasteryLevel {
  const masteryLevel = Math.min(20, Math.max(1, Math.floor(playerLevel / 2.5)))
  return SMITH_MASTERY_LEVELS[masteryLevel - 1] ?? SMITH_MASTERY_DEFAULT
}

// ================================
// КОНФИГУРАЦИЯ ТИПОВ РЕМОНТА
// ================================

export const REPAIR_TYPES: Record<RepairType, Omit<RepairOption, 'materials' | 'goldCost'>> = {
  quick: {
    type: 'quick',
    name: 'Быстрый ремонт',
    description: 'Срочный ремонт с высокими рисками. Подходит для экстренных ситуаций.',
    icon: '⚡',
    durabilityRestore: 25,
    maxDurabilityLoss: 5,
    soulLossPercent: 30,
    attackLossChance: 25,
    attackLossPercent: 10,
    epicLossPercent: 20,
    baseSuccessChance: 70,
  },
  standard: {
    type: 'standard',
    name: 'Стандартный ремонт',
    description: 'Сбалансированный ремонт для большинства ситуаций.',
    icon: '🔧',
    durabilityRestore: 50,
    maxDurabilityLoss: 3,
    soulLossPercent: 15,
    attackLossChance: 10,
    attackLossPercent: 5,
    epicLossPercent: 10,
    baseSuccessChance: 85,
  },
  quality: {
    type: 'quality',
    name: 'Качественный ремонт',
    description: 'Тщательный ремонт с минимальными рисками. Требует больше материалов.',
    icon: '✨',
    durabilityRestore: 80,
    maxDurabilityLoss: 1,
    soulLossPercent: 5,
    attackLossChance: 0,
    attackLossPercent: 0,
    epicLossPercent: 3,
    baseSuccessChance: 95,
  },
  restoration: {
    type: 'restoration',
    name: 'Реставрация',
    description: 'Полное восстановление оружия, включая максимальную прочность. Дорого, но безопасно.',
    icon: '💎',
    durabilityRestore: 100,
    maxDurabilityLoss: 0,
    soulLossPercent: 0,
    attackLossChance: 0,
    attackLossPercent: 0,
    epicLossPercent: 0,
    baseSuccessChance: 100,
  },
  enhancement: {
    type: 'enhancement',
    name: 'Усиление',
    description: 'Ремонт с попыткой улучшить оружие. Только для грандмастеров. Высокий риск.',
    icon: '🔥',
    durabilityRestore: 100,
    maxDurabilityLoss: 0,
    soulLossPercent: 0,
    attackLossChance: 0,
    attackLossPercent: 0,
    epicLossPercent: 0,
    baseSuccessChance: 60, // Базовый шанс успеха улучшения
  },
}

// ================================
// МНОЖИТЕЛИ ПО ТИРУ ОРУЖИЯ
// ================================

export const TIER_REPAIR_MULTIPLIERS: Record<WeaponTier, {
  materialMult: number    // Множитель материалов
  goldMult: number        // Множитель золота
  successPenalty: number  // Штраф к успеху
}> = {
  common: { materialMult: 1.0, goldMult: 1.0, successPenalty: 0 },
  uncommon: { materialMult: 1.2, goldMult: 1.3, successPenalty: 2 },
  rare: { materialMult: 1.5, goldMult: 1.8, successPenalty: 5 },
  epic: { materialMult: 2.0, goldMult: 2.5, successPenalty: 8 },
  legendary: { materialMult: 3.0, goldMult: 4.0, successPenalty: 12 },
  mythic: { materialMult: 5.0, goldMult: 8.0, successPenalty: 18 },
}

// ================================
// ФУНКЦИИ РАСЧЁТА
// ================================

/**
 * Получить материалы для ремонта
 * Берёт % от материалов, использованных при создании оружия
 */
export function getRepairMaterials(
  weapon: WeaponRepairCalc,
  repairType: RepairType
): CraftingCost {
  const baseMaterials = weapon.materials || {}
  const tierMult =
    TIER_REPAIR_MULTIPLIERS[weapon.tier] ?? TIER_REPAIR_MULTIPLIERS.common

  // Процент от оригинальных материалов
  const materialPercentages: Record<RepairType, number> = {
    quick: 0.15,
    standard: 0.30,
    quality: 0.50,
    restoration: 1.0,
    enhancement: 1.5,
  }
  
  const percent = materialPercentages[repairType]
  const materials: CraftingCost = {}
  
  for (const [mat, amount] of Object.entries(baseMaterials)) {
    const required = Math.ceil((amount as number) * percent * tierMult.materialMult)
    if (required > 0) {
      materials[mat as keyof CraftingCost] = required
    }
  }
  
  // Уголь всегда нужен для нагрева
  const coalRequired = Math.ceil(3 * percent * tierMult.materialMult)
  materials.coal = (materials.coal || 0) + coalRequired
  
  // Для реставрации и усиления нужна эссенция душ
  if (repairType === 'restoration') {
    materials.soulEssence = Math.ceil(5 * tierMult.materialMult)
  } else if (repairType === 'enhancement') {
    materials.soulEssence = Math.ceil(15 * tierMult.materialMult)
  }
  
  return materials
}

/**
 * Стоимость ремонта в золоте (legacy поле RepairOption). Ремонт в кузнице — только материалы и время.
 */
export function getRepairGoldCost(
  _weapon: WeaponRepairCalc,
  _repairType: RepairType,
  _mastery: SmithMasteryLevel
): number {
  return 0
}

/**
 * Рассчитать финальные опции ремонта с учётом мастерства кузнеца
 */
export function getRepairOptions(
  weapon: WeaponRepairCalc,
  playerLevel: number
): RepairOption[] {
  const mastery = getSmithMastery(Math.max(1, playerLevel))
  
  const options: RepairOption[] = []
  const tierMult =
    TIER_REPAIR_MULTIPLIERS[weapon.tier] ?? TIER_REPAIR_MULTIPLIERS.common
  
  for (const [type, baseOption] of Object.entries(REPAIR_TYPES)) {
    // Усиление доступно только грандмастерам
    if (type === 'enhancement' && !mastery.canEnhance) continue
    
    // Реставрация требует способности восстановления maxDur
    if (type === 'restoration' && weapon.maxDurability < 100 && !mastery.canRestoreMaxDur) {
      // Можно сделать реставрацию, но maxDur не восстановится
    }
    
    const materials = getRepairMaterials(weapon, type as RepairType)
    const goldCost = getRepairGoldCost(weapon, type as RepairType, mastery)
    
    // Применяем бонусы мастерства
    const adjustedMaxDurLoss = Math.max(0, 
      baseOption.maxDurabilityLoss - (baseOption.maxDurabilityLoss * mastery.maxDurLossReduction / 100)
    )
    
    const adjustedSoulLoss = Math.max(0,
      baseOption.soulLossPercent - (baseOption.soulLossPercent * mastery.soulLossReduction / 100)
    )
    
    const adjustedEpicLoss = Math.max(0,
      baseOption.epicLossPercent - (baseOption.epicLossPercent * mastery.epicLossReduction / 100)
    )
    
    // Шанс успеха с учётом мастерства и тира
    const successChance = Math.min(100, Math.max(0,
      baseOption.baseSuccessChance + mastery.successBonus - tierMult.successPenalty
    ))
    
    // Скидка на материалы
    const discountedMaterials: CraftingCost = {}
    for (const [mat, amount] of Object.entries(materials)) {
      discountedMaterials[mat as keyof CraftingCost] = Math.ceil(
        (amount as number) * (1 - mastery.discountPercent / 100)
      )
    }
    
    options.push({
      ...baseOption,
      materials: discountedMaterials,
      goldCost,
      maxDurabilityLoss: adjustedMaxDurLoss,
      soulLossPercent: adjustedSoulLoss,
      epicLossPercent: adjustedEpicLoss,
      baseSuccessChance: successChance,
    })
  }
  
  return options
}

/**
 * Выполнить ремонт оружия
 */
export function executeRepair(
  weapon: WeaponRepairCalc,
  option: RepairOption,
  playerLevel: number
): RepairResult {
  const mastery = getSmithMastery(Math.max(1, playerLevel))
  
  // Базовый результат
  const result: RepairResult = {
    success: false,
    durabilityRestored: 0,
    maxDurabilityBefore: weapon.maxDurability,
    maxDurabilityAfter: weapon.maxDurability,
    soulLost: 0,
    attackLost: 0,
    epicLost: 0,
    criticalFailure: false,
  }
  
  // Проверяем успех
  const roll = Math.random() * 100
  const success = roll <= option.baseSuccessChance
  
  if (!success) {
    // Провал ремонта
    result.success = false
    result.criticalFailure = roll > option.baseSuccessChance + 15 // Критический провал
    
    if (result.criticalFailure) {
      // Критический провал - оружие повреждено
      result.durabilityRestored = -5 // Даже минус к прочности
      result.maxDurabilityAfter = Math.max(10, weapon.maxDurability - 10)
    }
    
    return result
  }
  
  // Успешный ремонт
  result.success = true
  result.durabilityRestored = option.durabilityRestore
  
  // Потеря максимальной прочности
  const maxDurLossRoll = Math.random() * 100
  if (maxDurLossRoll > mastery.attackPreservation) {
    result.maxDurabilityAfter = Math.max(10, 
      weapon.maxDurability - option.maxDurabilityLoss
    )
  } else {
    // Мастерство спасло от потери maxDur
    result.maxDurabilityAfter = weapon.maxDurability
  }
  
  // Реставрация может восстановить maxDurability
  if (option.type === 'restoration' && mastery.canRestoreMaxDur) {
    result.maxDurabilityAfter = Math.min(100, weapon.maxDurability + 5)
  }
  
  // Потеря души войны
  if (weapon.warSoul > 0 && option.soulLossPercent > 0) {
    result.soulLost = Math.floor(weapon.warSoul * option.soulLossPercent / 100)
  }
  
  // Потеря атаки (редко)
  if (option.attackLossChance > 0 && Math.random() * 100 < option.attackLossChance) {
    result.attackLost = Math.floor(weapon.attack * option.attackLossPercent / 100)
  }
  
  // Потеря эпичности
  if (weapon.epicMultiplier > 1 && option.epicLossPercent > 0) {
    result.epicLost = Number((weapon.epicMultiplier * option.epicLossPercent / 100).toFixed(2))
  }
  
  return result
}

/**
 * Проверить, доступен ли тип ремонта для данного оружия и кузнеца
 */
export function isRepairOptionAvailable(
  weapon: WeaponRepairCalc,
  option: RepairOption,
  playerLevel: number
): { available: boolean; reason?: string } {
  // Оружие уже на 100% прочности
  if (weapon.durability >= 100 && option.type !== 'enhancement') {
    return { available: false, reason: 'Оружие не требует ремонта' }
  }
  
  const mastery = getSmithMastery(Math.max(1, playerLevel))

  // Усиление требует грандмастера
  if (option.type === 'enhancement') {
    if (!mastery.canEnhance) {
      return { available: false, reason: 'Требуется более высокий уровень персонажа (мастерство грандмастера)' }
    }
  }
  
  // Реставрация требует Эксперта+
  if (option.type === 'restoration' && weapon.maxDurability < 100) {
    if (!mastery.canRestoreMaxDur) {
      return { available: false, reason: 'Требуется более высокий уровень персонажа для восстановления max прочности' }
    }
  }
  
  return { available: true }
}

/**
 * Получить текстовое описание риска
 */
export function getRiskDescription(option: RepairOption, _mastery: SmithMasteryLevel): string[] {
  const risks: string[] = []
  
  if (option.maxDurabilityLoss > 0) {
    risks.push(`Потеря макс. прочности: ${option.maxDurabilityLoss.toFixed(1)}%`)
  }
  
  if (option.soulLossPercent > 0) {
    risks.push(`Потеря души войны: ${option.soulLossPercent}%`)
  }
  
  if (option.attackLossChance > 0) {
    risks.push(`Шанс потери атаки: ${option.attackLossChance}%`)
  }
  
  if (option.epicLossPercent > 0) {
    risks.push(`Потеря эпичности: ${option.epicLossPercent}%`)
  }
  
  if (option.baseSuccessChance < 100) {
    risks.push(`Шанс успеха: ${option.baseSuccessChance}%`)
  }
  
  if (option.baseSuccessChance >= 100) {
    risks.push('Гарантированный успех')
  }
  
  return risks
}

export default {
  SMITH_MASTERY_LEVELS,
  REPAIR_TYPES,
  TIER_REPAIR_MULTIPLIERS,
  getSmithMastery,
  getRepairMaterials,
  getRepairGoldCost,
  getRepairOptions,
  executeRepair,
  isRepairOptionAvailable,
  getRiskDescription,
}
