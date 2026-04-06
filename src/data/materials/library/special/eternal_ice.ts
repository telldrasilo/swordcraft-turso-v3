import { buildWorldNode, loreSummary } from '../build-world-node'
export const eternal_ice = buildWorldNode({
id: 'eternal_ice',
    name: 'Вечный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 50, tier: 3, baseValue: 30, availability: 42, discoverability: 40 },
    summary: loreSummary(
      'Кристаллы льда аномальной стойкости, не теряющие объём при обычном нагреве у горна.'
    ),
    description:
      'Сохраняет интенсивный холод долго после добычи; применяют как стабилизатор ледяных зачарований и охлаждение реактивов.',
})
