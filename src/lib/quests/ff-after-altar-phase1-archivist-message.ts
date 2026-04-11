/**
 * Реплика архивариуса после фазы I: зависит от фактически открытых техник фазы II.
 */

import { getAltarPhaseConfig } from '@/data/altar/altar-phases-config'
import { getTechniqueById } from '@/data/techniques'
import { getEffectiveUnlockedCraftTechniques } from '@/lib/altar/altar-construction-phase'

export function buildAfterAltarPhase1ArchivistMessage(unlockedCraftTechniqueIds: string[]): string {
  const required = getAltarPhaseConfig(2).requiredTechniques
  const tech = getEffectiveUnlockedCraftTechniques(unlockedCraftTechniqueIds)
  const missing = required.filter((id) => !tech.has(id))
  const missingLabels = missing.map((id) => `«${getTechniqueById(id)?.name ?? id}»`)

  const intro =
    'Фундамент готов, молодец. Теперь — силовой каркас: рама, опоры, усиление. ' +
    'Чертёж фазы II требует три кузнечные техники: базовую ковку, складывание металла и двойную закалку. ' +
    'Базовая ковка у вас с самого начала как опора гильдии.'

  if (missing.length === 0) {
    return (
      `${intro} Складывание и двойная закалка у вас тоже на месте — можно начинать фазу II на экране «Зачарования». ` +
      'Когда каркас будет готов, напишу, что делать дальше.'
    )
  }

  const missingStr =
    missingLabels.length === 1
      ? missingLabels[0]
      : `${missingLabels.slice(0, -1).join(', ')} и ${missingLabels[missingLabels.length - 1]}`

  return (
    `${intro} Пока не хватает: ${missingStr}. ` +
    'Купите недостающие свитки у интенданта гильдии: вкладка «Гильдия» → интендант → блок техник крафта (за репутацию). ' +
    'Если уже купили раньше — на карточке фазы II зелёные галочки у всех трёх техник подтвердят готовность.'
  )
}
