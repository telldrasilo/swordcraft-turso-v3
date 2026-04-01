import { buildWorldNode, loreSummary } from '../build-world-node'
export const dragon_glass = buildWorldNode({
id: 'dragon_glass',
    name: 'Драконье стекло',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 14, discoverability: 15 },
    summary: loreSummary('Стекло, сплавленное дыханием дракона с песком склонов.'),
    description: 'Сочетает жар и хрупкость; идеально для ритуальных орудий.',
})
