import { buildWorldNode, loreSummary } from '../build-world-node'
export const wild_herbs = buildWorldNode({
id: 'wild_herbs',
    name: 'Дикие травы',
    role: 'organic',
    economy: { rarity: 45, tier: 1, baseValue: 16, availability: 60, discoverability: 55 },
    summary: loreSummary(
      'Смесь целебных и ароматических трав с лугов, вырубок и влажных опушек.'
    ),
    description:
      'Сбор требует опыта и сезонности: используют в настойках, припарках, простой полевой медицине и пищевых консервациях.',
})
