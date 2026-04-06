import { buildWorldNode, loreSummary } from '../build-world-node'
export const ancient_metal = buildWorldNode({
id: 'ancient_metal',
    name: 'Древний металл',
    role: 'metal',
    origin: 'alloy',
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 26, discoverability: 28 },
    summary: loreSummary('Сплав неизвестной эпохи; сохраняет форму веками.'),
    description:
        'Слиток-подобный материал из руин глубин; состав не расшифровывают даже гильдейские химики.',
})
