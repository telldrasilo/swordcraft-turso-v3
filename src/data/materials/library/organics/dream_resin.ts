import { buildWorldNode, loreSummary } from '../build-world-node'
export const dream_resin = buildWorldNode({
id: 'dream_resin',
    name: 'Смола снов',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Липкая смола с лёгким снотворным ароматом.'),
    description:
        'База для зелий сна и успокоения без полной потери сознания; смолу режут горячим ножом.',
})
