import { buildWorldNode, loreSummary } from '../build-world-node'
export const echo_bark = buildWorldNode({
id: 'echo_bark',
    name: 'Эхо-кора',
    role: 'organic',
    economy: { rarity: 50, tier: 3, baseValue: 26, availability: 46, discoverability: 44 },
    summary: loreSummary('Кора, усиливающая отголоски шагов и заклинаний.'),
    description:
        'Собирается с деревьев, чувствительных к вибрациям магии; сушат в тени, иначе «эхо» гаснет.',
})
