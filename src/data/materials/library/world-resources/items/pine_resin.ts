import { buildWorldNode, loreSummary } from '../build-world-node'
export const pine_resin = buildWorldNode({
id: 'pine_resin',
    name: 'Сосновая смола',
    role: 'organic',
    economy: { rarity: 32, tier: 2, baseValue: 11, availability: 80, discoverability: 75 },
    summary: loreSummary('Вязкая смола для пропитки, клея и факела.'),
    description: 'Собирается с коры сосен над серебряными жилами; горит ярко.',
})
