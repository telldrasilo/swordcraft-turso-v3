/**
 * Стихийные следы — шепчущий лес (nature, arcane, darkness).
 */

import type { EventTemplate } from '../_event-template';

export const eventWhisperArcaneSurge: EventTemplate = {
  id: 'event_whisper_arcane_surge',
  name: 'Резонанс леса',
  type: 'negative',
  category: 'environment',
  title: 'Магия коснулась металла',
  description: `Магический шторм в кронах сорвался на секунду вниз — клинок поймал чужую частоту: мерцающие разводы и лёгкий гул в стали, не свойственные обычной ковке.`,
  flavorText: 'Лес шепчет — металл отвечает.',
  conditions: { locationIds: ['whispering_forest'], minProgress: 18, maxProgress: 82 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (аркан в металле)' },
    { type: 'modify_success_chance', modifier: -4, description: '-4% к успеху' },
  ],
  weight: 11,
  icon: '✨',
};

export const eventWhisperRootNature: EventTemplate = {
  id: 'event_whisper_root_nature',
  name: 'Корни на стали',
  type: 'negative',
  category: 'environment',
  title: 'Сок и пыльца',
  description: `Корневая сеть у поверхности пустила липкий сок и споры — тонкая плёнка въелась в микрорельеф клинка, будто лес решил оставить на металле свой знак.`,
  flavorText: 'Здесь природа метит оружие не хуже клейма.',
  conditions: { locationIds: ['whispering_forest'], minProgress: 16, maxProgress: 80 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (природный налёт)' },
  ],
  weight: 8,
  icon: '🌿',
};

export const whisperElementalEvents: EventTemplate[] = [
  eventWhisperArcaneSurge,
  eventWhisperRootNature,
];
