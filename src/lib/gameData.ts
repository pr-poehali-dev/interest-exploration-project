export type GameScreen = "main" | "game" | "map" | "diary" | "ending";

export type RoomId = "entrance" | "corridor" | "library" | "basement" | "chapel";

export type EndingId = "escape" | "consumed" | "enlightened" | "trapped" | "sacrifice";

export interface Room {
  id: RoomId;
  name: string;
  unlocked: boolean;
  visited: boolean;
  description: string;
  mapX: number;
  mapY: number;
  connections: RoomId[];
}

export interface Action {
  id: string;
  text: string;
  icon: string;
  condition?: (state: GameState) => boolean;
  effect: (state: GameState) => Partial<GameState> & { message: string; scare?: boolean };
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
  icon: string;
}

export interface ScareEvent {
  id: string;
  message: string;
  weight: number;
  condition?: (state: GameState) => boolean;
}

export interface GameState {
  currentRoom: RoomId;
  rooms: Record<RoomId, Room>;
  lightAttempts: number;
  hasExplored: boolean;
  listenedCount: number;
  mysteryTriggered: boolean;
  cabinetOpened: boolean;
  doorAttempts: number;
  hasKey: boolean;
  hasNote: boolean;
  shoutCount: number;
  tension: number;
  turnsInRoom: number;
  scaresCooldown: number;
  diaryEntries: DiaryEntry[];
  lastEnding: EndingId | null;
  endingsUnlocked: EndingId[];
  totalTurns: number;
}

export const INITIAL_ROOMS: Record<RoomId, Room> = {
  entrance: {
    id: "entrance",
    name: "Тёмная Комната",
    unlocked: true,
    visited: false,
    description: "Первая комната. Кромешная тьма. Здесь всё началось.",
    mapX: 50,
    mapY: 50,
    connections: ["corridor"],
  },
  corridor: {
    id: "corridor",
    name: "Коридор",
    unlocked: false,
    visited: false,
    description: "Длинный сырой коридор. Стены покрыты плесенью.",
    mapX: 75,
    mapY: 50,
    connections: ["entrance", "library", "basement"],
  },
  library: {
    id: "library",
    name: "Библиотека",
    unlocked: false,
    visited: false,
    description: "Тысячи сгнивших книг. Запах мертвых знаний.",
    mapX: 75,
    mapY: 25,
    connections: ["corridor", "chapel"],
  },
  basement: {
    id: "basement",
    name: "Подвал",
    unlocked: false,
    visited: false,
    description: "Самое глубокое место. Здесь не бывает света.",
    mapX: 75,
    mapY: 75,
    connections: ["corridor"],
  },
  chapel: {
    id: "chapel",
    name: "Часовня",
    unlocked: false,
    visited: false,
    description: "Забытый алтарь. Кому здесь молились?",
    mapX: 50,
    mapY: 15,
    connections: ["library"],
  },
};

export const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: "entry_1",
    title: "Запись I — Пробуждение",
    content: "Я не помню, как здесь оказался. Темнота полная, абсолютная. Воздух холодный и сырой. Кто-то запер меня здесь... или я сам зашёл? Память размыта как акварель под дождём.",
    unlocked: true,
    icon: "📓",
  },
  {
    id: "entry_2",
    title: "Запись II — Стены",
    content: "Нашёл старую записку за плинтусом. Кто-то написал одно слово: «УХОДИ». Чернила странного цвета. Не хочу думать о том, чем они написаны.",
    unlocked: false,
    icon: "📝",
  },
  {
    id: "entry_3",
    title: "Запись III — Шорохи",
    content: "Оно здесь. Я слышу его дыхание. Оно не спешит — знает, что я никуда не денусь. Или это просто мои нервы, разорванные темнотой? Нет. Я слышал имя. Моё имя.",
    unlocked: false,
    icon: "👁️",
  },
  {
    id: "entry_4",
    title: "Запись IV — Часовня",
    content: "В часовне стоит алтарь. На нём — книга без обложки. Страницы покрыты символами, которые я не могу прочитать. Но когда я смотрю на них слишком долго, они начинают двигаться.",
    unlocked: false,
    icon: "🕯️",
  },
  {
    id: "entry_5",
    title: "Запись V — Понимание",
    content: "Я понял. Это место — живое. Оно поглощает всех, кто заходит сюда. Не убивает — просто... переваривает. Медленно. Меня уже почти не осталось.",
    unlocked: false,
    icon: "🩸",
  },
];

// Случайные пугающие события
export const SCARE_EVENTS: ScareEvent[] = [
  {
    id: "whisper",
    message: "Вы слышите шёпот прямо у уха: «...иди глубже...»",
    weight: 3,
  },
  {
    id: "footstep",
    message: "Позади вас — чёткий звук шагов. Один. Другой. Тишина.",
    weight: 3,
  },
  {
    id: "cold",
    message: "Температура резко падает. Вы видите своё дыхание в темноте... но откуда здесь свет?",
    weight: 2,
  },
  {
    id: "touch",
    message: "Что-то коснулось вашего плеча. Когда вы обернулись — никого.",
    weight: 2,
  },
  {
    id: "laughter",
    message: "Тихий смех. Детский. Откуда-то снизу.",
    weight: 1,
    condition: (s) => s.currentRoom === "basement" || s.tension > 5,
  },
  {
    id: "name",
    message: "Кто-то произнёс ваше имя. Медленно. По слогам. Из стены.",
    weight: 2,
    condition: (s) => s.tension > 3,
  },
  {
    id: "mirror",
    message: "На секунду темноту прорезала вспышка. Вы увидели отражение. Оно смотрело не туда, куда смотрели вы.",
    weight: 1,
    condition: (s) => s.mysteryTriggered || s.tension > 4,
  },
  {
    id: "door_knock",
    message: "Три удара в дверь. С той стороны. Медленно. Тяжело.",
    weight: 2,
    condition: (s) => s.doorAttempts > 0,
  },
  {
    id: "writing",
    message: "На стене появились буквы. Они исчезли, когда вы моргнули. Успели прочитать: «НЕ ОГЛЯДЫВАЙСЯ».",
    weight: 1,
    condition: (s) => s.tension > 6,
  },
  {
    id: "scream_far",
    message: "Где-то очень далеко — крик. Человеческий. Обрывается.",
    weight: 2,
    condition: (s) => s.currentRoom !== "entrance",
  },
];

// Концовки
export const ENDINGS: Record<EndingId, { title: string; text: string; type: "good" | "bad" | "neutral" | "secret"; icon: string }> = {
  escape: {
    title: "ПОБЕГ",
    type: "good",
    icon: "🚪",
    text: "Вы нашли ключ, вы победили панику, вы вышли. Холодный ночной воздух ударил в лицо. Вы живы. Но каждую ночь, засыпая, вы слышите: «...мы ещё встретимся...»",
  },
  consumed: {
    title: "ПОГЛОЩЕНИЕ",
    type: "bad",
    icon: "🕳️",
    text: "Тьма победила. Вы перестали бороться — и тьма приняла вас. Вы всё ещё здесь. Просто теперь вы — часть стен. Часть шёпота. Часть того, что пугает следующих.",
  },
  enlightened: {
    title: "ПРОСВЕТЛЕНИЕ",
    type: "secret",
    icon: "👁️",
    text: "Вы поняли. Тьма — не враг. Она всегда была внутри вас. Вы видите теперь то, что скрыто от других. Выйти можно. Но зачем? Там, снаружи, уже ничего не осталось для вас.",
  },
  trapped: {
    title: "ЛОВУШКА",
    type: "bad",
    icon: "⛓️",
    text: "Дверь захлопнулась. Ключ исчез. Фонарик разбит. Вы сели на пол и ждёте. Прошли часы. Или годы. В этом месте время не имеет смысла.",
  },
  sacrifice: {
    title: "ЖЕРТВА",
    type: "neutral",
    icon: "🩸",
    text: "Вы оставили часть себя в этом месте. Буквально. Взамен — выход. Вы вышли другим человеком. Меньшим. Что-то важное осталось там, в темноте, навсегда.",
  },
};

// Логика получения случайного события
export function getRandomScare(state: GameState): ScareEvent | null {
  if (state.scaresCooldown > 0) return null;
  if (Math.random() > 0.35) return null;

  const eligible = SCARE_EVENTS.filter(
    (e) => !e.condition || e.condition(state)
  );
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const event of eligible) {
    rand -= event.weight;
    if (rand <= 0) return event;
  }
  return eligible[0];
}

// Начальное состояние игры
export function createInitialState(): GameState {
  return {
    currentRoom: "entrance",
    rooms: JSON.parse(JSON.stringify(INITIAL_ROOMS)),
    lightAttempts: 0,
    hasExplored: false,
    listenedCount: 0,
    mysteryTriggered: false,
    cabinetOpened: false,
    doorAttempts: 0,
    hasKey: false,
    hasNote: false,
    shoutCount: 0,
    tension: 0,
    turnsInRoom: 0,
    scaresCooldown: 0,
    diaryEntries: JSON.parse(JSON.stringify(INITIAL_DIARY)),
    lastEnding: null,
    endingsUnlocked: [],
    totalTurns: 0,
  };
}