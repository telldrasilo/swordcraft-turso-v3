import { buildWorldNode, loreSummary } from '../build-world-node'
export const gold_ore = buildWorldNode({
id: 'gold_ore',
    name: 'Золотая руда',
    role: 'ore',
    tags: ['gold-bearing'],
    economy: { rarity: 55, tier: 3, baseValue: 38, availability: 40, discoverability: 38 },
    summary: loreSummary('Редкая руда с высокой ценностью и примесью породы.'),
    description: 'Встречается в драконьих землях и глубинах; плавится в отдельных процессах.',
})
