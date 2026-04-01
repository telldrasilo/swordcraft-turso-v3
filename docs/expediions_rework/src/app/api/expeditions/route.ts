import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types
// ============================================================================

interface Weapon {
  id: string;
  name: string;
  type: string;
  attack: number;
  durability: number;
  maxDurability: number;
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

interface Adventurer {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level: number;
  power: number;
  precision: number;
  endurance: number;
  luck: number;
  combatStyle: string;
  traits: string[];
  icon: string;
}

interface GeneratedEvent {
  id: string;
  name: string;
  type: 'positive' | 'negative' | 'neutral' | 'choice';
  category: string;
  title: string;
  description: string;
  icon: string;
  triggerTime: number;
  triggered: boolean;
  effects?: {
    resources?: { material: string; quantity: number }[];
    durabilityLoss?: number;
    warSoul?: number;
  };
}

interface LocationResource {
  materialId: string;
  baseWeight: number;
  rarity: string;
  minQuantity: number;
  maxQuantity: number;
}

// ============================================================================
// Constants
// ============================================================================

// Множители потери прочности по сложности
const DURABILITY_LOSS_BY_DIFFICULTY: Record<string, number> = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.4,
  extreme: 2.0,
};

// Порог ремонта (ниже этого значения оружие требует починки)
const REPAIR_THRESHOLD = 20;

// Среднее количество миссий до ремонта
const AVG_MISSIONS_TO_REPAIR = 3.5;

// Weapon names by type
const weaponNames: Record<string, string[]> = {
  sword: ['Меч Рассвета', 'Клинок Бури', 'Стальной Разитель', 'Палаш Ветра'],
  axe: ['Секирa Грома', 'Топор Викинга', 'Раскалыватель', 'Ледоруб'],
  hammer: ['Молот Тора', 'Кувалда Судьбы', 'Громоотбойник', 'Дробитель'],
  dagger: ['Кинжал Теней', 'Остриё Ночи', 'Зуб Виперы', 'Шип Скорпиона'],
  spear: ['Копьё Ветра', 'Пика Грома', 'Дротик Молнии', 'Алебарда'],
  bow: ['Лук Охотника', 'Стреломёт', 'Дальний Разряд', 'Тетива Смерти'],
};

const weaponIcons: Record<string, string> = {
  sword: '⚔️',
  axe: '🪓',
  hammer: '🔨',
  dagger: '🗡️',
  spear: '🔱',
  bow: '🏹',
};

// Adventurer names
const adventurerNames = [
  'Александр', 'Мария', 'Дмитрий', 'Анна', 'Сергей',
  'Елена', 'Николай', 'Ольга', 'Владимир', 'Татьяна',
  'Артём', 'Катерина', 'Игорь', 'Наталья', 'Андрей',
];

const adventurerIcons = ['🧙', '🧝', '🧛', '🧟', '🦸', '🦹', '👸', '🤴', '🧑‍🎤', '🧑‍✈️'];
const combatStyles = ['aggressive', 'defensive', 'balanced', 'tactical'];
const adventurerTraits = [
  'Храбрый', 'Осторожный', 'Удачливый', 'Сильный', 'Ловкий',
  'Мудрый', 'Быстрый', 'Стойкий', 'Внимательный', 'Хитрый',
];

// ============================================================================
// Helper Functions
// ============================================================================

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomId = () => Math.random().toString(36).substring(2, 10);

// Helper to get modules dynamically
async function getModules() {
  const { MISSION_REGISTRY, MISSIONS_BY_LOCATION } = await import('@/modules/expeditions/data/missions');
  const { LOCATION_REGISTRY } = await import('@/modules/expeditions/data/locations');
  const { EVENT_REGISTRY, getRandomEvents, getEventsForLocation, filterEventsByConditions } = await import('@/modules/expeditions/data/events');
  const { MATERIAL_REGISTRY, getMaterialName } = await import('@/modules/expeditions/data/materials');
  const { GLOBAL_BALANCE_CONFIG } = await import('@/modules/expeditions/lib/balance-config');

  return {
    MISSION_REGISTRY,
    MISSIONS_BY_LOCATION,
    LOCATION_REGISTRY,
    EVENT_REGISTRY,
    getRandomEvents,
    getEventsForLocation,
    filterEventsByConditions,
    MATERIAL_REGISTRY,
    getMaterialName,
    GLOBAL_BALANCE_CONFIG,
  };
}

// ============================================================================
// Generator Functions
// ============================================================================

// Generate random weapon
function generateWeapon(): Weapon {
  const types = Object.keys(weaponNames);
  const type = randomChoice(types);
  const quality = randomChoice(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const);
  const qualityMultiplier = { common: 1, uncommon: 1.2, rare: 1.5, epic: 2, legendary: 3 }[quality];
  
  return {
    id: `weapon_${randomId()}`,
    name: randomChoice(weaponNames[type]),
    type,
    attack: Math.floor(randomInt(10, 30) * qualityMultiplier),
    durability: Math.floor(100 * qualityMultiplier),
    maxDurability: Math.floor(100 * qualityMultiplier),
    quality,
    icon: weaponIcons[type],
  };
}

// Generate random adventurer
function generateAdventurer(): Adventurer {
  const rarity = randomChoice(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const);
  const rarityMultiplier = { common: 1, uncommon: 1.1, rare: 1.3, epic: 1.6, legendary: 2 }[rarity];
  const level = randomInt(5, 50);
  
  return {
    id: `adventurer_${randomId()}`,
    name: randomChoice(adventurerNames),
    rarity,
    level,
    power: Math.floor((randomInt(10, 30) + level * 2) * rarityMultiplier),
    precision: Math.floor((randomInt(10, 30) + level * 1.5) * rarityMultiplier),
    endurance: Math.floor((randomInt(10, 30) + level * 1.5) * rarityMultiplier),
    luck: Math.floor((randomInt(5, 20) + level) * rarityMultiplier),
    combatStyle: randomChoice(combatStyles),
    traits: [randomChoice(adventurerTraits), randomChoice(adventurerTraits)].filter((v, i, a) => a.indexOf(v) === i),
    icon: randomChoice(adventurerIcons),
  };
}

/**
 * Рассчитать потерю прочности за миссию
 * 
 * Формула: lossRate * difficultyModifier * durationModifier
 * Где lossRate = (maxDurability - repairThreshold) / avgMissionsCount
 */
function calculateDurabilityLoss(
  maxDurability: number,
  difficulty: string,
  durationSeconds: number,
  durabilityLossMultiplier: number = 1.0
): number {
  // Базовая потеря за миссию (чтобы хватило на 3-4 миссии до порога ремонта)
  const lossRate = (maxDurability - REPAIR_THRESHOLD) / AVG_MISSIONS_TO_REPAIR;
  
  // Множитель сложности
  const difficultyModifier = DURABILITY_LOSS_BY_DIFFICULTY[difficulty] || 1.0;
  
  // Множитель длительности (нормализация к 1 часу)
  const durationModifier = durationSeconds / 3600;
  
  // Итоговая потеря
  const totalLoss = Math.floor(lossRate * difficultyModifier * durationModifier * durabilityLossMultiplier);
  
  // Минимум 1 единица потери
  return Math.max(1, totalLoss);
}

/**
 * Рассчитать потерю прочности для конкретного негативного события
 */
function calculateEventDurabilityLoss(
  maxDurability: number,
  baseLossPercent: number = 0.05 // 5% от разницы max-repairThreshold
): number {
  const availableDurability = maxDurability - REPAIR_THRESHOLD;
  return Math.max(1, Math.floor(availableDurability * baseLossPercent));
}

/**
 * Генерация эффектов для события
 * 
 * ВАЖНО: Золото и слава НЕ генерируются в событиях - они выдаются только по завершении миссии!
 */
function generateEventEffects(
  event: { type: string; category: string },
  locationResources: LocationResource[] | undefined,
  maxWeaponDurability: number,
  quantityMultiplier: number,
  warSoulMultiplier: number
): GeneratedEvent['effects'] {
  const effects: GeneratedEvent['effects'] = {};
  
  if (event.type === 'positive') {
    // Позитивные события: 60% шанс получить ресурсы из локации
    if (locationResources && locationResources.length > 0 && Math.random() < 0.6) {
      // Выбираем ресурс с учётом весов
      const totalWeight = locationResources.reduce((sum, r) => sum + r.baseWeight, 0);
      let random = Math.random() * totalWeight;
      let selectedResource: LocationResource | null = null;
      
      for (const resource of locationResources) {
        random -= resource.baseWeight;
        if (random <= 0) {
          selectedResource = resource;
          break;
        }
      }
      
      if (selectedResource) {
        // Используем minQuantity/maxQuantity из конфигурации ресурса локации
        const baseQuantity = randomInt(selectedResource.minQuantity, selectedResource.maxQuantity);
        effects.resources = [{
          material: selectedResource.materialId,
          quantity: Math.max(1, Math.floor(baseQuantity * quantityMultiplier)),
        }];
      }
    }
    
    // Позитивные события могут давать душу войны (15% шанс)
    if (Math.random() < 0.15) {
      effects.warSoul = Math.max(1, Math.floor(randomInt(2, 5) * warSoulMultiplier));
    }
    
  } else if (event.type === 'negative') {
    // Негативные события: потеря прочности оружия
    // Базовая потеря 3-8% от доступной прочности
    const lossPercent = randomInt(3, 8) / 100;
    effects.durabilityLoss = calculateEventDurabilityLoss(maxWeaponDurability, lossPercent);
    
  } else if (event.type === 'choice') {
    // События выбора: 45% шанс на ресурсы, могут быть как наградой так и риском
    if (locationResources && locationResources.length > 0 && Math.random() < 0.45) {
      const selectedResource = randomChoice(locationResources);
      const baseQuantity = randomInt(selectedResource.minQuantity, selectedResource.maxQuantity + 2); // +2 бонус за выбор
      effects.resources = [{
        material: selectedResource.materialId,
        quantity: Math.max(1, Math.floor(baseQuantity * quantityMultiplier)),
      }];
    }
    
    // Небольшой шанс души войны за правильный выбор (20%)
    if (Math.random() < 0.20) {
      effects.warSoul = Math.max(1, Math.floor(randomInt(1, 3) * warSoulMultiplier));
    }
    
  } else if (event.type === 'neutral') {
    // Нейтральные события: редко дают ресурсы (25% шанс)
    if (locationResources && locationResources.length > 0 && Math.random() < 0.25) {
      const selectedResource = randomChoice(locationResources);
      const baseQuantity = Math.floor(selectedResource.minQuantity * 0.7); // Меньше, чем в позитивных
      effects.resources = [{
        material: selectedResource.materialId,
        quantity: Math.max(1, Math.floor(baseQuantity * quantityMultiplier)),
      }];
    }
  }
  
  return effects;
}

// ============================================================================
// GET Handler
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const mods = await getModules();

    switch (action) {
      case 'available-missions': {
        const count = randomInt(3, 4);
        const shuffled = [...mods.MISSION_REGISTRY].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        
        const missionsWithLocation = selected.map(m => {
          const locationId = Object.entries(mods.MISSIONS_BY_LOCATION)
            .find(([, missions]) => missions.some(mission => mission.id === m.id))?.[0];
          const location = mods.LOCATION_REGISTRY.find(l => l.id === locationId);
          
          return {
            id: m.id,
            name: m.name,
            type: m.type,
            difficulty: m.difficulty,
            rarity: m.rarity,
            description: m.description,
            objective: m.objective,
            duration: m.duration,
            cost: m.cost,
            reward: m.reward,
            client: m.client,
            location: location ? {
              id: location.id,
              name: location.name,
              tier: location.tier,
              type: location.type,
            } : null,
            enemies: m.enemies,
          };
        });

        return NextResponse.json({ missions: missionsWithLocation });
      }

      case 'generate-weapon':
        return NextResponse.json({ weapon: generateWeapon() });

      case 'generate-adventurer':
        return NextResponse.json({ adventurer: generateAdventurer() });

      case 'balance-config':
        return NextResponse.json({
          config: {
            quantityMultiplier: mods.GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier,
            qualityShift: mods.GLOBAL_BALANCE_CONFIG.resources.qualityShift,
            durationMultiplier: mods.GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier,
            warSoulMultiplier: mods.GLOBAL_BALANCE_CONFIG.rewards.warSoulMultiplier,
          },
          presets: ['default', 'testing', 'development', 'hardcore', 'endgame'],
          constants: {
            repairThreshold: REPAIR_THRESHOLD,
            avgMissionsToRepair: AVG_MISSIONS_TO_REPAIR,
            difficultyModifiers: DURABILITY_LOSS_BY_DIFFICULTY,
          },
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const mods = await getModules();

    switch (action) {
      case 'start-mission': {
        const { missionId, weapon, adventurer, rewardSplit, balanceMultipliers } = data;
        
        const mission = mods.MISSION_REGISTRY.find(m => m.id === missionId);
        if (!mission) {
          return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
        }

        const locationId = Object.entries(mods.MISSIONS_BY_LOCATION)
          .find(([, missions]) => missions.some(m => m.id === missionId))?.[0];
        const location = mods.LOCATION_REGISTRY.find(l => l.id === locationId);

        // Получаем множители из баланс-конфига
        const quantityMult = balanceMultipliers?.quantity ?? mods.GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier;
        const durationMult = balanceMultipliers?.duration ?? mods.GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier;
        const warSoulMult = mods.GLOBAL_BALANCE_CONFIG.rewards.warSoulMultiplier;
        const goldMult = mods.GLOBAL_BALANCE_CONFIG.rewards.goldMultiplier;
        const gloryMult = mods.GLOBAL_BALANCE_CONFIG.rewards.gloryMultiplier;
        const expMult = mods.GLOBAL_BALANCE_CONFIG.rewards.experienceMultiplier;

        // Генерируем события для миссии
        const duration = Math.floor(mission.duration.base * durationMult);
        const eventCount = Math.floor(duration / 300) + randomInt(1, 3);
        
        // Получаем события для локации
        const locationEvents = location ? mods.getEventsForLocation(location.id) : mods.EVENT_REGISTRY;
        
        // Фильтруем события по условиям локации
        const filteredEvents = location 
          ? mods.filterEventsByConditions(locationEvents, {
              locationId: location.id,
              locationType: location.type,
              locationTags: location.tags || [],
              locationTier: location.tier,
              missionType: mission.type,
              missionDifficulty: mission.difficulty,
              progress: 50, // Средний прогресс при генерации
            })
          : locationEvents;
        
        const selectedEvents = mods.getRandomEvents(filteredEvents, Math.min(eventCount, 10));
        
        // Генерируем эффекты для каждого события
        const events: GeneratedEvent[] = selectedEvents.map((e, i) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          category: e.category,
          title: e.title,
          description: e.description,
          icon: e.icon,
          triggerTime: Math.floor((i + 1) * duration / (selectedEvents.length + 1)),
          triggered: false,
          effects: generateEventEffects(
            e,
            location?.resources as LocationResource[] | undefined,
            weapon.maxDurability,
            quantityMult,
            warSoulMult
          ),
        }));

        // Рассчитываем базовую потерю прочности за миссию
        const baseDurabilityLoss = calculateDurabilityLoss(
          weapon.maxDurability,
          mission.difficulty,
          duration,
          1.0 // Можно добавить durabilityLossMultiplier в конфиг
        );

        // Суммируем потерю прочности из негативных событий
        const eventDurabilityLoss = events.reduce((sum, e) => sum + (e.effects?.durabilityLoss || 0), 0);
        const totalDurabilityLoss = baseDurabilityLoss + eventDurabilityLoss;

        // Рассчитываем награды с учётом множителей
        const baseGold = Math.floor((mission.reward.gold?.base || 50) * goldMult);
        const baseGlory = Math.floor((mission.reward.glory?.base || 5) * gloryMult);
        const baseExp = Math.floor((mission.reward.experience?.base || 20) * expMult);
        const baseWarSoul = Math.floor((mission.reward.warSoul?.base || 10) * warSoulMult);
        
        const adventurerShare = rewardSplit === '50/50' ? 0.5 : 0.3;
        
        // Суммируем душу войны из событий
        const eventWarSoul = events.reduce((sum, e) => sum + (e.effects?.warSoul || 0), 0);
        const totalWarSoul = baseWarSoul + eventWarSoul;
        
        return NextResponse.json({
          mission: {
            id: mission.id,
            name: mission.name,
            type: mission.type,
            difficulty: mission.difficulty,
            duration,
            location: location?.name || 'Unknown',
          },
          weapon,
          adventurer,
          rewardSplit,
          events,
          durabilityLoss: {
            base: baseDurabilityLoss,
            fromEvents: eventDurabilityLoss,
            total: totalDurabilityLoss,
          },
          rewards: {
            base: {
              gold: baseGold,
              glory: baseGlory,
              experience: baseExp,
              warSoul: baseWarSoul,
            },
            guildShare: {
              gold: Math.floor(baseGold * (1 - adventurerShare)),
              glory: Math.floor(baseGlory * (1 - adventurerShare)),
            },
            adventurerShare: {
              gold: Math.floor(baseGold * adventurerShare),
              glory: Math.floor(baseGlory * adventurerShare),
            },
            totalWarSoul,
          },
          startTime: Date.now(),
        });
      }

      case 'update-balance': {
        const { quantityMultiplier, qualityShift, durationMultiplier } = data;
        
        return NextResponse.json({
          success: true,
          config: {
            quantityMultiplier: quantityMultiplier || 1,
            qualityShift: qualityShift || 0,
            durationMultiplier: durationMultiplier || 1,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
