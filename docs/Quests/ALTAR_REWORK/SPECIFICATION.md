## Техническая спецификация: квест «Эхо забытой кузни» и строительство алтаря

**Версия:** 1.0  
**Назначение:** для разработчиков (Next.js, TypeScript, Zustand)  
**Связанные документы:**  
- `FORGOTTEN_FORGE.md` (сценарий квеста)  
- `ALTAR_CONSTRUCTION_CRAFT_CREATIVE_TZ.md` (геймдизайн строительства)  

---

## 1. Структура данных (Zustand store)

### 1.1. Основные флаги квеста

```typescript
// store/slices/questForgottenForgeSlice.ts

interface QuestForgottenForgeState {
  // Шаг квеста: 0..18, где 18 = завершён (или 99 для финала)
  step: number;
  
  // Флаг ожидания крафта после фазы II (шаг 9)
  waitingForCraftAfterPhase2: boolean;
  
  // Опционально: для отладки можно хранить время последнего перехода
  lastStepChangeAt: number | null;
}

interface QuestForgottenForgeActions {
  setStep: (step: number) => void;
  setWaitingForCraft: (value: boolean) => void;
  resetQuest: () => void; // для сброса (если потребуется)
}
```

### 1.2. Состояние строительства алтаря

```typescript
// store/slices/altarConstructionSlice.ts

export type AltarPhase = 1 | 2 | 3 | 4 | 5;

export interface AltarConstructionState {
  // Флаги доступа (устанавливаются квестом)
  altarUnlocked: boolean;        // соответствует altarUnlockedByForgottenForgeQuest
  altarBuilt: boolean;           // altarBuiltInForge
  
  // Прогресс фаз
  completedPhases: AltarPhase[]; // номера завершённых фаз (например, [1,2])
  
  // Активная фаза (если идёт строительство)
  activePhase: AltarPhase | null;
  activePhaseStartTime: number;   // timestamp Unix (ms)
  activePhaseStageIndex: number;  // индекс текущего микроэтапа (0..N-1)
  activePhaseStageStartTime: number;
  
  // Список микроэтапов для активной фазы (генерируется при старте)
  activePhaseStages: AltarStage[]; // см. определение ниже
}

export interface AltarStage {
  id: string;            // уникальный id этапа (например, "clear_debris")
  name: string;          // локализованное название
  durationSec: number;   // длительность в секундах
  techniqueId?: string;  // опциональная техника, применяемая на этапе
  description: string;   // пояснение для UI
}

export interface AltarPhaseConfig {
  phase: AltarPhase;
  requiredMaterials: Record<string, number>;   // materialId -> количество
  requiredTechniques: string[];                 // техники, которые должны быть изучены
  stages: AltarStage[];                         // микроэтапы (фиксированные)
  totalDurationSec: number;                     // сумма длительностей
}
```

### 1.3. Дополнительные флаги (существующие, используются квестом)

```typescript
// store/slices/inventorySlice.ts (уже есть)
materialStash: Record<string, number>;

// store/slices/techniquesSlice.ts (уже есть)
unlockedTechniques: string[]; // массив id техник

// store/slices/blacksmithSlice.ts (уже есть)
blacksmithLevel: number;
```

---

## 2. Имена событий и триггеры

Для связи систем нужны глобальные события (можно реализовать через Zustand subscribe или через event emitter). Рекомендуется использовать простой `EventEmitter` или `mitt`.

### 2.1. События, генерируемые другими системами

| Событие | Параметры | Где генерируется |
|---------|-----------|------------------|
| `expedition:completed` | `{ locationId: string, questTag?: string }` | После успешного завершения экспедиции |
| `craft:completed` | `{ recipeId: string }` | После завершения крафта v2 |
| `altar:phaseCompleted` | `{ phase: AltarPhase }` | После завершения последнего микроэтапа фазы |
| `altar:phaseCancelled` | `{ phase: AltarPhase }` | При отмене активной фазы (не используется в квесте) |

### 2.2. События, на которые подписывается квест

Квестовый `useEffect` или middleware подписывается на эти события и вызывает соответствующие переходы.

---

## 3. Интеграция с редьюсерами (пример на Zustand)

### 3.1. Основной store (combine slices)

```typescript
// store/useGameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQuestForgottenForgeSlice } from './slices/questForgottenForgeSlice';
import { createAltarConstructionSlice } from './slices/altarConstructionSlice';
// ... другие slices

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...createQuestForgottenForgeSlice(set, get),
      ...createAltarConstructionSlice(set, get),
      // ... другие slices
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        // только нужные поля
        questForgottenForge: state.questForgottenForge,
        altarConstruction: state.altarConstruction,
        materialStash: state.materialStash,
        unlockedTechniques: state.unlockedTechniques,
        // ...
      }),
    }
  )
);
```

### 3.2. Реализация срезов

**questForgottenForgeSlice.ts**

```typescript
export const createQuestForgottenForgeSlice = (set, get) => ({
  questForgottenForge: {
    step: 0,
    waitingForCraftAfterPhase2: false,
    lastStepChangeAt: null,
  },
  setStep: (step: number) => {
    set((state) => ({
      questForgottenForge: {
        ...state.questForgottenForge,
        step,
        lastStepChangeAt: Date.now(),
      },
    }));
    // При изменении шага можно триггерить проверки (например, UI обновление)
  },
  setWaitingForCraft: (value: boolean) => {
    set((state) => ({
      questForgottenForge: {
        ...state.questForgottenForge,
        waitingForCraftAfterPhase2: value,
      },
    }));
  },
  resetQuest: () => {
    set((state) => ({
      questForgottenForge: {
        step: 0,
        waitingForCraftAfterPhase2: false,
        lastStepChangeAt: null,
      },
    }));
  },
});
```

**altarConstructionSlice.ts**

```typescript
import { AltarPhase, AltarConstructionState, AltarStage, AltarPhaseConfig } from './types';
import { altarPhasesConfig } from '../../data/altar/altarPhasesConfig';

export const createAltarConstructionSlice = (set, get) => ({
  altarConstruction: {
    altarUnlocked: false,
    altarBuilt: false,
    completedPhases: [],
    activePhase: null,
    activePhaseStartTime: 0,
    activePhaseStageIndex: 0,
    activePhaseStageStartTime: 0,
    activePhaseStages: [],
  },
  
  // Действия
  unlockAltar: () => {
    set((state) => ({
      altarConstruction: { ...state.altarConstruction, altarUnlocked: true },
    }));
  },
  
  startAltarPhase: (phase: AltarPhase) => {
    const state = get().altarConstruction;
    if (state.activePhase !== null) return false; // уже активна фаза
    const config = altarPhasesConfig[phase];
    if (!config) return false;
    
    // Проверка материалов и техник (должна быть вызвана перед этим)
    set((state) => ({
      altarConstruction: {
        ...state.altarConstruction,
        activePhase: phase,
        activePhaseStartTime: Date.now(),
        activePhaseStageIndex: 0,
        activePhaseStageStartTime: Date.now(),
        activePhaseStages: config.stages,
      },
    }));
    return true;
  },
  
  completeAltarPhase: (phase: AltarPhase) => {
    set((state) => ({
      altarConstruction: {
        ...state.altarConstruction,
        completedPhases: [...state.altarConstruction.completedPhases, phase],
        activePhase: null,
        activePhaseStages: [],
      },
    }));
    // Генерируем событие для квеста
    get().emitEvent('altar:phaseCompleted', { phase });
  },
  
  cancelAltarPhase: () => {
    // Отмена: сброс активной фазы, материалы не возвращаются
    set((state) => ({
      altarConstruction: {
        ...state.altarConstruction,
        activePhase: null,
        activePhaseStages: [],
      },
    }));
  },
  
  updateAltarProgress: () => {
    // Вызывается по тику (например, каждую секунду)
    const state = get().altarConstruction;
    if (!state.activePhase) return;
    const now = Date.now();
    const stage = state.activePhaseStages[state.activePhaseStageIndex];
    if (!stage) return;
    
    const elapsed = (now - state.activePhaseStageStartTime) / 1000;
    if (elapsed >= stage.durationSec) {
      // Переход к следующему этапу
      const nextIndex = state.activePhaseStageIndex + 1;
      if (nextIndex >= state.activePhaseStages.length) {
        // Фаза завершена
        get().completeAltarPhase(state.activePhase);
      } else {
        set((state) => ({
          altarConstruction: {
            ...state.altarConstruction,
            activePhaseStageIndex: nextIndex,
            activePhaseStageStartTime: now,
          },
        }));
      }
    }
  },
  
  setAltarBuilt: () => {
    set((state) => ({
      altarConstruction: { ...state.altarConstruction, altarBuilt: true },
    }));
  },
});
```

---

## 4. Логика переходов квеста (основной обработчик)

Создаём хук `useForgottenForgeQuestEvents`, который подписывается на события и вызывает `setStep`.

```typescript
// hooks/useForgottenForgeQuestEvents.ts
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { eventBus } from '../lib/eventBus';

export const useForgottenForgeQuestEvents = () => {
  const { step, setStep, setWaitingForCraft, altarConstruction, materialStash, unlockedTechniques } = useGameStore();
  
  useEffect(() => {
    // Обработчик завершения экспедиции
    const onExpeditionComplete = ({ locationId, questTag }) => {
      // Маппинг локаций на шаги (упрощённо)
      const stepMap = {
        oak_grove_outskirts: { fromStep: 1, toStep: 2, questTag: 'default' },
        red_stone_mines: [
          { fromStep: 2, toStep: 3, tag: 'default' },
          { fromStep: 11, toStep: 12, tag: 'clay_firing' }, // для получения обжига
        ],
        forgotten_mines: { fromStep: 3, toStep: 4 },
        misty_lowlands: [
          { fromStep: 4, toStep: 5, tag: 'default' },
          { fromStep: 14, toStep: 15, tag: 'spirit_blessing' },
        ],
        rotten_swamp: { fromStep: 5, toStep: 6 },
        silver_grove: [
          { fromStep: 6, toStep: 7, tag: 'default' },
          { fromStep: 12, toStep: 13, tag: 'frequency_tuning' },
        ],
        // для рун (шаг 10) тоже oak_grove_outskirts, но с отдельным тегом
      };
      
      // Проверяем текущий шаг и locationId
      if (step === 1 && locationId === 'oak_grove_outskirts') setStep(2);
      else if (step === 2 && locationId === 'red_stone_mines') setStep(3);
      else if (step === 3 && locationId === 'forgotten_mines') setStep(4);
      else if (step === 4 && locationId === 'misty_lowlands') setStep(5);
      else if (step === 5 && locationId === 'rotten_swamp') setStep(6);
      else if (step === 6 && locationId === 'silver_grove') setStep(7);
      // Получение техник
      else if (step === 10 && locationId === 'oak_grove_outskirts' && questTag === 'runes') {
        // выдать технику rune_engraving_basic
        useGameStore.getState().addTechnique('rune_engraving_basic');
        setStep(11);
      }
      else if (step === 11 && locationId === 'red_stone_mines' && questTag === 'clay_firing') {
        useGameStore.getState().addTechnique('clay_firing');
        setStep(12);
      }
      else if (step === 12 && locationId === 'silver_grove' && questTag === 'frequency_tuning') {
        // Проверяем наличие shadow_leather (уже должно быть списано при отправке)
        useGameStore.getState().addTechnique('frequency_tuning');
        setStep(13);
      }
      else if (step === 14 && locationId === 'misty_lowlands' && questTag === 'spirit_blessing') {
        useGameStore.getState().addTechnique('spirit_blessing');
        setStep(15);
      }
    };
    
    // Обработчик завершения крафта
    const onCraftComplete = () => {
      if (step === 9 && useGameStore.getState().waitingForCraftAfterPhase2) {
        setWaitingForCraft(false);
        setStep(10);
      }
    };
    
    // Обработчик завершения фазы алтаря
    const onAltarPhaseComplete = ({ phase }) => {
      if (step === 8 && phase === 1) setStep(9);
      else if (step === 9 && phase === 2) {
        // переход к шагу 9 уже произошёл, но фаза II завершена – теперь ставим ожидание крафта
        setWaitingForCraft(true);
        // шаг остаётся 9, но UI цель меняется
      }
      else if (step === 13 && phase === 3) setStep(14);
      else if (step === 15 && phase === 4) setStep(16);
      else if (step === 16 && phase === 5) {
        setStep(17);
        useGameStore.getState().setAltarBuilt();
      }
    };
    
    eventBus.on('expedition:completed', onExpeditionComplete);
    eventBus.on('craft:completed', onCraftComplete);
    eventBus.on('altar:phaseCompleted', onAltarPhaseComplete);
    
    return () => {
      eventBus.off('expedition:completed', onExpeditionComplete);
      eventBus.off('craft:completed', onCraftComplete);
      eventBus.off('altar:phaseCompleted', onAltarPhaseComplete);
    };
  }, [step, setStep, setWaitingForCraft]);
};
```

---

## 5. Интеграция с UI: панель цели на вкладке «Алтарь»

```tsx
// components/Altar/AltarQuestGoal.tsx
import { useGameStore } from '../../store/useGameStore';

const goalTextByStep = {
  7: 'Завершите фазу I строительства алтаря.',
  8: 'Завершите фазу II строительства алтаря.',
  9: 'Выполните один крафт оружия, чтобы помочь архивариусу расшифровать свитки.',
  10: 'Отправьте экспедицию в Дубовую Рощу за рунической пластиной.',
  11: 'Отправьте экспедицию в Рудники Красного Камня за секретом обжига.',
  12: 'Отправьте экспедицию в Серебряный Бор (требуется 2 болотной кожи).',
  13: 'Завершите фазу III строительства алтаря.',
  14: 'Отправьте экспедицию в Туманные Низины за благословением (требуется 3 туманных трав).',
  15: 'Завершите фазу IV строительства алтаря.',
  16: 'Завершите фазу V строительства алтаря.',
};

export const AltarQuestGoal = () => {
  const step = useGameStore((state) => state.questForgottenForge.step);
  const waitingCraft = useGameStore((state) => state.questForgottenForge.waitingForCraftAfterPhase2);
  
  if (step < 7 || step > 16) return null;
  let text = goalTextByStep[step];
  if (step === 9 && waitingCraft) text = goalTextByStep[9];
  return <div className="quest-goal-panel">🎯 {text}</div>;
};
```

---

## 6. Данные конфигурации фаз алтаря

```typescript
// data/altar/altarPhasesConfig.ts
import { AltarPhaseConfig } from '../../store/types';

export const altarPhasesConfig: Record<number, AltarPhaseConfig> = {
  1: {
    phase: 1,
    requiredMaterials: {
      fieldstone: 20,
      clay: 25,
      coal: 12,
      oak: 15,
      birch: 8,
      iron_ingot: 8,
      raw_leather: 6,
    },
    requiredTechniques: [], // нет
    stages: [
      { id: 'clear_debris', name: 'Расчистка мусора', durationSec: 900, description: 'Убираем камни и корни.' },
      { id: 'dig_foundation', name: 'Копка котлована', durationSec: 1800, description: 'Роем яму под фундамент.' },
      { id: 'mix_clay_mortar', name: 'Замес глины', durationSec: 600, description: 'Приготавливаем раствор.' },
      { id: 'lay_foundation', name: 'Кладка фундамента', durationSec: 2400, description: 'Укладываем камень.' },
      { id: 'forge_brackets', name: 'Ковка скоб', durationSec: 900, techniqueId: 'basic_forging', description: 'Куём железные крепления.' },
      { id: 'install_brackets', name: 'Установка скоб', durationSec: 600, description: 'Закрепляем в фундаменте.' },
    ],
    totalDurationSec: 7200,
  },
  2: { /* аналогично */ },
  3: { /* ... */ },
  4: { /* ... */ },
  5: { /* ... */ },
};
```

---

## 7. Проверка и списание материалов перед стартом фазы

```typescript
// lib/altar/canStartPhase.ts
export function canStartPhase(
  phase: AltarPhase,
  materialStash: Record<string, number>,
  unlockedTechniques: string[]
): { ok: boolean; missingMaterials?: string[]; missingTechniques?: string[] } {
  const config = altarPhasesConfig[phase];
  const missingMaterials: string[] = [];
  const missingTechniques: string[] = [];
  
  for (const [matId, requiredQty] of Object.entries(config.requiredMaterials)) {
    const have = materialStash[matId] || 0;
    if (have < requiredQty) missingMaterials.push(matId);
  }
  
  for (const techId of config.requiredTechniques) {
    if (!unlockedTechniques.includes(techId)) missingTechniques.push(techId);
  }
  
  if (missingMaterials.length === 0 && missingTechniques.length === 0) {
    return { ok: true };
  }
  return { ok: false, missingMaterials, missingTechniques };
}

export function consumeMaterialsForPhase(phase: AltarPhase, materialStash: Record<string, number>) {
  const config = altarPhasesConfig[phase];
  const newStash = { ...materialStash };
  for (const [matId, qty] of Object.entries(config.requiredMaterials)) {
    newStash[matId] = (newStash[matId] || 0) - qty;
    if (newStash[matId] < 0) throw new Error(`Not enough ${matId}`);
  }
  return newStash;
}
```

---

## 8. Дальнейшие шаги по разработке

1. Создать файлы типов и конфигураций (`types.ts`, `altarPhasesConfig.ts`).
2. Реализовать slices в Zustand.
3. Написать `eventBus` (простой класс на основе `mitt`).
4. Реализовать хук `useForgottenForgeQuestEvents` и подключить его в `_app.tsx` или в layout.
5. Реализовать UI компоненты: вкладка «Алтарь» с фазами, панель цели, экран строительства.
6. Добавить в систему экспедиций возможность указывать `questTag` для квестовых миссий.
7. Протестировать все переходы.

---

*Документ готов для реализации.*