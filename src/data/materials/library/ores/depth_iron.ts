import { buildWorldNode, loreSummary } from '../build-world-node'
export const depth_iron = buildWorldNode({
id: 'depth_iron',
    name: 'Глубинное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 32, discoverability: 34 },
    summary: loreSummary('Железная руда с аномально высокой плотностью и чистотой.'),
    description: 'Формируется под давлением глубин; даёт особенно качественный металл при выплавке.',
})
