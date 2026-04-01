import { buildWorldNode, loreSummary } from '../build-world-node'
export const silver_ore = buildWorldNode({
id: 'silver_ore',
    name: 'Серебряная руда',
    role: 'ore',
    tags: ['silver-bearing'],
    economy: { rarity: 42, tier: 2, baseValue: 22, availability: 62, discoverability: 58 },
    summary: loreSummary('Руда с ценным серебром; требует очистки и сплава.'),
    description: 'Стандартный источник серебра в средних тирах.',
})
