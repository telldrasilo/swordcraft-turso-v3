import { buildWorldNode, loreSummary } from '../build-world-node'
export const decayed_bones = buildWorldNode({
id: 'decayed_bones',
    name: 'Гнилые кости',
    role: 'organic',
    economy: { rarity: 30, tier: 2, baseValue: 8, availability: 72, discoverability: 68 },
    summary: loreSummary('Кости в стадии разложения; источник костной муки и алхимии.'),
    description:
        'Находятся на болотах и топях; при сырой обработке высок риск инфекции, гильдии рекомендуют проварку.',
})
