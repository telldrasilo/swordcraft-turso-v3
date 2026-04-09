/**
 * Пользовательские тексты провала ремонта по техникам: привязка к модели (тир, диагностика, верстак).
 */

import type { RepairResult, WeaponRepairCalc } from '@/data/repair-system'
import { TIER_REPAIR_MULTIPLIERS } from '@/data/repair-system'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'

function hasWrongManualHypothesis(
  opts: RepairTechniqueExecutionOptions | undefined,
  activeTagIds: readonly string[]
): boolean {
  if (opts?.diagnosis?.mode !== 'manual_inspection') return false
  const h = opts.diagnosis.hypothesisByTagId
  if (!h) return false
  return activeTagIds.some((tid) => h[tid] === false)
}

/**
 * Сообщение после неуспешного `executeRepair` в цепочке техник (не подменяет системные ошибки валидации).
 */
export function describeTechniqueRepairFailureMessage(params: {
  repairCalc: WeaponRepairCalc
  roll: RepairResult
  opts: RepairTechniqueExecutionOptions | undefined
  activeTagIds: readonly string[]
  workbenchQueueFinale: boolean
}): string {
  const { repairCalc, roll, opts, activeTagIds, workbenchQueueFinale } = params

  if (roll.criticalFailure) {
    if (workbenchQueueFinale) {
      return 'Финальная закалка прошла вразнос: скрытая трещина лопнула — клинок пострадал сильнее, чем до попытки.'
    }
    return 'Критический провал: инструмент сорвался по слабому месту стали — оружие повреждено сильнее.'
  }

  if (hasWrongManualHypothesis(opts, activeTagIds)) {
    return 'Осмотр ошибся: удар ушёл не в ту зону повреждения — приём не сработал. Клинок не испорчен дополнительно; попробуйте снова с верной гипотезой.'
  }

  const tierPen = TIER_REPAIR_MULTIPLIERS[repairCalc.tier]?.successPenalty ?? 0
  if (tierPen >= 8) {
    return 'Оружие высокого класса требует большей выверенности: в этот раз металл не принял приварку и «поплыл». Расходники не списаны — можно повторить.'
  }

  if (workbenchQueueFinale) {
    return 'Этапы выдержали клинок, но финальная подгонка не сошлась: сталь ещё держит внутреннее напряжение. Материалы не израсходованы — оставьте работу в очереди или начните снова.'
  }

  return 'Ремонт не удался: шов не взялся, силы кузни не хватило на этот заход. Оружие не ухудшилось; можно повторить попытку.'
}
