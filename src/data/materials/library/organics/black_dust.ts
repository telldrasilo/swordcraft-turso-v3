import { buildWorldNode, loreSummary } from '../build-world-node'
export const black_dust = buildWorldNode({
id: 'black_dust',
    name: 'Чёрная пыль',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 22, availability: 50, discoverability: 48 },
    summary: loreSummary('Алхимический порошок из глубинных отложений.'),
    description: 'Катализатор для взрывчатых и контрастных смесей; хранить сухим.',
})
