import { buildWorldNode, loreSummary } from '../build-world-node'
export const soulforge_ember = buildWorldNode({
id: 'soulforge_ember',
    name: 'Уголь душеплавильни',
    role: 'special',
    origin: 'refined',
    economy: { rarity: 90, tier: 4, baseValue: 84, availability: 10, discoverability: 11 },
    summary: loreSummary('Тлеющий уголь, горящий без кислорода и на питании духа.'),
    description: 'Топливо для легендарных горнов; опасен для неподготовленных кузнецов.',
})
