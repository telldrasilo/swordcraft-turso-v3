import { buildWorldNode, loreSummary } from '../build-world-node'
export const primordial_amber = buildWorldNode({
id: 'primordial_amber',
    name: 'Первозданный янтарь',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 72, availability: 14, discoverability: 16 },
    summary: loreSummary('Ископаемая смола, пропитанная энергией пепла эпох.'),
    description: 'Капсулирует заряды пламени; эндгейм-материал Пустошей.',
})
