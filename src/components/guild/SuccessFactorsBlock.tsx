/**
 * Success Factors Block
 * Блок объяснения факторов успеха/неудачи с цитатой
 */

'use client'

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

// ================================
// ТИПЫ
// ================================

export interface SuccessFactor {
  type: 'positive' | 'negative' | 'neutral'
  icon: string
  text: string
  value?: string
}

export interface SuccessFactorsBlockProps {
  successChance: number
  factors: SuccessFactor[]
  blockType: 'ideal' | 'balanced' | 'risky'
  adventurerName?: string
  quote?: string
}

// ================================
// КОМПОНЕНТ
// ================================

export const SuccessFactorsBlock: React.FC<SuccessFactorsBlockProps> = ({
  successChance: _successChance,
  factors,
  blockType,
  adventurerName: _adventurerName,
  quote,
}) => {
  const blockStyles = {
    ideal: 'bg-green-900/30 border-green-600/50',
    balanced: 'bg-amber-900/30 border-amber-600/50',
    risky: 'bg-red-900/30 border-red-600/50',
  }
  
  const titleStyles = {
    ideal: 'text-green-300',
    balanced: 'text-amber-300',
    risky: 'text-red-300',
  }

  const titleIcon = blockType === 'ideal' ? (
    <CheckCircle className="w-5 h-5 text-green-400" />
  ) : blockType === 'balanced' ? (
    <AlertTriangle className="w-5 h-5 text-amber-400" />
  ) : (
    <XCircle className="w-5 h-5 text-red-400" />
  )

  const titleText = blockType === 'ideal' ? 'Почему он идеален:' :
                   blockType === 'balanced' ? 'Сбалансированно:' :
                   'Есть риски:'

  return (
    <div className={`p-3 rounded-lg ${blockStyles[blockType]} border`}>
      {/* Заголовок и цитата */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {titleIcon}
          <span className={`font-semibold text-sm ${titleStyles[blockType]}`}>
            {titleText}
          </span>
        </div>
        
        {quote && (
          <div className="text-right italic text-stone-400 text-sm">
            «{quote}»
          </div>
        )}
      </div>

      {/* Список факторов */}
      <ul className="space-y-2">
        {factors.map((factor, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`text-lg ${factor.type === 'positive' ? 'text-green-400' : factor.type === 'negative' ? 'text-red-400' : 'text-stone-400'}`}>
              {factor.icon}
            </span>
            <span className={`font-medium text-sm ${factor.type === 'positive' ? 'text-green-200' : factor.type === 'negative' ? 'text-red-200' : 'text-stone-300'}`}>
              {factor.text}
            </span>
            {factor.value && (
              <span className="text-sm font-bold text-stone-400 ml-1">
                {factor.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SuccessFactorsBlock
