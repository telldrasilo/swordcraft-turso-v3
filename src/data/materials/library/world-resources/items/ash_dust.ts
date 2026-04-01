import { buildWorldNode, loreSummary } from '../build-world-node'
export const ash_dust = buildWorldNode({
id: 'ash_dust',
    name: 'Пепельная пыль',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 18, availability: 55, discoverability: 52 },
    summary: loreSummary('Мелкая зола вулканов для укрепляющих смесей и адсорбции.'),
    description: 'Тонкий порошок; раздражает лёгкие при вдыхании.',
})
