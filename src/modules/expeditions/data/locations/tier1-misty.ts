/**
 * Локация 3: Туманные Низины
 * Tier 1 - Стартовая локация
 */

import type { Location } from '../../types';

export const mistyLowlands: Location = {
  id: 'misty_lowlands',
  name: 'Туманные Низины',
  description: `Низменность между холмами, где вечно стелется туман. Почва здесь нестабильна —
трясина может поглотить неосторожного путника за считанные секунды. Местные жители обходят
это место стороной, но травники и алхимики ценят его за редкие растения.`,

  tier: 1,
  type: 'swamp',
  tags: ['swamp', 'wetlands', 'fog', 'mysterious', 'herbs', 'dead_ground'],

  unlockRequirements: {
    guildLevel: 1,
  },

  resources: [
    // Базовые материалы
    { materialId: 'iron_ore', baseWeight: 30, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'fieldstone', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'raw_leather', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'coal', baseWeight: 20, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
    // Новые материалы
    { materialId: 'clay', baseWeight: 90, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'peat', baseWeight: 80, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'bones', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'swamp_moss', baseWeight: 70, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'mist_herbs', baseWeight: 25, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
  ],

  rarityDistribution: { common: 90, uncommon: 10, rare: 0, epic: 0, legendary: 0 },

  weather: [
    { id: 'dense_fog', name: 'Густой туман', chance: 50, effects: [
      { type: 'stealth', value: 25 },
      { type: 'visibility', value: -30 }
    ]},
    { id: 'light_fog', name: 'Лёгкий туман', chance: 25, effects: [
      { type: 'stealth', value: 10 },
      { type: 'visibility', value: -15 }
    ]},
    { id: 'rain', name: 'Дождь', chance: 15, effects: [
      { type: 'stealth', value: 15 },
      { type: 'speed', value: -10 }
    ]},
    { id: 'clear', name: 'Ясно (редко)', chance: 5, effects: [] },
    { id: 'storm', name: 'Гроза', chance: 5, effects: [
      { type: 'damage', value: 15, description: 'Опасно на открытых местах' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'bog_walker', name: 'Болтоходец', levelRange: [2, 5], disposition: 'hostile',
        description: 'Зомбиподобное существо из трясины' },
      { id: 'mist_ghost', name: 'Туманный призрак', levelRange: [3, 6], disposition: 'hostile',
        description: 'Полупрозрачная фигура, замораживает взглядом' },
      { id: 'giant_leech', name: 'Гигантская пиявка', levelRange: [1, 3], disposition: 'hostile',
        description: 'Присасывается и высасывает кровь' },
      { id: 'swamp_hydra', name: 'Трясинная гидра', levelRange: [4, 8], disposition: 'hostile',
        description: 'Многоголовое существо из глубин' },
    ],
    neutral: [
      { id: 'swamp_witch', name: 'Болотная ведьма', levelRange: [8, 12], disposition: 'neutral',
        description: 'Живёт в хижине на сваях, торгует зельями' },
      { id: 'herbalist_hermit', name: 'Травник-отшельник', levelRange: [4, 6], disposition: 'neutral',
        description: 'Собирает редкие растения' },
      { id: 'lost_traveler', name: 'Заблудший путник', levelRange: [1, 3], disposition: 'neutral',
        description: 'Нужна помощь с выходом' },
    ],
    friendly: [
      { id: 'old_fisherman', name: 'Старый рыбак', levelRange: [3, 5], disposition: 'friendly',
        description: 'Знает безопасные тропы через трясину' },
      { id: 'young_tracker', name: 'Юный следопыт', levelRange: [2, 4], disposition: 'friendly',
        description: 'Учит различать опасные места' },
    ],
  },

  plotHook: `Болотная ведьма Марга рассказывает о "старом городе под водой". Её бабушка говорила,
что до болота здесь было поселение, которое ушло под воду за одну ночь. Говорят, колокола его
церкви всё ещё звонят иногда, когда туман особенно густ.`,

  dungeonHook: {
    name: 'Затонувший город Ильтар',
    description: `Под тонной ила и воды лежит древний город, поглощённый землёй за одну ночь.
Жители что-то нашли в глубине — или что-то нашло их.`,
    entryRequirement: 'iltar_gate_key',
    difficulty: 'hard',
  },
};

export default mistyLowlands;
