/**
 * Стихийные следы — серебряный бор (nature, light, air, lightning).
 */

import type { EventTemplate } from '../_event-template';

export const eventSilverMoonSear: EventTemplate = {
  id: 'event_silver_moon_sear',
  name: 'Лунный ожог',
  type: 'negative',
  category: 'environment',
  title: 'Свет оставил границу',
  description: `Лунный свет, отражённый с тысячи игл сосен, на миг сконцентрировался на кромке — металл перехватил холодный жар, и по полотну прошла бледная полоса обесцвечивания.`,
  flavorText: 'Серебро любит свет — но не вся сталь его переносит.',
  conditions: { locationIds: ['silver_grove'], minProgress: 20, maxProgress: 80 },
  effects: [
    { type: 'damage_weapon', modifier: 5, description: '-5% прочности (ожог света)' },
  ],
  weight: 8,
  icon: '🌙',
};

export const eventSilverStormTine: EventTemplate = {
  id: 'event_silver_storm_tine',
  name: 'Удар молнии рядом',
  type: 'negative',
  category: 'danger',
  title: 'Разряд зацепил сталь',
  description: `Гроза прошла ближе, чем хотелось: вспышка и удар тока по мокрой стали оставили точечные оплавления — не смертельно, но клинок «помнит» небо.`,
  flavorText: 'Серебро в лесу зовёт гром.',
  conditions: { locationIds: ['silver_grove'], minProgress: 15, maxProgress: 85 },
  effects: [
    { type: 'damage_adventurer', modifier: 8, description: '-8% HP (удар током)' },
    { type: 'damage_weapon', modifier: 8, description: '-8% прочности (след молнии)' },
  ],
  weight: 5,
  icon: '⚡',
};

export const silverElementalEvents: EventTemplate[] = [eventSilverMoonSear, eventSilverStormTine];
