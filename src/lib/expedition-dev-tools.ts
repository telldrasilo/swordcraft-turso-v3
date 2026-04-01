/**
 * Флаги инструментов отладки экспедиций (UI: скипы времени, слайдеры баланса).
 * В продакшене по умолчанию выключено; для staging: NEXT_PUBLIC_EXPEDITION_DEV_TOOLS=true
 */

export const EXPEDITION_DEV_UI_ENABLED =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_EXPEDITION_DEV_TOOLS === 'true'
