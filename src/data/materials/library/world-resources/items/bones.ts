import { buildWorldNode, loreSummary } from '../build-world-node'
export const bones = buildWorldNode({
id: 'bones',
    name: 'Кости животных',
    role: 'organic',
    economy: { rarity: 26, tier: 1, baseValue: 6, availability: 85, discoverability: 78 },
    summary: loreSummary('Прочный органический материал для клея, инструментов и украшений.'),
    description: 'Набираются на болотах и охотничьих тропах; подходят для измельчения и обработки.',
})
