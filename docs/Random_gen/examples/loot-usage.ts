/**
 * Примеры использования системы loot (Loot System Usage Examples)
 * Демонстрация работы генератора и интеграции
 */

import {
  generateLootFromEvent,
  generateLootWithStats,
  generateManyLoot,
  createMockContext,
  createMockEvent,
  selectRarity,
  selectLootType,
} from '../lib/loot-generator'

import type {
  LootDrop,
  LootGenerationContext,
  LootType,
  LootRarity,
  GenerateLootOptions,
} from '../types/expedition-loot.types'

// ================================
// ПРИМЕР 1: БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
// ================================

/**
 * Пример 1: Базовое генерирование loot из события
 */
export function example1_BasicUsage() {
  console.log('=== Пример 1: Базовое использование ===')

  // Создаём событие
  const event = createMockEvent('treasure')

  // Создаём контекст генерации
  const context = createMockContext({
    expedition: {
      difficulty: 'normal',
      location: 'forest',
      duration: 600,
    },
    adventurer: {
      level: 15,
      luck: 25,
      traits: [],
    },
  })

  // Генерируем loot
  const loot = generateLootFromEvent(event, context)

  // Выводим результат
  console.log('Сгенерировано loot:', loot.length)
  loot.forEach((drop, index) => {
    console.log(`  ${index + 1}. [${drop.rarity}] ${drop.type}:`, drop.item)
  })

  return loot
}

// ================================
// ПРИМЕР 2: РАЗНЫЕ ТИПЫ СОБЫТИЙ
// ================================

/**
 * Пример 2: Генерация loot для разных типов событий
 */
export function example2_DifferentEventTypes() {
  console.log('\n=== Пример 2: Разные типы событий ===')

  const context = createMockContext({
    expedition: { difficulty: 'normal', location: 'cave', duration: 600 },
    adventurer: { level: 20, luck: 30, traits: ['lucky_star'] },
  })

  // Treasure событие (должен генерировать loot)
  const treasureEvent = createMockEvent('treasure')
  const treasureLoot = generateLootFromEvent(treasureEvent, context)
  console.log('Treasure event:', treasureLoot.length, 'loot')

  // Discovery событие (должен генерировать loot)
  const discoveryEvent = createMockEvent('discovery')
  const discoveryLoot = generateLootFromEvent(discoveryEvent, context)
  console.log('Discovery event:', discoveryLoot.length, 'loot')

  // Travel событие (НЕ должен генерировать loot)
  const travelEvent = createMockEvent('travel')
  const travelLoot = generateLootFromEvent(travelEvent, context)
  console.log('Travel event:', travelLoot.length, 'loot (ожидается 0)')

  return {
    treasureLoot,
    discoveryLoot,
    travelLoot,
  }
}

// ================================
// ПРИМЕР 3: ВЛИЯНИЕ УДАЧИ ИСКАТЕЛЯ
// ================================

/**
 * Пример 3: Влияние удачи на редкость loot
 */
export function example3_LuckInfluence() {
  console.log('\n=== Пример 3: Влияние удачи искателя ===')

  const event = createMockEvent('treasure')

  // Низкая удача
  const lowLuckContext = createMockContext({
    adventurer: { level: 15, luck: 10, traits: [] },
    expedition: { difficulty: 'normal', location: 'forest', duration: 600 },
  })

  // Средняя удача
  const mediumLuckContext = createMockContext({
    adventurer: { level: 15, luck: 25, traits: [] },
    expedition: { difficulty: 'normal', location: 'forest', duration: 600 },
  })

  // Высокая удача
  const highLuckContext = createMockContext({
    adventurer: { level: 15, luck: 50, traits: ['lucky_star'] },
    expedition: { difficulty: 'normal', location: 'forest', duration: 600 },
  })

  // Генерируем много loot для статистики
  const iterations = 100

  const lowLuckLoot = generateManyLoot(event, lowLuckContext, iterations)
  const mediumLuckLoot = generateManyLoot(event, mediumLuckContext, iterations)
  const highLuckLoot = generateManyLoot(event, highLuckContext, iterations)

  // Подсчитываем редкость
  const countRarity = (loot: LootDrop[]) => {
    return {
      common: loot.filter(l => l.rarity === 'common').length,
      rare: loot.filter(l => l.rarity === 'rare').length,
      epic: loot.filter(l => l.rarity === 'epic').length,
      legendary: loot.filter(l => l.rarity === 'legendary').length,
    }
  }

  const lowStats = countRarity(lowLuckLoot)
  const mediumStats = countRarity(mediumLuckLoot)
  const highStats = countRarity(highLuckLoot)

  console.log('Низкая удача (10):', lowStats)
  console.log('Средняя удача (25):', mediumStats)
  console.log('Высокая удача (50):', highStats)

  return { lowStats, mediumStats, highStats }
}

// ================================
// ПРИМЕР 4: РАЗНЫЕ ЛОКАЦИИ
// ================================

/**
 * Пример 4: Генерация loot в разных локациях
 */
export function example4_DifferentLocations() {
  console.log('\n=== Пример 4: Разные локации ===')

  const event = createMockEvent('discovery')
  const locations: Array<{ location: string; name: string }> = [
    { location: 'forest', name: 'Лес' },
    { location: 'cave', name: 'Пещера' },
    { location: 'ruins', name: 'Руины' },
    { location: 'mountain', name: 'Гора' },
    { location: 'swamp', name: 'Болото' },
  ]

  const results: Record<string, LootDrop[]> = {}

  for (const { location, name } of locations) {
    const context = createMockContext({
      expedition: {
        difficulty: 'normal',
        location: location as any,
        duration: 600,
      },
      adventurer: { level: 20, luck: 30, traits: ['explorer'] },
    })

    const loot = generateLootFromEvent(event, context)
    results[name] = loot

    // Подсчитываем типы
    const byType: Record<string, number> = {}
    loot.forEach(drop => {
      byType[drop.type] = (byType[drop.type] || 0) + 1
    })

    console.log(`${name}:`, loot.length, 'loot - Типы:', byType)
  }

  return results
}

// ================================
// ПРИМЕР 5: РАЗНЫЕ СЛОЖНОСТИ
// ================================

/**
 * Пример 5: Влияние сложности на редкость loot
 */
export function example5_DifficultyInfluence() {
  console.log('\n=== Пример 5: Влияние сложности ===')

  const event = createMockEvent('treasure')
  const difficulties: Array<{ difficulty: string; name: string }> = [
    { difficulty: 'easy', name: 'Лёгкая' },
    { difficulty: 'normal', name: 'Обычная' },
    { difficulty: 'hard', name: 'Сложная' },
    { difficulty: 'extreme', name: 'Экстремальная' },
    { difficulty: 'legendary', name: 'Легендарная' },
  ]

  const results: Record<string, LootDrop[]> = {}

  for (const { difficulty, name } of difficulties) {
    const context = createMockContext({
      expedition: {
        difficulty: difficulty as any,
        location: 'dungeon',
        duration: 900,
      },
      adventurer: { level: 25, luck: 30, traits: ['lucky_star'] },
    })

    const loot = generateLootFromEvent(event, context)
    results[name] = loot

    // Подсчитываем редкость
    const byRarity: Record<string, number> = {}
    loot.forEach(drop => {
      byRarity[drop.rarity] = (byRarity[drop.rarity] || 0) + 1
    })

    console.log(`${name}:`, loot.length, 'loot - Редкость:', byRarity)
  }

  return results
}

// ================================
// ПРИМЕР 6: ПРИНУДИТЕЛЬНЫЕ ПАРАМЕТРЫ
// ================================

/**
 * Пример 6: Использование принудительных параметров (для тестирования)
 */
export function example6_ForcedParameters() {
  console.log('\n=== Пример 6: Принудительные параметры ===')

  const event = createMockEvent('treasure')
  const context = createMockContext()

  // Принудительно генерируем только rare материалы
  const options: GenerateLootOptions = {
    forceType: 'materials',
    forceRarity: 'rare',
    minCount: 3,
    maxCount: 3,
  }

  const loot = generateLootFromEvent(event, context, options)

  console.log('Принудительный loot (3 rare materials):')
  loot.forEach((drop, index) => {
    console.log(`  ${index + 1}. ${drop.type}:`, drop.item)
  })

  // Проверяем, что все loot - материалы rare редкости
  const allMaterials = loot.every(drop => drop.type === 'materials')
  const allRare = loot.every(drop => drop.rarity === 'rare')

  console.log('Все материалы?', allMaterials)
  console.log('Все rare?', allRare)

  return loot
}

// ================================
// ПРИМЕР 7: ГЕНЕРАЦИЯ СО СТАТИСТИКОЙ
// ================================

/**
 * Пример 7: Генерация loot с полной статистикой
 */
export function example7_GenerationWithStats() {
  console.log('\n=== Пример 7: Генерация со статистикой ===')

  const event = createMockEvent('treasure')
  const context = createMockContext({
    expedition: {
      difficulty: 'hard',
      location: 'dungeon',
      duration: 900,
    },
    adventurer: { level: 30, luck: 40, traits: ['explorer', 'lucky_star'] },
  })

  // Генерируем loot со статистикой
  const result = generateLootWithStats(event, context)

  console.log('Результат генерации:')
  console.log('  Всего loot:', result.totalCount)
  console.log('  По типам:', result.stats)
  console.log('  По редкости:', result.rarityStats)

  console.log('\nСгенерированные loot:')
  result.drops.forEach((drop, index) => {
    console.log(`  ${index + 1}. [${drop.rarity}] ${drop.type}:`, drop.item)
  })

  return result
}

// ================================
// ПРИМЕР 8: НОЧНЫЕ ЭКСПЕДИЦИИ
// ================================

/**
 * Пример 8: Ночные экспедиции (специальные материалы)
 */
export function example8_NightExpeditions() {
  console.log('\n=== Пример 8: Ночные экспедиции ===')

  const event = createMockEvent('discovery')

  // Дневная экспедиция
  const dayContext = createMockContext({
    expedition: {
      difficulty: 'normal',
      location: 'forest',
      duration: 600,
    },
    adventurer: { level: 20, luck: 30, traits: [] },
    timeOfDay: 'day',
  })

  // Ночная экспедиция
  const nightContext = createMockContext({
    expedition: {
      difficulty: 'normal',
      location: 'forest',
      duration: 600,
    },
    adventurer: { level: 20, luck: 30, traits: [] },
    timeOfDay: 'night',
  })

  // Генерируем loot для обоих случаев
  const dayLoot = generateManyLoot(event, dayContext, 50)
  const nightLoot = generateManyLoot(event, nightContext, 50)

  // Подсчитываем редкие материалы (которые могут быть только ночью)
  const countRareMaterials = (loot: LootDrop[]) => {
    return loot.filter(drop => 
      drop.type === 'materials' && 
      drop.rarity === 'rare'
    ).length
  }

  const dayRare = countRareMaterials(dayLoot)
  const nightRare = countRareMaterials(nightLoot)

  console.log('Дневная экспедиция (50 loot):', dayRare, 'rare материалов')
  console.log('Ночная экспедиция (50 loot):', nightRare, 'rare материалов')
  console.log('Разница:', nightRare - dayRare, 'больше ночью')

  return { dayLoot, nightLoot, dayRare, nightRare }
}

// ================================
// ПРИМЕР 9: TRAITS ИСКАТЕЛЯ
// ================================

/**
 * Пример 9: Влияние traits на типы loot
 */
export function example9_AdventurerTraits() {
  console.log('\n=== Пример 9: Traits искателя ===')

  const event = createMockEvent('discovery')

  // Искатель с knowledge_seeker
  const knowledgeSeekerContext = createMockContext({
    expedition: { difficulty: 'normal', location: 'ruins', duration: 600 },
    adventurer: { 
      level: 25, 
      luck: 30, 
      traits: ['knowledge_seeker'] 
    },
  })

  // Искатель с resourceful
  const resourcefulContext = createMockContext({
    expedition: { difficulty: 'normal', location: 'ruins', duration: 600 },
    adventurer: { 
      level: 25, 
      luck: 30, 
      traits: ['resourceful'] 
    },
  })

  // Искатель без специальных traits
  const normalContext = createMockContext({
    expedition: { difficulty: 'normal', location: 'ruins', duration: 600 },
    adventurer: { level: 25, luck: 30, traits: [] },
  })

  // Генерируем много loot для статистики
  const iterations = 100

  const knowledgeSeekerLoot = generateManyLoot(
    event, 
    knowledgeSeekerContext, 
    iterations
  )
  const resourcefulLoot = generateManyLoot(
    event, 
    resourcefulContext, 
    iterations
  )
  const normalLoot = generateManyLoot(event, normalContext, iterations)

  // Подсчитываем знания
  const countKnowledge = (loot: LootDrop[]) => 
    loot.filter(l => l.type === 'knowledge').length

  const ksKnowledge = countKnowledge(knowledgeSeekerLoot)
  const rfKnowledge = countKnowledge(resourcefulLoot)
  const nmKnowledge = countKnowledge(normalLoot)

  console.log('Knowledge Seeker (100 loot):', ksKnowledge, 'знаний')
  console.log('Resourceful (100 loot):', rfKnowledge, 'знаний')
  console.log('Normal (100 loot):', nmKnowledge, 'знаний')

  return { 
    knowledgeSeekerLoot, 
    resourcefulLoot, 
    normalLoot,
    stats: {
      knowledgeSeeker: ksKnowledge,
      resourceful: rfKnowledge,
      normal: nmKnowledge,
    },
  }
}

// ================================
// ПРИМЕР 10: ПОЛНАЯ СИМУЛЯЦИЯ ЭКСПЕДИЦИИ
// ================================

/**
 * Пример 10: Полная симуляция экспедиции
 */
export function example10_FullExpeditionSimulation() {
  console.log('\n=== Пример 10: Полная симуляция экспедиции ===')

  // Параметры экспедиции
  const expeditionConfig = {
    difficulty: 'hard',
    location: 'dungeon',
    duration: 1200, // 20 минут
  }

  // Искатель
  const adventurerConfig = {
    level: 30,
    luck: 40,
    traits: ['explorer', 'lucky_star', 'keen_eye'],
  }

  // Симулируем 10 событий
  const eventTypes = ['treasure', 'discovery', 'treasure', 'discovery', 
                     'combat', 'rest', 'travel', 'treasure', 
                     'discovery', 'treasure']

  let totalLoot: LootDrop[] = []
  let lootEvents = 0

  console.log('Симуляция экспедиции:')
  console.log('  Сложность:', expeditionConfig.difficulty)
  console.log('  Локация:', expeditionConfig.location)
  console.log('  Длительность:', expeditionConfig.duration, 'сек')
  console.log('  Уровень искателя:', adventurerConfig.level)
  console.log('  Удача искателя:', adventurerConfig.luck)
  console.log('  Traits:', adventurerConfig.traits.join(', '))
  console.log()

  eventTypes.forEach((eventType, index) => {
    const event = createMockEvent(eventType)
    const context = createMockContext({
      expedition: expeditionConfig as any,
      adventurer: adventurerConfig as any,
      timeOfDay: index > 5 ? 'night' : 'day',
    })

    const result = generateLootWithStats(event, context)

    console.log(`Событие ${index + 1} [${eventType}]:`, 
                result.totalCount, 'loot')

    totalLoot = [...totalLoot, ...result.drops]
    if (result.totalCount > 0) {
      lootEvents++
    }
  })

  // Итоговая статистика
  console.log('\nИтоги симуляции:')
  console.log('  Событий с loot:', lootEvents, 'из', eventTypes.length)
  console.log('  Всего loot:', totalLoot.length)

  // По типам
  const byType: Record<string, number> = {}
  totalLoot.forEach(drop => {
    byType[drop.type] = (byType[drop.type] || 0) + 1
  })
  console.log('  По типам:', byType)

  // По редкости
  const byRarity: Record<string, number> = {}
  totalLoot.forEach(drop => {
    byRarity[drop.rarity] = (byRarity[drop.rarity] || 0) + 1
  })
  console.log('  По редкости:', byRarity)

  return {
    totalLoot,
    lootEvents,
    byType,
    byRarity,
  }
}

// ================================
// ЗАПУСК ВСЕХ ПРИМЕРОВ
// ================================

/**
 * Запустить все примеры
 */
export function runAllExamples() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║     ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ СИСТЕМЫ LOOT       ║')
  console.log('╚══════════════════════════════════════════════════╝')

  example1_BasicUsage()
  example2_DifferentEventTypes()
  example3_LuckInfluence()
  example4_DifferentLocations()
  example5_DifficultyInfluence()
  example6_ForcedParameters()
  example7_GenerationWithStats()
  example8_NightExpeditions()
  example9_AdventurerTraits()
  example10_FullExpeditionSimulation()

  console.log('\n✅ Все примеры выполнены!')
}

// ================================
// ЭКСПОРТЫ
// ================================

export {
  example1_BasicUsage,
  example2_DifferentEventTypes,
  example3_LuckInfluence,
  example4_DifferentLocations,
  example5_DifficultyInfluence,
  example6_ForcedParameters,
  example7_GenerationWithStats,
  example8_NightExpeditions,
  example9_AdventurerTraits,
  example10_FullExpeditionSimulation,
  runAllExamples,
}

// Если этот файл запущен напрямую (не как модуль)
if (require.main === module) {
  runAllExamples()
}
