/**
 * Стихийные следы — гнилое болото (poison, water, corrosion).
 */

import type { EventTemplate } from '../_event-template';

export const eventRottenBilePoison: EventTemplate = {
  id: 'event_rotten_bile_poison',
  name: 'Жёлтая плёнка',
  type: 'negative',
  category: 'danger',
  title: 'Яд на кромке',
  description: `Болотная жижа брызнула на клинок — зеленоватый матовый след остался на стали, и металл начал вести себя «кисло», как после травления.`,
  flavorText: 'Болото кислит не только душу.',
  conditions: { locationIds: ['rotten_swamp'], minProgress: 15, maxProgress: 88 },
  effects: [
    { type: 'damage_adventurer', modifier: 6, description: '-6% HP (брызги)' },
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (яд на металле)' },
  ],
  weight: 13,
  icon: '☠️',
};

export const eventRottenAcidCorrosion: EventTemplate = {
  id: 'event_rotten_acid_corrosion',
  name: 'Кислотный туман',
  type: 'negative',
  category: 'environment',
  title: 'Коррозия за один выдох',
  description: `Кислотный туман осёл на голой стали — пятна пошли язвенно, зерно стало пористым на вид. Без зачистки клинок не переживёт долгую дорогу.`,
  flavorText: 'Воздух здесь ест металл.',
  conditions: { locationIds: ['rotten_swamp'], minProgress: 12, maxProgress: 90 },
  effects: [
    { type: 'damage_weapon', modifier: 8, description: '-8% прочности (коррозия)' },
    { type: 'modify_success_chance', modifier: -5, description: '-5% к успеху' },
  ],
  weight: 12,
  icon: '🧪',
};

export const rottenElementalEvents: EventTemplate[] = [
  eventRottenBilePoison,
  eventRottenAcidCorrosion,
];
