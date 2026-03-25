import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  Screen, GameState, BiomeId, ResourceId, ItemId,
  createGameState, canCraft, getTotalItems, rollResources, rollCreature,
  creatureDamage, oxygenCostPerTurn,
  RESOURCES, CRAFT_RECIPES,
} from "@/lib/subData";

function cn(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

// ─── STAT BAR ────────────────────────────────────────────────────────────────
function StatBar({ value, max = 100, color, label, icon }: {
  value: number; max?: number; color: string; label: string; icon: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const low = pct < 25;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-0.5">
          <span className="font-rajdhani text-xs uppercase tracking-wider text-steel/70">{label}</span>
          <span className={cn("font-mono text-xs", low ? "text-danger animate-blink" : "text-steel")}>{Math.round(value)}</span>
        </div>
        <div className="h-1.5 bg-mid/60 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full bar-fill", low ? "bg-danger" : color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function HUD({ gs, onNav }: { gs: GameState; onNav: (s: Screen) => void }) {
  const hasRebreather = gs.crafted.includes("rebreather");
  const biome = gs.biomes[gs.currentBiome];

  return (
    <header className="hud-panel sticky top-0 z-30 px-4 py-3 border-b border-cyan/10">
      <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto">
        {/* Location */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{biome.emoji}</span>
          <div>
            <p className="font-rajdhani font-bold text-sm uppercase tracking-wider glow-cyan" style={{ color: "var(--cyan)" }}>
              {biome.name}
            </p>
            <p className="font-mono text-xs text-steel/60">
              {gs.depth}м ▪ День {gs.day} ▪ Ход {gs.turn}
            </p>
          </div>
        </div>
        {/* Nav */}
        <div className="flex gap-1">
          {([
            { id: "game" as Screen, icon: "🎮", label: "ИГРА" },
            { id: "craft" as Screen, icon: "⚙️", label: "КРАФТ" },
            { id: "map" as Screen, icon: "🗺️", label: "КАРТА" },
            { id: "log" as Screen, icon: "📋", label: "ЛОГ" },
          ] as const).map((btn) => (
            <button
              key={btn.id}
              onClick={() => onNav(btn.id)}
              title={btn.label}
              className={cn(
                "sub-btn px-2 py-1.5 rounded text-xs border transition-all",
                gs.screen === btn.id
                  ? "bg-cyan/10 border-cyan/40 text-cyan glow-cyan"
                  : "bg-mid/30 border-mid hover:border-cyan/20 text-steel/70 hover:text-steel"
              )}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-2xl mx-auto">
        <StatBar value={gs.oxygen}  color="bg-cyan-400"   label="O₂"      icon="🫧" />
        <StatBar value={gs.health}  color="bg-emerald-500" label="Здоровье" icon="❤️" />
        <StatBar value={gs.hunger}  color="bg-amber-400"   label="Питание"  icon="🍖" />
        <StatBar value={Math.min(100, gs.depth / 15)} color="bg-blue-600" label="Глубина" icon="⬇️" />
      </div>
    </header>
  );
}

// ─── MAIN MENU ───────────────────────────────────────────────────────────────
function MainMenu({ onStart }: { onStart: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const hints = [
    "Исследуй глубины. Крафти снаряжение. Выживай.",
    "На 900м что-то огромное ждёт тебя.",
    "Кислород — твой главный ресурс.",
    "Некоторые существа охотятся на свет.",
    "Тишина в бездне — это тоже сигнал.",
  ];

  return (
    <div className="scanlines min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Bubbles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-bubble absolute rounded-full border border-cyan/20 bg-cyan/5"
          style={{
            width: `${6 + i * 4}px`, height: `${6 + i * 4}px`,
            left: `${10 + i * 11}%`, bottom: "-20px",
            animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i * 0.7}s`,
          }}
        />
      ))}

      {/* Sonar rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-sonar absolute rounded-full border border-cyan/20"
            style={{
              width: `${i * 120}px`, height: `${i * 120}px`,
              marginLeft: `-${i * 60}px`, marginTop: `-${i * 60}px`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-mid/20 via-deep to-abyss" />

      <div className="relative z-10 text-center max-w-md w-full">
        <div className="animate-float mb-6">
          <div className="text-6xl mb-2">🌊</div>
          <div className="text-3xl">🐠</div>
        </div>

        <h1 className="font-rajdhani font-bold text-5xl md:text-6xl uppercase tracking-widest mb-1 glow-cyan" style={{ color: "var(--cyan)" }}>
          SUBNAUTICA
        </h1>
        <h2 className="font-rajdhani font-light text-xl uppercase tracking-[0.4em] mb-2 text-steel/60">
          Бездна
        </h2>
        <p className="font-mono text-xs text-steel/40 mb-10 tracking-widest">
          ПЛАНЕТА 4546B · ПОДВОДНОЕ ВЫЖИВАНИЕ
        </p>

        <p
          key={tick}
          className="font-exo italic text-sm text-cyan/60 mb-8 min-h-5 animate-fade-in"
        >
          {hints[tick % hints.length]}
        </p>

        <button
          onClick={onStart}
          className="sub-btn w-full max-w-xs mx-auto block py-4 px-8 bg-cyan/10 hover:bg-cyan/20 border border-cyan/40 hover:border-cyan/70 text-cyan font-rajdhani font-bold text-lg tracking-widest rounded box-glow-cyan transition-all mb-3"
        >
          ⬤ ПОГРУЗИТЬСЯ
        </button>
        <p className="font-mono text-xs text-steel/30">Аврора разрушена. Начните с отмелей.</p>
      </div>
    </div>
  );
}

// ─── GAME SCREEN ─────────────────────────────────────────────────────────────
function GameView({ gs, setGs }: { gs: GameState; setGs: (g: GameState) => void }) {
  const [msg, setMsg] = useState<string[]>([]);
  const [animKey, setAnimKey] = useState(0);

  const biome = gs.biomes[gs.currentBiome];
  const hasKnife = gs.crafted.includes("knife");
  const hasRebreather = gs.crafted.includes("rebreather");
  const hasFlashlight = gs.crafted.includes("flashlight");
  const hasSeaglide = gs.crafted.includes("seaglide");
  const hasDepthModule = gs.crafted.includes("depth_module");

  const maxDepthAllowed = 100 + (hasDepthModule ? 200 : 0) + (gs.crafted.includes("prawn_suit") ? 800 : 0);

  const pushMsg = (lines: string[]) => {
    setMsg(lines);
    setAnimKey((k) => k + 1);
  };

  // Tick: расход кислорода и голода
  const applyTick = useCallback((state: GameState): GameState => {
    const oxyDrain = oxygenCostPerTurn(state.depth, hasRebreather);
    const newOxy = Math.max(0, state.oxygen - oxyDrain);
    const newHunger = Math.max(0, state.hunger - 3);
    const newHealth = newOxy <= 0 ? Math.max(0, state.health - 20)
      : newHunger <= 0 ? Math.max(0, state.health - 5)
      : state.health;
    return {
      ...state,
      oxygen: newOxy,
      hunger: newHunger,
      health: newHealth,
      turn: state.turn + 1,
    };
  }, [hasRebreather]);

  // Нырнуть / Исследовать текущий биом
  const actionExplore = () => {
    const next = applyTick({ ...gs, isUnderwater: true });

    // Найти ресурсы
    const found = rollResources(biome);
    const newInv = { ...next.inventory };
    const lines: string[] = [`${biome.emoji} Исследуете ${biome.name}...`];
    lines.push(biome.atmosphere);

    found.forEach(({ resource, amount }) => {
      newInv[resource] = (newInv[resource] ?? 0) + amount;
      lines.push(`▸ Найдено: ${RESOURCES[resource].icon} ${RESOURCES[resource].name} ×${amount}`);
    });

    // Существо?
    const creatureId = rollCreature(biome);
    let dmg = 0;
    if (creatureId) {
      const creature = next.creatures[creatureId];
      dmg = creatureDamage(creature, hasKnife);
      const newCreatures = { ...next.creatures };
      newCreatures[creatureId] = { ...creature, encountered: true };

      if (dmg > 0) {
        lines.push(`⚠️ Атакует: ${creature.icon} ${creature.name}! Урон: ${dmg} HP`);
        if (!hasKnife) lines.push("  — Нет ножа. Вы беззащитны.");
      } else {
        lines.push(`${creature.icon} Вы видите: ${creature.name}. ${creature.danger === "passive" ? "Не агрессивна." : "Удалось уклониться."}`);
      }

      const updatedGs = {
        ...next,
        inventory: newInv,
        creatures: newCreatures,
        health: Math.max(0, next.health - dmg),
        maxDepth: Math.max(next.maxDepth, next.depth),
      };

      // Разблокировать лог при первом исследовании
      if (!gs.logEntries.find((e) => e.id === "first_dive")?.unlocked) {
        updatedGs.logEntries = updatedGs.logEntries.map((e) =>
          e.id === "first_dive" ? { ...e, unlocked: true } : e
        );
      }
      if (dmg > 0 && !gs.logEntries.find((e) => e.id === "stalker")?.unlocked) {
        updatedGs.logEntries = updatedGs.logEntries.map((e) =>
          e.id === "stalker" ? { ...e, unlocked: true } : e
        );
      }

      setGs(updatedGs);
    } else {
      const updatedGs = {
        ...next,
        inventory: newInv,
        maxDepth: Math.max(next.maxDepth, next.depth),
      };
      if (!gs.logEntries.find((e) => e.id === "first_dive")?.unlocked) {
        updatedGs.logEntries = updatedGs.logEntries.map((e) =>
          e.id === "first_dive" ? { ...e, unlocked: true } : e
        );
      }
      setGs(updatedGs);
    }

    pushMsg(lines);
  };

  // Всплыть
  const actionSurface = () => {
    const refillOxy = Math.min(100, gs.oxygen + 60);
    setGs({ ...gs, oxygen: refillOxy, depth: 0, isUnderwater: false, turn: gs.turn + 1 });
    pushMsg(["🌊 Вы всплываете на поверхность.", `Кислород восполнен: ${refillOxy}%`]);
  };

  // Нырнуть глубже
  const actionDive = (extraDepth: number) => {
    const newDepth = gs.depth + extraDepth;
    if (newDepth > maxDepthAllowed) {
      pushMsg([`⚠️ Превышена допустимая глубина (${maxDepthAllowed}м).`, "Нужен модуль глубины или экзокостюм."]);
      return;
    }
    if (newDepth > 200 && !hasFlashlight) {
      pushMsg(["🔦 Слишком темно для погружения без фонаря.", "Скрафтите фонарь (Titanium + Copper)."]);
      return;
    }

    // Разблокировать биомы по глубине
    const newBiomes = { ...gs.biomes };
    const newBiome = gs.currentBiome;
    if (newDepth >= 50  && !newBiomes.kelp.unlocked)      { newBiomes.kelp = { ...newBiomes.kelp, unlocked: true }; }
    if (newDepth >= 100 && !newBiomes.grassy.unlocked)    { newBiomes.grassy = { ...newBiomes.grassy, unlocked: true }; }
    if (newDepth >= 150 && !newBiomes.mushroom.unlocked)  { newBiomes.mushroom = { ...newBiomes.mushroom, unlocked: true }; }
    if (newDepth >= 500 && !newBiomes.abyss.unlocked)     { newBiomes.abyss = { ...newBiomes.abyss, unlocked: true }; }
    if (newDepth >= 900 && !newBiomes.lava.unlocked)      { newBiomes.lava = { ...newBiomes.lava, unlocked: true }; }

    const oxyDrain = oxygenCostPerTurn(newDepth, hasRebreather);
    const newOxy = Math.max(0, gs.oxygen - oxyDrain);

    setGs({
      ...gs,
      depth: newDepth,
      oxygen: newOxy,
      isUnderwater: true,
      biomes: newBiomes,
      currentBiome: newBiome,
      maxDepth: Math.max(gs.maxDepth, newDepth),
      turn: gs.turn + 1,
    });
    pushMsg([
      `⬇️ Погружение до ${newDepth}м.`,
      newDepth > 500 ? "Связь с поверхностью прервана. Абсолютная тьма." :
      newDepth > 200 ? "Давление нарастает. Включите фонарь." :
      newDepth > 50  ? "Вода становится темнее." : "Вы под водой.",
    ]);
  };

  // Перейти в биом
  const actionMoveToBiome = (biomeId: BiomeId) => {
    const target = gs.biomes[biomeId];
    if (!target.unlocked) {
      pushMsg(["🔒 Биом ещё не открыт. Нырните глубже."]);
      return;
    }
    const newBiomes = { ...gs.biomes };
    newBiomes[biomeId] = { ...target, discovered: true };
    setGs({
      ...gs,
      currentBiome: biomeId,
      depth: target.depth,
      biomes: newBiomes,
      turn: gs.turn + 1,
    });
    pushMsg([
      `${target.emoji} Вы перемещаетесь в: ${target.name}`,
      target.description,
      `Глубина: ${target.depth}м | Опасность: ${"●".repeat(target.dangerLevel / 2)}`,
    ]);
    if (!gs.logEntries.find((e) => e.id === "signal")?.unlocked && biomeId === "grassy") {
      setGs((prev: GameState) => ({ ...prev, logEntries: prev.logEntries.map((e) => e.id === "signal" ? { ...e, unlocked: true } : e) }));
    }
    if (biomeId === "abyss" && !gs.logEntries.find((e) => e.id === "disease")?.unlocked) {
      setTimeout(() => {
        setGs((prev: GameState) => ({ ...prev, logEntries: prev.logEntries.map((e) => e.id === "disease" ? { ...e, unlocked: true } : e) }));
      }, 500);
    }
    if (biomeId === "lava" && !gs.logEntries.find((e) => e.id === "emperor")?.unlocked) {
      setTimeout(() => {
        setGs((prev: GameState) => ({ ...prev, logEntries: prev.logEntries.map((e) => e.id === "emperor" ? { ...e, unlocked: true } : e) }));
      }, 500);
    }
  };

  // Поесть (если есть reginald)
  const actionEat = () => {
    if ((gs.inventory.reginald ?? 0) <= 0) {
      // reginald нет в ResourceId, так что используем альтернативу
      pushMsg(["🍖 Нет еды. Поймайте рыбу во время исследования."]);
      return;
    }
    setGs({ ...gs, hunger: Math.min(100, gs.hunger + 40), turn: gs.turn + 1 });
    pushMsg(["🐠 Вы съели рыбу Реджинальда. Питание восстановлено."]);
  };

  // Отдохнуть на поверхности
  const actionRest = () => {
    if (gs.depth > 0) {
      pushMsg(["⚠️ Нельзя отдыхать под водой. Всплывите."]);
      return;
    }
    setGs({
      ...gs,
      oxygen: 100,
      health: Math.min(100, gs.health + 20),
      hunger: Math.max(0, gs.hunger - 10),
      turn: gs.turn + 1,
      day: gs.turn % 8 === 0 ? gs.day + 1 : gs.day,
    });
    pushMsg(["😴 Вы отдыхаете в спасательном модуле.", "Здоровье и кислород восстановлены.", "Прошло несколько часов..."]);
  };

  const isDead = gs.health <= 0;
  const isOxygenCritical = gs.oxygen < 20;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      {/* Danger alerts */}
      {(isDead || isOxygenCritical) && (
        <div className={cn(
          "mx-4 mt-3 px-4 py-2 rounded border text-center font-rajdhani font-bold text-sm uppercase tracking-wider",
          isDead ? "bg-danger/15 border-danger text-danger box-glow-danger animate-blink"
                 : "bg-amber-900/20 border-amber-600 text-amber-400"
        )}>
          {isDead ? "⚠ КРИТИЧЕСКОЕ СОСТОЯНИЕ — НЕМЕДЛЕННО ВСПЛЫВИТЕ" : "🫧 КИСЛОРОД КРИТИЧЕСКИЙ"}
        </div>
      )}

      {/* Event log */}
      <div className="mx-4 mt-4 hud-panel rounded p-4 min-h-32">
        {msg.length === 0 ? (
          <div key="init" className="animate-fade-in">
            <p className="font-rajdhani font-semibold text-base text-cyan/80 mb-1">{biome.emoji} {biome.name}</p>
            <p className="font-exo text-sm text-steel/80 leading-relaxed">{biome.atmosphere}</p>
            <p className="font-mono text-xs text-steel/40 mt-3">Глубина: {gs.depth}м | {gs.crafted.length} предметов скрафчено | {getTotalItems(gs.inventory)} ресурсов</p>
          </div>
        ) : (
          <div key={animKey} className="animate-fade-in space-y-1.5">
            {msg.map((line, i) => (
              <p key={i} className={cn(
                "font-exo text-sm leading-relaxed",
                line.startsWith("⚠") || line.startsWith("💀") ? "text-danger" :
                line.startsWith("▸") ? "text-biolum/80" :
                line.startsWith("  —") ? "text-steel/50 text-xs" :
                i === 0 ? "font-semibold text-cyan/90" : "text-steel/80"
              )}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Inventory quick view */}
      {getTotalItems(gs.inventory) > 0 && (
        <div className="mx-4 mt-3 hud-panel rounded p-3">
          <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/50 mb-2">Инвентарь</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(gs.inventory) as [ResourceId, number][])
              .filter(([, qty]) => qty > 0)
              .map(([res, qty]) => (
                <div key={res} className="flex items-center gap-1 bg-mid/40 border border-cyan/10 rounded px-2 py-1">
                  <span className="text-sm">{RESOURCES[res]?.icon ?? "?"}</span>
                  <span className="font-mono text-xs text-steel">{qty}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Crafted gear */}
      {gs.crafted.length > 0 && (
        <div className="mx-4 mt-2 flex gap-2 flex-wrap">
          {gs.crafted.map((item) => {
            const recipe = CRAFT_RECIPES.find((r) => r.id === item);
            return recipe ? (
              <span key={item} className="text-lg" title={recipe.name}>{recipe.icon}</span>
            ) : null;
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="mx-4 mt-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* Исследовать */}
          <ActionBtn icon="🔍" onClick={actionExplore} variant="primary">Исследовать</ActionBtn>

          {/* Нырнуть */}
          {gs.depth < maxDepthAllowed && (
            <ActionBtn icon="⬇️" onClick={() => actionDive(hasSeaglide ? 50 : 25)} variant="secondary">
              Нырнуть {hasSeaglide ? "−50м" : "−25м"}
            </ActionBtn>
          )}

          {/* Всплыть */}
          {gs.depth > 0 && (
            <ActionBtn icon="⬆️" onClick={actionSurface} variant="secondary">Всплыть</ActionBtn>
          )}

          {/* Отдохнуть */}
          {gs.depth === 0 && (
            <ActionBtn icon="😴" onClick={actionRest} variant="secondary">Отдохнуть</ActionBtn>
          )}

          {/* Переместиться в биомы */}
          {Object.values(gs.biomes)
            .filter((b) => b.unlocked && b.id !== gs.currentBiome)
            .slice(0, 3)
            .map((b) => (
              <ActionBtn key={b.id} icon={b.emoji} onClick={() => actionMoveToBiome(b.id)} variant="ghost">
                {b.name}
              </ActionBtn>
            ))}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, icon, variant = "secondary" }: {
  children: React.ReactNode; onClick: () => void; icon?: string; variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:   "bg-cyan/10 border-cyan/40 hover:bg-cyan/20 hover:border-cyan/70 text-cyan box-glow-cyan",
    secondary: "bg-mid/50 border-mid hover:border-cyan/25 text-steel hover:text-foam",
    ghost:     "bg-transparent border-mid/40 hover:border-biolum/30 text-steel/60 hover:text-biolum",
    danger:    "bg-danger/10 border-danger/40 hover:bg-danger/20 text-danger",
  };
  return (
    <button
      onClick={onClick}
      className={cn("sub-btn px-3 py-2 rounded border text-sm transition-all", styles[variant])}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </button>
  );
}

// ─── CRAFT SCREEN ────────────────────────────────────────────────────────────
function CraftView({ gs, setGs }: { gs: GameState; setGs: (g: GameState) => void }) {
  const [filter, setFilter] = useState<"all" | "tools" | "equipment" | "vehicles">("all");
  const [craftedItem, setCraftedItem] = useState<string | null>(null);

  const doCraft = (recipeId: ItemId) => {
    const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    if (!canCraft(recipe, gs.inventory)) return;
    if (gs.crafted.includes(recipeId)) return;

    const newInv = { ...gs.inventory };
    for (const [res, qty] of Object.entries(recipe.ingredients)) {
      newInv[res as ResourceId] = (newInv[res as ResourceId] ?? 0) - (qty ?? 0);
    }
    const newCrafted = [...gs.crafted, recipeId];
    const newGs = { ...gs, inventory: newInv, crafted: newCrafted };

    // Разблокировать лог при первом крафте
    if (!gs.logEntries.find((e) => e.id === "precursors")?.unlocked && newCrafted.length >= 4) {
      newGs.logEntries = newGs.logEntries.map((e) => e.id === "precursors" ? { ...e, unlocked: true } : e);
    }
    setGs(newGs);
    setCraftedItem(recipe.name);
    setTimeout(() => setCraftedItem(null), 2000);
  };

  const filtered = filter === "all" ? CRAFT_RECIPES : CRAFT_RECIPES.filter((r) => r.category === filter);

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4">
      {/* Toast */}
      {craftedItem && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 hud-panel border-biolum/40 px-5 py-3 rounded animate-scale-in box-glow-biolum">
          <p className="font-rajdhani font-bold text-biolum tracking-wider">✅ Скрафчено: {craftedItem}</p>
        </div>
      )}

      {/* Inventory */}
      <div className="hud-panel rounded p-3 mb-4">
        <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/50 mb-2">Доступные ресурсы</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(gs.inventory) as [ResourceId, number][])
            .filter(([, qty]) => qty > 0)
            .map(([res, qty]) => (
              <div key={res} className="flex items-center gap-1.5 bg-mid/40 border border-cyan/10 rounded px-2.5 py-1.5">
                <span>{RESOURCES[res]?.icon}</span>
                <span className="font-rajdhani text-sm text-foam">{RESOURCES[res]?.name}</span>
                <span className="font-mono text-xs text-cyan ml-1">×{qty}</span>
              </div>
            ))}
          {getTotalItems(gs.inventory) === 0 && (
            <p className="font-exo text-sm italic text-steel/40">Нет ресурсов. Исследуйте биомы.</p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(["all", "tools", "equipment", "vehicles"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "sub-btn px-3 py-1.5 rounded text-xs border transition-all",
              filter === f
                ? "bg-cyan/10 border-cyan/40 text-cyan"
                : "bg-mid/30 border-mid text-steel/60 hover:text-steel"
            )}
          >
            {f === "all" ? "ВСЁ" : f === "tools" ? "ИНСТРУМЕНТЫ" : f === "equipment" ? "СНАРЯЖЕНИЕ" : "ТРАНСПОРТ"}
          </button>
        ))}
      </div>

      {/* Recipes */}
      <div className="space-y-2 overflow-y-auto flex-1">
        {filtered.map((recipe) => {
          const craftable = canCraft(recipe, gs.inventory);
          const already = gs.crafted.includes(recipe.id);
          return (
            <div
              key={recipe.id}
              className={cn(
                "hud-panel rounded p-3 border transition-all",
                already ? "border-biolum/20 bg-biolum/5" :
                craftable ? "border-cyan/25 hover:border-cyan/50 cursor-pointer" :
                "opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{recipe.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn("font-rajdhani font-bold text-sm uppercase tracking-wider",
                      already ? "text-biolum" : craftable ? "text-foam" : "text-steel/60")}>
                      {recipe.name}
                    </p>
                    {already && <span className="font-mono text-xs text-biolum/60">✓ ЕСТЬ</span>}
                  </div>
                  <p className="font-exo text-xs text-steel/60 mb-2">{recipe.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.entries(recipe.ingredients) as [ResourceId, number][]).map(([res, qty]) => {
                      const have = gs.inventory[res] ?? 0;
                      const ok = have >= qty;
                      return (
                        <span key={res} className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border font-mono",
                          ok ? "border-cyan/20 text-cyan bg-cyan/5" : "border-danger/20 text-danger/70 bg-danger/5"
                        )}>
                          {RESOURCES[res]?.icon} {qty} {ok ? `✓` : `(${have})`}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {!already && (
                  <button
                    onClick={() => craftable && doCraft(recipe.id)}
                    disabled={!craftable}
                    className={cn(
                      "sub-btn px-3 py-2 rounded border text-xs flex-shrink-0 transition-all",
                      craftable
                        ? "bg-cyan/10 border-cyan/40 hover:bg-cyan/25 text-cyan"
                        : "border-mid/30 text-steel/20 cursor-not-allowed"
                    )}
                  >
                    КРАФТ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAP SCREEN ──────────────────────────────────────────────────────────────
function MapView({ gs, setGs }: { gs: GameState; setGs: (g: GameState) => void }) {
  const biomeOrder: BiomeId[] = ["shallows", "kelp", "grassy", "mushroom", "abyss", "lava"];
  const depths: Record<BiomeId, number> = {
    shallows: 0, kelp: 100, grassy: 150, mushroom: 200, abyss: 900, lava: 1300,
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
      <div className="hud-panel rounded p-4 mb-4">
        <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/50 mb-1">Статистика</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Макс. глубина", value: `${gs.maxDepth}м` },
            { label: "Ходов", value: gs.turn },
            { label: "Открыто биомов", value: Object.values(gs.biomes).filter((b) => b.discovered).length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-rajdhani font-bold text-xl text-cyan glow-cyan">{s.value}</p>
              <p className="font-exo text-xs text-steel/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Depth map */}
      <div className="hud-panel rounded p-4">
        <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/50 mb-4">Карта глубин</p>
        <div className="relative">
          {/* Depth line */}
          <div className="absolute left-16 top-0 bottom-0 w-px bg-cyan/10" />

          {biomeOrder.map((id, i) => {
            const biome = gs.biomes[id];
            const isCurrent = gs.currentBiome === id;
            const isUnlocked = biome.unlocked;
            const depth = depths[id];

            return (
              <div key={id} className="flex items-center gap-3 mb-4 relative">
                {/* Depth label */}
                <div className="w-14 text-right flex-shrink-0">
                  <span className="font-mono text-xs text-steel/40">{depth}м</span>
                </div>

                {/* Node */}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0 relative z-10 transition-all",
                    isCurrent ? "border-cyan bg-cyan animate-pulse-cyan" :
                    biome.discovered ? "border-biolum/60 bg-biolum/20" :
                    isUnlocked ? "border-cyan/30 bg-mid" :
                    "border-mid/40 bg-abyss"
                  )}
                />

                {/* Biome info */}
                <div className={cn("flex-1", !isUnlocked && "opacity-30")}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{biome.emoji}</span>
                    <span className={cn("font-rajdhani font-semibold text-sm uppercase tracking-wider",
                      isCurrent ? "text-cyan glow-cyan" :
                      biome.discovered ? "text-biolum" : "text-steel/70"
                    )}>
                      {isUnlocked ? biome.name : "???"}
                    </span>
                    {isCurrent && <span className="font-mono text-xs text-cyan/60 animate-blink">● ЗДЕСЬ</span>}
                  </div>
                  {isUnlocked && (
                    <div className="flex gap-2 mt-0.5">
                      <span className="font-mono text-xs text-steel/40">
                        Опасность: {"●".repeat(Math.min(5, Math.ceil(biome.dangerLevel / 2)))}{"○".repeat(Math.max(0, 5 - Math.ceil(biome.dangerLevel / 2)))}
                      </span>
                      {biome.discovered && <span className="font-mono text-xs text-biolum/50">✓ исследован</span>}
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {i < biomeOrder.length - 1 && (
                  <div className="absolute left-[4.5rem] top-4 w-px h-8 bg-cyan/10" style={{ top: "100%" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Encountered creatures */}
      <div className="hud-panel rounded p-4 mt-4">
        <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/50 mb-3">Встреченные существа</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(gs.creatures).filter((c) => c.encountered).map((c) => (
            <div key={c.id} className={cn(
              "flex items-start gap-2 p-2 rounded border",
              c.danger === "leviathan" ? "border-danger/20 bg-danger/5" :
              c.danger === "aggressive" ? "border-amber-800/30 bg-amber-900/10" :
              "border-biolum/15 bg-biolum/5"
            )}>
              <span className="text-xl">{c.icon}</span>
              <div>
                <p className="font-rajdhani text-xs font-bold text-foam">{c.name}</p>
                <p className="font-exo text-xs text-steel/50 leading-tight">{c.description.substring(0, 60)}...</p>
              </div>
            </div>
          ))}
          {Object.values(gs.creatures).filter((c) => c.encountered).length === 0 && (
            <p className="font-exo italic text-steel/30 text-sm col-span-2">Вы ещё никого не встретили. Исследуйте глубины.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOG SCREEN ──────────────────────────────────────────────────────────────
function LogView({ gs }: { gs: GameState }) {
  const [selected, setSelected] = useState<string | null>(null);
  const entry = gs.logEntries.find((e) => e.id === selected);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
      {!selected ? (
        <>
          <p className="font-rajdhani text-xs uppercase tracking-wider text-steel/40 mb-3">
            Записи КДА · {gs.logEntries.filter((e) => e.unlocked).length}/{gs.logEntries.length}
          </p>
          <div className="space-y-2">
            {gs.logEntries.map((e, i) => (
              <button
                key={e.id}
                onClick={() => e.unlocked && setSelected(e.id)}
                disabled={!e.unlocked}
                className={cn(
                  "w-full text-left hud-panel rounded p-3 border transition-all",
                  e.unlocked
                    ? "border-cyan/15 hover:border-cyan/35 cursor-pointer"
                    : "opacity-30 cursor-not-allowed border-mid/20"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{e.unlocked ? e.icon : "🔒"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-rajdhani font-semibold text-sm uppercase tracking-wider",
                      e.unlocked ? "text-foam" : "text-steel/30")}>
                      {e.unlocked ? e.title : "ЗАПИСЬ ЗАБЛОКИРОВАНА"}
                    </p>
                    {e.unlocked && (
                      <p className="font-exo text-xs text-steel/50 truncate">{e.content.substring(0, 55)}…</p>
                    )}
                  </div>
                  {e.unlocked && <Icon name="ChevronRight" size={14} className="text-cyan/30 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : entry ? (
        <div className="animate-fade-in-up">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-steel/50 hover:text-cyan mb-4 transition-colors">
            <Icon name="ChevronLeft" size={16} />
            <span className="font-rajdhani text-xs uppercase tracking-wider">Назад</span>
          </button>
          <div className="text-4xl mb-4 text-center">{entry.icon}</div>
          <div className="hud-panel rounded p-5 border-l-2 border-l-cyan/40">
            <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider text-cyan mb-4">{entry.title}</h3>
            <p className="font-exo text-base leading-relaxed text-steel/90">{entry.content}</p>
          </div>
          <p className="text-center font-mono text-xs text-steel/25 mt-6">— запись Компьютера Дополненной Действительности —</p>
        </div>
      ) : null}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [gs, setGs] = useState<GameState>(createGameState());
  const [screen, setScreen] = useState<Screen>("main");

  const handleNav = useCallback((s: Screen) => {
    setScreen(s);
    setGs((prev) => ({ ...prev, screen: s }));
  }, []);

  const handleStart = () => {
    setGs(createGameState());
    setScreen("game");
  };

  if (screen === "main") return <MainMenu onStart={handleStart} />;

  return (
    <div className="scanlines min-h-screen flex flex-col bg-abyss">
      <HUD gs={gs} onNav={handleNav} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {screen === "game"  && <GameView  gs={gs} setGs={setGs} />}
        {screen === "craft" && <CraftView gs={gs} setGs={setGs} />}
        {screen === "map"   && <MapView   gs={gs} setGs={setGs} />}
        {screen === "log"   && <LogView   gs={gs} />}
      </div>
    </div>
  );
}
