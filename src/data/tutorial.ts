// Данные для системы туториала

export interface TutorialStep {
  id: string
  screen: string // На каком экране показывается
  target?: string // CSS селектор для подсветки
  title: string
  description: string
  icon?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string // Действие, которое нужно выполнить для продолжения
  highlightNav?: string // Подсветить пункт навигации
}

export const tutorialSteps: TutorialStep[] = [
  // Шаг 0: Приветствие
  {
    id: 'welcome',
    screen: 'forge',
    title: 'Добро пожаловать в SwordCraft!',
    description: 'Вы — владелец кузницы. Ваша задача: создавать легендарное оружие, нанимать работников и развивать своё дело. Давайте разберёмся с основами!',
    icon: '⚔️',
    position: 'center',
  },
  
  // Шаг 1: Ресурсы
  {
    id: 'resources_intro',
    screen: 'forge',
    target: '[data-tutorial="resources-bar"]',
    title: 'Ресурсы',
    description: 'В верхней части экрана отображаются ваши ресурсы: золото 💰 для найма и покупок, дерево 🪵 и камень 🪨 для строительства, железо ⚙️ и уголь 🔥 для крафта.',
    icon: '📦',
    position: 'bottom',
  },
  
  // Шаг 2: Навигация
  {
    id: 'navigation',
    screen: 'forge',
    target: '[data-tutorial="nav-workers"]',
    title: 'Навигация',
    description: 'Используйте меню слева для переключения между экранами. Сейчас перейдите в раздел "Рабочие" чтобы нанять первого помощника!',
    icon: '🗺️',
    position: 'right',
    highlightNav: 'workers',
  },
  
  // Шаг 3: Найм рабочего
  {
    id: 'hire_worker',
    screen: 'workers',
    target: '[data-tutorial="hire-apprentice"]',
    title: 'Найм рабочего',
    description: 'Ученик — самый дешёвый и универсальный работник. Нажмите "Нанять" чтобы взять первого помощника!',
    icon: '👤',
    position: 'left',
    action: 'hire_worker',
  },
  
  // Шаг 4: Назначение
  {
    id: 'assign_worker',
    screen: 'workers',
    target: '[data-tutorial="worker-card"]',
    title: 'Назначение на работу',
    description: 'Нажмите "Назначить" на карточке рабочего и выберите здание для работы. Специалисты работают эффективнее на своих специальностях!',
    icon: '📍',
    position: 'left',
  },
  
  // Шаг 5: Здания
  {
    id: 'buildings',
    screen: 'resources',
    target: '[data-tutorial="buildings-section"]',
    title: 'Производственные здания',
    description: 'Здания производят ресурсы автоматически. Эффективность зависит от назначенных рабочих. Найдите здание без работников и назначьте туда рабочего!',
    icon: '🏭',
    position: 'top',
  },
  
  // Шаг 6: Переработка
  {
    id: 'refining',
    screen: 'resources',
    target: '[data-tutorial="refining-section"]',
    title: 'Переработка ресурсов',
    description: 'В плавильне можно переплавлять руду в слитки. Слитки нужны для создания оружия. Попробуйте переплавить немного железа!',
    icon: '🔥',
    position: 'top',
  },
  
  // Шаг 7: Крафт
  {
    id: 'crafting',
    screen: 'forge',
    target: '[data-tutorial="recipe-card"]',
    title: 'Создание оружия',
    description: 'Выберите рецепт и нажмите "Крафтить" чтобы создать оружие. Качество зависит от мастерства ваших кузнецов!',
    icon: '⚒️',
    position: 'top',
  },
  
  // Шаг 8: Инвентарь
  {
    id: 'inventory',
    screen: 'forge',
    target: '[data-tutorial="inventory-tab"]',
    title: 'Инвентарь оружия',
    description: 'Готовое оружие попадает в инвентарь. Здесь можно продать его торговцам или сохранить для заказов.',
    icon: '🎒',
    position: 'bottom',
  },

  // §6.8 redesign: верстак — очередь и второй подрежим
  {
    id: 'workbench_tab',
    screen: 'forge',
    target: '[data-tutorial="workbench-main-tab"]',
    title: 'Вкладка «Верстак»',
    description:
      'Откройте верстак этой кнопкой в кузнице. Внутри — фильтры, компактный список клинков, карточка по центру, вкладки «Ремонт / Перековка» справа и общая очередь снизу.',
    icon: '🔧',
    position: 'bottom',
  },
  {
    id: 'workbench_overview',
    screen: 'forge',
    target: '[data-tutorial="workbench-group"]',
    title: 'Верстак и очередь',
    description:
      'Ремонт и перековка делят одну очередь: выберите клинок слева, настройте работу во вкладке справа, затем «Начать работу» в блоке очереди внизу. Прогресс — по полосе сегментов и панели этапов.',
    icon: '🔧',
    position: 'bottom',
  },
  {
    id: 'workbench_reforge_queue',
    screen: 'forge',
    target: '[data-tutorial="reforge-tab"]',
    title: 'Перековка в очередь',
    description:
      'Во вкладке «Перековка» добавляйте усиления в ту же очередь — исполнение по этапам идёт в одном потоке с ремонтом после «Начать работу».',
    icon: '⚒️',
    position: 'bottom',
  },
  
  // Шаг 9: Гильдия — заказы
  {
    id: 'guild',
    screen: 'guild',
    target: '[data-tutorial="orders-section"]',
    title: 'Заказы Гильдии',
    description:
      'NPC размещают заказы на оружие. Выполнение заказов даёт золото, славу и ценные награды. Рецепты и техники теперь покупаются во вкладке «Интендант» за репутацию ранга гильдии. Дальше — вкладка «Экспедиции»: миссии с тем же расчётом прогноза и договора, что и в брифинге миссии.',
    icon: '📜',
    position: 'top',
  },

  // Шаг 9b: Гильдия — экспедиции
  {
    id: 'guild_expeditions',
    screen: 'guild',
    target: '[data-tutorial="expeditions-tab"]',
    title: 'Экспедиции',
    description:
      'Здесь миссии для искателей: снабжение и залог в контракте оплачивает заказчик через гильдию — с вашего золота при отправке не списывается. Риск кузнеца — оружие (износ, потеря). Прогноз и тип договора (exploration / speed) совпадают с брифингом.',
    icon: '🗺️',
    position: 'bottom',
  },

  // Шаг 10: Заключение
  {
    id: 'final',
    screen: 'forge',
    title: 'Вы готовы!',
    description: 'Теперь вы знаете основы! Нанимайте рабочих, создавайте оружие, выполняйте заказы и развивайте свою кузницу. Удачи! 🎉',
    icon: '🏆',
    position: 'center',
  },
]

// Советы для загрузочного экрана
export const loadingTips = [
  'Специалисты работают на 30% эффективнее на своих специальностях',
  'Качество оружия зависит от мастерства кузнецов',
  'Выполняйте заказы Гильдии для получения славы и редких рецептов',
  'Уголь нужен для плавки руды — не забывайте о нём!',
  'Бронза создаётся из меди и олова в пропорции 2:1',
  'Рабочие автоматически уходят на отдых при истощении',
  'Продавайте излишки ресурсов в магазине на экране Ресурсы',
  'При увольнении рабочего возвращается 30% от стоимости найма',
  'Ремонт и перековка делят очередь верстака: план на «Перековке», запуск сессии на «Ремонте», этапы и таймер — для всего пакета',
  'Перековка тратит душу войны: усиление статов или рискованное пробуждение шрама; пункты можно ставить в очередь без отдельного «верстака» в инвентаре',
]

// Проверка условий для шагов
export function checkStepCondition(stepId: string, gameState: any): boolean {
  switch (stepId) {
    case 'hire_worker':
      return gameState.workers.length > 0
    case 'assign_worker':
      return gameState.workers.some((w: any) => w.assignment !== 'rest')
    default:
      return false
  }
}
