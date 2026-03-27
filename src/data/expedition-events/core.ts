/**
 * Универсальные события экспедиций
 * Применимы ко всем типам миссий независимо от локации и врагов
 */

import type { ExpeditionEventTemplate } from '@/types/expedition-events'

/**
 * События отдыха и восстановления
 */
export const REST_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'rest_break',
    text: 'Короткий привал для отдыха',
    type: 'rest',
    icon: '☕',
    conditions: {},
    weight: 5,
  },
  {
    id: 'rest_meal',
    text: 'Перекус во время пути',
    type: 'rest',
    icon: '🍞',
    conditions: {},
    weight: 4,
  },
  {
    id: 'rest_camp',
    text: 'Разбит лагерь для ночлега',
    type: 'rest',
    icon: '⛺',
    conditions: {
      minDuration: 600, // Только для экспедиций длительнее 10 минут
    },
    weight: 3,
  },
  {
    id: 'rest_fire',
    text: 'Костёр разогревает уставших путников',
    type: 'rest',
    icon: '🔥',
    conditions: {
      weather: ['night', 'clear'],
      minDuration: 300,
    },
    weight: 4,
  },
  {
    id: 'rest_gear_check',
    text: 'Проверка снаряжения перед продолжением',
    type: 'rest',
    icon: '🎒',
    conditions: {},
    weight: 3,
  },
]

/**
 * События путешествия
 */
export const TRAVEL_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'travel_march',
    text: 'Уверенный марш вперёд',
    type: 'travel',
    icon: '🥾',
    conditions: {},
    weight: 6,
  },
  {
    id: 'travel_crossroads',
    text: 'Перекрёсток — выбор пути',
    type: 'travel',
    icon: '🛤️',
    conditions: {},
    weight: 4,
  },
  {
    id: 'travel_difficult_terrain',
    text: 'Труднопроходимая местность замедляет продвижение',
    type: 'travel',
    icon: '⛰️',
    conditions: {},
    weight: 3,
  },
  {
    id: 'travel_ford',
    text: 'Переправа через ручей',
    type: 'travel',
    icon: '💧',
    conditions: {
      themes: ['wilderness', 'exploration'],
    },
    weight: 3,
  },
  {
    id: 'travel_bridge',
    text: 'Старый мост перекинут через пропасть',
    type: 'travel',
    icon: '🌉',
    conditions: {
      themes: ['wilderness', 'adventure'],
    },
    weight: 3,
  },
  {
    id: 'travel_map',
    text: 'Проверка карты — идём верной дорогой',
    type: 'travel',
    icon: '🗺️',
    conditions: {
      themes: ['exploration', 'adventure'],
    },
    weight: 4,
  },
]

/**
 * События погоды
 */
export const WEATHER_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'weather_clear',
    text: 'Ясное небо — отличная погода для путешествий',
    type: 'weather',
    icon: '☀️',
    conditions: {
      weather: ['clear'],
    },
    weight: 5,
  },
  {
    id: 'weather_rain',
    text: 'Начался дождь, одежда промокает',
    type: 'weather',
    icon: '🌧️',
    conditions: {
      weather: ['rain'],
    },
    weight: 5,
  },
  {
    id: 'weather_fog',
    text: 'Густой туман окутывает окрестности',
    type: 'weather',
    icon: '🌫️',
    conditions: {
      weather: ['fog'],
    },
    weight: 4,
  },
  {
    id: 'weather_storm',
    text: 'Буря разразилась с небывалой силой',
    type: 'weather',
    icon: '⛈️',
    conditions: {
      weather: ['storm'],
    },
    weight: 3,
  },
  {
    id: 'weather_night_cold',
    text: 'Ночной холод пробирает до костей',
    type: 'weather',
    icon: '🌙',
    conditions: {
      weather: ['night'],
    },
    weight: 4,
  },
  {
    id: 'weather_snow',
    text: 'Снег кружится в воздухе',
    type: 'weather',
    icon: '❄️',
    conditions: {
      weather: ['snow'],
    },
    weight: 3,
  },
]

/**
 * События опасности
 */
export const DANGER_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'danger_wildlife',
    text: 'Дикие звери наблюдают из чащи',
    type: 'danger',
    icon: '👀',
    conditions: {
      themes: ['wilderness', 'survival'],
    },
    weight: 4,
  },
  {
    id: 'danger_noise',
    text: 'Подозрительный шум позади',
    type: 'danger',
    icon: '👂',
    conditions: {},
    weight: 4,
  },
  {
    id: 'danger_unease',
    text: 'Неясное беспокойство не покидает',
    type: 'danger',
    icon: '😰',
    conditions: {
      themes: ['horror', 'mystery'],
    },
    weight: 3,
  },
  {
    id: 'danger_footprints',
    text: 'Обнаружены свежие следы... не человеческие',
    type: 'danger',
    icon: '🐾',
    conditions: {
      themes: ['wilderness', 'horror'],
    },
    weight: 3,
  },
  {
    id: 'danger_collapse',
    text: 'Предчувствие надвигающейся опасности',
    type: 'danger',
    icon: '⚠️',
    conditions: {
      themes: ['underground', 'ruins'],
    },
    weight: 3,
  },
]

/**
 * Универсальные боевые события
 */
export const UNIVERSAL_COMBAT_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'combat_preparation',
    text: 'Искатель готовит оружие к бою',
    type: 'combat',
    icon: '⚔️',
    conditions: {
      themes: ['combat_heavy'],
    },
    weight: 4,
  },
  {
    id: 'combat_skirmish',
    text: 'Незначительная стычка с противником',
    type: 'combat',
    icon: '🗡️',
    conditions: {
      themes: ['combat_heavy'],
    },
    weight: 3,
  },
  {
    id: 'combat_weapon_check',
    text: 'Проверка остроты клинка',
    type: 'combat',
    icon: '🔧',
    conditions: {
      themes: ['combat_heavy', 'survival'],
    },
    weight: 3,
  },
]

/**
 * Все универсальные события
 */
export const CORE_EVENTS: ExpeditionEventTemplate[] = [
  ...REST_EVENTS,
  ...TRAVEL_EVENTS,
  ...WEATHER_EVENTS,
  ...DANGER_EVENTS,
  ...UNIVERSAL_COMBAT_EVENTS,
]

export default CORE_EVENTS
