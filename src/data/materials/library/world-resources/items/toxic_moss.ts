import { buildWorldNode, loreSummary } from '../build-world-node'
export const toxic_moss = buildWorldNode({
id: 'toxic_moss',
    name: 'Токсичный мох',
    role: 'organic',
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: loreSummary('Мох, накапливающий яды болота.'),
    description: 'Концентрат для фильтров-ловушек и контролируемых выделений.',
})
