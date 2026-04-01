/**
 * Adventurer Quotes Generator
 * Генерирует ролевые фразы искателей на основе типа экспедиции и характера
 */

'use client'

import type { AdventurerExtended } from '@/types/adventurer-extended'

// ================================
// ТИПЫ
// ================================

export interface AdventurerQuote {
  text: string
  mood: 'confident' | 'cautious' | 'enthusiastic' | 'determined'
  type: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
}

export interface QuotesByType {
  hunt: string[]
  scout: string[]
  clear: string[]
  delivery: string[]
  magic: string[]
}

// ================================
// ЦИТАТЫ ПО ТИПУ ЭКСПЕДИЦИЙ
// ================================

const quotes: QuotesByType = {
  hunt: [
    "Охота — это моя стихия!",
    "Звери боятся моего оружия!",
    "В крови найду славу!",
    "Я готов к любым испытаниям!",
    "Лес — мой дом, звери — моя добыча!",
    "Ни один не уйдёт от моего клинка!",
  ],
  scout: [
    "Путь мне открыт!",
    "Ничто не скроется от глаз!",
    "Разведка — это искусство воина!",
    "Тени предательствуют, но я вижу истину!",
    "Опасность — моя вторая натура!",
    "Территория изучена, цель найдена!",
  ],
  clear: [
    "Чистить землю от зла!",
    "Справедливость восторжествует в бою!",
    "На защиту слабых!",
    "Я делаю это ради правды и света!",
    "Пусть зло падёт под моим клинком!",
  ],
  delivery: [
    "Груз в целости — моя честь!",
    "Надёжный искатель, как никто другой!",
    "Доставлю вовремя и в сохранности!",
    "Моя репутация — это моя жизнь!",
    "Секретность и скорость — мои преимущества!",
  ],
  magic: [
    "Тайны раскрываются!",
    "Магия крови предков!",
    "Знание — сила!",
    "Артефакты таинственного мастерства!",
    "Сила сияет во мне, когда я применяю магию!",
  ],
}

// Резервные цитаты для неизвестных типов
const fallbackQuotes: string[] = [
  "Я готов к этому заданию!",
  "Это миссия по плечам!",
  "Пожалуйста, на что я способен!",
  "Приятно быть полезным гильдией!",
]

// ================================
// ГЕНЕРАТОР
// ================================

export const getAdventurerQuote = (
  adventurer: AdventurerExtended,
  expedition: { type: string }
): AdventurerQuote => {
  const expeditionType = expedition.type as keyof QuotesByType
  const typeQuotes = quotes[expeditionType] || fallbackQuotes
  
  // Выбираем случайную цитату
  const text = typeQuotes[Math.floor(Math.random() * typeQuotes.length)]
  
  // Определяем настроение цитаты на основе характера и успеха
  let mood: AdventurerQuote['mood'] = 'determined'
  
  const personality = adventurer.personality.primaryTrait
  
  // Определяем настроение на основе характера
  if (personality === 'reckless' || personality === 'brave' || personality === 'daring') {
    mood = 'enthusiastic'
  } else if (personality === 'cautious' || personality === 'thoughtful') {
    mood = 'cautious'
  }

  const quoteType: AdventurerQuote['type'] =
    expeditionType in quotes ? expeditionType : 'clear'

  return { text, mood, type: quoteType }
}

export default getAdventurerQuote
