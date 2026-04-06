import { buildWorldNode, loreSummary } from '../build-world-node'
export const mist_herbs = buildWorldNode({
id: 'mist_herbs',
    name: 'Туманные травы',
    role: 'organic',
    economy: { rarity: 48, tier: 1, baseValue: 18, availability: 50, discoverability: 48 },
    summary: loreSummary('Травы, цветущие только в постоянном тумане.'),
    description:
        'Имеют лёгкие магические свойства из-за среды произрастания в вечном тумане низин.',
})
