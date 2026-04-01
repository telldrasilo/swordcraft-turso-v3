/**
 * ШАБЛОН МИССИИ ЭКСПЕДИЦИИ
 *
 * Этот файл содержит шаблон и типы для создания миссий.
 * Используйте его как справочник при создании новых миссий.
 *
 * Расположение миссий:
 * src/modules/expeditions/data/missions/
 *   ├── _mission-template.ts    <- Этот файл (шаблон)
 *   ├── index.ts                 <- Реестр миссий
 *   ├── oak-grove-outskirts/     <- Миссии для локации 1
 *   │   ├── hunt.ts
 *   │   ├── scout.ts
 *   │   └── ...
 *   ├── red-stone-mines/         <- Миссии для локации 2
 *   └── ...
 */

import { getRandomValue, applyResourceMultiplier } from '../../lib/balance-config';

// ============================================================================
// ТИПЫ ДОГОВОРОВ
// ============================================================================

/**
 * Тип договора между кузнецом и искателем
 * Определяет распределение награды и бонусы
 */
export type ContractType = 'exploration' | 'speed';

/**
 * Конфигурация договоров
 */
export const CONTRACT_CONFIG = {
  /**
   * Договор исследования (80/20)
   * Кузнец: 20% золота (аренда оружия)
   * Искатель: 80% золота
   * Бонус: +50% к шансу найти материалы
   * Мотивация искателя: исследовать локацию, найти ресурсы
   */
  exploration: {
    name: 'Договор исследования',
    description: 'Искатель получает большую часть награды, но обязан тщательно исследовать местность',
    blacksmithGoldPercent: 20,
    adventurerGoldPercent: 80,
    materialFindMultiplier: 1.5,      // +50% к шансу найти материалы
    durationMultiplier: 1.0,          // Стандартная длительность
    eventChanceBonus: 20,             // +20% шанс дополнительных событий
  },

  /**
   * Договор скорости (50/50)
   * Кузнец: 50% золота
   * Искатель: 50% золота
   * Бонус: -30% к длительности миссии
   * Мотивация искателя: закончить быстро
   */
  speed: {
    name: 'Договор скорости',
    description: 'Равное разделение награды, миссия выполняется быстрее',
    blacksmithGoldPercent: 50,
    adventurerGoldPercent: 50,
    materialFindMultiplier: 0.7,      // -30% к шансу найти материалы
    durationMultiplier: 0.7,          // -30% к длительности
    eventChanceBonus: -20,            // -20% шанс событий
  },
} as const;

// ============================================================================
// КОМИССИЯ ГИЛЬДИИ
// ============================================================================

/**
 * Комиссия гильдии за посредничество
 * Вычитается из награды заказчика ПЕРЕД распределением
 */
export const GUILD_COMMISSION = {
  basePercent: 15,                    // Базовая комиссия 15%
  perGuildLevel: 2,                   // +2% за каждый уровень гильдии
  maxPercent: 30,                     // Максимум 30%

  /**
   * Рассчитать комиссию
   */
  calculate(guildLevel: number): number {
    return Math.min(
      this.maxPercent,
      this.basePercent + (guildLevel - 1) * this.perGuildLevel
    );
  },
};

// ============================================================================
// РЕДКОСТЬ МИССИИ
// ============================================================================

export type MissionRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const MISSION_RARITY_CONFIG = {
  common: {
    name: 'Обычная',
    weight: 100,                      // Вес при генерации (чем выше, тем чаще)
    rewardMultiplier: 1.0,
    materialChanceBonus: 0,
    eventCountBonus: 0,
    minGuildLevel: 1,
  },
  uncommon: {
    name: 'Необычная',
    weight: 40,
    rewardMultiplier: 1.5,
    materialChanceBonus: 15,
    eventCountBonus: 1,
    minGuildLevel: 2,
  },
  rare: {
    name: 'Редкая',
    weight: 15,
    rewardMultiplier: 2.5,
    materialChanceBonus: 30,
    eventCountBonus: 2,
    minGuildLevel: 4,
  },
  epic: {
    name: 'Эпическая',
    weight: 5,
    rewardMultiplier: 4.0,
    materialChanceBonus: 50,
    eventCountBonus: 3,
    minGuildLevel: 7,
  },
  legendary: {
    name: 'Легендарная',
    weight: 1,
    rewardMultiplier: 8.0,
    materialChanceBonus: 100,
    eventCountBonus: 5,
    minGuildLevel: 10,
  },
} as const;

// ============================================================================
// СЛОЖНОСТЬ МИССИИ
// ============================================================================

export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export const MISSION_DIFFICULTY_CONFIG = {
  easy: {
    name: 'Лёгкая',
    durationMultiplier: 0.5,          // 30 минут база
    enemyLevelMultiplier: 0.8,
    enemyCountBase: 3,
    enemyCountVariance: 2,
    successChanceBase: 85,
    failurePenalty: 0.5,              // 50% потери при провале
    costMultiplier: 0.8,
  },
  normal: {
    name: 'Обычная',
    durationMultiplier: 1.0,          // 1 час база
    enemyLevelMultiplier: 1.0,
    enemyCountBase: 5,
    enemyCountVariance: 3,
    successChanceBase: 70,
    failurePenalty: 0.7,
    costMultiplier: 1.0,
  },
  hard: {
    name: 'Сложная',
    durationMultiplier: 2.0,          // 2 часа база
    enemyLevelMultiplier: 1.3,
    enemyCountBase: 7,
    enemyCountVariance: 4,
    successChanceBase: 50,
    failurePenalty: 1.0,
    costMultiplier: 1.5,
  },
  extreme: {
    name: 'Экстремальная',
    durationMultiplier: 4.0,          // 4 часа база
    enemyLevelMultiplier: 1.6,
    enemyCountBase: 10,
    enemyCountVariance: 5,
    successChanceBase: 30,
    failurePenalty: 1.5,              // Потеря залога + штраф
    costMultiplier: 2.5,
  },
} as const;

// ============================================================================
// ТИП МИССИИ
// ============================================================================

export type MissionType =
  | 'hunt'      // Охота на существ
  | 'scout'     // Разведка местности
  | 'clear'     // Зачистка территории
  | 'gather'    // Сбор ресурсов
  | 'rescue'    // Спасение
  | 'delivery'  // Доставка
  | 'escort'    // Сопровождение
  | 'investigate'; // Расследование

export const MISSION_TYPE_CONFIG = {
  hunt: {
    name: 'Охота',
    icon: '🗡️',
    description: 'Уничтожить указанных существ',
    baseGoldPerEnemy: 10,
    preferredContract: 'exploration',
  },
  scout: {
    name: 'Разведка',
    icon: '🔭',
    description: 'Исследовать территорию',
    baseGoldPerMinute: 2,
    preferredContract: 'exploration',
  },
  clear: {
    name: 'Зачистка',
    icon: '⚔️',
    description: 'Очистить территорию от врагов',
    baseGoldPerEnemy: 15,
    preferredContract: 'speed',
  },
  gather: {
    name: 'Сбор',
    icon: '🎒',
    description: 'Собрать указанные ресурсы',
    baseGoldPerResource: 5,
    preferredContract: 'exploration',
  },
  rescue: {
    name: 'Спасение',
    icon: '🆘',
    description: 'Найти и спасти персонажа',
    baseGoldFixed: 100,
    preferredContract: 'speed',
  },
  delivery: {
    name: 'Доставка',
    icon: '📦',
    description: 'Доставить груз в точку назначения',
    baseGoldPerMinute: 1.5,
    preferredContract: 'speed',
  },
  escort: {
    name: 'Сопровождение',
    icon: '🛡️',
    description: 'Сопроводить персонажа до цели',
    baseGoldPerMinute: 3,
    preferredContract: 'speed',
  },
  investigate: {
    name: 'Расследование',
    icon: '🔍',
    description: 'Исследовать загадочное происшествие',
    baseGoldFixed: 80,
    preferredContract: 'exploration',
  },
} as const;

// ============================================================================
// МАСШТАБИРУЕМЫЕ ЗНАЧЕНИЯ
// ============================================================================

/**
 * Масштабируемое значение
 * base: базовое значение
 * variance: ±процент случайного отклонения
 * perDifficulty: добавка за уровень сложности (0=easy, 1=normal, 2=hard, 3=extreme)
 * perRarity: добавка за редкость (0=common, 1=uncommon, 2=rare, 3=epic)
 */
export interface ScalableValue {
  base: number;
  variance: number;       // 0.2 = ±20%
  perDifficulty: number;
  perRarity: number;
}

/**
 * Рассчитать итоговое значение с учётом глобальных множителей
 *
 * @param scalable - Масштабируемое значение
 * @param difficulty - Сложность миссии
 * @param rarity - Редкость миссии
 * @param resourceType - Тип ресурса (для применения соответствующего множителя)
 */
export function calculateValue(
  scalable: ScalableValue,
  difficulty: MissionDifficulty,
  rarity: MissionRarity,
  resourceType?: 'material' | 'gold' | 'experience' | 'glory' | 'warSoul'
): number {
  const diffLevel = { easy: 0, normal: 1, hard: 2, extreme: 3 }[difficulty];
  const rarityLevel = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }[rarity];

  const base = scalable.base + scalable.perDifficulty * diffLevel + scalable.perRarity * rarityLevel;

  // Применяем случайность с учётом настроек дебага
  const valueWithVariance = getRandomValue(base, scalable.variance);

  // Применяем глобальный множитель если указан тип ресурса
  if (resourceType) {
    return applyResourceMultiplier(valueWithVariance, resourceType);
  }

  return valueWithVariance;
}

// ============================================================================
// ШАБЛОН МИССИИ
// ============================================================================

export interface MissionTemplate {
  // === ИДЕНТИФИКАЦИЯ ===
  id: string;                          // Уникальный ID: 'oak_grove_hunt_boars_1'
  locationId: string;                  // ID локации: 'oak_grove_outskirts'

  // === КЛАССИФИКАЦИЯ ===
  type: MissionType;                   // Тип миссии
  rarity: MissionRarity;               // Редкость
  difficulty: MissionDifficulty;       // Сложность

  // === ЛИТЕРАТУРНОЕ ОПИСАНИЕ ===
  name: string;                        // Краткое название
  description: string;                 // 3-6 предложений, атмосферное описание
  objective: string;                   // Чёткая цель одной строкой

  // === ЗАКАЗЧИК ===
  client: MissionClient;

  // === ВРЕМЯ ВЫПОЛНЕНИЯ ===
  duration: ScalableValue;             // В секундах

  // === ЗАТРАТЫ (ПЛАТЯТ КУЗНЕЦ) ===
  cost: MissionCost;

  // === НАГРАДА ОТ ЗАКАЗЧИКА ===
  reward: MissionReward;

  // === ВРАГИ (для боевых миссий) ===
  enemies?: MissionEnemies;

  // === РЕСУРСЫ (для gather миссий) ===
  resources?: MissionResourceTarget[];

  // === ТРЕБОВАНИЯ ===
  requirements?: MissionRequirements;

  // === ПОВТОРЯЕМОСТЬ ===
  isRepeatable: boolean;
  cooldownHours: number;

  // === УСЛОВИЯ ПОЯВЛЕНИЯ ===
  conditions?: MissionCondition[];
}

// ============================================================================
// СВЯЗАННЫЕ ТИПЫ
// ============================================================================

export interface MissionClient {
  name: string;                        // Имя заказчика
  type: 'farmer' | 'merchant' | 'noble' | 'guild' | 'military' | 'scholar' | 'commoner';
  description?: string;                // Краткое описание
}

export interface MissionCost {
  /**
   * Расходники (еда, медицина, припасы)
   * Платит кузнец из своего кармана
   */
  supplies: ScalableValue;

  /**
   * Залог за оружие
   * Возвращается при успехе, теряется при провале
   */
  deposit: ScalableValue;
}

export interface MissionReward {
  /**
   * Золото от заказчика
   * Это фиксированная сумма, которую готов заплатить NPC
   * Распределяется: гильдия -> кузнец/искатель по договору
   */
  gold: ScalableValue;

  /**
   * Слава для гильдии
   */
  glory: ScalableValue;

  /**
   * Опыт для искателя
   */
  experience: ScalableValue;

  /**
   * Очки Души войны для оружия
   * Кузнец заинтересован в этом
   */
  warSoul: ScalableValue;

  /**
   * Гарантированные материалы (награда от заказчика)
   */
  guaranteedMaterials?: MaterialReward[];

  /**
   * Репутация у фракции (если применимо)
   */
  reputation?: {
    faction: string;
    amount: ScalableValue;
  };
}

export interface MaterialReward {
  materialId: string;
  quantity: ScalableValue;
}

export interface MissionEnemies {
  types: string[];                     // ID типов врагов
  count: ScalableValue;                // Количество
  levelBonus: number;                  // +к уровню врагов
}

export interface MissionResourceTarget {
  materialId: string;
  quantity: ScalableValue;
  optional?: boolean;                  // Можно ли не найти
}

export interface MissionRequirements {
  minGuildLevel?: number;
  minAdventurerLevel?: number;
  minWeaponAttack?: number;
  recommendedWeaponTypes?: string[];
  requiredItems?: string[];
}

export interface MissionCondition {
  type: 'time_of_day' | 'weather' | 'quest_completed' | 'location_cleared' | 'min_reputation';
  value: string | number;
}

// ============================================================================
// ПРИМЕР ЗАПОЛНЕННОЙ МИССИИ
// ============================================================================

export const EXAMPLE_MISSION: MissionTemplate = {
  id: 'oak_grove_hunt_boars_1',
  locationId: 'oak_grove_outskirts',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Охота на кабанов',
  description: `Фермеры из ближней деревни жалуются на стаю диких кабанов, которая портит посевы на краю рощи. Животные стали агрессивны и нападают на всех, кто приближается к их территории. Староста просит застрелить несколько зверей, чтобы отпугнуть остальных. Следы ведут в густые заросли у старого ручья, где кабаны устроили лежбище.`,
  objective: 'Убить 3-5 диких кабанов в зарослях у ручья',

  client: {
    name: 'Староста деревни Ольховка',
    type: 'farmer',
    description: 'Пожилой крестьянин, обеспокоенный урожаем',
  },

  duration: {
    base: 1800,           // 30 минут
    variance: 0.2,
    perDifficulty: 600,   // +10 минут за уровень сложности
    perRarity: 300,       // +5 минут за редкость
  },

  cost: {
    supplies: {
      base: 10,
      variance: 0.1,
      perDifficulty: 5,
      perRarity: 3,
    },
    deposit: {
      base: 20,
      variance: 0.1,
      perDifficulty: 10,
      perRarity: 5,
    },
  },

  reward: {
    gold: {
      base: 50,           // Базовая награда от заказчика
      variance: 0.2,
      perDifficulty: 25,
      perRarity: 15,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 20,
      variance: 0.1,
      perDifficulty: 10,
      perRarity: 5,
    },
    warSoul: {
      base: 5,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
    guaranteedMaterials: [
      {
        materialId: 'raw_leather',
        quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      },
    ],
  },

  enemies: {
    types: ['wild_boar'],
    count: {
      base: 3,
      variance: 0.3,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  requirements: {
    minGuildLevel: 1,
    minAdventurerLevel: 1,
    minWeaponAttack: 5,
  },

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// ФУНКЦИЯ РАСПРЕДЕЛЕНИЯ НАГРАДЫ
// ============================================================================

export interface RewardDistribution {
  guildCommission: number;
  blacksmithGold: number;
  adventurerGold: number;
  materials: Array<{ materialId: string; quantity: number }>;
  warSoul: number;
  glory: number;
  experience: number;
}

/**
 * Рассчитать распределение награды
 *
 * @param totalGold - Общая награда от заказчика
 * @param guildLevel - Уровень гильдии
 * @param contractType - Тип договора
 * @param materials - Найденные материалы
 * @param contractConfig - Конфигурация договоров (для переключения)
 */
export function calculateRewardDistribution(
  totalGold: number,
  guildLevel: number,
  contractType: ContractType,
  materials: Array<{ materialId: string; quantity: number }>,
  warSoul: number,
  glory: number,
  experience: number,
  contractConfig: typeof CONTRACT_CONFIG = CONTRACT_CONFIG
): RewardDistribution {
  // 1. Вычисляем комиссию гильдии
  const commissionPercent = GUILD_COMMISSION.calculate(guildLevel);
  const guildCommission = Math.floor(totalGold * commissionPercent / 100);

  // 2. Оставшаяся сумма после комиссии
  const remainingGold = totalGold - guildCommission;

  // 3. Распределяем по договору
  const contract = contractConfig[contractType];
  const blacksmithGold = Math.floor(remainingGold * contract.blacksmithGoldPercent / 100);
  const adventurerGold = remainingGold - blacksmithGold;

  // 4. Применяем модификаторы материалов
  const adjustedMaterials = materials.map(m => ({
    materialId: m.materialId,
    quantity: Math.floor(m.quantity * contract.materialFindMultiplier),
  }));

  return {
    guildCommission,
    blacksmithGold,
    adventurerGold,
    materials: adjustedMaterials,
    warSoul,
    glory,
    experience,
  };
}

// ============================================================================
// ЭКСПОРТ КОНФИГОВ
// ============================================================================

// Все экспорты уже сделаны inline выше
