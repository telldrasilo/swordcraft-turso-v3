import { buildWorldNode, loreSummary } from '../build-world-node'
export const star_metal = buildWorldNode({
id: 'star_metal',
    name: 'Звёздный металл',
    role: 'ore',
    tags: ['meteoric'],
    economy: { rarity: 88, tier: 4, baseValue: 82, availability: 14, discoverability: 12 },
    summary: loreSummary('Металл с небес, упавший в эпоху драконьих войн.'),
    description:
        'Редчайшая руда для клинков и небесных артефактов; плохо поддаётся обычным горнам без усиления.',
})
