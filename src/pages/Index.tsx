import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  GameScreen as GameScreenType,
  GameState,
  EndingId,
  RoomId,
  ENDINGS,
  createInitialState,
  getRandomScare,
} from "@/lib/gameData";

// ─────────────── HELPERS ───────────────
function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─────────────── MAIN APP ───────────────
export default function Index() {
  const [screen, setScreen] = useState<GameScreenType>("main");
  const [state, setState] = useState<GameState>(createInitialState());
  const [message, setMessage] = useState("");
  const [scareMsg, setScareMsg] = useState("");
  const [showScare, setShowScare] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [ending, setEnding] = useState<EndingId | null>(null);


  // Показать пугающее событие
  const triggerScare = useCallback((msg: string) => {
    setScareMsg(msg);
    setShowScare(true);
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 600);
    setTimeout(() => setShowScare(false), 3500);
  }, []);

  // Обновить состояние + проверить случайный испуг
  const updateState = useCallback(
    (patch: Partial<GameState>, msg: string, forceScare?: string) => {
      setState((prev) => {
        const next: GameState = {
          ...prev,
          ...patch,
          tension: (prev.tension || 0) + 1,
          totalTurns: (prev.totalTurns || 0) + 1,
          scaresCooldown: Math.max(0, (prev.scaresCooldown || 0) - 1),
        };
        const scare = forceScare || getRandomScare(next)?.message;
        if (scare) {
          next.scaresCooldown = 2;
          setTimeout(() => triggerScare(scare), 800);
        }
        return next;
      });
      setIsRevealing(true);
      setMessage(msg);
      setTimeout(() => setIsRevealing(false), 100);
    },
    [triggerScare]
  );

  // Разблокировать запись дневника
  const unlockDiary = useCallback((entryId: string) => {
    setState((prev) => ({
      ...prev,
      diaryEntries: prev.diaryEntries.map((e) =>
        e.id === entryId ? { ...e, unlocked: true } : e
      ),
    }));
  }, []);

  // Запустить концовку
  const triggerEnding = useCallback(
    (id: EndingId) => {
      setState((prev) => ({
        ...prev,
        lastEnding: id,
        endingsUnlocked: prev.endingsUnlocked.includes(id)
          ? prev.endingsUnlocked
          : [...prev.endingsUnlocked, id],
      }));
      setEnding(id);
      setScreen("ending");
    },
    []
  );

  // Сброс игры
  const resetGame = useCallback(() => {
    const fresh = createInitialState();
    setState((prev) => ({
      ...fresh,
      endingsUnlocked: prev.endingsUnlocked,
      lastEnding: prev.lastEnding,
    }));
    setMessage("");
    setEnding(null);
    setScreen("main");
  }, []);

  // ─── ACTIONS ───
  const actions = {
    explore: () => {
      if (state.hasExplored) {
        updateState({}, "Вы снова ощупываете стены. Шкаф. Дверь. Тряпка на полу. Всё на месте. Всё такое же холодное.");
        return;
      }
      const newRooms = { ...state.rooms };
      updateState(
        { hasExplored: true, rooms: newRooms },
        "Вы движетесь вдоль стен, касаясь шершавой поверхности. Находите: старый выключатель, массивный деревянный шкаф с резными ручками, металлическую дверь без наружной ручки — только защёлка. На полу — тряпичный комок. Вы нащупали плотную ткань."
      );
      unlockDiary("entry_2");
    },

    lightSwitch: () => {
      const attempts = state.lightAttempts + 1;
      let msg = "";
      let scare: string | undefined;
      if (attempts === 1) msg = "Вы нащупали выключатель и щёлкнули им. Ничего. Свет не зажигается. Электричества нет.";
      else if (attempts === 2) msg = "Снова щёлкаете. Несколько раз. Тишина. Мрак остаётся непоколебимым.";
      else if (attempts === 3) msg = "Слабое потрескивание. Но света нет. Кажется, проводка повреждена — или что-то специально обесточило это место.";
      else {
        msg = "Вы смирились. Выключатель лишь издаёт сухой щелчок. Темнота сгущается, становится почти осязаемой.";
        if (!state.mysteryTriggered) scare = "Чья-то рука легла на ваше плечо. Когда вы обернулись — никого.";
      }
      updateState(
        { lightAttempts: attempts, mysteryTriggered: attempts >= 4 || state.mysteryTriggered },
        msg,
        scare
      );
    },

    listen: () => {
      const count = state.listenedCount + 1;
      let msg = "";
      let scare: string | undefined;
      if (count === 1) {
        msg = "Вы замираете, вслушиваетесь. Полная тишина... затем — едва различимая капель где-то очень далеко. И эхо вашего дыхания.";
      } else if (count === 2) {
        msg = "Вы затаили дыхание. Приглушённый шорох в углу. Что-то движется. Или это мышь? Ваше сердце бьётся чаще.";
        if (!state.mysteryTriggered) {
          scare = "По коже пробежал холодок. Кажется, вы не одни.";
        }
        unlockDiary("entry_3");
      } else if (count === 3) {
        msg = "Мертвая тишина. Но вам упорно кажется, что чьё-то присутствие наблюдает из темноты.";
        scare = "Шёпот. «...не слушай...»";
      } else {
        msg = "Вы слышите только биение собственного сердца. Оно звучит... не совсем правильно. Ритм изменился.";
      }
      updateState(
        {
          listenedCount: count,
          mysteryTriggered: count >= 2 || state.mysteryTriggered,
        },
        msg,
        scare
      );
    },

    openDoor: () => {
      const attempts = state.doorAttempts + 1;
      let msg = "";
      let scare: string | undefined;

      if (!state.hasExplored) {
        msg = "Вы шарите руками в темноте. Долго. Наконец — холодная металлическая поверхность. Дверь. Заперта. Без ручки снаружи.";
      } else if (state.hasKey) {
        // Разблокировать коридор и перейти туда
        const newRooms = { ...state.rooms };
        newRooms.corridor = { ...newRooms.corridor, unlocked: true };
        updateState(
          { rooms: newRooms, currentRoom: "corridor" },
          "Ключ подошёл. Дверь открылась с протяжным скрипом. Перед вами — тёмный коридор. Вы сделали первый шаг."
        );
        setScreen("game");
        // Проверка концовки — если много напряжения
        if (state.tension > 15 && state.mysteryTriggered) {
          setTimeout(() => triggerEnding("sacrifice"), 2000);
        } else {
          setTimeout(() => triggerEnding("escape"), 2000);
        }
        return;
      } else if (attempts === 1) {
        msg = "Вы подходите к металлической двери. Толкаете — не поддаётся. Дергаете — заперто. Вы чувствуете углубление под пальцами. Нужен ключ.";
      } else if (attempts >= 2 && attempts < 4) {
        msg = "Снова пробуете дверь. Металл холодный и неподвижный. Она не откроется без ключа.";
        if (state.mysteryTriggered && state.listenedCount >= 2) {
          scare = "Из-за двери — приглушённый стук. Медленный. Тяжёлый.";
        }
      } else {
        msg = "Дверь не поддаётся. Вы начинаете терять надежду. Нужно искать ключ — где-то в этой тьме.";
        if (!state.mysteryTriggered) {
          scare = "Царапание. С другой стороны двери.";
        }
      }
      updateState({ doorAttempts: attempts, hasExplored: true }, msg, scare);
    },

    openCabinet: () => {
      if (!state.hasExplored) {
        updateState({}, "Вы ещё не нашли шкаф. Осмотритесь сначала.");
        return;
      }
      if (state.cabinetOpened) {
        updateState({}, "Шкаф открыт. Пусто. Только запах нафталина и старой древесины.");
        return;
      }
      let msg = "Вы тянете дверцу — протяжный скрип. Пахнет нафталином. На ощупь — старый фонарик!";
      let hasKey = state.hasKey;

      if (state.lightAttempts > 2) {
        msg += " Нажимаете кнопку — не работает. Батарейки сели.";
      } else {
        msg += " Вы нажимаете кнопку — тусклый луч! Вы успеваете разглядеть царапины на стене... и маленький ключ, висящий на гвозде. Лампа гаснет. Но ключ — в ваших руках.";
        hasKey = true;
      }

      if (!hasKey) {
        msg += " Ещё раз ощупываете шкаф. Ничего. Больше там нет.";
      }

      msg += " Шкаф пуст.";

      let scare: string | undefined;
      if (!state.mysteryTriggered && state.listenedCount >= 1) {
        scare = "Когда вы закрыли шкаф, вы услышали шёпот за спиной: «...отойди...»";
      }

      updateState({ cabinetOpened: true, hasKey }, msg, scare);

      if (!state.diaryEntries.find((e) => e.id === "entry_4")?.unlocked) {
        unlockDiary("entry_4");
      }
    },

    shout: () => {
      const count = state.shoutCount + 1;
      let msg = "";
      let scare: string | undefined;

      if (count === 1) {
        msg = "Вы кричите: «Есть кто-нибудь?!» Голос разбивается о стены. Тишина.";
        if (state.mysteryTriggered) {
          scare = "Из угла донеслось тихое: «...тише...»";
        }
      } else if (count === 2) {
        msg = "Вы кричите снова, громче. Эхо возвращается... немного другим. Искажённым.";
        scare = "Ваш собственный голос ответил вам. Но сказал не то, что вы кричали.";
      } else {
        msg = "Вы больше не кричите. Горло пересохло. И вы понимаете — кричать здесь не стоит. Это может их привлечь.";
        if (!state.mysteryTriggered) {
          scare = "Что-то шевельнулось в темноте. Крупное.";
        }
        unlockDiary("entry_5");
      }

      updateState({ shoutCount: count, mysteryTriggered: count >= 2 || state.mysteryTriggered }, msg, scare);
    },

    // Для коридора — попасть в другие комнаты
    moveToRoom: (roomId: RoomId) => {
      const newRooms = { ...state.rooms };
      newRooms[roomId] = { ...newRooms[roomId], visited: true, unlocked: true };

      // Разблокировать связанные комнаты
      if (roomId === "corridor") {
        newRooms.library = { ...newRooms.library, unlocked: true };
        newRooms.basement = { ...newRooms.basement, unlocked: true };
      }
      if (roomId === "library") {
        newRooms.chapel = { ...newRooms.chapel, unlocked: true };
      }

      const roomNames: Record<RoomId, string> = {
        entrance: "Тёмная Комнату",
        corridor: "Коридор",
        library: "Библиотеку",
        basement: "Подвал",
        chapel: "Часовню",
      };

      const roomDescriptions: Record<RoomId, string> = {
        entrance: "Вы возвращаетесь в тёмную комнату. Знакомый холод обнимает вас.",
        corridor: "Длинный сырой коридор. Капель с потолка. Стены в плесени. Запах гнили.",
        library: "Тысячи томов. Сгнивших. Страницы рассыпаются от прикосновения. На одной — читаемая надпись: «Они всегда были здесь».",
        basement: "Ступени вниз. Ещё холоднее. Здесь пахнет чем-то металлическим. Кровью? Ржавчиной?",
        chapel: "Алтарь. Свечи давно погасли. Но воск ещё тёплый — кто-то был здесь недавно.",
      };

      let scare: string | undefined;
      if (roomId === "basement") scare = "Что-то в темноте произнесло ваше имя.";
      if (roomId === "chapel" && state.tension > 8) scare = "На алтаре лежит фотография. Это вы. Но откуда?";

      if (roomId === "chapel" && !state.diaryEntries.find((e) => e.id === "entry_4")?.unlocked) {
        unlockDiary("entry_4");
      }

      // Особая концовка в подвале при высоком напряжении
      if (roomId === "basement" && state.tension > 12 && state.mysteryTriggered) {
        setTimeout(() => triggerEnding("consumed"), 2000);
        return;
      }

      // Просветление в часовне при большом количестве прослушиваний
      if (roomId === "chapel" && state.listenedCount >= 3) {
        setTimeout(() => triggerEnding("enlightened"), 2000);
        return;
      }

      updateState(
        { currentRoom: roomId, rooms: newRooms, turnsInRoom: 0 },
        `Вы входите в ${roomNames[roomId]}. ${roomDescriptions[roomId]}`,
        scare
      );
    },
  };

  const unlockedDiaryCount = state.diaryEntries.filter((e) => e.unlocked).length;

  // ─────────────── SCREENS ───────────────

  if (screen === "ending" && ending) {
    return <EndingScreen ending={ending} state={state} onRestart={resetGame} onMenu={() => setScreen("main")} />;
  }

  return (
    <div className={cn("scanlines noise min-h-screen bg-coal flex flex-col", shakeScreen && "animate-shake")}>
      {/* Scare overlay */}
      {showScare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 border border-blood rounded px-6 py-4 max-w-sm text-center animate-scale-in">
            <p className="font-cormorant text-blood-light text-lg italic leading-relaxed">{scareMsg}</p>
          </div>
        </div>
      )}

      {screen === "main" && (
        <MainScreen
          onStart={() => { setState(createInitialState()); setMessage(""); setScreen("game"); }}
          endingsUnlocked={state.endingsUnlocked}
          onShowDiary={() => setScreen("diary")}
          onShowMap={() => setScreen("map")}
        />
      )}

      {screen === "game" && (
        <GameScreen
          state={state}
          message={message}
          isRevealing={isRevealing}
          actions={actions}
          onMenu={() => setScreen("main")}
          onMap={() => setScreen("map")}
          onDiary={() => setScreen("diary")}
          unlockedDiaryCount={unlockedDiaryCount}
          onTrapEnding={() => triggerEnding("trapped")}
        />
      )}

      {screen === "map" && (
        <MapScreen state={state} onBack={() => setScreen("game")} onRoom={actions.moveToRoom} />
      )}

      {screen === "diary" && (
        <DiaryScreen entries={state.diaryEntries} onBack={() => setScreen(state.totalTurns > 0 ? "game" : "main")} />
      )}
    </div>
  );
}

// ─────────────── MAIN SCREEN ───────────────
function MainScreen({
  onStart, endingsUnlocked, onShowDiary, onShowMap,
}: {
  onStart: () => void;
  endingsUnlocked: EndingId[];
  onShowDiary: () => void;
  onShowMap: () => void;
}) {
  const [titleGlitch, setTitleGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleGlitch(true);
      setTimeout(() => setTitleGlitch(false), 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-radial from-rust/10 via-coal to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-blood opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-blood opacity-30" />

      {/* Blood drips decoration */}
      <div className="absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-blood to-transparent opacity-60" />
      <div className="absolute top-0 left-2/3 w-px h-24 bg-gradient-to-b from-blood to-transparent opacity-40" />
      <div className="absolute top-0 right-1/4 w-px h-12 bg-gradient-to-b from-blood to-transparent opacity-50" />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Skull icon */}
        <div className="text-5xl mb-6 animate-flicker">💀</div>

        {/* Title */}
        <h1
          className={cn(
            "font-oswald text-6xl md:text-7xl font-bold uppercase tracking-widest mb-2 glow-red",
            titleGlitch && "animate-glitch"
          )}
          style={{ color: "#c0392b" }}
        >
          Тёмная
        </h1>
        <h2 className="font-oswald text-4xl md:text-5xl font-light uppercase tracking-[0.3em] mb-1" style={{ color: "#8b1a1a" }}>
          Комната
        </h2>
        <p className="font-cormorant italic text-bone/50 text-sm tracking-widest mb-12">
          игра-исследование · ретро-хоррор
        </p>

        {/* Start button */}
        <button
          onClick={onStart}
          className="horror-btn w-full max-w-xs mx-auto block py-4 px-8 bg-blood hover:bg-blood-light text-white font-oswald text-xl tracking-widest uppercase rounded-sm border border-blood-light/30 transition-all duration-200 animate-pulse-red mb-4"
        >
          ⬤ Войти во тьму
        </button>

        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={onShowDiary}
            className="horror-btn py-2 px-5 bg-ash hover:bg-rust text-bone/70 hover:text-bone font-oswald text-sm tracking-wider uppercase rounded-sm border border-blood/20 transition-all"
          >
            📓 Дневник
          </button>
          <button
            onClick={onShowMap}
            className="horror-btn py-2 px-5 bg-ash hover:bg-rust text-bone/70 hover:text-bone font-oswald text-sm tracking-wider uppercase rounded-sm border border-blood/20 transition-all"
          >
            🗺️ Карта
          </button>
        </div>

        {/* Endings unlocked */}
        {endingsUnlocked.length > 0 && (
          <div className="mt-8 border border-blood/20 rounded-sm p-4 bg-ash/50">
            <p className="font-oswald text-xs text-muted-foreground uppercase tracking-widest mb-2">Концовки открыты</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {endingsUnlocked.map((id) => (
                <span key={id} className="text-xl" title={ENDINGS[id].title}>
                  {ENDINGS[id].icon}
                </span>
              ))}
              <span className="font-cormorant text-muted-foreground/60 text-sm self-center ml-1">
                {endingsUnlocked.length}/5
              </span>
            </div>
          </div>
        )}

        <p className="mt-8 font-cormorant italic text-muted-foreground/40 text-xs">
          каждое действие имеет последствия
        </p>
      </div>
    </div>
  );
}

// ─────────────── GAME SCREEN ───────────────
function GameScreen({
  state, message, isRevealing, actions, onMenu, onMap, onDiary, unlockedDiaryCount, onTrapEnding,
}: {
  state: GameState;
  message: string;
  isRevealing: boolean;
  actions: Record<string, (...args: RoomId[]) => void>;
  onMenu: () => void;
  onMap: () => void;
  onDiary: () => void;
  unlockedDiaryCount: number;
  onTrapEnding: () => void;
}) {
  const room = state.rooms[state.currentRoom];
  const isEntrance = state.currentRoom === "entrance";

  const tensionLevel =
    state.tension < 5 ? "low" : state.tension < 10 ? "medium" : state.tension < 15 ? "high" : "extreme";

  const tensionColors = {
    low: "text-bone/50",
    medium: "text-amber-700",
    high: "text-blood-light",
    extreme: "text-blood glow-red animate-flicker",
  };

  // Статус персонажа
  const statusText = () => {
    if (state.mysteryTriggered && state.tension > 12) return "ПАНИКА";
    if (state.mysteryTriggered) return "НАПРЯЖЁН";
    if (state.hasExplored) return "ОРИЕНТИРУЕТСЯ";
    return "В ТЕМНОТЕ";
  };

  const displayMessage = message || (isEntrance
    ? "Мерцание. Мир растворяется. Вы открываете глаза — вокруг непроглядная чернота. Вы стоите в центре холодной, тёмной комнаты. Где вы? Как вы здесь оказались?"
    : `Вы в ${room.name}. ${room.description}`);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="border-b border-blood/30 bg-charcoal/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onMenu} className="text-muted-foreground hover:text-bone transition-colors">
              <Icon name="ChevronLeft" size={18} />
            </button>
            <div>
              <h2 className="font-oswald text-blood-light uppercase tracking-wider text-base leading-tight">
                {room.name}
              </h2>
              <span className={cn("font-oswald text-xs tracking-widest", tensionColors[tensionLevel])}>
                ● {statusText()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.hasKey && (
              <span className="text-sm" title="У вас есть ключ">🗝️</span>
            )}
            <button
              onClick={onDiary}
              className="relative px-3 py-1.5 text-xs font-oswald uppercase tracking-wider text-bone/60 hover:text-bone border border-blood/20 hover:border-blood/50 rounded-sm transition-all"
            >
              📓
              {unlockedDiaryCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blood text-white text-xs rounded-full flex items-center justify-center font-oswald">
                  {unlockedDiaryCount}
                </span>
              )}
            </button>
            <button
              onClick={onMap}
              className="px-3 py-1.5 text-xs font-oswald uppercase tracking-wider text-bone/60 hover:text-bone border border-blood/20 hover:border-blood/50 rounded-sm transition-all"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Tension bar */}
        <div className="h-0.5 bg-charcoal">
          <div
            className="h-full bg-gradient-to-r from-blood-dark to-blood-light transition-all duration-1000"
            style={{ width: `${Math.min(100, (state.tension / 20) * 100)}%` }}
          />
        </div>
      </header>

      {/* Story panel */}
      <main className="flex-1 px-6 py-8 min-h-48">
        <div
          className={cn(
            "font-cormorant text-lg md:text-xl leading-relaxed text-bone/90",
            isRevealing && "animate-horror-reveal"
          )}
        >
          <span className="text-blood-light font-bold mr-2">▶</span>
          <span dangerouslySetInnerHTML={{ __html: displayMessage }} />
        </div>

        {/* Mystery indicator */}
        {state.mysteryTriggered && (
          <div className="mt-6 flex items-center gap-2 text-blood/70 animate-flicker">
            <span className="text-xs font-oswald tracking-widest uppercase">Присутствие ощущается</span>
            <span className="text-xs animate-blink">●</span>
          </div>
        )}
      </main>

      {/* Actions */}
      <footer className="border-t border-blood/20 px-4 py-5 bg-charcoal/60">
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Entrance actions */}
          {isEntrance && (
            <>
              <ActionBtn onClick={actions.explore} icon="🔦">Осмотреться</ActionBtn>
              <ActionBtn onClick={actions.lightSwitch} icon="💡">Выключатель</ActionBtn>
              <ActionBtn onClick={actions.listen} icon="👂">Прислушаться</ActionBtn>
              <ActionBtn onClick={actions.openDoor} icon="🚪">Дверь</ActionBtn>
              {state.hasExplored && (
                <ActionBtn onClick={actions.openCabinet} icon="🗄️">Шкаф</ActionBtn>
              )}
              <ActionBtn onClick={actions.shout} icon="📢">Крикнуть</ActionBtn>
              {state.tension > 10 && !state.hasKey && (
                <ActionBtn
                  onClick={onTrapEnding}
                  icon="🌀"
                  danger
                >
                  Сдаться тьме
                </ActionBtn>
              )}
            </>
          )}

          {/* Other rooms */}
          {!isEntrance && (
            <>
              <ActionBtn onClick={actions.listen} icon="👂">Прислушаться</ActionBtn>
              <ActionBtn onClick={actions.shout} icon="📢">Крикнуть</ActionBtn>
              {/* Move between connected rooms */}
              {room.connections.map((connId) => {
                const conn = state.rooms[connId];
                if (!conn.unlocked) return null;
                const roomEmojis: Record<RoomId, string> = {
                  entrance: "🚪", corridor: "🌑", library: "📚", basement: "⬇️", chapel: "🕯️",
                };
                return (
                  <ActionBtn key={connId} onClick={() => actions.moveToRoom(connId)} icon={roomEmojis[connId]}>
                    {conn.name}
                  </ActionBtn>
                );
              })}
            </>
          )}

          <ActionBtn onClick={onMenu} icon="↩" muted>Меню</ActionBtn>
        </div>
      </footer>
    </div>
  );
}

function ActionBtn({
  children, onClick, icon, danger, muted,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: string;
  danger?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "horror-btn py-2 px-4 rounded-sm font-oswald text-sm tracking-wider uppercase transition-all border",
        danger
          ? "bg-blood/20 border-blood hover:bg-blood/40 text-blood-light"
          : muted
          ? "bg-transparent border-blood/10 hover:border-blood/30 text-muted-foreground hover:text-bone"
          : "bg-ash hover:bg-rust border-blood/30 hover:border-blood/60 text-bone"
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </button>
  );
}

// ─────────────── MAP SCREEN ───────────────
function MapScreen({
  state, onBack, onRoom,
}: {
  state: GameState;
  onBack: () => void;
  onRoom: (id: RoomId) => void;
}) {
  const rooms = state.rooms;

  const roomPositions: Record<RoomId, { x: number; y: number }> = {
    entrance: { x: 50, y: 60 },
    corridor: { x: 70, y: 60 },
    library: { x: 70, y: 30 },
    basement: { x: 70, y: 88 },
    chapel: { x: 50, y: 12 },
  };

  const connections: [RoomId, RoomId][] = [
    ["entrance", "corridor"],
    ["corridor", "library"],
    ["corridor", "basement"],
    ["library", "chapel"],
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto w-full">
      <header className="border-b border-blood/30 bg-charcoal/80 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack} className="text-muted-foreground hover:text-bone transition-colors">
          <Icon name="ChevronLeft" size={18} />
        </button>
        <h2 className="font-oswald text-blood-light uppercase tracking-wider">Карта</h2>
        <span className="font-cormorant italic text-muted-foreground/60 text-sm ml-2">— клетка за клеткой</span>
      </header>

      <main className="flex-1 p-6">
        {/* SVG Map */}
        <div className="relative w-full bg-charcoal/40 border border-blood/20 rounded-sm overflow-hidden" style={{ paddingBottom: "70%" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connection lines */}
            {connections.map(([a, b]) => {
              const posA = roomPositions[a];
              const posB = roomPositions[b];
              const bothUnlocked = rooms[a].unlocked && rooms[b].unlocked;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={posA.x} y1={posA.y}
                  x2={posB.x} y2={posB.y}
                  stroke={bothUnlocked ? "#8b0000" : "#2a1a1a"}
                  strokeWidth="0.5"
                  strokeDasharray={bothUnlocked ? "none" : "2,2"}
                />
              );
            })}
          </svg>

          {/* Room nodes */}
          {(Object.entries(roomPositions) as [RoomId, { x: number; y: number }][]).map(([id, pos]) => {
            const room = rooms[id];
            const isCurrent = state.currentRoom === id;
            const isLocked = !room.unlocked;

            return (
              <button
                key={id}
                onClick={() => room.unlocked && state.totalTurns > 0 ? onRoom(id) : undefined}
                disabled={isLocked || state.totalTurns === 0}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all",
                  isLocked ? "opacity-30 cursor-not-allowed" : "hover:scale-110 cursor-pointer"
                )}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-sm border flex items-center justify-center text-lg transition-all",
                    isCurrent
                      ? "bg-blood border-blood-light animate-pulse-red"
                      : room.visited
                      ? "bg-ash border-blood/40"
                      : room.unlocked
                      ? "bg-charcoal border-blood/20"
                      : "bg-coal border-rust/20"
                  )}
                >
                  {isLocked ? "?" : room.visited ? "✓" : "○"}
                </div>
                <p
                  className={cn(
                    "font-oswald text-xs uppercase tracking-wide mt-1 text-center whitespace-nowrap",
                    isCurrent ? "text-blood-light" : "text-muted-foreground"
                  )}
                >
                  {isLocked ? "???" : room.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Room list */}
        <div className="mt-6 space-y-2">
          {(Object.values(state.rooms) as typeof state.rooms[RoomId][]).map((room) => (
            <div
              key={room.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border rounded-sm transition-all",
                !room.unlocked
                  ? "border-rust/10 bg-coal opacity-40"
                  : state.currentRoom === room.id
                  ? "border-blood bg-blood/10"
                  : room.visited
                  ? "border-blood/20 bg-ash/30"
                  : "border-blood/10 bg-charcoal/30"
              )}
            >
              <span className="text-xl">{!room.unlocked ? "🔒" : room.visited ? "✅" : "○"}</span>
              <div>
                <p className={cn("font-oswald text-sm uppercase tracking-wider", !room.unlocked ? "text-muted-foreground/30" : "text-bone")}>
                  {room.unlocked ? room.name : "НЕИЗВЕСТНО"}
                </p>
                {room.unlocked && (
                  <p className="font-cormorant text-xs text-muted-foreground italic">{room.description}</p>
                )}
              </div>
              {state.currentRoom === room.id && (
                <span className="ml-auto text-blood-light text-xs font-oswald animate-blink">● ЗДЕСЬ</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─────────────── DIARY SCREEN ───────────────
function DiaryScreen({ entries, onBack }: { entries: GameState["diaryEntries"]; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedEntry = entries.find((e) => e.id === selected);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto w-full">
      <header className="border-b border-blood/30 bg-charcoal/80 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={selected ? () => setSelected(null) : onBack}
          className="text-muted-foreground hover:text-bone transition-colors"
        >
          <Icon name="ChevronLeft" size={18} />
        </button>
        <h2 className="font-oswald text-blood-light uppercase tracking-wider">
          {selected ? selectedEntry?.title : "Дневник"}
        </h2>
        <span className="ml-auto font-cormorant italic text-muted-foreground/50 text-sm">
          {entries.filter((e) => e.unlocked).length}/{entries.length} записей
        </span>
      </header>

      <main className="flex-1 p-6">
        {!selected ? (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => entry.unlocked && setSelected(entry.id)}
                disabled={!entry.unlocked}
                className={cn(
                  "w-full text-left px-4 py-4 border rounded-sm transition-all",
                  entry.unlocked
                    ? "border-blood/30 bg-ash/30 hover:bg-ash/60 hover:border-blood/60 cursor-pointer"
                    : "border-rust/10 bg-coal/50 opacity-40 cursor-not-allowed"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.unlocked ? entry.icon : "🔒"}</span>
                  <div>
                    <p className={cn("font-oswald text-sm uppercase tracking-wider", entry.unlocked ? "text-bone" : "text-muted-foreground/30")}>
                      {entry.unlocked ? entry.title : "ЗАПИСЬ ЗАБЛОКИРОВАНА"}
                    </p>
                    {entry.unlocked && (
                      <p className="font-cormorant text-xs text-muted-foreground italic mt-0.5 line-clamp-1">
                        {entry.content.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                  {entry.unlocked && (
                    <Icon name="ChevronRight" size={14} className="ml-auto text-blood/50" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : selectedEntry ? (
          <div className="animate-fade-in-up">
            <div className="text-4xl mb-6 text-center">{selectedEntry.icon}</div>
            <div className="border-l-2 border-blood pl-6">
              <h3 className="font-oswald text-xl text-blood-light uppercase tracking-wider mb-4">
                {selectedEntry.title}
              </h3>
              <p className="font-cormorant text-lg leading-relaxed text-bone/90 italic">
                {selectedEntry.content}
              </p>
            </div>
            <div className="mt-8 border-t border-blood/10 pt-4">
              <p className="font-cormorant text-xs text-muted-foreground/50 italic text-center">
                — запись найдена в темноте —
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

// ─────────────── ENDING SCREEN ───────────────
function EndingScreen({
  ending, state, onRestart, onMenu,
}: {
  ending: EndingId;
  state: GameState;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const data = ENDINGS[ending];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setTimeout(() => setRevealed(true), 600);
  }, []);

  const typeColors = {
    good: "text-emerald-500 border-emerald-800",
    bad: "text-blood-light border-blood",
    neutral: "text-amber-600 border-amber-900",
    secret: "text-purple-400 border-purple-900",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-coal">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-coal to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-blood/60" />

      <div
        className={cn(
          "relative z-10 max-w-lg w-full text-center transition-all duration-1000",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="text-6xl mb-6 animate-fade-in">{data.icon}</div>

        <div className={cn("inline-block border px-3 py-1 rounded-sm mb-4 font-oswald text-xs tracking-widest uppercase", typeColors[data.type])}>
          {data.type === "good" ? "Хорошая концовка" : data.type === "bad" ? "Плохая концовка" : data.type === "secret" ? "Секретная концовка" : "Нейтральная концовка"}
        </div>

        <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-widest text-bone mb-8">
          {data.title}
        </h1>

        <div className="border border-blood/20 bg-ash/30 rounded-sm p-6 mb-8">
          <p className="font-cormorant text-lg md:text-xl leading-relaxed text-bone/90 italic">
            {data.text}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center">
          {[
            { label: "Ходов", value: state.totalTurns },
            { label: "Напряжение", value: state.tension },
            { label: "Записей", value: state.diaryEntries.filter((e) => e.unlocked).length + "/" + state.diaryEntries.length },
          ].map((stat) => (
            <div key={stat.label} className="border border-blood/20 bg-charcoal/50 rounded-sm py-3 px-2">
              <p className="font-oswald text-xl text-blood-light">{stat.value}</p>
              <p className="font-cormorant text-xs text-muted-foreground italic">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRestart}
            className="horror-btn py-3 px-6 bg-blood hover:bg-blood-light text-white font-oswald text-sm tracking-widest uppercase rounded-sm border border-blood-light/20 transition-all"
          >
            Сыграть снова
          </button>
          <button
            onClick={onMenu}
            className="horror-btn py-3 px-6 bg-ash hover:bg-rust text-bone font-oswald text-sm tracking-widest uppercase rounded-sm border border-blood/20 transition-all"
          >
            Главное меню
          </button>
        </div>
      </div>
    </div>
  );
}