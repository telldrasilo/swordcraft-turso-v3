import { buildWorldNode, loreSummary } from '../build-world-node'
export const red_stone = buildWorldNode({
id: 'red_stone',
    name: 'Красный камень',
    role: 'stone',
    economy: { rarity: 30, tier: 1, baseValue: 10, availability: 80, discoverability: 80 },
    summary: loreSummary('Порода с ржавым оттенком из рудников Красного Камня.'),
    description: 'Плотный камень местных жил; пригоден для строительства и как наполнитель.',
})
