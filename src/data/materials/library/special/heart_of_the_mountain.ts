import { buildWorldNode, loreSummary } from '../build-world-node'
export const heart_of_the_mountain = buildWorldNode({
id: 'heart_of_the_mountain',
    name: 'Сердце горы',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 96, tier: 5, baseValue: 120, availability: 5, discoverability: 8 },
    summary: loreSummary('Легендарный конгломерат — память всех металлов мира.'),
    description: 'Кульминационный материал дальних земель; одна добыча меняет статус кузницы.',
})
