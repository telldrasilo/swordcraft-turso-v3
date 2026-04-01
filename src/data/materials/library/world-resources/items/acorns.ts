import { buildWorldNode, loreSummary } from '../build-world-node'
export const acorns = buildWorldNode({
id: 'acorns',
    name: 'Жёлуди',
    role: 'organic',
    economy: { rarity: 22, tier: 1, baseValue: 4, availability: 95, discoverability: 90 },
    summary: loreSummary('Семена дуба: корм, мука, заготовки.'),
    description: 'Обычный лесной ресурс; при обработке даёт массу для выпечки и корма.',
})
