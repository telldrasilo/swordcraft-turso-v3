import { buildWorldNode, loreSummary } from '../build-world-node'
export const forest_moss = buildWorldNode({
id: 'forest_moss',
    name: 'Лесной мох',
    role: 'organic',
    economy: { rarity: 30, tier: 1, baseValue: 8, availability: 85, discoverability: 80 },
    summary: loreSummary('Мягкий мох для набивки, укрытий и простых снадобий.'),
    description:
        'Растёт на старых дубах и пнях; впитывает влагу и служит мягкой набивкой для тюков и спальных мешков.',
})
