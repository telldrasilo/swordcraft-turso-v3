import { buildWorldNode, loreSummary } from '../build-world-node'
export const depth_stone = buildWorldNode({
id: 'depth_stone',
    name: 'Камень глубины',
    role: 'stone',
    economy: { rarity: 48, tier: 4, baseValue: 32, availability: 40, discoverability: 38 },
    summary: loreSummary('Порода ядра мира: плотнее обычного камня.'),
    description: 'Строительный и ритуальный материал глубинных зон.',
})
