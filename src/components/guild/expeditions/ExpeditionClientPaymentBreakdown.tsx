'use client'

import { motion } from 'framer-motion'
import { Landmark, Hammer, UserRound, Wallet } from 'lucide-react'
import type { MissionGoldSplit } from '@/lib/expedition-contract-economy'

interface ExpeditionClientPaymentBreakdownProps {
  economy: MissionGoldSplit
  className?: string
}

export function ExpeditionClientPaymentBreakdown({
  economy,
  className = '',
}: ExpeditionClientPaymentBreakdownProps) {
  const { clientGrossGold, guildFeeGold, blacksmithGold, adventurerGold } = economy
  if (clientGrossGold <= 0) return null

  const pct = (part: number) => Math.min(100, Math.max(0, (part / clientGrossGold) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border border-amber-800/35 bg-gradient-to-br from-stone-900/90 via-amber-950/20 to-stone-950/90 p-4 shadow-inner ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-amber-400" />
        <div>
          <h4 className="text-sm font-semibold text-amber-100/95">Оплата от заказчика</h4>
          <p className="text-[11px] text-stone-500">
            Вы не вносите золото в миссию — выплата идёт из контракта; на ваш счёт при успехе
            поступает только доля кузнеца.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <span className="text-stone-400 flex items-center gap-1.5">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            🏛
          </span>
          Контракт
        </span>
        <span className="font-mono tabular-nums text-emerald-200/90">{clientGrossGold} 💰</span>
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-stone-800/80 border border-stone-700/50 mb-4"
        title="Распределение выплаты заказчика"
      >
        <div
          className="h-full bg-slate-500/90 transition-all"
          style={{ width: `${pct(guildFeeGold)}%` }}
        />
        <div
          className="h-full bg-amber-600/95 transition-all"
          style={{ width: `${pct(blacksmithGold)}%` }}
        />
        <div
          className="h-full bg-sky-700/90 transition-all"
          style={{ width: `${pct(adventurerGold)}%` }}
        />
      </div>

      <ul className="grid gap-2 sm:grid-cols-3 text-[11px]">
        <li className="rounded-lg border border-slate-700/50 bg-slate-950/40 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Landmark className="w-3.5 h-3.5" />
            Гильдия
          </div>
          <div className="font-mono tabular-nums text-slate-200">−{guildFeeGold} 💰</div>
          <p className="text-slate-600 mt-0.5 leading-tight">Комиссия и площадка</p>
        </li>
        <li className="rounded-lg border border-amber-800/40 bg-amber-950/35 px-2.5 py-2 ring-1 ring-amber-700/25">
          <div className="flex items-center gap-1.5 text-amber-200/90 mb-1">
            <Hammer className="w-3.5 h-3.5" />
            Кузнец
          </div>
          <div className="font-mono tabular-nums text-amber-200">+{blacksmithGold} 💰</div>
          <p className="text-amber-200/45 mt-0.5 leading-tight">Ваша доля при успехе</p>
        </li>
        <li className="rounded-lg border border-sky-900/40 bg-sky-950/30 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-sky-300/90 mb-1">
            <UserRound className="w-3.5 h-3.5" />
            Авантюрист
          </div>
          <div className="font-mono tabular-nums text-sky-200/90">{adventurerGold} 💰</div>
          <p className="text-sky-200/35 mt-0.5 leading-tight">Доля напарника</p>
        </li>
      </ul>
    </motion.div>
  )
}
