import { buildWorldNode, loreSummary } from '../build-world-node'
export const spirit_wood = buildWorldNode({
id: 'spirit_wood',
    name: 'Древесина духов',
    role: 'wood',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 28, discoverability: 30 },
    summary: loreSummary('Древесина, слегка поглощающая ману вокруг.'),
    description: 'Падает с особых деревьев Шепчущего Леса; подходит для магических рукоятей.',
})
