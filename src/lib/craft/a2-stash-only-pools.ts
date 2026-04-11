/**
 * Пулы `ResourceKey`, для которых экономика каталога ведётся **только** через `materialStash`
 * (волна снятия dual-path, roadmap фаза **2.4** хвост).
 *
 * Для таких ключей `getAvailableAmountForResourceKey` / списание не используют `resources[key]`
 * после миграции persist (`migrateLegacyMaterialResourcesToStash`).
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

/** Ключи «stash-only»: один домен за итерацию плана — топливо **coal**. */
export const A2_STASH_ONLY_RESOURCE_KEYS = new Set<ResourceKey>(['coal'])

export function isA2StashOnlyResourceKey(key: ResourceKey): boolean {
  return A2_STASH_ONLY_RESOURCE_KEYS.has(key)
}
