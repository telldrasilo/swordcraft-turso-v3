import { buildWorldNode, loreSummary } from '../build-world-node'
export const toxic_moss = buildWorldNode({
id: 'toxic_moss',
    name: 'Токсичный мох',
    role: 'organic',
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: loreSummary(
      'Болотный мох, годами накапливающий яды, соли и грибковые токсины торфяников.'
    ),
    description:
      'Концентрированное сырьё для фильтров-ловушек, реагентов и контролируемых выделений; требует перчаток и проветривания при сушке.',
})
