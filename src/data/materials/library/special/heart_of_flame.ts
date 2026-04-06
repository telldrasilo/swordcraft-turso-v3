import { buildWorldNode, loreSummary } from '../build-world-node'
export const heart_of_flame = buildWorldNode({
id: 'heart_of_flame',
    name: 'Сердце пламени',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 90, tier: 4, baseValue: 85, discoverability: 12, availability: 10 },
    summary: loreSummary('Кристаллизованное дыхание древнего огня.'),
    description:
        'Ядро огненных артефактов; без оболочки из жаропрочного сплава пульсирует и оставляет ожоги.',
})
