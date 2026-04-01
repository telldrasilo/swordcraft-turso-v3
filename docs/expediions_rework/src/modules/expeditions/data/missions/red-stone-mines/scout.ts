/**
 * Миссии разведки для локации "Рудники Красного Камня"
 *
 * Цель разведки: исследование неизвестных областей, поиск новых жил,
 * оценка безопасности и выявление опасностей
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// КАРТОГРАФИРОВАНИЕ ЗАБРОШЕННЫХ ШТОЛЕН (common, easy)
// ============================================================================

export const scoutAbandonedTunnelsCommon: MissionTemplate = {
  id: 'red_stone_scout_abandoned_1',
  locationId: 'red_stone_mines',

  type: 'scout',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Карта забытых туннелей',
  description: `Старшие шахтёры говорят, что на нижних уровнях есть система заброшенных туннелей, прорытых ещё столетия назад. Никто точно не знает их протяжённости и назначения — старые карты утеряны, а те, кто спускался туда, редко возвращались. Бригадир хочет получить актуальную карту этих штолен, чтобы понять, можно ли их использовать для транспортировки руды или расширения добычи.`,
  objective: 'Исследовать и составить карту заброшенных туннелей',

  client: {
    name: 'Бригадир Харальд',
    type: 'commoner',
    description: 'Планирует оптимизировать работу шахты',
  },

  duration: {
    base: 2700,           // 45 минут
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 12,
      variance: 0.1,
      perDifficulty: 6,
      perRarity: 3,
    },
    deposit: {
      base: 25,
      variance: 0.1,
      perDifficulty: 12,
      perRarity: 6,
    },
  },

  reward: {
    gold: {
      base: 55,
      variance: 0.2,
      perDifficulty: 28,
      perRarity: 14,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 22,
      variance: 0.1,
      perDifficulty: 11,
      perRarity: 6,
    },
    warSoul: {
      base: 6,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК НОВОЙ ЖИЛЫ (uncommon, normal)
// ============================================================================

export const scoutNewVeinUncommon: MissionTemplate = {
  id: 'red_stone_scout_vein_1',
  locationId: 'red_stone_mines',

  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Следы богатой жилы',
  description: `Опытный геолог осмотрел образцы породы из глубокой штольни и уверен — где-то поблизости должна быть богатая жила меди с примесью серебра. Следы указывают на туннель, который шахтёры пробили на прошлой неделе, но забросили из-за обвала. Если жила существует, её разработка принесёт шахте немалую прибыль. Нужен кто-то, кто пройдёт через завал и определит точное местоположение залежей.`,
  objective: 'Найти и отметить на карте новую рудную жилу',

  client: {
    name: 'Геолог Мариус',
    type: 'scholar',
    description: 'Учёный, специализирующийся на горном деле',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 18,
      variance: 0.1,
      perDifficulty: 9,
      perRarity: 5,
    },
    deposit: {
      base: 35,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
    },
  },

  reward: {
    gold: {
      base: 95,
      variance: 0.2,
      perDifficulty: 48,
      perRarity: 24,
    },
    glory: {
      base: 4,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 38,
      variance: 0.1,
      perDifficulty: 19,
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
// ИССЛЕДОВАНИЕ ГЛУБОКОЙ ШТОЛЬНИ (rare, hard)
// ============================================================================

export const scoutDeepShaftRare: MissionTemplate = {
  id: 'red_stone_scout_deep_1',
  locationId: 'red_stone_mines',

  type: 'scout',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Зеркальные залы',
  description: `Бригадир рассказывает о странной находке: рабочие пробили стену в глубокой штольне и обнаружили древний туннель, явно не естественного происхождения. Стены там гладкие, как полированное стекло, а воздух холодный, как в могиле. Двое рабочих, попытались исследовать проход — они пропали без следа. Шахта нуждается в том, чтобы кто-то выяснил, что скрывается в этих "зеркальных залах" и можно ли их безопасно использовать.`,
  objective: 'Исследовать зеркальные залы и выяснить природу опасности',

  client: {
    name: 'Владелец шахты Баргус',
    type: 'merchant',
    description: 'Богатый торговец, владеющий рудниками',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 30,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
    },
    deposit: {
      base: 60,
      variance: 0.1,
      perDifficulty: 30,
      perRarity: 15,
    },
  },

  reward: {
    gold: {
      base: 180,
      variance: 0.2,
      perDifficulty: 90,
      perRarity: 45,
    },
    glory: {
      base: 10,
      variance: 0,
      perDifficulty: 5,
      perRarity: 3,
    },
    experience: {
      base: 70,
      variance: 0.1,
      perDifficulty: 35,
      perRarity: 18,
    },
    warSoul: {
      base: 28,
      variance: 0.2,
      perDifficulty: 14,
      perRarity: 10,
    },
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const redStoneScoutMissions: MissionTemplate[] = [
  scoutAbandonedTunnelsCommon,
  scoutNewVeinUncommon,
  scoutDeepShaftRare,
];
