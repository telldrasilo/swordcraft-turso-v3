/**
 * Стихийные следы — пепельные пустоши (fire, air, earth).
 */

import type { EventTemplate } from '../_event-template';

export const eventAshCinderScorch: EventTemplate = {
  id: 'event_ash_cinder_scorch',
  name: 'Угли на клинке',
  type: 'negative',
  category: 'environment',
  title: 'Жар пепельной бури',
  description: `Пепельная вихрь на секунду стала плотной — раскалённые частицы осели на полотно, оставив матовые воронки и синеву закалки там, где сталь должна была остаться ровной.`,
  flavorText: 'В Пустошах огонь не только под ногами.',
  conditions: { locationIds: ['ash_wastes'], minProgress: 14, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 7, description: '-7% прочности (жар пепла)' },
    { type: 'modify_success_chance', modifier: -4, description: '-4% к успеху (забоина в глазах)' },
  ],
  weight: 12,
  icon: '🔥',
};

export const eventAshStormShear: EventTemplate = {
  id: 'event_ash_storm_shear',
  name: 'Нож пепельной бури',
  type: 'negative',
  category: 'environment',
  title: 'Порыв с пеплом',
  description: `Струя горячего ветра с пеплом ударила в плоскость клинка сбоку — металл отозвался микротрещинами у шейки, будто воздух резал не только кожу.`,
  flavorText: 'Буря здесь точит сталь, как наждак.',
  conditions: { locationIds: ['ash_wastes'], minProgress: 16, maxProgress: 86 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (сдвиг воздуха и пепла)' },
  ],
  weight: 11,
  icon: '🌪️',
};

export const eventAshFissureGrit: EventTemplate = {
  id: 'event_ash_fissure_grit',
  name: 'Крошка из трещины',
  type: 'negative',
  category: 'danger',
  title: 'Земля осыпается',
  description: `Край раскалённой трещины осыпался вулканическим песком — крошка забилась в микропоры стали, и клинок «поёт» на бруске иначе, чем до шага.`,
  flavorText: 'Пустошь заполняет щели без спроса.',
  conditions: { locationIds: ['ash_wastes'], minProgress: 18, maxProgress: 84 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (земля и песок)' },
    { type: 'modify_duration', modifier: 45, description: '+45 с (продувка)' },
  ],
  weight: 10,
  icon: '🪨',
};

export const ashWastesElementalEvents: EventTemplate[] = [
  eventAshCinderScorch,
  eventAshStormShear,
  eventAshFissureGrit,
];
