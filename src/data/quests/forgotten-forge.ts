/**
 * Данные квеста «Эхо забытой кузни».
 * Тексты синхронизированы с docs/Quests/FORGOTTEN_FORGE.md
 */

export const FORGOTTEN_FORGE_QUEST_ID = 'forgotten_forge' as const

export const FORGOTTEN_FORGE_QUEST_NAME = 'Эхо забытой кузни'

export const FORGOTTEN_FORGE_CARD_BLURB =
  'Архивариус нашёл чертёж древнего алтаря зачарований. Его части разбросаны по опасным землям. Отправляйте искателей в экспедиции: добудьте резонаторную матрицу, фокусирующую чашу и лунный камертон. Алтарь вернёт утерянную технологию.'

/** Локация, которую нужно пройти на шаге 1..6 (после завершения предыдущего диалога) */
export const FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP: Record<
  number,
  string | undefined
> = {
  1: 'oak_grove_outskirts',
  2: 'red_stone_mines',
  3: 'forgotten_mines',
  4: 'misty_lowlands',
  5: 'rotten_swamp',
  6: 'silver_grove',
}

export const FORGOTTEN_FORGE_PROGRESS_LINES: Record<number, string> = {
  0: 'Архивариус активировал особое задание. Первая цель — Окраины Дубовой Рощи.',
  1: 'Карта артефактов найдена. Нужен зеркальный ключ из Рудников.',
  2: 'Зеркальный ключ добыт. Путь в Забытые Шахты открыт.',
  3: 'Резонаторная матрица получена. Следующее — Гнилое Болото.',
  4: 'Рецепт очистки от ведьмы Марги готов.',
  5: 'Фокусирующая чаша очищена. Остался камертон.',
  6: 'Лунный камертон в гильдии. Все части собраны.',
  7: 'Чертёж и артефакты в кузнице. Соберите алтарь по инструкции.',
}

/** Стоимость страховки на шаге 3 (золото) */
export const FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD = 80
