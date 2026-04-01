import { buildWorldNode, loreSummary } from '../build-world-node'
export const whisper_moss = buildWorldNode({
id: 'whisper_moss',
    name: 'Шепчущий мох',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Мох для чернил и ментально-насыщенных порошков.'),
    description: 'При растирании издаёт едва слышимый шум, похожий на речь.',
})
