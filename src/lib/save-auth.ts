/**
 * Политика привязки облачных сейвов к игроку (NextAuth session).
 * Сервер и клиент используют зеркальные env-флаги.
 */

/** Сервер: GET/POST/DELETE /api/save */
export function isSaveAuthEnforced(): boolean {
  if (process.env.ENFORCE_SAVE_AUTH === 'true') return true
  if (process.env.ENFORCE_SAVE_AUTH === 'false') return false
  return process.env.NODE_ENV === 'production'
}

/**
 * Клиент: нужен ли bootstrap-сессии (signIn) и credentials для fetch.
 * NEXT_PUBLIC_* — чтобы браузер знал до первого запроса.
 */
export function isSaveAuthEnforcedClient(): boolean {
  if (process.env.NEXT_PUBLIC_ENFORCE_SAVE_AUTH === 'true') return true
  if (process.env.NEXT_PUBLIC_ENFORCE_SAVE_AUTH === 'false') return false
  return process.env.NODE_ENV === 'production'
}
