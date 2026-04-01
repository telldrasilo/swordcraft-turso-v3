import { buildWorldNode, loreSummary } from '../build-world-node'
export const shadow_leather = buildWorldNode({
id: 'shadow_leather',
    name: 'Теневая кожа',
    role: 'leather',
    economy: { rarity: 72, tier: 3, baseValue: 48, availability: 28, discoverability: 30 },
    summary: loreSummary('Шкура существ тьмы; поглощает часть света.'),
    description: 'Дорогая кожа для скрытных доспехов и магической обивки.',
})
