/**
 * Миссии спасения для локации "Рудники Красного Камня"
 *
 * Спасательные миссии требуют найти и вывести пострадавших
 * из опасных зон шахты
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СПАСЕНИЕ ЗАСТРЯВШИХ ШАХТЁРОВ (common, normal)
// ============================================================================

export const rescueTrappedMinersCommon: MissionTemplate = {
  id: 'red_stone_rescue_trapped_1',
  locationId: 'red_stone_mines',

  type: 'rescue',
  rarity: 'common',
  difficulty: 'normal',

  name: 'За обвалом',
  description: `Небольшой обвал заблокировал выход из боковой штольни, где работала бригада из трёх шахтёров. Они подают сигналы ударом по породе — живы, но выйти не могут. Пробивать завал некогда — воздух там ограничен. Однако есть другой путь: через старые туннели можно обойти обвал с другой стороны. Нужен кто-то, кто знает эти штольни или достаточно смел, чтобы попытаться.`,
  objective: 'Найти путь к заблокированной штольне и вывести шахтёров',

  client: {
    name: 'Старший смены Грегор',
    type: 'commoner',
    description: 'Организует спасательную операцию',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 15,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
    deposit: {
      base: 30,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
    },
  },

  reward: {
    gold: {
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 23,
    },
    glory: {
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
    },
    experience: {
      base: 40,
      variance: 0.1,
      perDifficulty: 20,
      perRarity: 10,
    },
    warSoul: {
      base: 12,
      variance: 0.2,
      perDifficulty: 6,
      perRarity: 4,
    },
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ПОИСК ПРОПАВШЕГО НОВИЧКА (uncommon, hard)
// ============================================================================

export const rescueLostApprenticeUncommon: MissionTemplate = {
  id: 'red_stone_rescue_apprentice_1',
  locationId: 'red_stone_mines',

  type: 'rescue',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Потерявшийся в глубине',
  description: `Молодой подмастерье по имени Тоб, отправился за инструментом в складскую штольню и не вернулся. Прошло уже несколько часов. Ветераны говорят, что он мог забрести в старые туннели, где легко потерять ориентировку во тьме. Бригадир опасается худшего — в глубине водят призраки, а местами встречаются пауки и крысы. Нужно найти парня, пока он не наткнулся на что-то опасное или не погиб от холода и истощения.`,
  objective: 'Найти потерявшегося подмастерья в глубине шахты',

  client: {
    name: 'Бригадир Харальд',
    type: 'commoner',
    description: 'Беспокоится за жизнь молодого работника',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 22,
      variance: 0.1,
      perDifficulty: 11,
      perRarity: 6,
    },
    deposit: {
      base: 45,
      variance: 0.1,
      perDifficulty: 22,
      perRarity: 12,
    },
  },

  reward: {
    gold: {
      base: 130,
      variance: 0.2,
      perDifficulty: 65,
      perRarity: 33,
    },
    glory: {
      base: 8,
      variance: 0,
      perDifficulty: 4,
      perRarity: 3,
    },
    experience: {
      base: 50,
      variance: 0.1,
      perDifficulty: 25,
      perRarity: 13,
    },
    warSoul: {
      base: 20,
      variance: 0.2,
      perDifficulty: 10,
      perRarity: 7,
    },
  },

  enemies: {
    types: ['ore_rat', 'cave_spider', 'lost_miner'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const redStoneRescueMissions: MissionTemplate[] = [
  rescueTrappedMinersCommon,
  rescueLostApprenticeUncommon,
];
