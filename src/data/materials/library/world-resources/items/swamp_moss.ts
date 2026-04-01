import { buildWorldNode, loreSummary } from '../build-world-node'
export const swamp_moss = buildWorldNode({
id: 'swamp_moss',
    name: 'Болотный мох',
    role: 'organic',
    economy: { rarity: 32, tier: 1, baseValue: 9, availability: 78, discoverability: 72 },
    summary: loreSummary('Влажный мох для перевязок и противогнилостных примочек.'),
    description: 'Растёт в тумане; держит влагу дольше лесного собрата.',
})
