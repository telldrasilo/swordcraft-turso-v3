import { buildWorldNode, loreSummary } from '../build-world-node'
export const oak_bark = buildWorldNode({
id: 'oak_bark',
    name: 'Кора дуба',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 88, discoverability: 82 },
    summary: loreSummary('Кора для дубления, настоев и грубых перевязок.'),
    description: 'Собирается с окраин Дубовой Рощи; содержит дубильные вещества.',
})
