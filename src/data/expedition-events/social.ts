/**
 * Социальные события экспедиций
 * Встречи с NPC, торговцами, странниками
 */

import type { ExpeditionEventTemplate } from '@/types/expedition-events'

// ================================
// ТОРГОВЦЫ И КАРАВАНЫ
// ================================

export const MERCHANT_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'merchant_caravan',
    text: 'Встречен торговый караван',
    type: 'social',
    icon: '🐪',
    conditions: {
      locations: ['road', 'village'],
    },
    weight: 4,
  },
  {
    id: 'merchant_peddler',
    text: 'Бродячий торговец предлагает свои товары',
    type: 'social',
    icon: '💼',
    conditions: {
      locations: ['road', 'forest', 'ruins'],
    },
    weight: 3,
  },
  {
    id: 'merchant_weapons',
    text: 'Торговец оружием хочет купить трофеи',
    type: 'social',
    icon: '🔪',
    conditions: {
      locations: ['road', 'village', 'tavern'],
    },
    weight: 3,
  },
  {
    id: 'merchant_rare_goods',
    text: 'Встречен торговец редкими товарами',
    type: 'social',
    icon: '💎',
    conditions: {
      locations: ['road', 'ruins'],
    },
    weight: 2,
  },
  {
    id: 'merchant_gossip',
    text: 'Купец делится сплетнями из столицы',
    type: 'social',
    icon: '🗣️',
    conditions: {
      locations: ['road', 'village', 'tavern'],
    },
    weight: 3,
  },
]

// ================================
// СТРАЖНИКИ И ПАТРУЛИ
// ================================

export const GUARD_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'guard_checkpoint',
    text: 'Контрольный пункт стражи',
    type: 'social',
    icon: '🛡️',
    conditions: {
      locations: ['road', 'castle'],
    },
    weight: 4,
  },
  {
    id: 'guard_patrol',
    text: 'Патруль гвардейцев на дороге',
    type: 'social',
    icon: '👮',
    conditions: {
      locations: ['road', 'village'],
    },
    weight: 4,
  },
  {
    id: 'guard_warning',
    text: 'Стражники предупреждают об опасности впереди',
    type: 'social',
    icon: '⚠️',
    conditions: {
      locations: ['road'],
      themes: ['wilderness', 'adventure'],
    },
    weight: 4,
  },
  {
    id: 'guard_quest',
    text: 'Капитан стражи предлагает вознаграждение за помощь',
    type: 'social',
    icon: '📜',
    conditions: {
      locations: ['road', 'village', 'castle'],
    },
    weight: 2,
  },
]

// ================================
// СТРАННИКИ И СКИТАЛЬЦЫ
// ================================

export const WANDERER_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'wanderer_meeting',
    text: 'Встречен одинокий путник',
    type: 'social',
    icon: '🚶',
    conditions: {
      locations: ['road', 'forest'],
    },
    weight: 4,
  },
  {
    id: 'wanderer_info',
    text: 'Скиталец делится полезной информацией',
    type: 'social',
    icon: '💡',
    conditions: {
      locations: ['road', 'forest', 'tavern'],
    },
    weight: 3,
  },
  {
    id: 'wanderer_hermit',
    text: 'В лесу живёт странный отшельник',
    type: 'social',
    icon: '👤',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
  {
    id: 'wanderer_pilgrim',
    text: 'Группа паломников направляется к святыне',
    type: 'social',
    icon: '🙏',
    conditions: {
      locations: ['road', 'temple'],
    },
    weight: 3,
  },
  {
    id: 'wanderer_refugee',
    text: 'Беженцы рассказывают о нападениях',
    type: 'social',
    icon: '😰',
    conditions: {
      locations: ['road', 'village'],
      themes: ['wilderness', 'combat_heavy'],
    },
    weight: 3,
  },
]

// ================================
// НЕОБЫЧНЫЕ ЛИЧНОСТИ
// ================================

export const STRANGE_FOLK_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'folk_mystic',
    text: 'Странная женщина читает судьбу по картам',
    type: 'mystery',
    icon: '🔮',
    conditions: {
      locations: ['village', 'road', 'tavern'],
    },
    weight: 2,
  },
  {
    id: 'folk_alchemist',
    text: 'Странствующий алхимик предлагает зелья',
    type: 'social',
    icon: '🧪',
    conditions: {
      locations: ['village', 'road', 'tavern'],
    },
    weight: 2,
  },
  {
    id: 'folk_minstrel',
    text: 'Менестрель просит защитить до города',
    type: 'social',
    icon: '🎻',
    conditions: {
      locations: ['road', 'tavern'],
      themes: ['social'],
    },
    weight: 3,
  },
  {
    id: 'folk_scholar',
    text: 'Учёный ищет проводника для раскопок',
    type: 'social',
    icon: '📚',
    conditions:    {
      locations: ['ruins', 'road'],
      themes: ['exploration'],
    },
    weight: 3,
  },
  {
    id: 'folk_ex_soldier',
    text: 'Ветеран предлагает обучить боевым приёмам',
    type: 'social',
    icon: '🎖️',
    conditions: {
      locations: ['tavern', 'village'],
      themes: ['combat_heavy'],
    },
    weight: 2,
  },
]

// ================================
// СОСТАВА И КОМАНДЫ
// ================================

export const COMPANY_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'company_adventurers',
    text: 'Встречена другая группа искателей',
    type: 'social',
    icon: '🏹',
    conditions: {
      locations: ['road', 'ruins', 'cave'],
      themes: ['adventure', 'exploration'],
    },
    weight: 3,
  },
  {
    id: 'company_scouts',
    text: 'Разведчики сообщают о ситуации впереди',
    type: 'social',
    icon: '🔭',
    conditions: {
      locations: ['road', 'forest'],
    },
    weight: 4,
  },
  {
    id: 'company_mercenaries',
    text: 'Наёмники предлагают свои услуги',
    type: 'social',
    icon: '⚔️',
    conditions: {
      locations: ['road', 'tavern'],
      themes: ['combat_heavy'],
    },
    weight: 3,
  },
  {
    id: 'company_hunters',
    text: 'Охотники делятся дичью и советами',
    type: 'social',
    icon: '🦌',
    conditions: {
      locations: ['forest'],
    },
    weight: 4,
  },
]

// ================================
// ДРУЖЕСТВЕННЫЕ СУЩЕСТВА
// ================================

export const FRIENDLY_CREATURE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'creature_friendly_wolf',
    text: 'Одинокий волк следует параллельным курсом',
    type: 'discovery',
    icon: '🐺',
    conditions: {
      locations: ['forest'],
    },
    weight: 2,
  },
  {
    id: 'creature_dog',
    text: 'Бродячая собака привязалась к группе',
    type: 'discovery',
    icon: '🐕',
    conditions: {
      locations: ['road', 'village'],
    },
    weight: 3,
  },
  {
    id: 'creature_hawk',
    text: 'Ястреб кружит над группой, показывая путь',
    type: 'discovery',
    icon: '🦅',
    conditions: {
      locations: ['forest', 'road', 'mountain'],
    },
    weight: 3,
  },
]

// ================================
// ВСЕ СОЦИАЛЬНЫЕ СОБЫТИЯ
// ================================

export const SOCIAL_EVENTS: ExpeditionEventTemplate[] = [
  ...MERCHANT_EVENTS,
  ...GUARD_EVENTS,
  ...WANDERER_EVENTS,
  ...STRANGE_FOLK_EVENTS,
  ...COMPANY_EVENTS,
  ...FRIENDLY_CREATURE_EVENTS,
]

export default SOCIAL_EVENTS
