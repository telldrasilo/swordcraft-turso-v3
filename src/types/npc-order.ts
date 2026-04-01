/**
 * Единый контракт заказа NPC (store, market-data, утилиты)
 */

export type OrderStatus = 'available' | 'in_progress' | 'completed' | 'expired'

export interface OrderBonusItem {
  resource: string
  amount: number
}

export interface MaterialAdvance {
  materials: { resource: string; amount: number }[]
  totalCost: number
}

export interface NPCOrder {
  id: string
  clientName: string
  clientTitle: string
  clientIcon: string
  weaponType: string
  material?: string
  minQuality: number
  minAttack?: number
  goldReward: number
  fameReward: number
  bonusItems?: OrderBonusItem[]
  materialAdvance?: MaterialAdvance
  advanceTaken?: number
  materialCost?: number
  status: OrderStatus
  acceptedAt?: number
  completedAt?: number
  requiredLevel: number
  requiredFame: number
  /** Абсолютный срок (ms, Date.now()) при использовании истечения */
  deadline?: number
}
