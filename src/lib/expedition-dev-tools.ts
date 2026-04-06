/**
 * Флаги инструментов отладки экспедиций (UI: скипы времени, слайдеры баланса).
 * В продакшене по умолчанию выключено; для staging: NEXT_PUBLIC_EXPEDITION_DEV_TOOLS=true
 */

export const EXPEDITION_DEV_UI_ENABLED =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_EXPEDITION_DEV_TOOLS === 'true'

/**
 * Кнопки «до следующего события» / «к концу миссии» на активной экспедиции (тест).
 * По умолчанию **включены** в любой сборке; чтобы скрыть в публичной сборке — задать
 * `NEXT_PUBLIC_HIDE_EXPEDITION_SKIP_BUTTONS=true`.
 */
export const EXPEDITION_SKIP_TIMELINE_UI_ENABLED =
  process.env.NEXT_PUBLIC_HIDE_EXPEDITION_SKIP_BUTTONS !== 'true'
