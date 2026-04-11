'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, BookOpen, ScrollText } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGameStore, type GameScreen } from '@/store'
import type { GameMessage } from '@/types/game-message'
import {
  isValidEncyclopediaTechniqueRef,
  type EncyclopediaTechniqueRef,
} from '@/types/encyclopedia-techniques'
import type { GameMessagesDockChannel } from '@/types/forgotten-forge-quest'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { computeMessagesDockUnreadCount } from '@/lib/messages-dock-unread'
import { getForgottenForgeProgressLine } from '@/store/slices/forgotten-forge-quest-slice'

const KNOWN_SCREENS: GameScreen[] = [
  'forge',
  'resources',
  'workers',
  'shop',
  'guild',
  'dungeons',
  'altar',
  'encyclopedia',
]

function isGameScreen(s: string): s is GameScreen {
  return (KNOWN_SCREENS as string[]).includes(s)
}

function applyNavigationFromMessage(
  msg: GameMessage,
  setCurrentScreen: (s: GameScreen) => void,
  setEncyclopediaFocusMaterialId: (id: string | null) => void,
  setEncyclopediaFocusTechniqueRef: (ref: EncyclopediaTechniqueRef | null) => void
): void {
  const t = msg.navigationTarget
  if (!t?.screen || !isGameScreen(t.screen)) return
  setCurrentScreen(t.screen)
  if (t.screen !== 'encyclopedia') return
  const tr = t.techniqueRef
  if (tr && isValidEncyclopediaTechniqueRef(tr)) {
    setEncyclopediaFocusMaterialId(null)
    setEncyclopediaFocusTechniqueRef(tr)
    return
  }
  setEncyclopediaFocusTechniqueRef(null)
  if (t.entityId) {
    setEncyclopediaFocusMaterialId(t.entityId)
  }
}

const MAX_VISIBLE = 18

function DockChannelTabs(props: {
  channel: GameMessagesDockChannel
  onChannel: (c: GameMessagesDockChannel) => void
  className?: string
}) {
  const { channel, onChannel, className } = props
  const tabBtn = (ch: GameMessagesDockChannel, label: string, Icon: typeof BookOpen) => (
    <button
      type="button"
      onClick={() => onChannel(ch)}
      title={label}
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center rounded-md px-1.5 py-2 transition-colors w-full',
        channel === ch
          ? 'bg-amber-900/50 text-amber-100 border border-amber-700/60'
          : 'text-stone-500 hover:text-stone-300 border border-transparent'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
    </button>
  )
  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-l border-stone-800/80 bg-stone-950/90 py-2 pl-1 pr-1 shrink-0 w-12',
        className
      )}
      role="tablist"
      aria-label="Каналы сообщений"
    >
      {tabBtn('encyclopedia', 'Энциклопедия', BookOpen)}
      {tabBtn('archivist', 'Архивариус', ScrollText)}
    </div>
  )
}

export function GameMessagesDock() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const rawMessages = useGameStore((s) => s.gameMessages)
  const gameMessages = useMemo(
    () => (Array.isArray(rawMessages) ? rawMessages : []),
    [rawMessages]
  )
  const setCurrentScreen = useGameStore((s) => s.setCurrentScreen)
  const setEncyclopediaFocusMaterialId = useGameStore((s) => s.setEncyclopediaFocusMaterialId)
  const setEncyclopediaFocusTechniqueRef = useGameStore((s) => s.setEncyclopediaFocusTechniqueRef)
  const channel = useGameStore((s) => s.messagesDockChannel)
  const setMessagesDockChannel = useGameStore((s) => s.setMessagesDockChannel)
  const messagesDockOpenNonce = useGameStore((s) => s.messagesDockOpenNonce)
  const encyclopediaReadUpToTs = useGameStore((s) => s.messagesDockEncyclopediaReadUpToTs)
  const archivistReadUpToTs = useGameStore((s) => s.messagesDockArchivistReadUpToTs)
  const markMessagesDockRead = useGameStore((s) => s.markMessagesDockRead)
  const archivistThread = useGameStore((s) => s.archivistDialogue.thread)
  const archivistPending = useGameStore((s) => s.archivistPendingChoices)
  const selectArchivistChoice = useGameStore((s) => s.selectArchivistChoice)
  const forgottenForgeQuest = useGameStore((s) => s.forgottenForgeQuest)
  const archivistTaskBannerAfterEntryId = useGameStore(
    (s) => s.archivistForgottenForgeTaskBannerAfterEntryId
  )
  const navigateToGuildForgottenForgeSpecialQuest = useGameStore(
    (s) => s.navigateToGuildForgottenForgeSpecialQuest
  )

  const encyclopediaListRef = useRef<HTMLUListElement>(null)
  const archivistMessagesScrollRef = useRef<HTMLDivElement>(null)
  const dockMainScrollRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(
    () =>
      computeMessagesDockUnreadCount({
        gameMessages,
        archivistThread,
        encyclopediaReadUpToTs: encyclopediaReadUpToTs ?? 0,
        archivistReadUpToTs: archivistReadUpToTs ?? 0,
      }),
    [gameMessages, archivistThread, encyclopediaReadUpToTs, archivistReadUpToTs]
  )

  useEffect(() => {
    if (messagesDockOpenNonce === 0) return
    queueMicrotask(() => {
      setOpen(true)
      setDesktopCollapsed(false)
      markMessagesDockRead()
    })
  }, [messagesDockOpenNonce, markMessagesDockRead])

  const dockVisible = isMobile ? open : !desktopCollapsed
  useEffect(() => {
    if (!dockVisible) return
    markMessagesDockRead()
  }, [dockVisible, gameMessages, archivistThread, markMessagesDockRead])

  const sorted = [...gameMessages].sort((a, b) => b.ts - a.ts).slice(0, MAX_VISIBLE)
  const filtered = sorted.filter((m) =>
    channel === 'encyclopedia' ? m.kind === 'encyclopedia' : m.kind === 'archivist'
  )

  const encyclopediaFeedKey = useMemo(() => filtered.map((m) => m.id).join('|'), [filtered])
  const archivistFeedKey = useMemo(
    () =>
      `${archivistThread.map((e) => e.id).join(',')}#${archivistPending?.map((c) => c.id).join(',') ?? ''}@${archivistTaskBannerAfterEntryId ?? ''}`,
    [archivistThread, archivistPending, archivistTaskBannerAfterEntryId]
  )

  const ffTaskLine = useMemo(
    () =>
      getForgottenForgeProgressLine(
        forgottenForgeQuest.step,
        forgottenForgeQuest.status,
        forgottenForgeQuest.waitingForCraftAfterPhase2
      ),
    [
      forgottenForgeQuest.step,
      forgottenForgeQuest.status,
      forgottenForgeQuest.waitingForCraftAfterPhase2,
    ]
  )

  const showArchivistFfTaskBanner =
    (forgottenForgeQuest.status === 'available' || forgottenForgeQuest.status === 'active') &&
    typeof archivistTaskBannerAfterEntryId === 'string' &&
    archivistThread.some((e) => e.id === archivistTaskBannerAfterEntryId)

  useLayoutEffect(() => {
    if (!dockVisible) return
    if (channel === 'encyclopedia') {
      const list = encyclopediaListRef.current
      if (list) list.scrollTop = 0
      const outerEnc = dockMainScrollRef.current
      if (outerEnc) outerEnc.scrollTop = 0
    }
  }, [channel, dockVisible, encyclopediaFeedKey])

  useLayoutEffect(() => {
    if (!dockVisible) return
    if (channel !== 'archivist') return
    const inner = archivistMessagesScrollRef.current
    if (inner) inner.scrollTop = inner.scrollHeight
    const outer = dockMainScrollRef.current
    if (outer) outer.scrollTop = outer.scrollHeight
  }, [channel, dockVisible, archivistFeedKey])

  const encyclopediaList = (
    <ul
      ref={encyclopediaListRef}
      className="scrollbar-dock-subtle space-y-2 text-xs max-h-[min(70vh,520px)] overflow-y-auto pr-1"
      aria-label="Сообщения энциклопедии"
    >
      {filtered.length === 0 ? (
        <li className="text-stone-500 py-4 text-center">Пока нет событий</li>
      ) : (
        filtered.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              disabled={!m.navigationTarget?.screen}
              onClick={() => {
                applyNavigationFromMessage(
                  m,
                  setCurrentScreen,
                  setEncyclopediaFocusMaterialId,
                  setEncyclopediaFocusTechniqueRef
                )
                setOpen(false)
              }}
              className={cn(
                'w-full text-left rounded-md border border-stone-800/80 bg-stone-900/50 px-3 py-2 transition-colors',
                m.navigationTarget?.screen
                  ? 'hover:bg-stone-800/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700'
                  : 'opacity-90 cursor-default'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-stone-500 tabular-nums shrink-0">
                  {new Date(m.ts).toLocaleString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {m.navigationTarget?.screen && (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600/80 shrink-0 mt-0.5" aria-hidden />
                )}
              </div>
              <span className="mt-1 block font-medium text-amber-200/95">{m.title}</span>
              <span className="mt-0.5 block text-stone-400 leading-snug">{m.body}</span>
            </button>
          </li>
        ))
      )}
    </ul>
  )

  const archivistPanel = (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={archivistMessagesScrollRef}
        className="scrollbar-dock-subtle flex-1 overflow-y-auto space-y-2 pr-1 text-xs max-h-[min(70vh,520px)]"
      >
        {archivistThread.length === 0 ? (
          <p className="text-stone-500 py-4 text-center">Диалогов пока нет</p>
        ) : (
          archivistThread.flatMap((e) => {
            const metaLine = (
              <div className="text-[10px] text-stone-500 mb-1">
                {e.speaker === 'archivist' ? 'Архивариус' : 'Вы'} ·{' '}
                {new Date(e.ts).toLocaleString('ru-RU', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )
            const bodyClass = cn(
              'rounded-md border px-2 py-2',
              e.speaker === 'archivist'
                ? 'border-stone-700/80 bg-stone-900/60 text-stone-200'
                : 'border-amber-900/40 bg-amber-950/20 text-amber-100/90 ml-4'
            )
            const ctaTarget =
              e.ctaToScreen && isGameScreen(e.ctaToScreen) ? e.ctaToScreen : null
            const bubble = ctaTarget ? (
              <button
                type="button"
                key={e.id}
                className={cn(
                  bodyClass,
                  'w-full text-left transition-colors cursor-pointer',
                  'hover:bg-stone-800/70 hover:border-amber-800/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700'
                )}
                onClick={() => {
                  setCurrentScreen(ctaTarget)
                  setOpen(false)
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  {metaLine}
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600/80 shrink-0 mt-0.5" aria-hidden />
                </div>
                <p className="leading-snug whitespace-pre-wrap">{e.text}</p>
              </button>
            ) : (
              <div key={e.id} className={bodyClass}>
                {metaLine}
                <p className="leading-snug whitespace-pre-wrap">{e.text}</p>
              </div>
            )
            if (showArchivistFfTaskBanner && e.id === archivistTaskBannerAfterEntryId) {
              return [
                bubble,
                <div
                  key={`${e.id}-ff-task-banner`}
                  className="rounded-md border border-amber-800/50 bg-amber-950/25 px-2 py-2 space-y-2"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="w-full h-auto min-h-9 whitespace-normal text-left text-amber-100 border-amber-700/50 bg-amber-900/30 hover:bg-amber-900/45"
                    onClick={() => {
                      navigateToGuildForgottenForgeSpecialQuest()
                      setOpen(false)
                    }}
                  >
                    Обновление задачи: Эхо забытой кузни
                  </Button>
                  <p className="text-[11px] text-stone-300 leading-snug">{ffTaskLine}</p>
                </div>,
              ]
            }
            return [bubble]
          })
        )}
      </div>
      {archivistPending && archivistPending.length > 0 && (
        <div className="mt-2 pt-2 border-t border-stone-800 space-y-1.5 shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-stone-500">Ответ</p>
          <div className="flex flex-col gap-1.5">
            {archivistPending.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-2 px-2 text-left text-xs whitespace-normal border-stone-600 text-stone-200 hover:bg-stone-800"
                onClick={() => selectArchivistChoice(c.id)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const mainContent = channel === 'encyclopedia' ? encyclopediaList : archivistPanel

  const dockTabs = (
    <DockChannelTabs channel={channel} onChannel={(c) => setMessagesDockChannel(c)} />
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'relative fixed bottom-24 right-4 z-40 h-11 w-11 rounded-full border-amber-800/50 bg-stone-950/95 shadow-lg',
              unreadCount > 0 && 'ring-2 ring-amber-700/40'
            )}
            aria-label={
              unreadCount > 0
                ? `Сообщения, непрочитанных: ${unreadCount > 9 ? 'больше 9' : unreadCount}`
                : 'Сообщения'
            }
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-amber-700 px-1 text-[10px] font-bold text-amber-50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100vw-1rem,400px)] border-stone-700 bg-stone-950 p-0 flex flex-col">
          <SheetHeader className="text-left border-b border-stone-800 px-4 py-3 shrink-0">
            <SheetTitle className="text-amber-200">События</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 min-h-0">
            <div className="flex-1 overflow-hidden p-3 min-w-0">{mainContent}</div>
            {dockTabs}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (desktopCollapsed) {
    return (
      <aside
        className="hidden md:flex min-h-0 flex-col w-12 shrink-0 self-stretch border-l border-stone-800/80 bg-stone-950/80 backdrop-blur-sm items-center pt-2 px-1 gap-2"
        aria-label="Лента событий свёрнута"
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-9 w-9 shrink-0 rounded-md border-amber-800/50 bg-stone-900/90 text-amber-200 hover:text-amber-100 hover:bg-stone-800"
          onClick={() => setDesktopCollapsed(false)}
          aria-label={
            unreadCount > 0
              ? `Развернуть ленту событий, непрочитанных: ${unreadCount > 9 ? 'больше 9' : unreadCount}`
              : 'Развернуть ленту событий'
          }
          title="Развернуть события"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-amber-700 px-0.5 text-[9px] font-bold leading-tight text-amber-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </aside>
    )
  }

  return (
    <aside
      className="hidden md:flex min-h-0 flex-row w-[min(100vw,356px)] shrink-0 self-stretch border-l border-stone-800/80 bg-stone-950/80 backdrop-blur-sm"
      aria-label="Лента событий"
    >
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <div className="flex items-center justify-between gap-2 px-2 py-2 border-b border-stone-800/80 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-400 pl-1">
            {channel === 'encyclopedia' ? 'Энциклопедия' : 'Архивариус'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-stone-400 hover:text-amber-200 hover:bg-stone-800/80"
            onClick={() => setDesktopCollapsed(true)}
            aria-label="Свернуть ленту событий вправо"
            title="Свернуть"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div
          ref={dockMainScrollRef}
          className="scrollbar-dock-subtle flex-1 overflow-y-auto p-2 min-h-0"
        >
          {mainContent}
        </div>
      </div>
      {dockTabs}
    </aside>
  )
}
