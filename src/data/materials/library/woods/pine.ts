import { buildWorldNode, loreSummary } from '../build-world-node'
export const pine = buildWorldNode({
id: 'pine',
    name: 'Сосна',
    role: 'wood',
    economy: { rarity: 30, tier: 2, baseValue: 12, availability: 82, discoverability: 78 },
    summary: loreSummary('Смолистая древесина: лёгкая, пахучая, быстрая в обработке.'),
    description: 'Основная древесина Серебряного Бора; смола выходит при распиле.',
})
