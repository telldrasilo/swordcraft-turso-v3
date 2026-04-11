'use client'

import { ListOrdered } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { materialById } from '@/data/materials'
import { ENCYCLOPEDIA_TECHNIQUE_KIND_ICONS } from '@/lib/encyclopedia/encyclopedia-technique-kind-ui'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store/game-store-composed'
import type {
  EncyclopediaTechniqueCardModel,
  EncyclopediaTechniqueKind,
} from '@/types/encyclopedia-techniques'

const FAMILY_SURFACE: Record<
  EncyclopediaTechniqueKind,
  { border: string; bg: string; iconWrap: string }
> = {
  craft: {
    border: 'border-amber-700/45',
    bg: 'bg-amber-950/25',
    iconWrap: 'text-amber-400 bg-amber-950/40',
  },
  material_processing: {
    border: 'border-orange-800/45',
    bg: 'bg-orange-950/20',
    iconWrap: 'text-orange-300 bg-orange-950/35',
  },
  material_study: {
    border: 'border-sky-800/45',
    bg: 'bg-sky-950/25',
    iconWrap: 'text-sky-300 bg-sky-950/40',
  },
  reforge: {
    border: 'border-violet-800/45',
    bg: 'bg-violet-950/25',
    iconWrap: 'text-violet-300 bg-violet-950/40',
  },
  repair: {
    border: 'border-slate-600/50',
    bg: 'bg-slate-900/35',
    iconWrap: 'text-slate-300 bg-slate-800/60',
  },
}

function KindIcon({ kind }: { kind: EncyclopediaTechniqueKind }) {
  const Icon = ENCYCLOPEDIA_TECHNIQUE_KIND_ICONS[kind]
  return <Icon className="w-7 h-7" aria-hidden />
}

export function EncyclopediaTechniqueCard({
  model,
}: {
  model: EncyclopediaTechniqueCardModel
}) {
  const setEncyclopediaFocusMaterialId = useGameStore(s => s.setEncyclopediaFocusMaterialId)
  const surface = FAMILY_SURFACE[model.ref.kind]
  const workSteps = model.workSteps
  const hasCollapsibleDetails = (model.detailHintLines?.length ?? 0) > 0

  return (
    <div
      className="min-w-0"
      data-encyclopedia-technique-kind={model.ref.kind}
      data-encyclopedia-technique-id={model.ref.id}
    >
      <Card
        className={cn(
          'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border',
          surface.border,
          surface.bg,
        )}
      >
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-stone-100 leading-tight pr-2">
              {model.name}
            </CardTitle>
            <div
              className={cn(
                'shrink-0 w-12 h-12 rounded-md flex items-center justify-center border border-stone-700/50',
                surface.iconWrap,
              )}
              aria-hidden
            >
              <KindIcon kind={model.ref.kind} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs font-normal">
              {model.familyLabel}
            </Badge>
            {model.subLabel ? (
              <Badge variant="outline" className="text-xs font-normal border-stone-600 text-stone-300">
                {model.subLabel}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {model.expertisePercent != null ? (
            <div className="space-y-1.5 rounded-md border border-stone-700/40 bg-stone-950/30 p-2">
              <div className="text-xs text-stone-400">Экспертиза</div>
              <Progress value={model.expertisePercent} className="h-2 bg-stone-800" />
            </div>
          ) : null}

          <p className="text-stone-400 text-sm leading-relaxed">{model.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {model.summaryRows.map(row => (
              <div
                key={`${model.ref.kind}:${model.ref.id}:${row.label}`}
                className="rounded border border-stone-800/80 bg-stone-950/20 px-2 py-1.5"
              >
                <div className="text-stone-500 truncate" title={row.label}>
                  {row.label}
                </div>
                <div className="text-stone-200 font-medium break-words">{row.value}</div>
              </div>
            ))}
          </div>

          {model.relatedMaterialIds?.length ? (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-stone-400">Связанные материалы</div>
              <div className="flex flex-wrap gap-1.5">
                {model.relatedMaterialIds.map(mid => {
                  const node = materialById[mid]
                  if (node) {
                    return (
                      <button
                        key={mid}
                        type="button"
                        onClick={() => setEncyclopediaFocusMaterialId(mid)}
                        className={cn(
                          'inline-flex items-center rounded-md border border-amber-800/50 bg-amber-950/30',
                          'px-2 py-0.5 text-[11px] font-medium text-amber-100/95',
                          'hover:bg-amber-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600',
                        )}
                      >
                        {node.identity.name}
                      </button>
                    )
                  }
                  return (
                    <Badge
                      key={mid}
                      variant="outline"
                      title="Ключ расхода без узла в каталоге энциклопедии"
                      className="text-[10px] font-normal border-stone-600 text-stone-500"
                    >
                      Склад: {mid}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ) : null}

          {workSteps?.length ? (
            <div className="space-y-2 rounded-md border border-stone-700/40 bg-stone-950/25 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-200/90">
                <ListOrdered className="w-4 h-4 shrink-0 text-amber-500" aria-hidden />
                Ход работы
              </div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-stone-400">
                {workSteps.map((step, i) => (
                  <li key={step.id ?? `${model.ref.id}-step-${i}`}>
                    <span className="text-stone-200">{step.label}</span>
                    {step.hint ? (
                      <span className="text-stone-500"> — {step.hint}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {hasCollapsibleDetails ? (
            <Collapsible>
              <CollapsibleTrigger className="text-xs text-amber-400/95 hover:text-amber-300 underline-offset-2 hover:underline">
                Детали и несовместимости
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2 text-xs text-stone-500">
                {model.detailHintLines?.map((line, i) => (
                  <p key={`d-${i}`}>{line}</p>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
