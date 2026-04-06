/**
 * Стихийные следы — драконьи шрамы (fire, blood, light, lightning).
 */

import type { EventTemplate } from '../_event-template';

export const eventDragonBloodArena: EventTemplate = {
  id: 'event_dragon_blood_arena',
  name: 'Кровь на арене',
  type: 'negative',
  category: 'combat',
  title: 'Кровь въелась в сталь',
  description: `Брызги с арены попали на полотно — не обычная ржавчина: тёмные пятна держатся за металл, будто кровь помнит бой дольше, чем кузнец хотел бы.`,
  flavorText: 'На драконьей земле кровь не смывается с первого раза.',
  conditions: { locationIds: ['dragon_scars'], minProgress: 20, maxProgress: 85 },
  effects: [
    { type: 'damage_adventurer', modifier: 10, description: '-10% HP (бой)' },
    { type: 'damage_weapon', modifier: 8, description: '-8% прочности (кровяной след)' },
  ],
  weight: 12,
  icon: '🩸',
};

export const eventDragonLightningFork: EventTemplate = {
  id: 'event_dragon_lightning_fork',
  name: 'Вилка молнии',
  type: 'negative',
  category: 'environment',
  title: 'Искра между пиками',
  description: `Молния ударила не в искателя — в металл: по клинку прошла тонкая дуга, оставив тёмные точки закалки и лёгкий запах озона там, где сталь должна была остаться чистой.`,
  flavorText: 'На Шрамах небо бьёт в сталь чаще, чем в людей.',
  conditions: { locationIds: ['dragon_scars'], minProgress: 18, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (дуга по стали)' },
  ],
  weight: 6,
  icon: '⚡',
};

export const dragonElementalEvents: EventTemplate[] = [
  eventDragonBloodArena,
  eventDragonLightningFork,
];
