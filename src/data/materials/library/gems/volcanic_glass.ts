import { buildWorldNode, loreSummary } from '../build-world-node'
export const volcanic_glass = buildWorldNode({
id: 'volcanic_glass',
    name: 'Вулканическое стекло',
    role: 'gem',
    economy: { rarity: 66, tier: 3, baseValue: 40, availability: 32, discoverability: 35 },
    summary: loreSummary('Остеклованная лава; режущий край острее многих сплавов.'),
    description:
        'Добывается на Пепельных Пустошах; хрупок при ударе сбоку, но держит остриё при прямом давлении.',
})
