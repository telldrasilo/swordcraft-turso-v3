/**
 * Стихийные следы на оружии — окраины рощи (nature, earth, air в presentElements).
 */

import type { EventTemplate } from '../_event-template';

export const eventOakSporeNature: EventTemplate = {
  id: 'event_oak_spore_nature',
  name: 'Споры в царапинах',
  type: 'negative',
  category: 'environment',
  title: 'Зелёный налёт на клинке',
  description: `Споры древнего леса осели в микротрещинах кромки — не ржавчина, а живой налёт. Металл ведёт себя иначе: словно клинок «дышит» влажным воздухом чащи.`,
  flavorText: '"Лес оставляет метку не только на коже."',
  conditions: { locationIds: ['oak_grove_outskirts'], minProgress: 15, maxProgress: 88 },
  effects: [
    { type: 'damage_weapon', modifier: 6, description: '-6% прочности (природа в металле)' },
    { type: 'modify_duration', modifier: 90, description: '+1.5 минуты (очистка клинка)' },
  ],
  weight: 12,
  icon: '🌿',
};

export const eventOakGustAir: EventTemplate = {
  id: 'event_oak_gust_air',
  name: 'Порыв с опушки',
  type: 'negative',
  category: 'environment',
  title: 'Воздух ударил по плоскости',
  description: `Внезапный порыв с открытой поляны сорвался с кромки холма — клинок поймал перепад, сталь «зазвенела», и по шейке пошли едва видимые микротрещины.`,
  flavorText: '"Ветер не режет — но заставляет металл работать не так."',
  conditions: { locationIds: ['oak_grove_outskirts'], minProgress: 20, maxProgress: 82 },
  effects: [
    { type: 'damage_weapon', modifier: 5, description: '-5% прочности (сдвиг воздуха)' },
    { type: 'modify_success_chance', modifier: -3, description: '-3% к успеху' },
  ],
  weight: 11,
  icon: '💨',
};

export const oakGroveElementalEvents: EventTemplate[] = [eventOakSporeNature, eventOakGustAir];
