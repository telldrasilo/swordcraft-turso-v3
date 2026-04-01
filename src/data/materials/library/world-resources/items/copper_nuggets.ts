import { buildWorldNode, loreSummary } from '../build-world-node'
export const copper_nuggets = buildWorldNode({
id: 'copper_nuggets',
    name: 'Медные самородки',
    role: 'ore',
    tags: ['copper-bearing'],
    economy: { rarity: 48, tier: 1, baseValue: 22, availability: 55, discoverability: 50 },
    summary: loreSummary('Куски почти чистой меди без полной переплавки.'),
    description: 'Редкие самородки в верхних жилах; ценятся алхимиками и плавильщиками.',
})
