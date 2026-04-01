import { buildWorldNode, loreSummary } from '../build-world-node'
export const clay = buildWorldNode({
id: 'clay',
    name: 'Глина',
    role: 'stone',
    economy: { rarity: 26, tier: 1, baseValue: 8, availability: 90, discoverability: 85 },
    summary: loreSummary('Пластичная порода для керамики и грубых форм.'),
    description: 'Сырая глина из низин и штолен; сохнет на воздухе, обжигается в печи.',
    tags: ['ceramic'],
})
