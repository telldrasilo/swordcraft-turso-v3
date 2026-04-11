'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Package,
  Users,
  Sword,
  Map,
  Sparkles,
  Coins,
  Droplet,
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle,
  BookOpen,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { useGameStore, useFormattedResources, type GameScreen } from '@/store'
import { useGameLoop } from '@/hooks/use-game-loop'
import { useCloudSave } from '@/hooks/use-cloud-save'
import { useForgottenForgeQuestEvents } from '@/hooks/use-forgotten-forge-quest-events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState, useEffect } from 'react'

// Навигационные элементы
const navItems: { id: GameScreen; label: string; icon: typeof Flame }[] = [
  { id: 'forge', label: 'Кузница', icon: Flame },
  { id: 'resources', label: 'Ресурсы', icon: Package },
  { id: 'workers', label: 'Рабочие', icon: Users },
  { id: 'shop', label: 'Магазин', icon: Coins },
  { id: 'guild', label: 'Гильдия', icon: Sword },
  { id: 'dungeons', label: 'Подземелья', icon: Map },
  { id: 'altar', label: 'Зачарования', icon: Sparkles },
  { id: 'encyclopedia', label: 'Энциклопедия', icon: BookOpen },
]

// Компонент статуса сохранения
function SaveStatusIndicator({ 
  isSaving, 
  lastSavedAt, 
  error 
}: { 
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null 
}) {
  const [timeAgo, setTimeAgo] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      if (!lastSavedAt) {
        setTimeAgo('')
        return
      }
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
      if (seconds < 60) setTimeAgo('только что')
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)} мин.`)
      else setTimeAgo(`${Math.floor(seconds / 3600)} ч.`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [lastSavedAt])
  
  if (error) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-400" title={error}>
        <CloudOff className="w-3 h-3" />
        <span className="hidden sm:inline">Ошибка</span>
      </div>
    )
  }
  
  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Сохранение...</span>
      </div>
    )
  }
  
  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-500">
        <CheckCircle className="w-3 h-3" />
        <span className="hidden sm:inline">{timeAgo}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1 text-xs text-stone-500">
      <Cloud className="w-3 h-3" />
    </div>
  )
}

/** Верхняя полоса: уровень, золото, эссенция, сохранение (без агрегатов дерева/камня/железа — §3.5 roadmap). */
function TopStatusBar({
  saveStatus,
}: {
  saveStatus: { isSaving: boolean; lastSavedAt: Date | null; error: string | null }
}) {
  const resources = useFormattedResources()
  const player = useGameStore((state) => state.player)

  return (
    <div
      data-tutorial="resources-bar"
      className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-700/50 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50 text-amber-200">
            Lv.{player.level}
          </Badge>
          <span className="text-stone-300 font-medium">{player.name}</span>
          <span className="text-xs text-stone-500 hidden sm:inline">({player.title})</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-amber-200 font-semibold inline-flex items-center gap-1">
            <Coins className="w-4 h-4" />
            {resources.formatted.gold}
          </span>
          <span className="text-purple-300 font-semibold inline-flex items-center gap-1">
            <Droplet className="w-4 h-4" />
            {resources.formatted.soulEssence}
          </span>
          <SaveStatusIndicator {...saveStatus} />
          <div className="flex items-center gap-2 min-w-[140px]">
            <Progress
              value={(player.experience / player.experienceToNextLevel) * 100}
              className="w-24 h-2 bg-stone-800"
            />
            <span className="text-xs text-stone-400 whitespace-nowrap">
              {Math.floor(player.experience)}/{player.experienceToNextLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Боковое меню для десктопа
function SideNav({ onSave, isSaving }: { onSave: () => void; isSaving: boolean }) {
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )
  const resetGame = useGameStore((state) => state.resetGame)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () => {
    if (showResetConfirm) {
      resetGame()
      setShowResetConfirm(false)
      setTimeout(() => window.location.reload(), 100)
    } else {
      setShowResetConfirm(true)
      setTimeout(() => setShowResetConfirm(false), 3000)
    }
  }

  return (
    <nav className="w-64 bg-gradient-to-b from-stone-900 to-stone-950 border-r border-stone-700/50 p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-200 text-glow">⚔️ SwordCraft</h1>
            <p className="text-xs text-stone-500">Idle Forge</p>
          </div>
          {/* Кнопка сохранения */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 text-stone-400 hover:text-amber-400"
            title="Сохранить игру"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          const altarLocked = item.id === 'altar' && !altarUnlockedByForgottenForgeQuest

          return (
            <motion.div
              key={item.id}
              whileHover={altarLocked ? undefined : { x: 5 }}
              whileTap={altarLocked ? undefined : { scale: 0.98 }}
            >
              <Button
                data-tutorial={item.id === 'workers' ? 'nav-workers' : item.id === 'resources' ? 'nav-resources' : item.id === 'guild' ? 'nav-guild' : undefined}
                variant={isActive ? 'default' : 'ghost'}
                disabled={altarLocked}
                title={
                  altarLocked
                    ? 'Откроется после реплики архивариуса о чертеже алтаря в особом задании «Эхо забытой кузни»'
                    : undefined
                }
                className={cn(
                  'w-full justify-start gap-3',
                  isActive
                    ? 'bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 shadow-lg glow-gold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50',
                  altarLocked && 'opacity-60 cursor-not-allowed hover:bg-transparent hover:text-stone-400'
                )}
                onClick={() => {
                  if (altarLocked) return
                  setCurrentScreen(item.id)
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {altarLocked ? <Lock className="w-4 h-4 shrink-0 text-stone-500" aria-hidden /> : null}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Декоративный элемент снизу */}
      <div className="mt-auto pt-4 space-y-3">
        <div className="h-32 bg-gradient-to-t from-amber-900/20 to-transparent rounded-lg border border-amber-800/20 flex items-end justify-center pb-4">
          <div className="text-center">
            <Flame className="w-8 h-8 text-amber-500/50 mx-auto animate-pulse-gold" />
            <p className="text-xs text-stone-600 mt-1">Кузница работает</p>
          </div>
        </div>

        {/* Кнопка сброса игры */}
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start gap-2',
            showResetConfirm
              ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
              : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-xs">
            {showResetConfirm ? 'Подтвердить сброс?' : 'Сбросить игру'}
          </span>
        </Button>
      </div>
    </nav>
  )
}



// Нижнее меню для мобильных
function BottomNav() {
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 to-stone-900 border-t border-stone-700/50 px-2 py-2 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          const altarLocked = item.id === 'altar' && !altarUnlockedByForgottenForgeQuest

          return (
            <motion.button
              key={item.id}
              type="button"
              disabled={altarLocked}
              title={
                altarLocked
                  ? 'Зачарования откроются после реплики архивариуса о чертеже (квест «Эхо забытой кузни»)'
                  : item.label
              }
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                isActive ? 'text-amber-400' : 'text-stone-500',
                altarLocked && 'opacity-50 cursor-not-allowed'
              )}
              whileTap={altarLocked ? undefined : { scale: 0.9 }}
              onClick={() => {
                if (altarLocked) return
                setCurrentScreen(item.id)
              }}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-all relative',
                  isActive && 'bg-amber-900/40 glow-gold'
                )}
              >
                <Icon className="w-5 h-5" />
                {altarLocked ? (
                  <Lock className="absolute -right-0.5 -top-0.5 w-3 h-3 text-stone-500" aria-hidden />
                ) : null}
              </div>
              <span
                className={cn('text-xs truncate max-w-full', isActive ? 'font-semibold' : 'font-normal')}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

// Импорт экранов
import { ForgeScreen } from '@/components/screens/forge-screen'
import { ResourcesScreen } from '@/components/screens/resources-screen'
import { WorkersScreen } from '@/components/screens/workers-screen'
import { ShopScreen } from '@/components/screens/shop-screen'
import { GuildScreen } from '@/components/guild/GuildScreen'
import { DungeonsScreen } from '@/components/screens/dungeons-screen'
import { AltarScreen } from '@/components/screens/altar-screen'
import { EncyclopediaScreen } from '@/components/screens/encyclopedia-screen'
import { TutorialOverlay } from '@/components/tutorial-overlay'
import { GameMessagesDock } from '@/components/layout/game-messages-dock'

// Маппинг экранов
const screens: Record<GameScreen, typeof ForgeScreen> = {
  forge: ForgeScreen,
  resources: ResourcesScreen,
  workers: WorkersScreen,
  shop: ShopScreen,
  guild: GuildScreen,
  dungeons: DungeonsScreen,
  altar: AltarScreen,
  encyclopedia: EncyclopediaScreen,
}

function resolveScreen(key: GameScreen): GameScreen {
  return key in screens ? key : 'forge'
}

export function GameLayout() {
  // Запуск игрового цикла
  useGameLoop()
  useForgottenForgeQuestEvents()

  const tickForgottenForgeQuestAvailability = useGameStore(
    (state) => state.tickForgottenForgeQuestAvailability
  )
  const guildLevel = useGameStore((state) => state.guild.level)
  useEffect(() => {
    tickForgottenForgeQuestAvailability()
  }, [tickForgottenForgeQuestAvailability, guildLevel])

  // Облачное сохранение
  const {
    isLoading: isLoadingSave,
    isSaving,
    lastSavedAt,
    error: saveError,
    save: saveGame,
  } = useCloudSave({
    autoSaveInterval: 60000, // каждую минуту
    enableAutoSave: true,
  })
  
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )
  const isMobile = useIsMobile()
  const safeScreen = resolveScreen(currentScreen)
  const CurrentScreen = screens[safeScreen]

  useEffect(() => {
    if (currentScreen !== safeScreen) {
      setCurrentScreen(safeScreen)
    }
  }, [currentScreen, safeScreen, setCurrentScreen])

  useEffect(() => {
    if (currentScreen === 'altar' && !altarUnlockedByForgottenForgeQuest) {
      setCurrentScreen('forge')
    }
  }, [currentScreen, altarUnlockedByForgottenForgeQuest, setCurrentScreen])
  
  // Экран загрузки
  if (isLoadingSave) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-400">Загрузка сохранения...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col md:flex-row">
      {/* Боковое меню только для десктопа */}
      {!isMobile && <SideNav onSave={saveGame} isSaving={isSaving} />}
      
      {/* Основной контент + лента сообщений; min-h-0 — иначе flex-1 + h-full схлопывают высоту контента */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Панель ресурсов сверху */}
          <TopStatusBar saveStatus={{ isSaving, lastSavedAt, error: saveError }} />
          
          {/* Область контента */}
          <main className={cn(
            'min-h-0 flex-1 overflow-y-auto scrollbar-medieval',
            isMobile && 'pb-20' // Отступ для нижней навигации
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={safeScreen}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CurrentScreen />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <GameMessagesDock />
      </div>
      
      {/* Нижнее меню только для мобильных */}
      {isMobile && <BottomNav />}
      
      {/* Оверлей туториала */}
      <TutorialOverlay />
    </div>
  )
}
