import { buildWorldNode, loreSummary } from '../build-world-node'
export const dragon_scale = buildWorldNode({
id: 'dragon_scale',
    name: 'Драконья чешуя',
    role: 'leather',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: loreSummary('Чешуя с естественной устойчивостью к жару и удару.'),
    description: 'Идёт на броню и декор; требует специальных прессов.',
})
