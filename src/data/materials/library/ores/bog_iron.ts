import { buildWorldNode, loreSummary } from '../build-world-node'
export const bog_iron = buildWorldNode({
id: 'bog_iron',
    name: 'Болотное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 46, tier: 2, baseValue: 20, availability: 58, discoverability: 55 },
    summary: loreSummary('Руда из заболоченных зон с примесью токсинов.'),
    description: 'Требует дополнительной очистки; может нести «болотную» порчу в сплавах.',
})
