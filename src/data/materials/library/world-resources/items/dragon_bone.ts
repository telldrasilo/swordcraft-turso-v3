import { buildWorldNode, loreSummary } from '../build-world-node'
export const dragon_bone = buildWorldNode({
id: 'dragon_bone',
    name: 'Драконья кость',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 72, tier: 4, baseValue: 55, availability: 24, discoverability: 26 },
    summary: loreSummary('Кость драконьего рода: легче стали при огромной твёрдости.'),
    description: 'Основа топоров и древков элитного уровня; трудна в распиле.',
})
