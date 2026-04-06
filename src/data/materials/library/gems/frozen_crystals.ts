import { buildWorldNode, loreSummary } from '../build-world-node'
export const frozen_crystals = buildWorldNode({
id: 'frozen_crystals',
    name: 'Ледяные кристаллы',
    role: 'gem',
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 30, discoverability: 32 },
    summary: loreSummary('Магические кристаллы холода из морозных расщелин.'),
    description:
        'Резонируют с водой и воздухом; ценны в магии и алхимии, но при таянии дают резкий треск.',
})
