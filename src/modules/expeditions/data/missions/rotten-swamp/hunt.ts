/**
 * Боевые миссии для локации "Гнилое Болото"
 *
 * Враги из локации:
 * - Трупный червь (corpse_worm) [3-6 ур.]
 * - Ядовитый тритон (poison_newt) [4-7 ур.]
 * - Гнилой утопленник (rotten_drowned) [5-8 ур.]
 * - Болото-лич (swamp_lich) [7-11 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА ТРУПНЫХ ЧЕРВЕЙ (common, normal)
// ============================================================================

export const huntCorpseWormsCommon: MissionTemplate = {
  id: 'rotten_swamp_hunt_worms_1',
  locationId: 'rotten_swamp',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Падальщики трясины',
  description: `Трупные черви — огромные падальщики, обитающие в гнилых водах болота. Они не нападают первыми, но привлекают других хищников запахом разложения. Трупоед просит уничтожить несколько червей, чтобы уменьшить их популяцию — они мешают ему собирать "материал".`,
  objective: 'Уничтожить 4-6 трупных червей',

  client: {
    name: 'Трупоед Гнил',
    type: 'commoner',
    description: 'Странный человек, живущий охотой за мёртвыми',
  },

  duration: {
    base: 3600,
    variance: 0.2,
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
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 23,
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
      base: 14,
      variance: 0.2,
      perDifficulty: 7,
      perRarity: 5,
    },
  },

  enemies: {
    types: ['corpse_worm'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ОХОТА НА ЯДОВИТЫХ ТРИТОНОВ (uncommon, normal)
// ============================================================================

export const huntPoisonNewtsUncommon: MissionTemplate = {
  id: 'rotten_swamp_hunt_newts_1',
  locationId: 'rotten_swamp',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Яд в воде',
  description: `Ядовитые тритоны расплодились в восточной части болота. Их кожа выделяет токсин, смертельный при контакте. Отравитель-отшельник просит зачистить территорию — он хочет собирать яд, но не может подобраться к тритонам из-за их численности.`,
  objective: 'Уничтожить 4-5 ядовитых тритонов',

  client: {
    name: 'Отравитель Скальд',
    type: 'scholar',
    description: 'Создаёт яды и противоядия',
  },

  duration: {
    base: 4500,
    variance: 0.2,
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
      base: 120,
      variance: 0.2,
      perDifficulty: 60,
      perRarity: 30,
    },
    glory: {
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
    },
    experience: {
      base: 48,
      variance: 0.1,
      perDifficulty: 24,
      perRarity: 12,
    },
    warSoul: {
      base: 20,
      variance: 0.2,
      perDifficulty: 10,
      perRarity: 7,
    },
  },

  enemies: {
    types: ['poison_newt'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ГНИЛЫЕ УТОПЛЕННИКИ (uncommon, hard)
// ============================================================================

export const huntDrownedUncommon: MissionTemplate = {
  id: 'rotten_swamp_hunt_drowned_1',
  locationId: 'rotten_swamp',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Восставшие из тины',
  description: `Гнилые утопленники — мёртвые, поднятые из болота самой токсичной средой. Они бродят по трясине в поисках живой плоти. Болотный целитель просит уничтожить их, пока они не добрались до его хижины.`,
  objective: 'Уничтожить 4-6 гнилых утопленников',

  client: {
    name: 'Болотный целитель Мёрт',
    type: 'scholar',
    description: 'Лечит отравления и болезни болота',
  },

  duration: {
    base: 4500,
    variance: 0.25,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 25,
      variance: 0.1,
      perDifficulty: 12,
      perRarity: 6,
    },
    deposit: {
      base: 50,
      variance: 0.1,
      perDifficulty: 25,
      perRarity: 13,
    },
  },

  reward: {
    gold: {
      base: 150,
      variance: 0.2,
      perDifficulty: 75,
      perRarity: 38,
    },
    glory: {
      base: 8,
      variance: 0,
      perDifficulty: 4,
      perRarity: 3,
    },
    experience: {
      base: 55,
      variance: 0.1,
      perDifficulty: 28,
      perRarity: 14,
    },
    warSoul: {
      base: 25,
      variance: 0.2,
      perDifficulty: 13,
      perRarity: 8,
    },
  },

  enemies: {
    types: ['rotten_drowned'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// БОЛОТО-ЛИЧ (rare, extreme)
// ============================================================================

export const huntSwampLichRare: MissionTemplate = {
  id: 'rotten_swamp_hunt_lich_1',
  locationId: 'rotten_swamp',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',

  name: 'Хозяин гниения',
  description: `В центре болота обитает болото-лич — некромант, слившийся с болотом в ритуале бессмертия. Он контролирует всех мёртвых в округе и отравляет воды своими заклинаниями. Отравитель Скальд говорит, что лич — хранитель Сердца гниения. Уничтожение лича откроет путь к древнему артефакту.`,
  objective: 'Победить болото-лича',

  client: {
    name: 'Дух утопленника',
    type: 'commoner',
    description: 'Просит освободить его и других от власти лича',
  },

  duration: {
    base: 7200,
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 40,
      variance: 0.1,
      perDifficulty: 20,
      perRarity: 10,
    },
    deposit: {
      base: 80,
      variance: 0.1,
      perDifficulty: 40,
      perRarity: 20,
    },
  },

  reward: {
    gold: {
      base: 350,
      variance: 0.2,
      perDifficulty: 175,
      perRarity: 88,
    },
    glory: {
      base: 20,
      variance: 0,
      perDifficulty: 10,
      perRarity: 7,
    },
    experience: {
      base: 120,
      variance: 0.1,
      perDifficulty: 60,
      perRarity: 30,
    },
    warSoul: {
      base: 60,
      variance: 0.2,
      perDifficulty: 30,
      perRarity: 20,
    },
  },

  enemies: {
    types: ['swamp_lich', 'rotten_drowned', 'rotten_drowned'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 2,
  },

  isRepeatable: true,
  cooldownHours: 16,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const rottenSwampHuntMissions: MissionTemplate[] = [
  huntCorpseWormsCommon,
  huntPoisonNewtsUncommon,
  huntDrownedUncommon,
  huntSwampLichRare,
];
