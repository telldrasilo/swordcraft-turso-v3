import { buildWorldNode, loreSummary } from '../build-world-node'
export const silver_bark = buildWorldNode({
id: 'silver_bark',
    name: 'Серебряная кора',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: loreSummary('Кора деревьев, подпитывающихся серебром из почвы.'),
    description: 'Слабо проводит магию серебра; подходит для инкрустаций и алхимии.',
})
