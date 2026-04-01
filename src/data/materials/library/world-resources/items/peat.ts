import { buildWorldNode, loreSummary } from '../build-world-node'
export const peat = buildWorldNode({
id: 'peat',
    name: 'Торф',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 82, discoverability: 75 },
    summary: loreSummary('Горючая масса болот; медленное, ровное пламя.'),
    description: 'Добывается в туманных низинах; сырьё для топлива и сушки материалов.',
    tags: ['fuel'],
})
