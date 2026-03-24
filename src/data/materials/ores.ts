/**
 * Руды
 * Природные материалы для выплавки металлов
 */

import type { MaterialNode } from '@/types/materials'

export const oresMaterials: MaterialNode[] = [
  // ============================================
  // ЖЕЛЕЗНАЯ РУДА
  // ============================================

  {
    identity: {
      id: 'iron_ore',
      name: 'Железная руда',
      class: 'mineral',
      origin: 'natural',
      tags: ['natural', 'mineral', 'iron-bearing', 'ore'],
    },

    physical: {
      // Механические
      density: 5.2,              // плотнее обычной породы
      hardness: 45,              // средняя твёрдость
      toughness: 40,             // средняя прочность
      elasticity: 15,            // низкая упругость

      // Тепловые
      meltingPoint: 1538,        // температура плавления железа
      ignitionPoint: null,       // не горит
      thermalConductivity: 25,   // низкая теплопроводность

      // Структурные
      porosity: 35,              // пористая структура
      compressiveStrength: 55,   // средняя прочность на сжатие
      tensileStrength: 25,       // низкая прочность на разрыв
    },

    chemical: {
      reactivity: 45,            // умеренная активность (окисляется)
      stability: 50,             // средняя устойчивость
      corrosionResistance: 20,   // низкая (ржавеет)
      oxidationResistance: 15,   // быстро окисляется
      acidity: 7,                // нейтральная
      solubility: 5,             // почти нерастворима
    },

    arcane: {
      conductivity: 10,          // низкая проводимость
      affinity: 15,              // слабое родство
      stability: 60,             // нормальная стабильность
      resonance: 5,              // почти нет резонанса
    },

    processing: {
      workability: 35,           // трудно обрабатывать напрямую
      refineDifficulty: 50,      // средняя сложность переработки
      purityPotential: 40,       // примеси неизбежны
      defectRisk: 30,            // высокий риск дефектов
      repairability: 100,        // не чинится, заменяется
    },

    economy: {
      rarity: 25,                // очень распространена
      tier: 1,                   // базовый уровень
      baseValue: 10,             // дешёвая
      availability: 90,          // почти везде
      discoverability: 100,      // открывается сразу
    },

    summary: {
      basic: 'Природная железная руда. Требует переработки для получения чистого металла.',
      applied: 'Сырьё для выплавки железа. Широко используется в кузнечном деле.',
      strengths: [
        'Широко распространена',
        'Низкая стоимость',
        'Основа металлургии',
      ],
      weaknesses: [
        'Требует переработки',
        'Низкая чистота',
        'Много примесей',
      ],
      bestFor: [
        'Выплавка железа',
        'Производство стали',
        'Базовое оружие',
      ],
    },

    discovery: {
      unlockedBy: [
        { type: 'harvest', requiredExpertise: 0 },
        { type: 'craft', requiredExpertise: 5 },
      ],
      researchCost: 20,
    },

    description: 'Железная руда — основной источник железа. Встречается в шахтах и горных районах. Содержит оксиды железа с примесями породы. Требует выплавки в печи для получения металла.',
    icon: '/icons/resources/ironOre.png',
    version: 1,
  },

  // ============================================
  // МЕДНАЯ РУДА
  // ============================================

  {
    identity: {
      id: 'copper_ore',
      name: 'Медная руда',
      class: 'mineral',
      origin: 'natural',
      tags: ['natural', 'mineral', 'copper-bearing', 'ore'],
    },

    physical: {
      density: 4.5,              // легче железной руды
      hardness: 35,              // мягче железной
      toughness: 40,             // средняя прочность
      elasticity: 10,            // низкая упругость

      meltingPoint: 1085,        // ниже чем у железа
      ignitionPoint: null,
      thermalConductivity: 30,   // лучше проводит тепло

      porosity: 45,              // более пористая
      compressiveStrength: 50,
      tensileStrength: 30,
    },

    chemical: {
      reactivity: 40,            // умеренная
      stability: 60,             // стабильнее железной
      corrosionResistance: 30,   // окисляется до зелёного
      oxidationResistance: 25,
      acidity: 6.5,
      solubility: 10,
    },

    arcane: {
      conductivity: 15,          // лучше для магии
      affinity: 20,              // выше родство
      stability: 65,
      resonance: 10,
    },

    processing: {
      workability: 40,           // чуть легче обрабатывать
      refineDifficulty: 45,      // проще перерабатывать
      purityPotential: 45,       // выше потенциал чистоты
      defectRisk: 25,
      repairability: 100,
    },

    economy: {
      rarity: 30,                // чуть реже железной
      tier: 1,
      baseValue: 15,
      availability: 85,
      discoverability: 95,
    },

    summary: {
      basic: 'Природная медная руда. Мягкий металл с характерным красноватым оттенком.',
      applied: 'Сырьё для выплавки меди и бронзы. Используется в украшениях.',
      strengths: [
        'Легко плавится',
        'Красивый цвет',
        'Подходит для украшений',
      ],
      weaknesses: [
        'Мягкий металл',
        'Быстро окисляется',
        'Низкая прочность',
      ],
      bestFor: [
        'Выплавка меди',
        'Производство бронзы',
        'Украшения',
      ],
    },

    discovery: {
      unlockedBy: [
        { type: 'harvest', requiredExpertise: 0 },
        { type: 'craft', requiredExpertise: 5 },
      ],
      researchCost: 25,
    },

    description: 'Медная руда содержит соединения меди с характерным красновато-бурым цветом. Один из первых металлов, освоенных человечеством. Легко плавится и обрабатывается.',
    icon: '/icons/resources/copperOre.png',
    version: 1,
  },

  // ============================================
  // ОЛОВЯННАЯ РУДА
  // ============================================

  {
    identity: {
      id: 'tin_ore',
      name: 'Оловянная руда',
      class: 'mineral',
      origin: 'natural',
      tags: ['natural', 'mineral', 'tin-bearing', 'ore'],
    },

    physical: {
      density: 4.0,              // лёгкая
      hardness: 30,              // мягкая
      toughness: 35,             // низкая прочность
      elasticity: 8,             // очень низкая

      meltingPoint: 232,         // очень низкая температура
      ignitionPoint: null,
      thermalConductivity: 20,

      porosity: 50,              // высокая пористость
      compressiveStrength: 40,
      tensileStrength: 20,
    },

    chemical: {
      reactivity: 30,            // низкая активность
      stability: 70,             // стабильная
      corrosionResistance: 50,   // устойчива к коррозии
      oxidationResistance: 45,
      acidity: 7,
      solubility: 8,
    },

    arcane: {
      conductivity: 8,           // очень низкая
      affinity: 12,
      stability: 70,
      resonance: 5,
    },

    processing: {
      workability: 50,           // легко обрабатывать
      refineDifficulty: 40,      // простая переработка
      purityPotential: 50,       // хороший потенциал
      defectRisk: 20,
      repairability: 100,
    },

    economy: {
      rarity: 40,                // реже меди и железа
      tier: 2,
      baseValue: 20,
      availability: 70,
      discoverability: 85,
    },

    summary: {
      basic: 'Природная оловянная руда. Мягкий металл с низкой температурой плавления.',
      applied: 'Компонент для производства бронзы. Редко используется в чистом виде.',
      strengths: [
        'Легко плавится',
        'Устойчив к коррозии',
        'Ключевой компонент бронзы',
      ],
      weaknesses: [
        'Очень мягкий',
        'Редко встречается',
        'Низкая прочность в чистом виде',
      ],
      bestFor: [
        'Производство бронзы',
        'Пайка металлов',
        'Покрытия',
      ],
    },

    discovery: {
      unlockedBy: [
        { type: 'harvest', requiredExpertise: 0 },
        { type: 'research', requiredExpertise: 10 },
      ],
      researchCost: 30,
    },

    description: 'Оловянная руда — источник олова, мягкого металла с очень низкой температурой плавления. Важнейший компонент для производства бронзы при сплавлении с медью.',
    icon: '/icons/resources/tinOre.png',
    version: 1,
  },
]
