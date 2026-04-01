import { buildWorldNode, loreSummary } from '../build-world-node'
export const living_ore = buildWorldNode({
id: 'living_ore',
    name: 'Живая руда',
    role: 'ore',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: loreSummary('Руда, медленно наращивающая массу при питании маной.'),
    description: 'Требует стабилизации перед плавкой; уникальна для Глубин.',
})
