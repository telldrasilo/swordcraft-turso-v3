/**
 * Базовые техники крафта
 * Доступны с начала игры или открываются на ранних уровнях
 * 
 * Принцип баланса: Каждая техника имеет цену за бонусы.
 */

import type { Technique } from '@/types/craft-v2'

export const basicTechniques: Technique[] = [
  // ============================================
  // БАЗОВАЯ (без бонусов и штрафов)
  // ============================================
  
  {
    id: 'basic_forging',
    name: 'Базовая ковка',
    description:
      'Обычный цикл нагрев–ковка–правка без особых приёмов: предсказуемо и без сюрпризов по технике.',
    
    effects: {
      qualityBonus: 0,
      appliesTo: ['all'],
    },
    
    // Нет штрафов — базовая техника
    
    compatibility: {
      appliesToMaterials: ['*'],  // Ко всем материалам
    },
    
    source: {
      type: 'start',
    },

    microTasks: [
      { id: 'basic_heat', label: 'Нагрев и черновая ковка', durationWeight: 2 },
      { id: 'basic_finish', label: 'Правка формы и снятие окалины', durationWeight: 1 },
    ],

    /** Крафтовая линия: после стадии 8 (`form_heating` лезвия) — см. TZ меча §3.3. */
    craftLineAnchorAfterStageIndex: 8,
  },
  
  // ============================================
  // СКЛАДЫВАНИЕ (качество за время)
  // ============================================
  
  {
    id: 'folded_steel',
    name: 'Складывание металла',
    description:
      'Многократная перековка и сварка слоёв в горне: выравнивается структура, уходит шлак. Дольше по времени и с потерей металла на окалину.',
    
    effects: {
      qualityBonus: 15,
      durabilityBonus: 5,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.4,    // +40% времени
      materialWaste: 0.05,        // 5% материала теряется
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],  // Только металлы
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,

    microTasks: [
      { id: 'fold_heat', label: 'Прогрев и первичная ковка слоёв', durationWeight: 2 },
      { id: 'fold_weld', label: 'Сварка складок и выравнивание', durationWeight: 2 },
    ],
  },
  
  // ============================================
  // ДВОЙНАЯ ЗАКАЛКА (прочность за время)
  // ============================================
  
  {
    id: 'double_hardening',
    name: 'Двойная закалка',
    description:
      'Дополнительный цикл термообработки (закалка с последующим отпуском или повторным подбором режима) для прочности клинка. Ошибка по температуре и времени даёт риск трещины.',
    
    effects: {
      durabilityBonus: 12,
      qualityBonus: 3,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.3,    // +30% времени
      riskOfFailure: 3,           // 3% риск трещины
    },
    
    processMods: {
      addStage: {
        after: 'fin_hardening',
        stage: 'fin_hardening',  // Вторая закалка
      },
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 10',
    },
    
    requiredLevel: 10,

    microTasks: [
      { id: 'dh_first', label: 'Первый цикл закалки и отпуска', durationWeight: 2 },
      { id: 'dh_second', label: 'Повторный подбор режима и финиш', durationWeight: 2 },
    ],
  },
  
  // ============================================
  // СБАЛАНСИРОВАННЫЙ ДИЗАЙН (качество за время)
  // ============================================
  
  {
    id: 'balanced_design',
    name: 'Сбалансированный дизайн',
    description:
      'Подгонка развесовки и центра масс, проверка баланса в руке — оружие ведёт себя ровнее; нужен лишний этап подгонки.',
    
    effects: {
      qualityBonus: 8,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.15,   // +15% времени
    },
    
    processMods: {
      addStage: {
        after: 'asmb_joining',
        stage: 'asmb_balancing',
      },
    },
    
    compatibility: {
      appliesToMaterials: ['*'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 8',
    },
    
    requiredLevel: 8,

    microTasks: [
      { id: 'bal_measure', label: 'Замер баланса и развесовки', durationWeight: 1 },
      { id: 'bal_trim', label: 'Подгонка масс и проверка в руке', durationWeight: 2 },
    ],
  },
  
  // ============================================
  // МАСТЕРСКАЯ ПОЛИРОВКА (качество за время)
  // ============================================
  
  {
    id: 'masterful_polish',
    name: 'Мастерская полировка',
    description:
      'Финишная шлифовка и полировка плоскостей и кромки: ровнее поверхность и меньше шероховатости на режущей кромке.',
    
    effects: {
      qualityBonus: 5,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.1,    // +10% времени
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,

    microTasks: [
      { id: 'polish_prep', label: 'Шлифовка плоскостей', durationWeight: 2 },
      { id: 'polish_edge', label: 'Доводка режущей кромки', durationWeight: 1 },
    ],
  },
  
  // ============================================
  // ЭЛЬФИЙСКАЯ КОВКА (проводимость за риск)
  // ============================================
  
  {
    id: 'elven_forging',
    name: 'Эльфийская ковка',
    description: 'Древние техники эльфов для улучшения магических свойств. Требует мастерства, есть риск испортить заготовку.',
    
    effects: {
      conductivityBonus: 20,
      qualityBonus: 5,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.25,   // +25% времени
      riskOfFailure: 8,           // 8% риск снижения качества
      qualityPenalty: 10,         // При провале: -10 качества
    },
    
    compatibility: {
      appliesToMaterials: ['*'],
      incompatibleMaterials: ['iron', 'cold_iron'],  // Не работает с обычным железом
    },
    
    source: {
      type: 'dungeon',
      condition: 'Эльфийские руины',
    },
    
    requiredLevel: 20,

    microTasks: [
      { id: 'elven_heat', label: 'Мягкий прогрев и работа по шаблону эльфов', durationWeight: 2 },
      { id: 'elven_tune', label: 'Настройка проводимости и финальный штрих', durationWeight: 2 },
    ],
  },
]
