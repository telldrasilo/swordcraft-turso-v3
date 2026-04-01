import { buildWorldNode, loreSummary } from '../build-world-node'
export const deep_clay = buildWorldNode({
id: 'deep_clay',
    name: 'Глубинная глина',
    role: 'stone',
    economy: { rarity: 34, tier: 2, baseValue: 12, availability: 72, discoverability: 65 },
    summary: loreSummary('Плотная глина с нижних уровней шахт.'),
    description: 'Держит форму после обжига лучше поверхностной глины.',
})
