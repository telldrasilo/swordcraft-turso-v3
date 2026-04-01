import { buildWorldNode, loreSummary } from '../build-world-node'
export const memory_leaf = buildWorldNode({
id: 'memory_leaf',
    name: 'Лист памяти',
    role: 'organic',
    economy: { rarity: 68, tier: 3, baseValue: 40, availability: 32, discoverability: 34 },
    summary: loreSummary('Лист, кратко удерживающий эмоциональный отпечаток касания.'),
    description: 'Используется в алхимии воспоминаний и детекции обмана.',
})
