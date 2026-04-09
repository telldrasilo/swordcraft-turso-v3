/**
 * Подсчёт непрочитанных для боковой ленты сообщений (энциклопедия + диалог архивариуса).
 */

import type { GameMessage } from '@/types/game-message'
import type { ArchivistThreadEntry } from '@/types/forgotten-forge-quest'

export function computeMessagesDockUnreadCount(params: {
  gameMessages: GameMessage[]
  archivistThread: ArchivistThreadEntry[]
  encyclopediaReadUpToTs: number
  archivistReadUpToTs: number
}): number {
  const enc = params.gameMessages.filter(
    (m) => m.kind === 'encyclopedia' && m.ts > params.encyclopediaReadUpToTs
  ).length
  const arch = params.archivistThread.filter((e) => e.ts > params.archivistReadUpToTs).length
  return enc + arch
}
