import { buildWorldNode, loreSummary } from '../build-world-node'
export const mithril_ore = buildWorldNode({
id: 'mithril_ore',
    name: 'Мифриловая руда',
    role: 'ore',
    tags: ['mithril-bearing'],
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 22, discoverability: 25 },
    summary: loreSummary('Легендарная руда лёгкого металла невероятной прочности.'),
    description: 'Ключевой ресурс высоких тиров; требует мастерской обработки.',
})
