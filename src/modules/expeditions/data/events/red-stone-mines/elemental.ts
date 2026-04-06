/**
 * Стихийные следы — рудники (fire, earth, air).
 */

import type { EventTemplate } from '../_event-template';

export const eventRedForgeSpark: EventTemplate = {
  id: 'event_red_forge_spark',
  name: 'Искра из печи',
  type: 'negative',
  category: 'danger',
  title: 'Жар коснулся клинка',
  description: `Рядом с печью или взрывной пробой искра ударила в полотно — металл мгновенно перегрелся и остыл, оставив окалину и синеватый налёт там, где должна была быть ровная закалка.`,
  flavorText: 'В шахте огонь не всегда друг.',
  conditions: { locationIds: ['red_stone_mines'], minProgress: 12, maxProgress: 90 },
  effects: [
    { type: 'damage_adventurer', modifier: 5, description: '-5% HP (жар)' },
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (ожог огня)' },
  ],
  weight: 13,
  icon: '🔥',
};

export const eventRedTunnelGrit: EventTemplate = {
  id: 'event_red_tunnel_grit',
  name: 'Пыль породы',
  type: 'negative',
  category: 'environment',
  title: 'Крошка врезалась в сталь',
  description: `Обвалившийся грунт и песчаник осыпались на клинок при работе в узком ходе — крошка вбилась в микрельеф, и теперь металл «поёт» на бруске иначе, чем должен.`,
  flavorText: 'Земля запоминает каждый удар.',
  conditions: { locationIds: ['red_stone_mines'], minProgress: 18, maxProgress: 85 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (земля и песок)' },
    { type: 'modify_duration', modifier: 60, description: '+1 минута (продувка)' },
  ],
  weight: 12,
  icon: '🪨',
};

export const eventRedShaftDraft: EventTemplate = {
  id: 'event_red_shaft_draft',
  name: 'Сквозняк в штреке',
  type: 'negative',
  category: 'environment',
  title: 'Давление в туннеле',
  description: `Сквозняк между штреками бросил клинок в микровибрацию — сталь ответила тонкими линиями у шейки, как от удара не по плоскости, а по воздуху.`,
  flavorText: 'В шахте ветер тоже режет.',
  conditions: { locationIds: ['red_stone_mines'], minProgress: 15, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 5, description: '-5% прочности (сдвиг воздуха)' },
  ],
  weight: 11,
  icon: '🌬️',
};

export const redStoneElementalEvents: EventTemplate[] = [
  eventRedForgeSpark,
  eventRedTunnelGrit,
  eventRedShaftDraft,
];
