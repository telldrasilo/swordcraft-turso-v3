import { buildWorldNode, loreSummary } from '../build-world-node'
export const void_crystal = buildWorldNode({
id: 'void_crystal',
    name: 'Кристалл пустоты',
    role: 'gem',
    economy: { rarity: 90, tier: 4, baseValue: 86, availability: 10, discoverability: 12 },
    summary: loreSummary('Камень, стремящийся «съесть» соседнюю ману и свет.'),
    description:
        'Добывается в Глубинах; без защитных контейнеров кристалл «подъедает» слабые амулеты рядом.',
})
