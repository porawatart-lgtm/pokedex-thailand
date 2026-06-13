import { getDualTypeDefenses, TYPE_CHART } from "./type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BattleStatus = "none" | "burn" | "paralysis" | "poison" | "sleep" | "freeze";
export type BattleCategory = "physical" | "special" | "status";
export type BattleMode = "single" | "double";

export interface SimMove {
  slug: string;
  nameEn: string;
  nameTh: string;
  type: PokemonTypeName;
  category: BattleCategory;
  power: number;
  accuracy: number; // 0 = always hits
  pp: number;
  priority: number;
  ailment: string;
  ailmentChance: number;
  drain: number;   // % of damage restored to attacker
  recoil: number;  // % of damage taken as recoil
}

export interface SimPokemon {
  uid: string;
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string;
  types: PokemonTypeName[];
  level: number;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  spAtk: number;
  spDef: number;
  speed: number;
  stages: { atk: number; def: number; spAtk: number; spDef: number; speed: number; acc: number; eva: number };
  status: BattleStatus;
  statusTurns: number;
  moves: (SimMove & { currentPp: number })[];
  spriteUrl: string;
  backSpriteUrl: string;
}

export interface BattleLogEntry {
  id: number;
  text: string;
  kind: "info" | "damage" | "status" | "heal" | "faint" | "result";
}

export interface BattleState {
  mode: BattleMode;
  playerTeam: SimPokemon[];
  opponentTeam: SimPokemon[];
  playerActive: number[];
  opponentActive: number[];
  turn: number;
  logSeed: number;
  winner: "player" | "opponent" | null;
}

export interface PlayerAction {
  activeSlot: number;
  moveIndex: number;
  targetSlot: number;
}

export interface TurnResult {
  state: BattleState;
  log: BattleLogEntry[];
}

// ─── Stat Calculation (IV=31, EV=85, Level=50, neutral nature) ────────────────

export function simCalcHp(base: number): number {
  return Math.floor(((2 * base + 31 + 21) * 50) / 100 + 50 + 10);
}

export function simCalcStat(base: number): number {
  return Math.floor(Math.floor((2 * base + 31 + 21) * 50 / 100) + 5);
}

const STAGE_MULTS: Record<number, number> = {
  [-6]: 2/8, [-5]: 2/7, [-4]: 2/6, [-3]: 2/5, [-2]: 2/4, [-1]: 2/3,
  [0]: 1, [1]: 3/2, [2]: 2, [3]: 5/2, [4]: 3, [5]: 7/2, [6]: 4,
};
function withStage(stat: number, stage: number): number {
  return Math.floor(stat * (STAGE_MULTS[Math.max(-6, Math.min(6, stage))] ?? 1));
}

// ─── Build SimPokemon ─────────────────────────────────────────────────────────

export function buildSimPokemon(p: {
  uid: string; id: number; slug: string; nameEn: string; nameTh: string;
  types: PokemonTypeName[];
  baseStats: { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
  moves: SimMove[];
}): SimPokemon {
  const maxHp = simCalcHp(p.baseStats.hp);
  return {
    uid: p.uid, id: p.id, slug: p.slug, nameEn: p.nameEn, nameTh: p.nameTh,
    types: p.types, level: 50,
    maxHp, currentHp: maxHp,
    atk: simCalcStat(p.baseStats.attack),
    def: simCalcStat(p.baseStats.defense),
    spAtk: simCalcStat(p.baseStats.specialAttack),
    spDef: simCalcStat(p.baseStats.specialDefense),
    speed: simCalcStat(p.baseStats.speed),
    stages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, acc: 0, eva: 0 },
    status: "none", statusTurns: 0,
    moves: p.moves.map(m => ({ ...m, currentPp: m.pp })),
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    backSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${p.id}.png`,
  };
}

// ─── Type Effectiveness ───────────────────────────────────────────────────────

export function getSimEff(moveType: PokemonTypeName, defTypes: PokemonTypeName[]): number {
  if (defTypes.length === 1) return TYPE_CHART[moveType]?.[defTypes[0]] ?? 1;
  return getDualTypeDefenses(defTypes)[moveType] ?? 1;
}

// ─── Status immunity ──────────────────────────────────────────────────────────

function canApplyStatus(target: SimPokemon, s: BattleStatus): boolean {
  if (target.status !== "none") return false;
  if (s === "burn" && target.types.includes("fire")) return false;
  if (s === "paralysis" && target.types.includes("electric")) return false;
  if (s === "poison" && (target.types.includes("poison") || target.types.includes("steel"))) return false;
  if (s === "freeze" && target.types.includes("ice")) return false;
  return true;
}

// ─── Damage Roll ──────────────────────────────────────────────────────────────

interface DmgResult { damage: number; effectiveness: number; isCrit: boolean; missed: boolean; messages: string[] }

function rollDamage(attacker: SimPokemon, defender: SimPokemon, move: SimMove): DmgResult {
  if (move.category === "status" || !move.power)
    return { damage: 0, effectiveness: 1, isCrit: false, missed: false, messages: [] };

  if (move.accuracy > 0) {
    const stage = Math.max(-6, Math.min(6, attacker.stages.acc - defender.stages.eva));
    const accMult = STAGE_MULTS[stage] ?? 1;
    if (Math.random() * 100 >= move.accuracy * accMult)
      return { damage: 0, effectiveness: 1, isCrit: false, missed: true, messages: ["ปาไม่โดน!"] };
  }

  const msgs: string[] = [];
  const isPhys = move.category === "physical";
  const rawAtk = isPhys ? attacker.atk : attacker.spAtk;
  const rawDef = isPhys ? defender.def : defender.spDef;
  const atkStage = isPhys ? attacker.stages.atk : attacker.stages.spAtk;
  const defStage = isPhys ? defender.stages.def : defender.stages.spDef;

  const isCrit = Math.random() < 1 / 24;
  const finalAtk = withStage(rawAtk, isCrit ? Math.max(0, atkStage) : atkStage);
  const finalDef = withStage(rawDef, isCrit ? Math.min(0, defStage) : defStage);

  let dmg = Math.floor((Math.floor((2 * 50 / 5 + 2) * move.power * finalAtk / finalDef) / 50) + 2);

  if (attacker.types.includes(move.type)) dmg = Math.floor(dmg * 1.5); // STAB

  const eff = getSimEff(move.type, defender.types);
  if (eff === 0) return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: ["ไม่ได้ผลเลย!"] };
  dmg = Math.floor(dmg * eff);
  if (eff >= 4) msgs.push("ได้ผลอย่างมหาศาล!! ×4");
  else if (eff >= 2) msgs.push("ได้ผลดีมาก! ×2");
  else if (eff <= 0.5) msgs.push("ได้ผลน้อย...");

  if (!isCrit && attacker.status === "burn" && isPhys) dmg = Math.floor(dmg * 0.5);
  if (isCrit) { dmg = Math.floor(dmg * 1.5); msgs.push("โจมตีจุดอ่อน!"); }

  dmg = Math.floor(dmg * (Math.floor(Math.random() * 16) + 85) / 100);
  return { damage: Math.max(1, dmg), effectiveness: eff, isCrit, missed: false, messages: msgs };
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function aiPickAction(attacker: SimPokemon, targets: SimPokemon[]): { moveIndex: number; targetIndex: number } {
  const available = attacker.moves.map((m, i) => ({ m, i })).filter(x => x.m.currentPp > 0);
  if (!available.length) return { moveIndex: 0, targetIndex: 0 };

  if (Math.random() < 0.25) {
    return {
      moveIndex: available[Math.floor(Math.random() * available.length)].i,
      targetIndex: Math.floor(Math.random() * targets.filter(t => t.currentHp > 0).length || 1),
    };
  }

  let best = { score: -1, mi: available[0].i, ti: 0 };
  for (const { m, i } of available) {
    for (let ti = 0; ti < targets.length; ti++) {
      if (targets[ti].currentHp <= 0) continue;
      const eff = m.power ? getSimEff(m.type, targets[ti].types) : 0.5;
      const stab = attacker.types.includes(m.type) ? 1.5 : 1;
      const score = (m.power || 5) * eff * stab * (0.8 + Math.random() * 0.4);
      if (score > best.score) best = { score, mi: i, ti };
    }
  }
  return { moveIndex: best.mi, targetIndex: best.ti };
}

// ─── Turn Processing ──────────────────────────────────────────────────────────

export function processTurn(state: BattleState, playerActions: PlayerAction[]): TurnResult {
  const pt = JSON.parse(JSON.stringify(state.playerTeam)) as SimPokemon[];
  const ot = JSON.parse(JSON.stringify(state.opponentTeam)) as SimPokemon[];
  const log: BattleLogEntry[] = [];
  let lid = state.logSeed;
  const add = (text: string, kind: BattleLogEntry["kind"] = "info") => log.push({ id: lid++, text, kind });

  type Act = { side: "p" | "o"; teamIdx: number; targetTeamIdx: number; moveIndex: number; priority: number; speed: number };
  const allActs: Act[] = [];

  // Player actions
  for (const pa of playerActions) {
    const ti = state.playerActive[pa.activeSlot];
    if (ti === undefined) continue;
    const pk = pt[ti];
    if (!pk || pk.currentHp <= 0) continue;
    const mv = pk.moves[pa.moveIndex];
    const spd = withStage(pk.speed, pk.stages.speed) * (pk.status === "paralysis" ? 0.5 : 1);
    allActs.push({ side: "p", teamIdx: ti, targetTeamIdx: state.opponentActive[pa.targetSlot] ?? state.opponentActive[0], moveIndex: pa.moveIndex, priority: mv?.priority ?? 0, speed: spd });
  }

  // AI actions
  for (const aiIdx of state.opponentActive) {
    const pk = ot[aiIdx];
    if (!pk || pk.currentHp <= 0) continue;
    const targets = state.playerActive.map(i => pt[i]).filter(t => t.currentHp > 0);
    const { moveIndex, targetIndex } = aiPickAction(pk, targets);
    const mv = pk.moves[moveIndex];
    const spd = withStage(pk.speed, pk.stages.speed) * (pk.status === "paralysis" ? 0.5 : 1);
    allActs.push({ side: "o", teamIdx: aiIdx, targetTeamIdx: state.playerActive[targetIndex] ?? state.playerActive[0], moveIndex, priority: mv?.priority ?? 0, speed: spd });
  }

  allActs.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (Math.abs(a.speed - b.speed) < 0.5) return Math.random() - 0.5;
    return b.speed - a.speed;
  });

  const STATUS_NAMES: Record<BattleStatus, string> = { none: "", burn: "ถูกเผา", paralysis: "เป็นอัมพาต", poison: "ถูกพิษ", sleep: "หลับ", freeze: "ถูกแช่แข็ง" };
  const STATUS_MAP: Record<string, BattleStatus> = { burn: "burn", paralysis: "paralysis", poison: "poison", sleep: "sleep", freeze: "freeze" };

  for (const act of allActs) {
    const atkTeam = act.side === "p" ? pt : ot;
    const defTeam = act.side === "p" ? ot : pt;
    const attacker = atkTeam[act.teamIdx];
    if (!attacker || attacker.currentHp <= 0) continue;

    const mv = attacker.moves[act.moveIndex];
    if (!mv) continue;
    const an = attacker.nameTh || attacker.nameEn;

    if (attacker.status === "paralysis" && Math.random() < 0.25) { add(`${an} เป็นอัมพาตจนไม่สามารถเคลื่อนไหวได้!`, "status"); continue; }
    if (attacker.status === "sleep") {
      if (attacker.statusTurns <= 0) { attacker.status = "none"; add(`${an} ตื่นนอนแล้ว!`, "status"); }
      else { attacker.statusTurns--; add(`${an} กำลังหลับอยู่...`, "status"); continue; }
    }
    if (attacker.status === "freeze") {
      if (Math.random() < 0.2) { attacker.status = "none"; add(`${an} ละลายออกจากน้ำแข็งแล้ว!`, "status"); }
      else { add(`${an} ถูกแช่แข็งไม่สามารถเคลื่อนไหวได้!`, "status"); continue; }
    }

    if (mv.currentPp <= 0) { add(`${an} หมด PP!`); continue; }
    mv.currentPp--;

    const target = defTeam[act.targetTeamIdx];
    if (!target || target.currentHp <= 0) continue;
    const tn = target.nameTh || target.nameEn;

    add(`${an} ใช้ ${mv.nameTh || mv.nameEn}!`);

    if (mv.category === "status") {
      const s = STATUS_MAP[mv.ailment];
      if (s && canApplyStatus(target, s)) {
        target.status = s;
        if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2;
        add(`${tn}${STATUS_NAMES[s]}!`, "status");
      } else { add("ไม่มีผล!"); }
      continue;
    }

    const { damage, effectiveness, isCrit, missed, messages } = rollDamage(attacker, target, mv);
    for (const m of messages) add(m);
    if (missed) continue;

    if (damage > 0) {
      target.currentHp = Math.max(0, target.currentHp - damage);
      add(`${tn} รับ ${damage} แดมเมจ (HP ${target.currentHp}/${target.maxHp})`, "damage");
    }

    // Secondary ailment
    if (mv.ailment && mv.ailment !== "none" && mv.ailmentChance > 0 && Math.random() * 100 < mv.ailmentChance) {
      const s = STATUS_MAP[mv.ailment];
      if (s && canApplyStatus(target, s)) {
        target.status = s;
        if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2;
        add(`${tn}${STATUS_NAMES[s]}!`, "status");
      }
    }
    if (mv.drain > 0 && damage > 0) {
      const h = Math.max(1, Math.floor(damage * mv.drain / 100));
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
      add(`${an} ดูดซับ ${h} HP!`, "heal");
    }
    if (mv.recoil > 0 && damage > 0) {
      const r = Math.max(1, Math.floor(damage * mv.recoil / 100));
      attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`${an} รับดาเมจสะท้อน ${r}!`, "damage");
      if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }
    if (target.currentHp <= 0) add(`${tn} หมดแรง!`, "faint");
  }

  // End-of-turn status damage
  for (const team of [pt, ot]) {
    for (const p of team) {
      if (p.currentHp <= 0) continue;
      const n = p.nameTh || p.nameEn;
      if (p.status === "burn") {
        const d = Math.max(1, Math.floor(p.maxHp / 16));
        p.currentHp = Math.max(0, p.currentHp - d);
        add(`${n} รับ ${d} แดมเมจจากการถูกเผา`, "status");
        if (p.currentHp <= 0) add(`${n} หมดแรง!`, "faint");
      } else if (p.status === "poison") {
        const d = Math.max(1, Math.floor(p.maxHp / 8));
        p.currentHp = Math.max(0, p.currentHp - d);
        add(`${n} รับ ${d} แดมเมจจากพิษ`, "status");
        if (p.currentHp <= 0) add(`${n} หมดแรง!`, "faint");
      }
    }
  }

  // Auto-switch fainted
  const updateActive = (team: SimPokemon[], active: number[]): number[] =>
    active.map(ai => {
      if (team[ai].currentHp > 0) return ai;
      const next = team.findIndex((p, i) => p.currentHp > 0 && !active.includes(i));
      if (next >= 0) { add(`${team[next].nameTh || team[next].nameEn} ออกมาต่อสู้!`); return next; }
      return ai;
    });

  const newPlayerActive = updateActive(pt, state.playerActive);
  const newOpponentActive = updateActive(ot, state.opponentActive);

  const playerFainted = pt.every(p => p.currentHp <= 0);
  const opponentFainted = ot.every(p => p.currentHp <= 0);
  let winner: BattleState["winner"] = null;
  if (opponentFainted) { winner = "player"; add("คุณชนะการต่อสู้! 🎉", "result"); }
  else if (playerFainted) { winner = "opponent"; add("คุณพ่ายแพ้...", "result"); }

  return {
    log,
    state: { ...state, playerTeam: pt, opponentTeam: ot, playerActive: newPlayerActive, opponentActive: newOpponentActive, turn: state.turn + 1, logSeed: lid, winner },
  };
}
