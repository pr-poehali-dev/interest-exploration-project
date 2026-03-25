// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Screen = "main" | "game" | "craft" | "map" | "log";

export type BiomeId = "shallows" | "kelp" | "mushroom" | "grassy" | "abyss" | "lava";

export type ResourceId =
  | "titanium" | "quartz" | "copper" | "silver" | "gold"
  | "fiber_mesh" | "silicone" | "aerogel"
  | "acid_mushroom" | "coral_tube" | "sea_treader_poop"
  | "kyanite" | "nickel" | "uranium"
  | "alien_cell" | "precursor_key";

export type ItemId =
  | "knife" | "fins" | "rebreather" | "o2_tank" | "flashlight"
  | "seaglide" | "radiation_suit" | "depth_module"
  | "scanner" | "repair_tool" | "habitat_builder"
  | "prawn_suit" | "cyclops_frag";

export type CreatureId =
  | "peeper" | "reginald" | "crashfish" | "stalker"
  | "sandshark" | "blighter" | "warper"
  | "ghost_leviathan" | "reaper_leviathan" | "sea_emperor";

export interface Resource {
  id: ResourceId;
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface CraftRecipe {
  id: ItemId;
  name: string;
  icon: string;
  description: string;
  ingredients: Partial<Record<ResourceId, number>>;
  category: "tools" | "equipment" | "vehicles";
  depthRequired?: number;
}

export interface Biome {
  id: BiomeId;
  name: string;
  emoji: string;
  depth: number;
  description: string;
  atmosphere: string;
  color: string;
  resources: ResourceId[];
  creatures: CreatureId[];
  dangerLevel: number;
  unlocked: boolean;
  discovered: boolean;
  lore?: string;
}

export interface Creature {
  id: CreatureId;
  name: string;
  icon: string;
  description: string;
  danger: "passive" | "aggressive" | "leviathan";
  encountered: boolean;
}

export interface LogEntry {
  id: string;
  title: string;
  content: string;
  icon: string;
  unlocked: boolean;
}

export interface GameState {
  screen: Screen;
  oxygen: number;       // 0–100
  health: number;       // 0–100
  hunger: number;       // 0–100
  depth: number;        // текущая глубина погружения (м)
  maxDepth: number;     // max достигнутая
  currentBiome: BiomeId;
  inventory: Partial<Record<ResourceId, number>>;
  crafted: ItemId[];
  biomes: Record<BiomeId, Biome>;
  creatures: Record<CreatureId, Creature>;
  logEntries: LogEntry[];
  turn: number;
  events: string[];
  lastEvent: string;
  isUnderwater: boolean;
  day: number;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

export const RESOURCES: Record<ResourceId, Resource> = {
  titanium:       { id: "titanium",       name: "Титан",          icon: "🔩", rarity: "common"   },
  quartz:         { id: "quartz",         name: "Кварц",          icon: "💎", rarity: "common"   },
  copper:         { id: "copper",         name: "Медь",           icon: "🪙", rarity: "common"   },
  silver:         { id: "silver",         name: "Серебро",        icon: "⚪", rarity: "uncommon" },
  gold:           { id: "gold",           name: "Золото",         icon: "🟡", rarity: "rare"     },
  fiber_mesh:     { id: "fiber_mesh",     name: "Волокнистая сеть", icon: "🕸️", rarity: "common" },
  silicone:       { id: "silicone",       name: "Силикон",        icon: "🧪", rarity: "common"   },
  aerogel:        { id: "aerogel",        name: "Аэрогель",       icon: "🌫️", rarity: "uncommon" },
  acid_mushroom:  { id: "acid_mushroom",  name: "Кислотный гриб", icon: "🍄", rarity: "common"   },
  coral_tube:     { id: "coral_tube",     name: "Кораллы",        icon: "🌿", rarity: "uncommon" },
  sea_treader_poop:{ id: "sea_treader_poop", name: "Морские удобрения", icon: "💩", rarity: "uncommon" },
  kyanite:        { id: "kyanite",        name: "Кианит",         icon: "🔷", rarity: "rare"     },
  nickel:         { id: "nickel",         name: "Никель",         icon: "⬛", rarity: "rare"     },
  uranium:        { id: "uranium",        name: "Уран",           icon: "☢️", rarity: "rare"     },
  alien_cell:     { id: "alien_cell",     name: "Инопланетная клетка", icon: "👾", rarity: "legendary" },
  precursor_key:  { id: "precursor_key",  name: "Ключ предтеч",   icon: "🗝️", rarity: "legendary" },
};

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "knife",
    name: "Нож",
    icon: "🔪",
    description: "Базовый инструмент для выживания. Позволяет собирать образцы флоры.",
    ingredients: { titanium: 1, silicone: 1 },
    category: "tools",
  },
  {
    id: "fins",
    name: "Ласты",
    icon: "🦈",
    description: "Увеличивают скорость плавания. Необходимы для исследования.",
    ingredients: { silicone: 2 },
    category: "equipment",
  },
  {
    id: "o2_tank",
    name: "Кислородный баллон",
    icon: "🫧",
    description: "Расширенный резервуар кислорода. +50 сек под водой.",
    ingredients: { titanium: 2 },
    category: "equipment",
  },
  {
    id: "flashlight",
    name: "Фонарь",
    icon: "🔦",
    description: "Освещает тёмные глубины. Обязателен ниже 200м.",
    ingredients: { titanium: 1, copper: 1 },
    category: "tools",
  },
  {
    id: "rebreather",
    name: "Ребризер",
    icon: "😮‍💨",
    description: "Снижает расход кислорода на глубине.",
    ingredients: { fiber_mesh: 1, silver: 1 },
    category: "equipment",
  },
  {
    id: "scanner",
    name: "Сканер",
    icon: "📡",
    description: "Позволяет сканировать флору, фауну и фрагменты технологий.",
    ingredients: { titanium: 1, copper: 1, gold: 1 },
    category: "tools",
  },
  {
    id: "seaglide",
    name: "Морской планёр",
    icon: "🚀",
    description: "Высокоскоростной подводный движитель. Ускоряет перемещение втрое.",
    ingredients: { titanium: 1, copper: 2, fiber_mesh: 1, silicone: 1 },
    category: "vehicles",
  },
  {
    id: "radiation_suit",
    name: "Радиационный костюм",
    icon: "🧥",
    description: "Защищает от радиации в зоне разлома реактора Авроры.",
    ingredients: { fiber_mesh: 3, lead: 2 } as Partial<Record<ResourceId, number>>,
    category: "equipment",
  },
  {
    id: "depth_module",
    name: "Модуль глубины",
    icon: "⬇️",
    description: "Увеличивает допустимую глубину погружения на 100м.",
    ingredients: { titanium: 2, nickel: 1 },
    category: "equipment",
  },
  {
    id: "repair_tool",
    name: "Инструмент ремонта",
    icon: "🔧",
    description: "Ремонтирует повреждённое оборудование и части корабля.",
    ingredients: { silicone: 2, copper: 1 },
    category: "tools",
  },
  {
    id: "habitat_builder",
    name: "Строитель базы",
    icon: "🏗️",
    description: "Позволяет возводить подводные базы и модули.",
    ingredients: { titanium: 3, copper: 2, silicone: 1 },
    category: "tools",
  },
];

const BIOMES_INIT: Record<BiomeId, Biome> = {
  shallows: {
    id: "shallows",
    name: "Безопасные отмели",
    emoji: "🌊",
    depth: 0,
    description: "Кристально чистая вода. Яркие кораллы. Дружелюбная фауна — здесь безопасно начать исследование.",
    atmosphere: "Солнечный свет пронизывает воду, создавая живые переливающиеся узоры на белом песчаном дне.",
    color: "#0099bb",
    resources: ["titanium", "quartz", "copper", "fiber_mesh", "coral_tube"],
    creatures: ["peeper", "reginald", "crashfish", "stalker"],
    dangerLevel: 1,
    unlocked: true,
    discovered: false,
    lore: "Сектор 1. Уровень опасности минимальный. Температура воды: 22°C. Видимость: превосходная.",
  },
  kelp: {
    id: "kelp",
    name: "Лес ламинарий",
    emoji: "🌿",
    depth: 100,
    description: "Густые заросли гигантских водорослей уходят вверх сквозь толщу воды. Здесь водятся сталкеры.",
    atmosphere: "Высокие стебли создают мерцающий зелёный полог. Что-то движется в тени.",
    color: "#006644",
    resources: ["titanium", "copper", "silver", "fiber_mesh", "silicone", "acid_mushroom"],
    creatures: ["peeper", "stalker", "crashfish"],
    dangerLevel: 3,
    unlocked: false,
    discovered: false,
    lore: "Сектор 2. Внимание: агрессивная фауна. Рекомендуется наличие защитного снаряжения.",
  },
  mushroom: {
    id: "mushroom",
    name: "Грибной лес",
    emoji: "🍄",
    depth: 200,
    description: "Огромные светящиеся грибы высотой с дерево. Биолюминесценция делает этот биом одним из красивейших.",
    atmosphere: "Пурпурное свечение пульсирует в ритме невидимого сердца. Здесь чувствуется что-то... живое.",
    color: "#6622aa",
    resources: ["quartz", "silver", "gold", "acid_mushroom", "aerogel"],
    creatures: ["blighter", "sandshark", "warper"],
    dangerLevel: 5,
    unlocked: false,
    discovered: false,
    lore: "Сектор 4. Уровень биолюминесценции критический. Возможны галлюцинации у неподготовленных.",
  },
  grassy: {
    id: "grassy",
    name: "Травяные плато",
    emoji: "🌾",
    depth: 150,
    description: "Широкие открытые равнины с густой подводной растительностью. Место охоты жнецов-левиафанов.",
    atmosphere: "Спокойно. Слишком спокойно. Морская трава колышется в потоке. Что-то крупное рядом.",
    color: "#2a6644",
    resources: ["titanium", "quartz", "copper", "sea_treader_poop", "nickel"],
    creatures: ["sandshark", "blighter", "reaper_leviathan"],
    dangerLevel: 7,
    unlocked: false,
    discovered: false,
    lore: "Сектор 3. ВНИМАНИЕ: зафиксированы следы левиафана класса Жнец. Погружение не рекомендуется без транспортного средства.",
  },
  abyss: {
    id: "abyss",
    name: "Безмолвная Бездна",
    emoji: "🌑",
    depth: 900,
    description: "Здесь нет света. Нет звука. Только давление, тьма и существа, которые адаптировались к вечной ночи.",
    atmosphere: "Абсолютная темнота. Ваш фонарь — единственная точка света во вселенной. Что-то огромное движется вокруг.",
    color: "#030812",
    resources: ["kyanite", "uranium", "nickel", "alien_cell"],
    creatures: ["ghost_leviathan", "warper", "sea_emperor"],
    dangerLevel: 10,
    unlocked: false,
    discovered: false,
    lore: "Зона Икс. ДАННЫЕ ОГРАНИЧЕНЫ. Последний сигнал из этой зоны: «Они знают о нас.»",
  },
  lava: {
    id: "lava",
    name: "Лавовые пещеры",
    emoji: "🌋",
    depth: 1300,
    description: "Вулканические зоны с активными жерлами. Экстремальные температуры. Источник редчайших ресурсов.",
    atmosphere: "Оранжевое зарево лавы отражается в чёрной воде. Температура за бортом: 87°C. Давление критическое.",
    color: "#aa2200",
    resources: ["kyanite", "uranium", "gold", "precursor_key", "alien_cell"],
    creatures: ["sea_emperor", "ghost_leviathan"],
    dangerLevel: 10,
    unlocked: false,
    discovered: false,
    lore: "Сектор Омега. Именно здесь находится Первичная сдерживающая камера. Разгадка всего.",
  },
};

const CREATURES_INIT: Record<CreatureId, Creature> = {
  peeper:           { id: "peeper",           name: "Пипер",         icon: "🐟", description: "Маленькая любопытная рыбка с огромным глазом. Абсолютно безопасна и невероятно мила.", danger: "passive",    encountered: false },
  reginald:         { id: "reginald",         name: "Реджинальд",    icon: "🐠", description: "Плотная съедобная рыба. Отличный источник питания в условиях выживания.", danger: "passive",    encountered: false },
  crashfish:        { id: "crashfish",         name: "Краш-рыба",     icon: "💥", description: "При приближении раздувается и взрывается. Держите дистанцию.", danger: "aggressive", encountered: false },
  stalker:          { id: "stalker",           name: "Сталкер",       icon: "🦈", description: "Крупная хищная рыба. Охотится на движущиеся объекты. Притягивается к металлу.", danger: "aggressive", encountered: false },
  sandshark:        { id: "sandshark",         name: "Песчаная акула", icon: "🦈", description: "Зарывается в грунт и атакует снизу. Практически невидима на песке.", danger: "aggressive", encountered: false },
  blighter:         { id: "blighter",          name: "Гнилец",        icon: "👁️", description: "Слепое существо, охотящееся на звук. Двигайтесь медленно.", danger: "aggressive", encountered: false },
  warper:           { id: "warper",            name: "Искажатель",    icon: "🌀", description: "Создаёт телепортационные порталы. Атакует инфицированных. Происхождение — неизвестно.", danger: "aggressive", encountered: false },
  ghost_leviathan:  { id: "ghost_leviathan",   name: "Призрачный левиафан", icon: "👻", description: "Огромное полупрозрачное существо. Живёт в бездне. Одно из крупнейших существ на планете.", danger: "leviathan", encountered: false },
  reaper_leviathan: { id: "reaper_leviathan",  name: "Жнец-левиафан", icon: "🐲", description: "Apex-хищник. Длина до 55м. Захватывает жертву щупальцами. МАКСИМАЛЬНАЯ ОПАСНОСТЬ.", danger: "leviathan", encountered: false },
  sea_emperor:      { id: "sea_emperor",       name: "Морской Император", icon: "👑", description: "Древнейшее существо планеты. Мать всего. Не агрессивна — она за пределами концепции угрозы.", danger: "passive",   encountered: false },
};

const LOG_ENTRIES_INIT: LogEntry[] = [
  {
    id: "crash",
    title: "День 0 — Крушение",
    content: "Аврора разрушена. Причина неизвестна. Я единственный выживший в спасательном модуле 5. Планета 4546B. Вода везде. Начинаю оценку ситуации.",
    icon: "🚀",
    unlocked: true,
  },
  {
    id: "first_dive",
    title: "День 1 — Первое погружение",
    content: "Вода чистая. Видимость хорошая. Обнаружил залежи титана и кварца. Странная флора — биолюминесцентные существа реагируют на свет. Планета живая.",
    icon: "🌊",
    unlocked: false,
  },
  {
    id: "stalker",
    title: "Предупреждение — Фауна",
    content: "ОСТОРОЖНО: Встречены агрессивные существа класса «Сталкер». Атакуют при приближении. Рекомендую: нож, дистанция, не паниковать. Паника убивает.",
    icon: "⚠️",
    unlocked: false,
  },
  {
    id: "signal",
    title: "Сигнал — Аврора",
    content: "Принят сигнал с Авроры. Реактор нестабилен. Радиационный выброс неизбежен. Необходимо проникнуть на корабль для ремонта. Нужен радиационный костюм.",
    icon: "📻",
    unlocked: false,
  },
  {
    id: "disease",
    title: "Медицинский отчёт",
    content: "Обнаружена неизвестная бактерия — Бактерия Кэра. Передаётся через воду. Возможно, причина карантина планеты. Инфекция активна. Иммунная система борется.",
    icon: "🦠",
    unlocked: false,
  },
  {
    id: "precursors",
    title: "Находка — Предтечи",
    content: "Руины внеземной цивилизации. Они здесь были до нас. Технологии несопоставимы с нашими. Зачем они построили это? Почему ушли? Ключи от их баз... везде.",
    icon: "🛸",
    unlocked: false,
  },
  {
    id: "emperor",
    title: "Морской Император",
    content: "Существо разумно. Оно пытается общаться телепатически. Ему тысячи лет. Оно знает лекарство от болезни. Яйца. Мне нужно найти яйца.",
    icon: "👑",
    unlocked: false,
  },
];

// ─── INITIAL STATE ───────────────────────────────────────────────────────────

export function createGameState(): GameState {
  return {
    screen: "main",
    oxygen: 100,
    health: 100,
    hunger: 100,
    depth: 0,
    maxDepth: 0,
    currentBiome: "shallows",
    inventory: {},
    crafted: [],
    biomes: JSON.parse(JSON.stringify(BIOMES_INIT)),
    creatures: JSON.parse(JSON.stringify(CREATURES_INIT)),
    logEntries: JSON.parse(JSON.stringify(LOG_ENTRIES_INIT)),
    turn: 0,
    events: [],
    lastEvent: "",
    isUnderwater: false,
    day: 1,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function canCraft(recipe: CraftRecipe, inventory: Partial<Record<ResourceId, number>>): boolean {
  for (const [res, qty] of Object.entries(recipe.ingredients)) {
    if ((inventory[res as ResourceId] ?? 0) < (qty ?? 0)) return false;
  }
  return true;
}

export function getTotalItems(inventory: Partial<Record<ResourceId, number>>): number {
  return Object.values(inventory).reduce((s, v) => s + (v ?? 0), 0);
}

// Случайный ресурс из биома
export function rollResources(biome: Biome): { resource: ResourceId; amount: number }[] {
  const found: { resource: ResourceId; amount: number }[] = [];
  const pool = biome.resources;
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const res = pool[Math.floor(Math.random() * pool.length)];
    const existing = found.find((f) => f.resource === res);
    if (existing) existing.amount++;
    else found.push({ resource: res, amount: 1 });
  }
  return found;
}

// Случайное существо из биома
export function rollCreature(biome: Biome): CreatureId | null {
  if (Math.random() > 0.5) return null;
  return biome.creatures[Math.floor(Math.random() * biome.creatures.length)];
}

// Расчёт урона от существа
export function creatureDamage(creature: Creature, hasKnife: boolean): number {
  const base = creature.danger === "passive" ? 0 : creature.danger === "aggressive" ? 15 : 40;
  return hasKnife && creature.danger !== "leviathan" ? Math.floor(base * 0.5) : base;
}

// Расход кислорода за ход (зависит от глубины и снаряжения)
export function oxygenCostPerTurn(depth: number, hasRebreather: boolean): number {
  const base = depth > 500 ? 25 : depth > 200 ? 15 : depth > 50 ? 10 : 5;
  return hasRebreather ? Math.floor(base * 0.6) : base;
}

export { BIOMES_INIT, CREATURES_INIT, LOG_ENTRIES_INIT };
