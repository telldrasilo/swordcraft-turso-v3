import { buildWorldNode, loreSummary } from '../build-world-node'
export const echo_stone = buildWorldNode({
id: 'echo_stone',
    name: 'Эхо-камень',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Камень, странным образом отражающий звук и вибрацию.'),
    description: 'Применяется в резонаторах и акустических ловушках древних штолен.',
})
