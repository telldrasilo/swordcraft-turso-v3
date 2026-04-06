import { buildWorldNode, loreSummary } from '../build-world-node'
export const acorns = buildWorldNode({
id: 'acorns',
    name: 'Жёлуди',
    role: 'organic',
    economy: { rarity: 22, tier: 1, baseValue: 4, availability: 95, discoverability: 90 },
    summary: loreSummary(
      'Семена дуба и родственных пород: корм, мука, жирное масло и заготовки на зиму.'
    ),
    description:
      'Обычный лесной ресурс на окраинах и рощах; при сушке и обжарке даёт основу для выпечки, каш и корма для скота.',
})
