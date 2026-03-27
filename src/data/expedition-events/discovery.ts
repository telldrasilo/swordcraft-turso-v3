/**
 * События находок и открытий во время экспедиций
 */

import type { ExpeditionEventTemplate } from '@/types/expedition-events'

// ================================
// РЕСУРСЫ И МАТЕРИАЛЫ
// ================================

export const RESOURCE_DISCOVERY_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'discover_herbs',
    text: 'Найдены ценные лекарственные травы',
    type: 'treasure',
    icon: '🌿',
    conditions: {
      locations: ['forest', 'swamp'],
    },
    weight: 4,
  },
  {
    id: 'discover_ore',
    text: 'На поверхности — залежи руды',
    type: 'treasure',
    icon: '⛏️',
    conditions: {
      locations: ['cave', 'mountain', 'ruins'],
    },
    weight: 4,
  },
  {
    id: 'discover_water_source',
    text: 'Обнаружен чистый родник',
    type: 'discovery',
    icon: '💧',
    conditions: {
      locations: ['forest', 'mountain', 'cave'],
    },
    weight: 5,
  },
  {
    id: 'discover_shelter',
    text: 'Найдено укрытие от непогоды',
    type: 'discovery',
    icon: '🏚️',
    conditions: {
      locations: ['forest', 'ruins'],
    },
    weight: 4,
  },
  {
    id: 'discover_ruins_materials',
    text: 'Среди обломков — пригодные материалы',
    type: 'treasure',
    icon: '🧱',
    conditions: {
      locations: ['ruins'],
    },
    weight: 3,
  },
  {
    id: 'discover_wood',
    text: 'Сухостой — отличное топливо',
    type: 'discovery',
    icon: '🪵',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
]

// ================================
// СОКРОВИЩА
// ================================

export const TREASURE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'treasure_coins',
    text: 'Кожаный кошелёк с золотом',
    type: 'treasure',
    icon: '💰',
    conditions: {
      themes: ['adventure', 'exploration'],
    },
    weight: 4,
  },
  {
    id: 'treasure_chest',
    text: 'Деревянный сундучок без замка',
    type: 'treasure',
    icon: '📦',
    conditions: {
      locations: ['ruins', 'dungeon'],
    },
    weight: 3,
  },
  {
    id: 'treasure_jewelry',
    text: 'Блестящий предмет украшения',
    type: 'treasure',
    icon: '💍',
    conditions: {
      locations: ['ruins', 'dungeon', 'cave'],
    },
    weight: 3,
  },
  {
    id: 'treasure_hidden_stash',
    text: 'Тайник под корнями дерева',
    type: 'treasure',
    icon: '🏴‍☠️',
    conditions: {
      locations: ['forest', 'cave'],
      themes: ['exploration'],
    },
    weight: 2,
  },
  {
    id: 'treasure_weapon_cache',
    text: 'Схрон с оружием',
    type: 'treasure',
    icon: '🗡️',
    conditions: {
      locations: ['ruins', 'dungeon', 'cave'],
      themes: ['combat_heavy'],
    },
    weight: 3,
  },
  {
    id: 'treasure_relic',
    text: 'Древний артефакт сложной работы',
    type: 'treasure',
    icon: '🏺',
    conditions: {
      locations: ['ruins', 'temple'],
      themes: ['exploration', 'mystery'],
    },
    weight: 2,
  },
  {
    id: 'treasure_goblin_loot',
    text: 'Найдена добыча гоблинов',
    type: 'treasure',
    icon: '🎒',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 4,
  },
  {
    id: 'treasure_bandit_hoard',
    text: 'Тайник разбойников обнаружен!',
    type: 'treasure',
    icon: '🏴',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 3,
  },
]

// ================================
// ЗНАНИЯ И ИНФОРМАЦИЯ
// ================================

export const KNOWLEDGE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'knowledge_map_fragment',
    text: 'Фрагмент древней карты',
    type: 'discovery',
    icon: '🗺️',
    conditions: {
      locations: ['ruins', 'cave'],
      themes: ['exploration'],
    },
    weight: 3,
  },
  {
    id: 'knowledge_diary',
    text: 'Старый дневник путешественника',
    type: 'discovery',
    icon: '📔',
    conditions: {
      locations: ['ruins', 'cave', 'dungeon'],
    },
    weight: 3,
  },
  {
    id: 'knowledge_warning',
    text: 'Надпись-предупреждение о ловушках',
    type: 'discovery',
    icon: '⚠️',
    conditions: {
      locations: ['ruins', 'dungeon', 'cave'],
      themes: ['exploration'],
    },
    weight: 3,
  },
  {
    id: 'knowledge_lore',
    text: 'Скрижали с историей древней цивилизации',
    type: 'discovery',
    icon: '🏛️',
    conditions:    {
      locations: ['ruins', 'temple'],
    },
    weight: 2,
  },
  {
    id: 'knowledge_boss_weakness',
    text: 'Найдены сведения о слабостях врага',
    type: 'discovery',
    icon: '💡',
    conditions: {
      special: ['boss'],
      themes: ['combat_heavy'],
    },
    weight: 2,
    flags: { bossOnly: true },
  },
]

// ================================
// ТАЙНЫ И МИСТИКА
// ================================

export const MYSTERY_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'mystery_strange_lights',
    text: 'Вдали мерцают странные огоньки',
    type: 'mystery',
    icon: '✨',
    conditions: {
      themes: ['mystery', 'horror'],
      weather: ['night', 'fog'],
    },
    weight: 3,
  },
  {
    id: 'mystery_whispers',
    text: 'Голоса без источника шепчут на ухо',
    type: 'mystery',
    icon: '👂',
    conditions: {
      locations: ['ruins', 'dungeon', 'cave'],
      themes: ['horror', 'mystery'],
    },
    weight: 3,
  },
  {
    id: 'mystery_illusion',
    text: 'Пейзаж искажается перед глазами',
    type: 'mystery',
    icon: '🌀',
    conditions: {
      themes: ['mystery'],
    },
    weight: 2,
  },
  {
    id: 'mystery_familiar',
    text: 'Место кажется странно знакомым',
    type: 'mystery',
    icon: '😶',
    conditions: {
      themes: ['mystery'],
    },
    weight: 2,
  },
  {
    id: 'mystery_time_gap',
    text: 'Прошло больше времени, чем казалось',
    type: 'mystery',
    icon: '⏰',
    conditions: {
      themes: ['mystery', 'horror'],
    },
    weight: 2,
  },
  {
    id: 'mystery_omen',
    text: 'Неблагоприятное знамение на пути',
    type: 'mystery',
    icon: '🔯',
    conditions: {
      themes: ['horror', 'mystery'],
    },
    weight: 3,
  },
  {
    id: 'mystery_ritual_site',
    text: 'Древнее место жертвоприношений',
    type: 'mystery',
    icon: '⛧',
    conditions: {
      locations: ['ruins', 'temple', 'cave'],
      themes: ['mystery', 'horror'],
    },
    weight: 3,
  },
]

// ================================
// ПРИРОДНЫЕ ЧУДЕСА
// ================================

export const NATURE_WONDER_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'nature_waterfall',
    text: 'Вдали виднеется живописный водопад',
    type: 'discovery',
    icon: '🌊',
    conditions: {
      locations: ['forest', 'mountain'],
    },
    weight: 4,
  },
  {
    id: 'nature_rainbow',
    text: 'Радуга украшает небосвод после дождя',
    type: 'discovery',
    icon: '🌈',
    conditions: {
      weather: ['rain', 'clear'],
    },
    weight: 3,
  },
  {
    id: 'nature_old_tree',
    text: 'Древо-великан, которому тысячи лет',
    type: 'discovery',
    icon: '🌲',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
  {
    id: 'nature_crystal_cave',
    text: 'Пещера сверкает кристаллами',
    type: 'discovery',
    icon: '💎',
    conditions: {
      locations: ['cave'],
    },
    weight: 3,
  },
  {
    id: 'nature_overlook',
    text: 'Открылась захватывающая панорама',
    type: 'discovery',
    icon: '🏞️',
    conditions: {
      locations: ['mountain', 'forest', 'coast'],
    },
    weight: 4,
  },
  {
    id: 'nature_bioluminescence',
    text: 'Темнота озарена светящимися грибами',
    type: 'discovery',
    icon: '🍄',
    conditions: {
      locations: ['cave', 'forest'],
      weather: ['night'],
    },
    weight: 3,
  },
]

// ================================
// СЛЕДЫ И ДОКАЗАТЕЛЬСТВА
// ================================

export const CLUE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'clue_footprints',
    text: 'Чёткие следы ведут вперёд',
    type: 'discovery',
    icon: '👣',
    conditions: {
      themes: ['exploration', 'adventure'],
    },
    weight: 4,
  },
  {
    id: 'clue_camp_remains',
    text: 'Остатки чужого лагеря',
    type: 'discovery',
    icon: '🏕️',
    conditions: {
      locations: ['forest', 'road', 'ruins'],
    },
    weight: 4,
  },
  {
    id: 'clue_blood',
    text: 'Свежие кровавые следы на земле',
    type: 'danger',
    icon: '🩸',
    conditions: {
      themes: ['combat_heavy', 'horror'],
    },
    weight: 3,
  },
  {
    id: 'clue_scorch_marks',
    text: 'Следы магии на камнях',
    type: 'mystery',
    icon: '⚡',
    conditions: {
      locations: ['ruins', 'dungeon', 'cave'],
      themes: ['mystery'],
    },
    weight: 3,
  },
  {
    id: 'clue_boss_sign',
    text: 'Признаки присутствия могучего врага',
    type: 'danger',
    icon: '👑',
    conditions: {
      special: ['boss'],
    },
    weight: 4,
    flags: { bossOnly: true },
  },
]

// ================================
// ВСЕ СОБЫТИЯ ОТКРЫТИЙ
// ================================

export const DISCOVERY_EVENTS: ExpeditionEventTemplate[] = [
  ...RESOURCE_DISCOVERY_EVENTS,
  ...TREASURE_EVENTS,
  ...KNOWLEDGE_EVENTS,
  ...MYSTERY_EVENTS,
  ...NATURE_WONDER_EVENTS,
  ...CLUE_EVENTS,
]

export default DISCOVERY_EVENTS
