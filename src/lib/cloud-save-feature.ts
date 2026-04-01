/**
 * Фича-флаг облачных сейвов (Turso + `/api/save` + синхронизация в `use-cloud-save`).
 *
 * Включение (после настройки Turso, NextAuth при необходимости):
 * - В `.env.local`: `NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true`
 * - Пересборка / перезапуск dev-сервера (NEXT_PUBLIC_* вшивается на этапе сборки).
 *
 * ---
 * Почему новые модули «ломают» облако, и как не ломать:
 *
 * 1. **Zustand `persist` (localStorage, ключ `swordcraft-store-v2`)** — основной офлайн-слой.
 *    Новые поля в store: поднимайте `STORE_VERSION` в `game-store-composed.ts` и при необходимости
 *    дополняйте `merge` / `partialize`, чтобы старые сейвы получали дефолты.
 *
 * 2. **Облако** дублирует подмножество состояния: `collectSaveData` / `applyLoadedData`
 *    в `use-cloud-save.ts`, Zod в `save-payload-schema.ts`, колонки/SQL в
 *    `lib/db.ts` + `app/api/save/route.ts`. Любое новое **персистящееся** поле
 *    нужно протащить по этой цепочке и (при смене схемы БД) через миграцию SQLite.
 *
 * 3. **`saveVersion` в payload** — используйте для однократных миграций блоба на сервере
 *    (см. `formatSaveData` / `validateSaveData`).
 *
 * При `NEXT_PUBLIC_CLOUD_SAVE_ENABLED !== 'true'` сетевые вызовы не идут; игра живёт
 * на persist + локальном бэкапе ключа `swordcraft-offline-backup`.
 */
export function isCloudSaveEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLOUD_SAVE_ENABLED === 'true'
}
