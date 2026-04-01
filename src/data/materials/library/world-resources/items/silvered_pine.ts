import { buildWorldNode, loreSummary } from '../build-world-node'
export const silvered_pine = buildWorldNode({
id: 'silvered_pine',
    name: 'Серебристая сосна',
    role: 'wood',
    economy: { rarity: 68, tier: 3, baseValue: 42, availability: 28, discoverability: 30 },
    summary: loreSummary('Дерево, впитавшее серебро; редкая древесина высокого тира.'),
    description: 'Растёт только там, где почва богата серебром; тяжелее обычной сосны.',
})
