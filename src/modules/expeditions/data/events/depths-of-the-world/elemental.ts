/**
 * Стихийные следы — глубины (space, blood, skverna, darkness, arcane).
 */

import type { EventTemplate } from '../_event-template';

export const eventDepthsFoldBlade: EventTemplate = {
  id: 'event_depths_fold_blade',
  name: 'Складка пространства',
  type: 'negative',
  category: 'danger',
  title: 'Геометрия не сходится',
  description: `На миг путь сократился иначе, чем должен — клинок прошёл через зону, где углы «плывут». На стали остался чужой сдвиг: линии кромки не совпадают с памятью мастера.`,
  flavorText: 'Глубина не прощает прямых линий.',
  conditions: { locationIds: ['depths_of_the_world'], minProgress: 18, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 9, description: '-9% прочности (искажение)' },
    { type: 'modify_success_chance', modifier: -6, description: '-6% к успеху' },
  ],
  weight: 10,
  icon: '🌀',
};

export const eventDepthsSkvernaFilm: EventTemplate = {
  id: 'event_depths_skverna_film',
  name: 'Скверна на металле',
  type: 'negative',
  category: 'danger',
  title: 'Серый налёт',
  description: `Воздух глубины липкий на языке — на клинке остался серый налёт и ощущение, что металл «живёт» иначе, чем должен. Это не ржавчина и не грязь.`,
  flavorText: 'Запретность оставляет след глубже царапины.',
  conditions: { locationIds: ['depths_of_the_world'], minProgress: 15, maxProgress: 90 },
  effects: [
    { type: 'damage_adventurer', modifier: 8, description: '-8% HP (скверна)' },
    { type: 'damage_weapon', modifier: 8, description: '-8% прочности (скверна)' },
  ],
  weight: 9,
  icon: '🫧',
};

export const depthsElementalEvents: EventTemplate[] = [eventDepthsFoldBlade, eventDepthsSkvernaFilm];
