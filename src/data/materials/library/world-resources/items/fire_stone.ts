import { buildWorldNode, loreSummary } from '../build-world-node'
export const fire_stone = buildWorldNode({
id: 'fire_stone',
    name: 'Огненный камень',
    role: 'gem',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 26, discoverability: 28 },
    summary: loreSummary('Камень, долго удерживающий тепло после нагрева.'),
    description: 'Применяется в накопителях тепла и малых горнах.',
})
