/**
 * Стихийные следы — забытые шахты (earth, darkness, air).
 */

import type { EventTemplate } from '../_event-template';

export const eventForgottenEarthGrit: EventTemplate = {
  id: 'event_forgotten_earth_grit',
  name: 'Порода в зубьях',
  type: 'negative',
  category: 'environment',
  title: 'Песок и крошка',
  description: `Древние отвалы осыпались при проходе — крошка породы врезалась в микрорельеф клинка, и кромка теперь ведёт себя как напильник, а не как лезвие.`,
  flavorText: 'Земля заполняет пустоты быстрее, чем их чистят.',
  conditions: { locationIds: ['forgotten_mines'], minProgress: 12, maxProgress: 90 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (земля и песок)' },
    { type: 'modify_duration', modifier: 90, description: '+1.5 минуты (чистка)' },
  ],
  weight: 13,
  icon: '🪨',
};

export const eventForgottenEchoDark: EventTemplate = {
  id: 'event_forgotten_echo_dark',
  name: 'Тьма в трещине',
  type: 'negative',
  category: 'danger',
  title: 'Тень в металле',
  description: `В глубине, где свет не держится, тьма оседает на сталь иначе, чем пыль — чёрные разводы не сдвигаются с полировки, будто металл впитал отсутствие света.`,
  flavorText: 'Старые шахты помнят не только руду.',
  conditions: { locationIds: ['forgotten_mines'], minProgress: 20, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (тьма на клинке)' },
    { type: 'modify_success_chance', modifier: -4, description: '-4% к успеху' },
  ],
  weight: 12,
  icon: '🕳️',
};

export const forgottenElementalEvents: EventTemplate[] = [
  eventForgottenEarthGrit,
  eventForgottenEchoDark,
];
