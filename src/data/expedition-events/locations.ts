/**
 * События по локациям экспедиций
 * Каждая локация имеет свои характерные события
 */

import type { ExpeditionEventTemplate } from '@/types/expedition-events'

// ================================
// ЛЕС (forest)
// ================================

export const FOREST_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'forest_tracks',
    text: 'На тропе свежие следы добычи',
    type: 'discovery',
    icon: '🐾',
    conditions: {
      locations: ['forest'],
    },
    weight: 5,
  },
  {
    id: 'forest_clearing',
    text: 'Найдена тихая поляна с родником',
    type: 'rest',
    icon: '🏕️',
    conditions: {
      locations: ['forest'],
    },
    weight: 4,
  },
  {
    id: 'forest_old_tree',
    text: 'Вековое древо украшает поляну',
    type: 'discovery',
    icon: '🌳',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
  {
    id: 'forest_ambush_prep',
    text: 'Что-то движется в густых кустах',
    type: 'danger',
    icon: '🌿',
    conditions: {
      locations: ['forest'],
      themes: ['combat_heavy', 'stealth'],
    },
    weight: 4,
  },
  {
    id: 'forest_mushrooms',
    text: 'Замечены съедобные грибы',
    type: 'discovery',
    icon: '🍄',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
  {
    id: 'forest_nest',
    text: 'Найдено птичье гнездо высоко на дереве',
    type: 'discovery',
    icon: '🪺',
    conditions: {
      locations: ['forest'],
    },
    weight: 2,
  },
  {
    id: 'forest_lost',
    text: 'Кажется, мы немного сбились с пути',
    type: 'travel',
    icon: '🤔',
    conditions: {
      locations: ['forest'],
    },
    weight: 3,
  },
  {
    id: 'forest_hunting_blind',
    text: 'Обнаружена старая охотничья засидка',
    type: 'discovery',
    icon: '🎯',
    conditions: {
      locations: ['forest'],
      themes: ['exploration'],
    },
    weight: 3,
  },
]

// ================================
// ПЕЩЕРА (cave)
// ================================

export const CAVE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'cave_darkness',
    text: 'Тьма сгущается, факел едва светит',
    type: 'danger',
    icon: '🕯️',
    conditions: {
      locations: ['cave'],
    },
    weight: 5,
  },
  {
    id: 'cave_echo',
    text: 'Шаги эхом разносятся по туннелям',
    type: 'mystery',
    icon: '🔊',
    conditions: {
      locations: ['cave'],
    },
    weight: 4,
  },
  {
    id: 'cave_stalactites',
    text: 'Сталактиты свисают с потолка',
    type: 'discovery',
    icon: '🪨',
    conditions: {
      locations: ['cave'],
    },
    weight: 3,
  },
  {
    id: 'cave_water_drip',
    text: 'Вода медленно капает где-то в темноте',
    type: 'mystery',
    icon: '💧',
    conditions: {
      locations: ['cave'],
    },
    weight: 4,
  },
  {
    id: 'cave_narrow',
    text: 'Проход сужается, приходится ползти',
    type: 'travel',
    icon: '🕳️',
    conditions: {
      locations: ['cave'],
    },
    weight: 3,
  },
  {
    id: 'cave_glow',
    text: 'Впереди мерцает странный свет',
    type: 'mystery',
    icon: '✨',
    conditions: {
      locations: ['cave'],
    },
    weight: 3,
  },
  {
    id: 'cave_ancient_drawing',
    text: 'На стене — древние наскальные рисунки',
    type: 'discovery',
    icon: '🎨',
    conditions: {
      locations: ['cave', 'ruins'],
      themes: ['exploration', 'mystery'],
    },
    weight: 3,
  },
]

// ================================
// РУИНЫ (ruins)
// ================================

export const RUINS_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'ruins_inscription',
    text: 'Найдена полустёртая надпись на древнем языке',
    type: 'discovery',
    icon: '📜',
    conditions: {
      locations: ['ruins'],
    },
    weight: 4,
  },
  {
    id: 'ruins_collapse',
    text: 'Фрагмент стены обрушился совсем недавно',
    type: 'danger',
    icon: '🧱',
    conditions: {
      locations: ['ruins'],
    },
    weight: 4,
  },
  {
    id: 'ruins_whisper',
    text: 'Шёпоты прошлого доносятся сквозь века',
    type: 'mystery',
    icon: '👻',
    conditions: {
      locations: ['ruins'],
      themes: ['horror', 'mystery'],
    },
    weight: 3,
  },
  {
    id: 'ruins_statue',
    text: 'Стоит разрушенная статуя неизвестного бога',
    type: 'discovery',
    icon: '🗿',
    conditions: {
      locations: ['ruins'],
    },
    weight: 3,
  },
  {
    id: 'ruins_secret_door',
    text: 'Обнаружена потайная дверь за обломками',
    type: 'discovery',
    icon: '🚪',
    conditions: {
      locations: ['ruins'],
      themes: ['exploration'],
    },
    weight: 2,
  },
  {
    id: 'ruins_old_coin',
    text: 'На земле блеснул древний монетный металл',
    type: 'treasure',
    icon: '🪙',
    conditions: {
      locations: ['ruins'],
    },
    weight: 3,
  },
  {
    id: 'ruins_broken_weapon',
    text: 'Среди камней лежит сломанный меч',
    type: 'discovery',
    icon: '⚔️',
    conditions: {
      locations: ['ruins'],
      themes: ['combat_heavy'],
    },
    weight: 3,
  },
]

// ================================
// ДОРОГА (road)
// ================================

export const ROAD_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'road_milestone',
    text: 'Пройден очередной веховой столб',
    type: 'travel',
    icon: '🪧',
    conditions: {
      locations: ['road'],
    },
    weight: 4,
  },
  {
    id: 'road_wagon_tracks',
    text: 'На дороге следы недавнего каравана',
    type: 'discovery',
    icon: '🛞',
    conditions: {
      locations: ['road'],
    },
    weight: 4,
  },
  {
    id: 'road_signpost',
    text: 'Разобрать указатель непросто — он старый',
    type: 'travel',
    icon: '📍',
    conditions: {
      locations: ['road'],
    },
    weight: 3,
  },
  {
    id: 'road_inn',
    text: 'Вдали виднеется придорожная гостиница',
    type: 'social',
    icon: '🏠',
    conditions: {
      locations: ['road'],
    },
    weight: 3,
  },
  {
    id: 'road_bridge',
    text: 'Пересечена река по каменному мосту',
    type: 'travel',
    icon: '🌉',
    conditions: {
      locations: ['road'],
    },
    weight: 3,
  },
  {
    id: 'road_patrol',
    text: 'Встречен стражниковый патруль',
    type: 'social',
    icon: '👮',
    conditions: {
      locations: ['road'],
    },
    weight: 3,
  },
]

// ================================
// ДЕРЕВНЯ (village)
// ================================

export const VILLAGE_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'village_market',
    text: 'Торговля кипит на деревенской площади',
    type: 'social',
    icon: '🏪',
    conditions: {
      locations: ['village'],
    },
    weight: 4,
  },
  {
    id: 'village_gossip',
    text: 'Крестьяне делятся сплетнями и слухами',
    type: 'social',
    icon: '🗣️',
    conditions: {
      locations: ['village'],
    },
    weight: 4,
  },
  {
    id: 'village_well',
    text: 'Колодец — центр местной жизни',
    type: 'social',
    icon: '🌊',
    conditions: {
      locations: ['village'],
    },
    weight: 3,
  },
  {
    id: 'village_smith',
    text: 'Слышен звон кузнечного молота',
    type: 'social',
    icon: '🔨',
    conditions: {
      locations: ['village'],
    },
    weight: 3,
  },
  {
    id: 'village_children',
    text: 'Дети бегают и играют во дворах',
    type: 'social',
    icon: '👶',
    conditions: {
      locations: ['village'],
    },
    weight: 3,
  },
]

// ================================
// ПОДЗЕМЕЛЬЕ (dungeon)
// ================================

export const DUNGEON_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'dungeon_chains',
    text: 'Ржавые цепи висят на стенах камер',
    type: 'discovery',
    icon: '⛓️',
    conditions: {
      locations: ['dungeon'],
    },
    weight: 4,
  },
  {
    id: 'dungeon_skeleton',
    text: 'Скелет в клетке — зловещее предупреждение',
    type: 'danger',
    icon: '💀',
    conditions: {
      locations: ['dungeon'],
    },
    weight: 3,
  },
  {
    id: 'dungeon_torch',
    text: 'Факел на стене ещё не успел погаснуть',
    type: 'mystery',
    icon: '🔥',
    conditions: {
      locations: ['dungeon'],
    },
    weight: 4,
  },
  {
    id: 'dungeon_trap_triggered',
    text: 'Осторожно! Сработала старая ловушка!',
    type: 'danger',
    icon: '⚠️',
    conditions: {
      locations: ['dungeon'],
      special: ['trap'],
    },
    weight: 4,
  },
  {
    id: 'dungeon_secret_passage',
    text: 'За шкафом обнаружен тайный проход',
    type: 'discovery',
    icon: '🚪',
    conditions: {
      locations: ['dungeon'],
      themes: ['exploration'],
    },
    weight: 2,
  },
]

// ================================
// ТАВЕРНА (tavern)
// ================================

export const TAVERN_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'tavern_noise',
    text: 'Гам и грохот слышны из зала',
    type: 'social',
    icon: '🍻',
    conditions: {
      locations: ['tavern'],
    },
    weight: 5,
  },
  {
    id: 'tavern_smell',
    text: 'Запах еды и выпивки стоит в воздухе',
    type: 'rest',
    icon: '🍖',
    conditions: {
      locations: ['tavern'],
    },
    weight: 4,
  },
  {
    id: 'tavern_suspicious',
    text: 'В углу за столом — подозрительная личность',
    type: 'mystery',
    icon: '🕵️',
    conditions: {
      locations: ['tavern'],
    },
    weight: 3,
  },
  {
    id: 'tavern_bard',
    text: 'Бард распевает историю о древних героях',
    type: 'social',
    icon: '🎵',
    conditions: {
      locations: ['tavern'],
    },
    weight: 3,
  },
]

// ================================
// ВСЕ ЛОКАЦИИ
// ================================

export const LOCATION_EVENTS: ExpeditionEventTemplate[] = [
  ...FOREST_EVENTS,
  ...CAVE_EVENTS,
  ...RUINS_EVENTS,
  ...ROAD_EVENTS,
  ...VILLAGE_EVENTS,
  ...DUNGEON_EVENTS,
  ...TAVERN_EVENTS,
]

export default LOCATION_EVENTS
