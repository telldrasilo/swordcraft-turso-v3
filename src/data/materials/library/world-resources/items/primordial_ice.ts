import { buildWorldNode, loreSummary } from '../build-world-node'
export const primordial_ice = buildWorldNode({
id: 'primordial_ice',
    name: 'Первозданный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 12, discoverability: 15 },
    summary: loreSummary('Древний лёд возрастом тысячелетий; хранит память зимы.'),
    description: 'Редчайший ресурс хребта; опасен при быстом нагреве.',
})
