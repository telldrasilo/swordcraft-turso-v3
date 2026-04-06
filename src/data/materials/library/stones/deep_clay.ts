import { buildWorldNode, loreSummary } from '../build-world-node'
export const deep_clay = buildWorldNode({
id: 'deep_clay',
    name: 'Глубинная глина',
    role: 'stone',
    economy: { rarity: 34, tier: 2, baseValue: 12, availability: 72, discoverability: 65 },
    summary: loreSummary(
      'Плотная глина с нижних горизонтов шахт и штолен, с высоким содержанием шамота.'
    ),
    description:
      'После обжигу держит форму и размер лучше поверхностной глины; ценится для грубой керамики и герметизации швов.',
})
