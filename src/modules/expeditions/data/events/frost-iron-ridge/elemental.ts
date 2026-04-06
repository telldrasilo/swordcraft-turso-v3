/**
 * Стихийные следы — кряж морозного железа (frost).
 */

import type { EventTemplate } from '../_event-template';

export const eventFrostRimeEdge: EventTemplate = {
  id: 'event_frost_rime_edge',
  name: 'Иней на стали',
  type: 'negative',
  category: 'environment',
  title: 'Мороз укусил кромку',
  description: `Ледяной ветер с пика обжёг кромку — белесая сетка микротрещин пошла от шейки к острию, и металл стал «хрупче», чем должен на этом градусе.`,
  flavorText: 'Холод любит шейку клинка первой.',
  conditions: { locationIds: ['frost_iron_ridge'], minProgress: 15, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (мороз по стали)' },
    { type: 'modify_duration', modifier: 90, description: '+1.5 минуты (отогрев)' },
  ],
  weight: 14,
  icon: '❄️',
};

export const frostElementalEvents: EventTemplate[] = [eventFrostRimeEdge];
