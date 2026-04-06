import { buildWorldNode, loreSummary } from '../build-world-node'
export const cold_iron_ore = buildWorldNode({
id: 'cold_iron_ore',
    name: 'Морозная руда',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 52, tier: 3, baseValue: 28, availability: 45, discoverability: 48 },
    summary: loreSummary(
      'Железистая руда, остающаяся холодной на ощупь даже у разогретой кузницы.'
    ),
    description:
      'Сырьё для холодного железа; типична для Кряжа Морозного Железа. Требует аккуратной плавки из-за нестабильных примесей.',
})
