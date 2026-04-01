import { buildWorldNode, loreSummary } from '../build-world-node'
export const sulfur = buildWorldNode({
id: 'sulfur',
    name: 'Сера',
    role: 'stone',
    economy: { rarity: 34, tier: 3, baseValue: 14, availability: 65, discoverability: 62 },
    summary: loreSummary('Жёлтый минерал для пороха, спичек и кислот.'),
    description: 'Характерен для жарких зон; хранить от огня и влаги.',
})
