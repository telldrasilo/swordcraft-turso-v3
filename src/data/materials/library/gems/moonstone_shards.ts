import { buildWorldNode, loreSummary } from '../build-world-node'
export const moonstone_shards = buildWorldNode({
id: 'moonstone_shards',
    name: 'Осколки лунного камня',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 26, availability: 45, discoverability: 42 },
    summary: loreSummary('Светящиеся осколки, питающиеся лунным светом.'),
    description: 'Находятся в Серебряном Бору; используются в амулетах и контроле маны.',
})
