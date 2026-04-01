import { buildWorldNode, loreSummary } from '../build-world-node'
export const eternal_ice = buildWorldNode({
id: 'eternal_ice',
    name: 'Вечный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 50, tier: 3, baseValue: 30, availability: 42, discoverability: 40 },
    summary: loreSummary('Лёд, не тающий при обычном нагреве.'),
    description: 'Сохраняет холод; используется как стабилизатор ледяных зачарований.',
})
