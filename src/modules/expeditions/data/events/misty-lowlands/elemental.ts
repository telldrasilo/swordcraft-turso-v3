/**
 * Стихийные следы — туманные низины (water, air, darkness).
 */

import type { EventTemplate } from '../_event-template';

export const eventMistyBogWater: EventTemplate = {
  id: 'event_misty_bog_water',
  name: 'Влага везде',
  type: 'negative',
  category: 'environment',
  title: 'Ручей по клинку',
  description: `Туман и роса конденсировались на стали снова и снова — рукоять разбухла, а на полотне остались матовые пятна и лёгкая порча там, где металл не успел просохнуть.`,
  flavorText: 'Низины не отпускают сталь сухой.',
  conditions: { locationIds: ['misty_lowlands'], minProgress: 15, maxProgress: 90 },
  effects: [
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (вода в металле)' },
    { type: 'modify_success_chance', modifier: -4, description: '-4% к успеху' },
  ],
  weight: 13,
  icon: '💧',
};

export const eventMistyShadowStain: EventTemplate = {
  id: 'event_misty_shadow_stain',
  name: 'Тень на стали',
  type: 'negative',
  category: 'environment',
  title: 'Чёрные разводы',
  description: `Плотный туман сгустился так, что свет не пробивался — на клинке остались несмываемые тёмные разводы, будто тень решила остаться на металле.`,
  flavorText: 'Иногда темнота оставляет след дольше раны.',
  conditions: { locationIds: ['misty_lowlands'], minProgress: 18, maxProgress: 85 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (тьма на металле)' },
    { type: 'modify_duration', modifier: 120, description: '+2 минуты (обход зоны)' },
  ],
  weight: 11,
  icon: '🌑',
};

export const mistyElementalEvents: EventTemplate[] = [eventMistyBogWater, eventMistyShadowStain];
