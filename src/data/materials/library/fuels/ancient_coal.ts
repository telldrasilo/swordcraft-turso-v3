import { buildWorldNode, loreSummary } from '../build-world-node'
export const ancient_coal = buildWorldNode({
id: 'ancient_coal',
    name: 'Древний уголь',
    role: 'fuel',
    tags: ['fuel'],
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: loreSummary('Уголь высокой плотности; жар дольше обычного.'),
    description: 'Залегает в забытых шахтах; ценится для высокотемпературной плавки.',
})
