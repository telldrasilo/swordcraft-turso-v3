import { buildWorldNode, loreSummary } from '../build-world-node'
export const rotten_wood = buildWorldNode({
id: 'rotten_wood',
    name: 'Гнилое дерево',
    role: 'wood',
    economy: { rarity: 28, tier: 2, baseValue: 6, availability: 75, discoverability: 70 },
    summary: loreSummary('Рыхлая древесина; горит дымно, годится для импровизаций.'),
    description:
        'Массовый ресурс Гнилого Болота; питает грибницы и яды, легко крошится в тёплом сарае.',
})
