import { buildWorldNode, loreSummary } from '../build-world-node'
export const coal = buildWorldNode({
id: 'coal',
    name: 'Уголь',
    role: 'fuel',
    economy: { rarity: 28, tier: 1, baseValue: 9, availability: 88, discoverability: 85 },
    summary: loreSummary('Органический минерал. Основное топливо для плавки и кузни.'),
    description:
      'Уголь из шахт и залежей. Используется как топливо и восстановитель при выплавке.',
    tags: ['fuel', 'carbon'],
})
