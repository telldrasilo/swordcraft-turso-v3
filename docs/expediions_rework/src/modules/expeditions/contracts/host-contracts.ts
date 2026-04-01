/**
 * Контракты модуля экспедиций
 * Определяют интерфейсы для интеграции с хост-проектом
 */

import type { ActiveExpedition, ExpeditionTemplate, ExpeditionResult } from '../types';
import type { ResourceAmount } from '../types/resource.types';

// ============================================================================
// Что модуль ожидает от хост-проекта
// ============================================================================

/**
 * Интерфейс для работы с ресурсами хоста
 */
export interface IResourceHost {
  canAfford(cost: Record<string, number>): boolean;
  spendResource(key: string, amount: number): boolean;
  addResource(key: string, amount: number): void;
  spendResources(cost: Record<string, number>): boolean;
}

/**
 * Интерфейс для работы с оружием хоста
 */
export interface IWeaponHost {
  removeWeapon(weaponId: string): boolean;
  addWarSoulToWeapon(
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number
  ): boolean;
  getWeapon(weaponId: string): unknown | null;
}

/**
 * Интерфейс для работы с искателями хоста
 */
export interface IAdventurerHost {
  getAdventurer(adventurerId: string): unknown | null;
  getAdventurerExtended(adventurerId: string): unknown | null;
}

/**
 * Интерфейс для работы с гильдией хоста
 */
export interface IGuildHost {
  getLevel(): number;
  getGlory(): number;
  addGlory(amount: number): void;
  getMaxActiveExpeditions(): number;
  getActiveExpeditions(): ActiveExpedition[];
  addActiveExpedition(expedition: ActiveExpedition): void;
  removeActiveExpedition(expeditionId: string): void;
}

/**
 * Интерфейс для работы с энциклопедией материалов
 */
export interface IEncyclopediaHost {
  addMaterialExpertise(materialId: string, amount: number): void;
  discoverMaterial(materialId: string): void;
}

/**
 * Интерфейс для работы со статистикой
 */
export interface IStatisticsHost {
  updateStatistics(stats: Partial<Record<string, number>>): void;
  addExperience(amount: number): void;
}

/**
 * Интерфейс для работы с квестами
 */
export interface IQuestHost {
  createRecoveryQuest(quest: {
    lostWeaponId: string;
    lostWeaponData: unknown;
    originalExpeditionId: string;
    originalExpeditionName: string;
    cost: number;
    duration: number;
  }): void;
}

/**
 * Полный интерфейс хоста
 */
export interface IHostContracts {
  resources: IResourceHost;
  weapons: IWeaponHost;
  adventurers: IAdventurerHost;
  guild: IGuildHost;
  encyclopedia: IEncyclopediaHost;
  statistics: IStatisticsHost;
  quests: IQuestHost;
}

// ============================================================================
// Что модуль предоставляет хосту
// ============================================================================

/**
 * Публичный API модуля экспедиций
 */
export interface IExpeditionModule {
  // Получение данных
  getAvailableLocations(): import('../types').Location[];
  getAvailableMissions(locationId: string): import('../types').MissionTemplate[];
  getActiveExpeditions(): ActiveExpedition[];

  // Операции
  startExpedition(
    template: ExpeditionTemplate,
    adventurerId: string,
    weaponId: string
  ): { success: boolean; error?: string; expedition?: ActiveExpedition };

  completeExpedition(expeditionId: string): ExpeditionResult | null;

  // Генерация
  generateMissions(locationId: string, seed?: string): import('../types').GeneratedMission[];
  generateEvents(expedition: ActiveExpedition): import('../types').ExpeditionEvent[];
}

// ============================================================================
// Типы для интеграции с Zustand store
// ============================================================================

/**
 * Срез состояния для модуля экспедиций
 */
export interface ExpeditionStateSlice {
  // Активные экспедиции
  activeExpeditions: ActiveExpedition[];

  // История
  expeditionHistory: import('../types').ExpeditionHistoryEntry[];

  // Разблокированные локации
  unlockedLocations: string[];

  // Пройденные миссии
  completedMissions: string[];
}

/**
 * Действия для модуля экспедиций
 */
export interface ExpeditionActionsSlice {
  startExpedition: (
    template: ExpeditionTemplate,
    adventurerId: string,
    weaponId: string
  ) => boolean;

  completeExpedition: (expeditionId: string) => ExpeditionResult | null;

  unlockLocation: (locationId: string) => void;
  completeMission: (missionId: string) => void;
}

// ============================================================================
// Функция инициализации модуля
// ============================================================================

/**
 * Конфигурация для инициализации модуля
 */
export interface ExpeditionModuleConfig {
  host: IHostContracts;
  seed?: string;  // Для детерминированной генерации
}

/**
 * Создаёт экземпляр модуля экспедиций
 */
export type CreateExpeditionModule = (
  config: ExpeditionModuleConfig
) => IExpeditionModule;
