/**
 * Тепловая палитра и группировка техник для единой крафтовой линии (UI).
 */

import type { CSSProperties } from 'react'
import type { EncyclopediaTechniqueRef } from '@/types/encyclopedia-techniques'
import type { CraftLineSegment } from '@/types/craft-line'
import { isCraftLineTechniqueSegment } from '@/types/craft-line'
import type { WeaponRecipe } from '@/types/craft-v2'
import { getTechniqueById } from '@/data/techniques'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'

/** Грубая «температура» процесса (тепловизор: красное — горячее, синее — холодная работа). */
export type ThermalBand = 'inferno' | 'hot' | 'warm' | 'tepid' | 'cool' | 'cryo'

const THERMAL_LABEL: Record<ThermalBand, string> = {
  inferno: 'очень горячо (горн, закалка)',
  hot: 'горячая обработка',
  warm: 'тёплый металл / прокат',
  tepid: 'переходная / смешанная',
  cool: 'прохладная обработка, механообработка',
  cryo: 'холодная доводка, осмотр',
}

export function techniqueDisplayName(ref: EncyclopediaTechniqueRef): string {
  if (ref.kind === 'craft') {
    return getTechniqueById(ref.id)?.name ?? ref.id
  }
  const p = allMaterialProcessingTechniques.find(t => t.id === ref.id)
  return p?.name ?? ref.id
}

export function thermalBandForStageType(stageType: string): ThermalBand {
  const st = stageType.toLowerCase()
  if (/prep_heating|proc_smelting|form_heating|form_forging|fin_hardening/.test(st)) {
    return /fin_hardening/.test(st) ? 'inferno' : 'hot'
  }
  if (/fin_tempering|proc_rolling|form_shaping|form_drawing_out|asmb_fitting/.test(st)) return 'warm'
  if (/proc_sawing|form_carving|prep_tools|proc_purchasing/.test(st)) return 'cool'
  if (/fin_grinding|fin_sharpening|fin_polishing|fin_inspection|asmb_wrapping|asmb_balancing|asmb_joining/.test(st))
    return 'cryo'
  return 'tepid'
}

function thermalBandForTechnique(ref: EncyclopediaTechniqueRef): ThermalBand {
  if (ref.kind === 'material_processing') return 'inferno'
  return 'warm'
}

export function thermalBandForCraftLineSegment(
  seg: CraftLineSegment,
  recipe: WeaponRecipe | null | undefined
): ThermalBand {
  if (isCraftLineTechniqueSegment(seg)) {
    return thermalBandForTechnique(seg.techniqueRef)
  }
  if (!recipe) return 'tepid'
  const cfg = recipe.stages[seg.stageIndex]
  if (!cfg) return 'tepid'
  return thermalBandForStageType(cfg.stageType)
}

/** HSL-градиент по полосе: лёгкий сдвиг оттенка по индексу, чтобы соседние шаги отличались. */
export function thermalSegmentStyle(band: ThermalBand, segmentIndex: number): {
  style: CSSProperties
  bandLabel: string
} {
  const baseHue: Record<ThermalBand, number> = {
    inferno: 8,
    hot: 24,
    warm: 42,
    tepid: 55,
    cool: 198,
    cryo: 222,
  }
  const spread = 26
  const h1 = (baseHue[band] + segmentIndex * 13 + spread / 2) % 360
  const h2 = (baseHue[band] + segmentIndex * 13 - spread / 2 + 360) % 360
  const s1 = band === 'cool' || band === 'cryo' ? 72 : 82
  const s2 = band === 'cool' || band === 'cryo' ? 55 : 70
  const l1 = band === 'inferno' ? 52 : band === 'cryo' ? 48 : 54
  const l2 = band === 'inferno' ? 34 : band === 'cryo' ? 28 : 38
  return {
    style: {
      background: `linear-gradient(180deg, hsl(${h1}, ${s1}%, ${l1}%) 0%, hsl(${h2}, ${s2}%, ${l2}%) 100%)`,
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.22)',
    },
    bandLabel: THERMAL_LABEL[band],
  }
}

export interface TechniqueBracketSpan {
  leftPct: number
  widthPct: number
  label: string
  kind: EncyclopediaTechniqueRef['kind']
  techniqueId: string
}

export function buildTechniqueBracketSpans(segments: CraftLineSegment[]): TechniqueBracketSpan[] {
  const out: TechniqueBracketSpan[] = []
  let i = 0
  let acc = 0

  while (i < segments.length) {
    const seg = segments[i]
    if (!isCraftLineTechniqueSegment(seg)) {
      acc += seg.durationShare
      i++
      continue
    }

    const kind = seg.techniqueRef.kind
    const techniqueId = seg.techniqueRef.id
    const left = acc
    let w = 0

    while (i < segments.length) {
      const s = segments[i]
      if (!isCraftLineTechniqueSegment(s)) break
      if (s.techniqueRef.kind !== kind || s.techniqueRef.id !== techniqueId) break
      w += s.durationShare
      i++
    }

    acc += w
    out.push({
      leftPct: left * 100,
      widthPct: w * 100,
      label: techniqueDisplayName({ kind, id: techniqueId }),
      kind,
      techniqueId,
    })
  }

  return out
}

export function craftLineSegmentTooltipLines(
  seg: CraftLineSegment,
  recipe: WeaponRecipe | null | undefined,
  segmentIndex: number,
  segmentsTotal: number
): { title: string; lines: string[] } {
  const band = thermalBandForCraftLineSegment(seg, recipe)
  const sharePct = (seg.durationShare * 100).toFixed(1)
  const lines: string[] = [
    `Доля полного времени: ${sharePct}%`,
    `Условная температура: ${THERMAL_LABEL[band]}`,
    `Шаг линии: ${segmentIndex + 1} из ${segmentsTotal}`,
  ]

  if (isCraftLineTechniqueSegment(seg)) {
    const name = techniqueDisplayName(seg.techniqueRef)
    const kindRu =
      seg.techniqueRef.kind === 'craft' ? 'Боевой приём (энциклопедия)' : 'Обработка материала (энциклопедия)'
    lines.unshift(`Техника: ${name} (${kindRu})`)
    if (seg.microTaskIndex != null) {
      lines.push(`Микрозадача в технике № ${seg.microTaskIndex + 1}`)
    }
    return { title: seg.label, lines }
  }

  lines.unshift('Микроэтап хребта рецепта')
  if (recipe) {
    const cfg = recipe.stages[seg.stageIndex]
    if (cfg) {
      lines.push(`Тип стадии: ${cfg.stageType}`)
      if (cfg.material || cfg.target) {
        lines.push(`Часть: ${cfg.material ?? cfg.target ?? '—'}`)
      }
    }
  }
  return { title: seg.label, lines }
}
