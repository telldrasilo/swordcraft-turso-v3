/**
 * Данные квеста «Эхо забытой кузни».
 * Тексты синхронизированы с docs/Quests/FORGOTTEN_FORGE.md
 */

import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

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
  7: 'Чертёж и артефакты у вас. Продолжите в диалоге с архивариусом.',
  8: 'Завершите фазу I строительства алтаря на экране «Зачарования».',
  9: 'Завершите фазу II строительства алтаря на экране «Зачарования».',
  11: 'Отправьте экспедицию в Дубовую Рощу за рунической пластиной.',
  12: 'Отправьте экспедицию в Рудники Красного Камня за секретом обжига.',
  13: 'Отправьте экспедицию в Серебряный Бор (нужно 2× болотной кожи shadow_leather).',
  14: 'Завершите фазу III строительства алтаря.',
  15: 'Отправьте экспедицию в Туманные Низины за благословением (нужно 3× mist_herbs).',
  16: 'Завершите фазу IV строительства алтаря.',
  17: 'Завершите фазу V строительства алтаря.',
  18: 'Квест завершён. Алтарь построен.',
}

/** Теги цепочки техник после шага 11 (совпадают с linkedQuestTag на активной экспедиции). */
export const FF_QUEST_EXPEDITION_TAGS = {
  runes: 'ff_runes',
  clay: 'ff_clay',
  frequency: 'ff_frequency',
  spirit: 'ff_spirit',
} as const

export function getForgottenForgeExpeditionExpectation(step: number): {
  locationId: string
  questTag?: string
} | undefined {
  if (step >= 1 && step <= 6) {
    const loc = FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[step]
    return loc ? { locationId: loc } : undefined
  }
  if (step === 11) return { locationId: 'oak_grove_outskirts', questTag: FF_QUEST_EXPEDITION_TAGS.runes }
  if (step === 12) return { locationId: 'red_stone_mines', questTag: FF_QUEST_EXPEDITION_TAGS.clay }
  if (step === 13) return { locationId: 'silver_grove', questTag: FF_QUEST_EXPEDITION_TAGS.frequency }
  if (step === 15) return { locationId: 'misty_lowlands', questTag: FF_QUEST_EXPEDITION_TAGS.spirit }
  return undefined
}

/** Стоимость страховки на шаге 3 (золото) */
export const FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD = 80

/** Текст цели на шаге 9, пока ждём крафт после фазы II (ветка waitingForCraftAfterPhase2). */
export const FORGOTTEN_FORGE_PROGRESS_LINE_STEP9_WAIT_CRAFT =
  'Совершите крафт оружия в кузнице — архивариусу нужны свежие записи процесса, чтобы расшифровать свитки.'

const FORGOTTEN_FORGE_PROGRESS_LOCKED_LINE =
  'Станет доступно, когда гильдия откроет локации 2-го тира.'

/**
 * Строка прогресса/цели для UI (карточка квеста, док сообщений, экран алтаря).
 */
export function getForgottenForgeProgressDisplayLine(
  step: number,
  status: ForgottenForgeQuestState['status'],
  waitingForCraftAfterPhase2?: boolean
): string {
  if (status === 'locked') return FORGOTTEN_FORGE_PROGRESS_LOCKED_LINE
  if (status === 'completed') return FORGOTTEN_FORGE_PROGRESS_LINES[18] ?? ''
  if (step === 9 && waitingForCraftAfterPhase2 === true) {
    return FORGOTTEN_FORGE_PROGRESS_LINE_STEP9_WAIT_CRAFT
  }
  return FORGOTTEN_FORGE_PROGRESS_LINES[step] ?? FORGOTTEN_FORGE_PROGRESS_LINES[0]
}
