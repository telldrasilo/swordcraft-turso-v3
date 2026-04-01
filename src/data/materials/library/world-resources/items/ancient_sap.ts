import { buildWorldNode, loreSummary } from '../build-world-node'
export const ancient_sap = buildWorldNode({
id: 'ancient_sap',
    name: 'Древний сок',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 75, availability: 12, discoverability: 14 },
    summary: loreSummary('Сок Первого Древа; концентрат жизненной силы леса.'),
    description: 'Легендарный ресурс Шепчущего Леса; переполняет слабые сосуды.',
})
