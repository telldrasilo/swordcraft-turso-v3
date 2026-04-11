/**
 * Гейты старта макрофазы по квесту FF v2 — DEVELOPMENT_HUB §3.5.
 */

import type { AltarPhase } from '@/types/altar-construction'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export function forgottenForgeAllowsStartingAltarPhase(
  q: Pick<ForgottenForgeQuestState, 'status' | 'step' | 'waitingForCraftAfterPhase2'>,
  phase: AltarPhase
): boolean {
  if (q.status !== 'active') return false
  const { step: s, waitingForCraftAfterPhase2: w } = q
  if (s === 8) return phase === 1
  if (s === 9) return !w && phase === 2
  if (s === 14) return phase === 3
  if (s === 16) return phase === 4
  if (s === 17) return phase === 5
  return false
}

export function getForgottenForgeAltarPhaseBlockHint(
  q: Pick<ForgottenForgeQuestState, 'status' | 'step' | 'waitingForCraftAfterPhase2'>
): string | null {
  if (q.status !== 'active') return 'Сначала продвиньте особое задание.'
  if (q.step === 9 && q.waitingForCraftAfterPhase2) {
    return 'Скуйте оружие в кузнице, чтобы архивариус расшифровал свитки.'
  }
  if (q.step >= 11 && q.step <= 13) {
    return 'Сначала получите три техники в экспедициях по заданию архивариуса.'
  }
  if (q.step === 15) {
    return 'Сначала получите духовное благословение в Туманных Низинах.'
  }
  return null
}
