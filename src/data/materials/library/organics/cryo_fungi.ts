import { buildWorldNode, loreSummary } from '../build-world-node'
export const cryo_fungi = buildWorldNode({
id: 'cryo_fungi',
    name: 'Крио-грибы',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 22, availability: 50, discoverability: 48 },
    summary: loreSummary('Грибы, растущие в зоне «тепла от холода».'),
    description: 'Парадоксальная флора хребта; экстракты с охлаждающим эффектом.',
})
