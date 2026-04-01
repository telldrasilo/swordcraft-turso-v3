import { buildWorldNode, loreSummary } from '../build-world-node'
export const poison_gland = buildWorldNode({
id: 'poison_gland',
    name: 'Ядовитая железа',
    role: 'organic',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: loreSummary('Орган с сосредоточенным ядом болотных тварей.'),
    description: 'Сырьё для контактных ядов и противоядий при правильной экстракции.',
})
