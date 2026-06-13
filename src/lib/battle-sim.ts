import { getDualTypeDefenses, TYPE_CHART } from "./type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

// ─── Ability & Item data ──────────────────────────────────────────────────────

export const BATTLE_ABILITIES: Record<string, { nameEn: string; nameTh: string; descTh: string }> = {
  "levitate":       { nameEn: "Levitate",       nameTh: "ลอยตัว",          descTh: "ภูมิคุ้มกัน Ground" },
  "flash-fire":     { nameEn: "Flash Fire",      nameTh: "แฟลชไฟร์",       descTh: "ดูด Fire → บูสต์ Fire ×1.5" },
  "water-absorb":   { nameEn: "Water Absorb",    nameTh: "ดูดน้ำ",          descTh: "ดูด Water → ฟื้น 25% HP" },
  "volt-absorb":    { nameEn: "Volt Absorb",     nameTh: "ดูดไฟฟ้า",       descTh: "ดูด Electric → ฟื้น 25% HP" },
  "lightning-rod":  { nameEn: "Lightning Rod",   nameTh: "สายล่อฟ้า",      descTh: "ดูด Electric → SpAtk +1" },
  "storm-drain":    { nameEn: "Storm Drain",     nameTh: "ท่อระบาย",        descTh: "ดูด Water → SpAtk +1" },
  "sap-sipper":     { nameEn: "Sap Sipper",      nameTh: "ดูดน้ำเลี้ยง",   descTh: "ดูด Grass → Atk +1" },
  "wonder-guard":   { nameEn: "Wonder Guard",    nameTh: "วันเดอร์การ์ด",  descTh: "โดนเฉพาะท่า SE เท่านั้น" },
  "thick-fat":      { nameEn: "Thick Fat",       nameTh: "ไขมันหนา",       descTh: "Fire/Ice ดาเมจ ÷2" },
  "heatproof":      { nameEn: "Heatproof",       nameTh: "กันความร้อน",     descTh: "Fire ดาเมจ ÷2" },
  "dry-skin":       { nameEn: "Dry Skin",        nameTh: "หนังแห้ง",        descTh: "ดูด Water → ฟื้น HP; Fire ×1.25" },
  "huge-power":     { nameEn: "Huge Power",      nameTh: "พลังมหึมา",       descTh: "Atk ×2" },
  "pure-power":     { nameEn: "Pure Power",      nameTh: "พลังบริสุทธิ์",  descTh: "Atk ×2" },
  "hustle":         { nameEn: "Hustle",          nameTh: "ขยัน",            descTh: "Atk ×1.5, แม่นยำกายภาพ ×0.8" },
  "guts":           { nameEn: "Guts",            nameTh: "กล้าหาญ",         descTh: "เมื่อมีสถานะ: Atk ×1.5, ไม่โดนลดจากไฟ" },
  "marvel-scale":   { nameEn: "Marvel Scale",    nameTh: "เกล็ดมหัศจรรย์", descTh: "เมื่อมีสถานะ: Def ×1.5" },
  "quick-feet":     { nameEn: "Quick Feet",      nameTh: "เท้าเร็ว",        descTh: "เมื่อมีสถานะ: Speed ×1.5" },
  "intimidate":     { nameEn: "Intimidate",      nameTh: "ขู่ขวัญ",         descTh: "เมื่อออกมา: Atk ฝ่ายตรงข้าม -1" },
  "speed-boost":    { nameEn: "Speed Boost",     nameTh: "บูสต์ความเร็ว",  descTh: "Speed +1 ทุกสิ้นเทิร์น" },
  "sturdy":         { nameEn: "Sturdy",          nameTh: "แข็งแกร่ง",       descTh: "รอดน็อคเอาท์ครั้งแรกจาก HP เต็ม" },
  "multiscale":     { nameEn: "Multiscale",      nameTh: "หลายชั้น",        descTh: "ดาเมจ ÷2 เมื่อ HP เต็ม" },
  "magic-guard":    { nameEn: "Magic Guard",     nameTh: "การ์ดเวทมนตร์",  descTh: "ไม่เสีย HP จากสถานะ/ไอเทม" },
  "poison-heal":    { nameEn: "Poison Heal",     nameTh: "รักษาพิษ",        descTh: "ฟื้น 1/8 HP ทุกเทิร์นเมื่อถูกพิษ" },
  "adaptability":   { nameEn: "Adaptability",    nameTh: "ปรับตัว",         descTh: "STAB ×2 แทน ×1.5" },
  "blaze":          { nameEn: "Blaze",           nameTh: "ลุกโชน",          descTh: "Fire ×1.5 เมื่อ HP ≤1/3" },
  "torrent":        { nameEn: "Torrent",         nameTh: "กระแสน้ำ",        descTh: "Water ×1.5 เมื่อ HP ≤1/3" },
  "overgrow":       { nameEn: "Overgrow",        nameTh: "เจริญงอกงาม",    descTh: "Grass ×1.5 เมื่อ HP ≤1/3" },
  "swarm":          { nameEn: "Swarm",           nameTh: "ฝูงแมลง",         descTh: "Bug ×1.5 เมื่อ HP ≤1/3" },
  "serene-grace":   { nameEn: "Serene Grace",    nameTh: "เกรซสงบ",         descTh: "โอกาสผลพิเศษ ×2" },
  "sheer-force":    { nameEn: "Sheer Force",     nameTh: "แรงสุทธิ์",       descTh: "ท่าที่มีผลพิเศษ: ดาเมจ ×1.3" },
  "iron-fist":      { nameEn: "Iron Fist",       nameTh: "กำปั้นเหล็ก",    descTh: "ท่าหมัด ×1.2" },
  "technician":     { nameEn: "Technician",      nameTh: "เทคนิเชียน",      descTh: "ท่าที่มีพลัง ≤60: ×1.5" },
  "tinted-lens":    { nameEn: "Tinted Lens",     nameTh: "เลนส์สี",         descTh: "ท่าที่ได้ผลน้อย: ×2" },
  "mold-breaker":   { nameEn: "Mold Breaker",    nameTh: "ทำลายแบบ",        descTh: "เพิกเฉยความสามารถของเป้าหมาย" },
  "no-guard":       { nameEn: "No Guard",        nameTh: "ไม่มีการ์ด",      descTh: "ท่าทั้งสองฝ่ายไม่พลาด" },
  "pressure":       { nameEn: "Pressure",        nameTh: "กดดัน",           descTh: "ฝ่ายตรงข้ามสูญเสีย 2 PP ต่อการใช้ท่า" },
  "download":       { nameEn: "Download",        nameTh: "ดาวน์โหลด",       descTh: "เมื่อออกมา: เพิ่ม Atk หรือ SpAtk" },
  "natural-cure":   { nameEn: "Natural Cure",    nameTh: "รักษาตามธรรมชาติ", descTh: "หายสถานะเมื่อสลับออก" },
};

export const HELD_ITEMS: Record<string, { nameEn: string; nameTh: string; descTh: string }> = {
  "leftovers":        { nameEn: "Leftovers",       nameTh: "เศษอาหาร",           descTh: "+1/16 HP ทุกสิ้นเทิร์น" },
  "black-sludge":     { nameEn: "Black Sludge",    nameTh: "โคลนดำ",             descTh: "Poison: +1/16, อื่น: −1/8 HP/เทิร์น" },
  "life-orb":         { nameEn: "Life Orb",        nameTh: "ลูกแก้วชีวิต",       descTh: "ดาเมจ ×1.3, เสีย 10% HP ทุกครั้งที่โจมตี" },
  "choice-band":      { nameEn: "Choice Band",     nameTh: "เข็มขัดเลือก",       descTh: "Atk ×1.5, ล็อคท่า" },
  "choice-specs":     { nameEn: "Choice Specs",    nameTh: "แว่นตาเลือก",        descTh: "SpAtk ×1.5, ล็อคท่า" },
  "choice-scarf":     { nameEn: "Choice Scarf",    nameTh: "ผ้าพันคอเลือก",      descTh: "Speed ×1.5, ล็อคท่า" },
  "focus-sash":       { nameEn: "Focus Sash",      nameTh: "สายรัดโฟกัส",        descTh: "รอดน็อคเอาท์ครั้งแรกจาก HP เต็ม" },
  "sitrus-berry":     { nameEn: "Sitrus Berry",    nameTh: "ผลไม้ซิตรัส",        descTh: "ฟื้น 25% HP เมื่อ HP ≤50%" },
  "lum-berry":        { nameEn: "Lum Berry",       nameTh: "ผลไม้ลัม",           descTh: "รักษาสถานะครั้งเดียว" },
  "rocky-helmet":     { nameEn: "Rocky Helmet",    nameTh: "หมวกหิน",            descTh: "ถูกโจมตีสัมผัส: ผู้โจมตีเสีย 1/6 HP" },
  "assault-vest":     { nameEn: "Assault Vest",    nameTh: "เสื้อเกราะกั้น",     descTh: "SpDef ×1.5, ใช้ได้เฉพาะท่าโจมตี" },
  "eviolite":         { nameEn: "Eviolite",        nameTh: "อีโวไลต์",           descTh: "Def+SpDef ×1.5" },
  "shell-bell":       { nameEn: "Shell Bell",      nameTh: "กระดิ่งเปลือก",      descTh: "ฟื้น 1/8 ของดาเมจที่ทำ" },
  "flame-orb":        { nameEn: "Flame Orb",       nameTh: "ลูกแก้วเปลวไฟ",     descTh: "ถูกเผาหลังสิ้นเทิร์น" },
  "toxic-orb":        { nameEn: "Toxic Orb",       nameTh: "ลูกแก้วพิษ",         descTh: "ถูกวางพิษหลังสิ้นเทิร์น" },
  "weakness-policy":  { nameEn: "Weakness Policy", nameTh: "นโยบายจุดอ่อน",     descTh: "โดนท่า SE: +2 Atk+SpAtk" },
  "muscle-band":      { nameEn: "Muscle Band",     nameTh: "สายรัดกล้าม",        descTh: "ดาเมจกายภาพ ×1.1" },
  "wise-glasses":     { nameEn: "Wise Glasses",    nameTh: "แว่นตาปราชญ์",       descTh: "ดาเมจพิเศษ ×1.1" },
  "expert-belt":      { nameEn: "Expert Belt",     nameTh: "เข็มขัดผู้เชี่ยวชาญ", descTh: "ท่า SE: ดาเมจ ×1.2" },
  "air-balloon":      { nameEn: "Air Balloon",     nameTh: "บอลลูนลม",           descTh: "ภูมิคุ้มกัน Ground จนกว่าจะถูกโจมตี" },
};

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
  accuracy: number;
  pp: number;
  priority: number;
  ailment: string;
  ailmentChance: number;
  drain: number;
  recoil: number;
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
  ability: string;
  heldItem: string | null;
  choiceLockedMove: number | null;
  flashFireActive: boolean;
  sashUsed: boolean;
  weaknessPolicyUsed: boolean;
  airBalloonPopped: boolean;
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
  ability?: string;
  heldItem?: string | null;
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
    ability: p.ability ?? "",
    heldItem: p.heldItem ?? null,
    choiceLockedMove: null,
    flashFireActive: false,
    sashUsed: false,
    weaknessPolicyUsed: false,
    airBalloonPopped: false,
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

// ─── Entry Effects ────────────────────────────────────────────────────────────

const PUNCH_MOVES = new Set(["ice-punch","fire-punch","thunder-punch","mach-punch","dynamic-punch","drain-punch","focus-punch","shadow-punch","hammer-arm","meteor-mash","power-up-punch","sucker-punch","sky-uppercut","comet-punch","bullet-punch","dizzy-punch","mega-punch"]);

function applyEntry(
  incoming: SimPokemon,
  incomingSide: "p" | "o",
  pt: SimPokemon[], ot: SimPokemon[],
  playerActive: number[], opponentActive: number[],
  add: (text: string, kind?: BattleLogEntry["kind"]) => void,
) {
  const oppTeam = incomingSide === "p" ? ot : pt;
  const oppActive = incomingSide === "p" ? opponentActive : playerActive;
  const name = incoming.nameTh || incoming.nameEn;

  if (incoming.ability === "intimidate") {
    for (const oi of oppActive) {
      const opp = oppTeam[oi];
      if (opp && opp.currentHp > 0) {
        opp.stages.atk = Math.max(-6, opp.stages.atk - 1);
        add(`😤 Intimidate ของ ${name} ลด Atk ของ ${opp.nameTh || opp.nameEn}!`, "status");
      }
    }
  }
  if (incoming.ability === "download") {
    const opp = oppTeam[oppActive[0]];
    if (opp) {
      if (opp.def < opp.spDef) { incoming.stages.atk = Math.min(6, incoming.stages.atk + 1); add(`💻 Download ของ ${name} เพิ่ม Atk!`, "status"); }
      else { incoming.stages.spAtk = Math.min(6, incoming.stages.spAtk + 1); add(`💻 Download ของ ${name} เพิ่ม SpAtk!`, "status"); }
    }
  }
}

export function applyTeamEntryEffects(state: BattleState): TurnResult {
  const pt = JSON.parse(JSON.stringify(state.playerTeam)) as SimPokemon[];
  const ot = JSON.parse(JSON.stringify(state.opponentTeam)) as SimPokemon[];
  const log: BattleLogEntry[] = [];
  let lid = state.logSeed;
  const add = (text: string, kind: BattleLogEntry["kind"] = "info") => log.push({ id: lid++, text, kind });
  for (const pi of state.playerActive) { const p = pt[pi]; if (p) applyEntry(p, "p", pt, ot, state.playerActive, state.opponentActive, add); }
  for (const oi of state.opponentActive) { const o = ot[oi]; if (o) applyEntry(o, "o", pt, ot, state.playerActive, state.opponentActive, add); }
  return { state: { ...state, playerTeam: pt, opponentTeam: ot, logSeed: lid }, log };
}

// ─── Damage Roll ──────────────────────────────────────────────────────────────

interface DmgResult {
  damage: number; effectiveness: number; isCrit: boolean; missed: boolean;
  messages: string[]; weaknessPolicyTriggered: boolean;
}

function rollDamage(attacker: SimPokemon, defender: SimPokemon, move: SimMove): DmgResult {
  if (move.category === "status" || !move.power)
    return { damage: 0, effectiveness: 1, isCrit: false, missed: false, messages: [], weaknessPolicyTriggered: false };

  const msgs: string[] = [];
  const defName = defender.nameTh || defender.nameEn;
  const atkName = attacker.nameTh || attacker.nameEn;
  const ignoringAbility = attacker.ability === "mold-breaker";

  // ── Defender ability: type immunities ──
  if (!ignoringAbility) {
    if (defender.ability === "levitate" && move.type === "ground")
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`✨ ${defName} ลอยตัวหนีท่า Ground!`], weaknessPolicyTriggered: false };
    if (defender.ability === "flash-fire" && move.type === "fire") {
      defender.flashFireActive = true;
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🔥 Flash Fire ของ ${defName} ดูดซับ Fire!`], weaknessPolicyTriggered: false };
    }
    if ((defender.ability === "water-absorb" || defender.ability === "dry-skin") && move.type === "water") {
      const h = Math.max(1, Math.floor(defender.maxHp / 4));
      defender.currentHp = Math.min(defender.maxHp, defender.currentHp + h);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`💧 ${defName} ดูดซับ Water ฟื้น ${h} HP!`], weaknessPolicyTriggered: false };
    }
    if ((defender.ability === "volt-absorb") && move.type === "electric") {
      const h = Math.max(1, Math.floor(defender.maxHp / 4));
      defender.currentHp = Math.min(defender.maxHp, defender.currentHp + h);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`⚡ ${defName} ดูดซับ Electric ฟื้น ${h} HP!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "lightning-rod" && move.type === "electric") {
      defender.stages.spAtk = Math.min(6, defender.stages.spAtk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`⚡ Lightning Rod ของ ${defName} ดูดซับ! SpAtk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "storm-drain" && move.type === "water") {
      defender.stages.spAtk = Math.min(6, defender.stages.spAtk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`💧 Storm Drain ของ ${defName} ดูดซับ! SpAtk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "sap-sipper" && move.type === "grass") {
      defender.stages.atk = Math.min(6, defender.stages.atk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🌿 Sap Sipper ของ ${defName} ดูดซับ! Atk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
  }
  // Air Balloon: immune to Ground until popped
  if (defender.heldItem === "air-balloon" && !defender.airBalloonPopped && move.type === "ground")
    return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🎈 Air Balloon ของ ${defName} ป้องกัน Ground!`], weaknessPolicyTriggered: false };

  // ── Accuracy ──
  const noGuard = attacker.ability === "no-guard" || defender.ability === "no-guard";
  if (!noGuard && move.accuracy > 0) {
    let accMult = STAGE_MULTS[Math.max(-6, Math.min(6, attacker.stages.acc - defender.stages.eva))] ?? 1;
    if (attacker.ability === "hustle" && move.category === "physical") accMult *= 0.8;
    if (Math.random() * 100 >= move.accuracy * accMult)
      return { damage: 0, effectiveness: 1, isCrit: false, missed: true, messages: ["ปาไม่โดน!"], weaknessPolicyTriggered: false };
  }

  const isPhys = move.category === "physical";
  let rawAtk = isPhys ? attacker.atk : attacker.spAtk;
  let rawDef = isPhys ? defender.def : defender.spDef;
  const atkStage = isPhys ? attacker.stages.atk : attacker.stages.spAtk;
  const defStage = isPhys ? defender.stages.def : defender.stages.spDef;

  // ── Attacker ability: stat boosts ──
  if ((attacker.ability === "huge-power" || attacker.ability === "pure-power") && isPhys) rawAtk = Math.floor(rawAtk * 2);
  if (attacker.ability === "hustle" && isPhys) rawAtk = Math.floor(rawAtk * 1.5);
  if (attacker.ability === "guts" && attacker.status !== "none" && isPhys) rawAtk = Math.floor(rawAtk * 1.5);

  // ── Defender ability: defensive stat boosts ──
  if (!ignoringAbility) {
    if (defender.ability === "marvel-scale" && defender.status !== "none" && isPhys) rawDef = Math.floor(rawDef * 1.5);
  }

  // ── Item: defensive stat boosts ──
  if (defender.heldItem === "eviolite") rawDef = Math.floor(rawDef * 1.5);
  if (defender.heldItem === "assault-vest" && !isPhys) rawDef = Math.floor(rawDef * 1.5);

  const isCrit = Math.random() < 1 / 24;
  const finalAtk = withStage(rawAtk, isCrit ? Math.max(0, atkStage) : atkStage);
  const finalDef = withStage(rawDef, isCrit ? Math.min(0, defStage) : defStage);

  let dmg = Math.floor((Math.floor((2 * 50 / 5 + 2) * move.power * finalAtk / finalDef) / 50) + 2);

  // STAB (Adaptability = 2x)
  const stabBonus = attacker.types.includes(move.type) ? (attacker.ability === "adaptability" ? 2 : 1.5) : 1;
  dmg = Math.floor(dmg * stabBonus);

  // Type effectiveness
  const eff = getSimEff(move.type, defender.types);

  // Wonder Guard: only SE works
  if (!ignoringAbility && defender.ability === "wonder-guard" && eff < 2)
    return { damage: 0, effectiveness: eff, isCrit: false, missed: false, messages: [`🛡️ Wonder Guard ของ ${defName} ปัดป้อง!`], weaknessPolicyTriggered: false };

  if (eff === 0) return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: ["ไม่ได้ผลเลย!"], weaknessPolicyTriggered: false };

  let effMult = eff;
  if (!ignoringAbility) {
    if (defender.ability === "thick-fat" && (move.type === "fire" || move.type === "ice")) effMult *= 0.5;
    if (defender.ability === "heatproof" && move.type === "fire") effMult *= 0.5;
    if (defender.ability === "dry-skin" && move.type === "fire") effMult *= 1.25;
  }
  dmg = Math.floor(dmg * effMult);

  if (eff >= 4) msgs.push("ได้ผลอย่างมหาศาล!! ×4");
  else if (eff >= 2) msgs.push("ได้ผลดีมาก! ×2");
  else if (eff < 1) {
    msgs.push("ได้ผลน้อย...");
    if (attacker.ability === "tinted-lens") { dmg = Math.floor(dmg * 2); msgs.push(`🔍 Tinted Lens เพิ่มดาเมจ!`); }
  }

  // Burn penalty (Guts ignores this)
  if (!isCrit && attacker.status === "burn" && isPhys && attacker.ability !== "guts") dmg = Math.floor(dmg * 0.5);
  if (isCrit) { dmg = Math.floor(dmg * 1.5); msgs.push("โจมตีจุดอ่อน!"); }

  // ── Attacker ability: damage boosts ──
  const atLowHp = attacker.currentHp <= Math.floor(attacker.maxHp / 3);
  if (attacker.ability === "blaze"   && move.type === "fire"   && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🔥 Blaze ลุกโชน!"); }
  if (attacker.ability === "torrent" && move.type === "water"  && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("💧 Torrent กระชาก!"); }
  if (attacker.ability === "overgrow"&& move.type === "grass"  && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🌿 Overgrow เจริญงอกงาม!"); }
  if (attacker.ability === "swarm"   && move.type === "bug"    && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🐛 Swarm รุมโจมตี!"); }
  if (attacker.ability === "flash-fire" && move.type === "fire" && attacker.flashFireActive) { dmg = Math.floor(dmg * 1.5); msgs.push("🔥 Flash Fire ถูกกระตุ้น!"); }
  if (attacker.ability === "technician" && move.power <= 60) { dmg = Math.floor(dmg * 1.5); }
  if (attacker.ability === "sheer-force" && move.ailmentChance > 0) dmg = Math.floor(dmg * 1.3);
  if (attacker.ability === "iron-fist" && PUNCH_MOVES.has(move.slug)) dmg = Math.floor(dmg * 1.2);

  // ── Attacker item: damage boosts ──
  const atkItem = attacker.heldItem;
  if (atkItem === "life-orb") dmg = Math.floor(dmg * 1.3);
  if (atkItem === "choice-band" && isPhys) dmg = Math.floor(dmg * 1.5);
  if (atkItem === "choice-specs" && !isPhys) dmg = Math.floor(dmg * 1.5);
  if (atkItem === "muscle-band" && isPhys) dmg = Math.floor(dmg * 1.1);
  if (atkItem === "wise-glasses" && !isPhys) dmg = Math.floor(dmg * 1.1);
  if (atkItem === "expert-belt" && eff >= 2) dmg = Math.floor(dmg * 1.2);

  // Random roll
  dmg = Math.floor(dmg * (Math.floor(Math.random() * 16) + 85) / 100);
  dmg = Math.max(1, dmg);

  // ── Multiscale ──
  if (!ignoringAbility && defender.ability === "multiscale" && defender.currentHp === defender.maxHp) {
    dmg = Math.floor(dmg / 2);
    msgs.push(`✨ Multiscale ของ ${defName} ลดดาเมจ!`);
  }

  // ── Focus Sash survival ──
  if (defender.heldItem === "focus-sash" && !defender.sashUsed && defender.currentHp === defender.maxHp && dmg >= defender.currentHp) {
    dmg = defender.currentHp - 1;
    defender.sashUsed = true;
    msgs.push(`🧣 Focus Sash ของ ${defName} ป้องกัน!`);
  }

  // ── Sturdy survival ──
  if (!ignoringAbility && defender.ability === "sturdy" && defender.currentHp === defender.maxHp && dmg >= defender.currentHp) {
    dmg = defender.currentHp - 1;
    msgs.push(`💪 Sturdy ของ ${defName} ทนอยู่!`);
  }

  // ── Weakness Policy trigger ──
  const weaknessPolicyTriggered = !!(defender.heldItem === "weakness-policy" && !defender.weaknessPolicyUsed && eff >= 2);

  // ── Air Balloon pop ──
  if (defender.heldItem === "air-balloon" && !defender.airBalloonPopped && dmg > 0) {
    defender.airBalloonPopped = true;
    msgs.push(`🎈 Air Balloon ของ ${defName} แตก!`);
  }

  void atkName;
  return { damage: dmg, effectiveness: eff, isCrit, missed: false, messages: msgs, weaknessPolicyTriggered };
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function aiPickAction(attacker: SimPokemon, targets: SimPokemon[]): { moveIndex: number; targetIndex: number } {
  // Respect choice lock
  if (attacker.choiceLockedMove !== null) {
    const mv = attacker.moves[attacker.choiceLockedMove];
    if (mv && mv.currentPp > 0) return { moveIndex: attacker.choiceLockedMove, targetIndex: 0 };
  }

  const available = attacker.moves.map((m, i) => ({ m, i })).filter(x => x.m.currentPp > 0);
  if (!available.length) return { moveIndex: 0, targetIndex: 0 };

  if (Math.random() < 0.2) {
    return {
      moveIndex: available[Math.floor(Math.random() * available.length)].i,
      targetIndex: Math.floor(Math.random() * (targets.filter(t => t.currentHp > 0).length || 1)),
    };
  }

  let best = { score: -1, mi: available[0].i, ti: 0 };
  for (const { m, i } of available) {
    for (let ti = 0; ti < targets.length; ti++) {
      if (targets[ti].currentHp <= 0) continue;
      const t = targets[ti];
      let eff = m.power ? getSimEff(m.type, t.types) : 0.5;
      // Account for common immunities
      if (t.ability === "wonder-guard" && eff < 2) eff = 0;
      if (t.ability === "levitate" && m.type === "ground") eff = 0;
      if ((t.ability === "water-absorb" || t.ability === "dry-skin") && m.type === "water") eff = 0;
      if ((t.ability === "volt-absorb" || t.ability === "lightning-rod") && m.type === "electric") eff = 0;
      if (t.ability === "flash-fire" && m.type === "fire") eff = 0;
      if (t.ability === "sap-sipper" && m.type === "grass") eff = 0;
      if (t.ability === "storm-drain" && m.type === "water") eff = 0;
      if (t.heldItem === "air-balloon" && !t.airBalloonPopped && m.type === "ground") eff = 0;
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

  for (const pa of playerActions) {
    const ti = state.playerActive[pa.activeSlot];
    if (ti === undefined) continue;
    const pk = pt[ti];
    if (!pk || pk.currentHp <= 0) continue;
    // Choice lock enforcement
    const effectiveMoveIdx = pk.choiceLockedMove !== null ? pk.choiceLockedMove : pa.moveIndex;
    const mv = pk.moves[effectiveMoveIdx];
    let spd = withStage(pk.speed, pk.stages.speed);
    if (pk.status === "paralysis" && pk.ability !== "quick-feet") spd = Math.floor(spd * 0.5);
    if (pk.ability === "quick-feet" && pk.status !== "none") spd = Math.floor(spd * 1.5);
    if (pk.heldItem === "choice-scarf") spd = Math.floor(spd * 1.5);
    allActs.push({ side: "p", teamIdx: ti, targetTeamIdx: state.opponentActive[pa.targetSlot] ?? state.opponentActive[0], moveIndex: effectiveMoveIdx, priority: mv?.priority ?? 0, speed: spd });
  }

  for (const aiIdx of state.opponentActive) {
    const pk = ot[aiIdx];
    if (!pk || pk.currentHp <= 0) continue;
    const targets = state.playerActive.map(i => pt[i]).filter(t => t.currentHp > 0);
    const { moveIndex, targetIndex } = aiPickAction(pk, targets);
    const mv = pk.moves[moveIndex];
    let spd = withStage(pk.speed, pk.stages.speed);
    if (pk.status === "paralysis" && pk.ability !== "quick-feet") spd = Math.floor(spd * 0.5);
    if (pk.ability === "quick-feet" && pk.status !== "none") spd = Math.floor(spd * 1.5);
    if (pk.heldItem === "choice-scarf") spd = Math.floor(spd * 1.5);
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

    // Assault Vest: block status moves
    if (attacker.heldItem === "assault-vest" && mv.category === "status") {
      add(`🦺 ${an} ถือ Assault Vest ไม่สามารถใช้ท่าสถานะได้!`);
      continue;
    }

    if (attacker.status === "paralysis" && attacker.ability !== "quick-feet" && Math.random() < 0.25) { add(`⚡ ${an} เป็นอัมพาตจนไม่สามารถเคลื่อนไหวได้!`, "status"); continue; }
    if (attacker.status === "sleep") {
      if (attacker.statusTurns <= 0) { attacker.status = "none"; add(`😴 ${an} ตื่นนอนแล้ว!`, "status"); }
      else { attacker.statusTurns--; add(`💤 ${an} กำลังหลับอยู่...`, "status"); continue; }
    }
    if (attacker.status === "freeze") {
      if (Math.random() < 0.2) { attacker.status = "none"; add(`🧊 ${an} ละลายออกจากน้ำแข็งแล้ว!`, "status"); }
      else { add(`🧊 ${an} ถูกแช่แข็งไม่สามารถเคลื่อนไหวได้!`, "status"); continue; }
    }

    if (mv.currentPp <= 0) { add(`${an} หมด PP!`); continue; }
    mv.currentPp--;
    // Pressure: extra PP loss
    const target = defTeam[act.targetTeamIdx];
    if (target && target.ability === "pressure" && target.currentHp > 0) {
      mv.currentPp = Math.max(0, mv.currentPp - 1);
    }

    if (!target || target.currentHp <= 0) continue;
    const tn = target.nameTh || target.nameEn;

    add(`${an} ใช้ ${mv.nameTh !== mv.nameEn && mv.nameTh ? mv.nameTh : mv.nameEn}!`);

    // Status move
    if (mv.category === "status") {
      const s = STATUS_MAP[mv.ailment];
      if (s && canApplyStatus(target, s)) {
        target.status = s;
        if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2;
        add(`${tn}${STATUS_NAMES[s]}!`, "status");
      } else { add("ไม่มีผล!"); }
      // Set Choice lock
      if (attacker.heldItem === "choice-band" || attacker.heldItem === "choice-specs" || attacker.heldItem === "choice-scarf") {
        if (attacker.choiceLockedMove === null) attacker.choiceLockedMove = act.moveIndex;
      }
      continue;
    }

    const { damage, effectiveness, isCrit: _crit, missed, messages, weaknessPolicyTriggered } = rollDamage(attacker, target, mv);
    void _crit;
    for (const m of messages) add(m, messages.length && (m.includes("ได้ผลดี") || m.includes("ได้ผลน้อย") || m.includes("ไม่ได้ผล") || m.includes("ปาไม่โดน") || m.includes("ลุกโชน") || m.includes("Boost") || m.includes("ทน") || m.includes("Guard") || m.includes("Sash") || m.includes("แตก") || m.includes("ลด") || m.includes("เพิ่ม")) ? "status" : "info");
    if (missed) continue;

    if (damage > 0) {
      target.currentHp = Math.max(0, target.currentHp - damage);
      add(`${tn} รับ ${damage} แดมเมจ (HP ${target.currentHp}/${target.maxHp})`, "damage");
    }

    // Set Choice lock on first use
    if (attacker.heldItem === "choice-band" || attacker.heldItem === "choice-specs" || attacker.heldItem === "choice-scarf") {
      if (attacker.choiceLockedMove === null) attacker.choiceLockedMove = act.moveIndex;
    }

    // Weakness Policy
    if (weaknessPolicyTriggered && damage > 0) {
      target.weaknessPolicyUsed = true;
      target.heldItem = null;
      target.stages.atk = Math.min(6, target.stages.atk + 2);
      target.stages.spAtk = Math.min(6, target.stages.spAtk + 2);
      add(`📜 Weakness Policy ของ ${tn} เพิ่ม Atk+SpAtk!`, "status");
    }

    // Shell Bell: heal attacker
    if (attacker.heldItem === "shell-bell" && damage > 0) {
      const h = Math.max(1, Math.floor(damage / 8));
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
      add(`🐚 ${an} ฟื้น ${h} HP จาก Shell Bell!`, "heal");
    }

    // Life Orb recoil
    if (attacker.heldItem === "life-orb" && damage > 0 && attacker.ability !== "magic-guard") {
      const r = Math.max(1, Math.floor(attacker.maxHp / 10));
      attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`💎 Life Orb ดูดพลัง ${an} ${r} HP!`, "damage");
      if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }

    // Rocky Helmet: damage physical attacker
    if (target.heldItem === "rocky-helmet" && mv.category === "physical" && damage > 0 && attacker.ability !== "magic-guard") {
      const r = Math.max(1, Math.floor(attacker.maxHp / 6));
      attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`⛏️ Rocky Helmet ของ ${tn} ทำอันตราย ${an} ${r} HP!`, "damage");
      if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }

    // Secondary ailment (Serene Grace doubles chance)
    if (mv.ailment && mv.ailment !== "none" && mv.ailmentChance > 0 && attacker.ability !== "sheer-force") {
      const chance = attacker.ability === "serene-grace" ? mv.ailmentChance * 2 : mv.ailmentChance;
      if (Math.random() * 100 < chance) {
        const s = STATUS_MAP[mv.ailment];
        if (s && canApplyStatus(target, s)) {
          target.status = s;
          if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2;
          add(`${tn}${STATUS_NAMES[s]}!`, "status");
        }
      }
    }

    if (mv.drain > 0 && damage > 0) {
      const h = Math.max(1, Math.floor(damage * mv.drain / 100));
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
      add(`${an} ดูดซับ ${h} HP!`, "heal");
    }
    if (mv.recoil > 0 && damage > 0) {
      const r = Math.max(1, Math.floor(damage * mv.recoil / 100));
      if (attacker.ability !== "magic-guard") {
        attacker.currentHp = Math.max(0, attacker.currentHp - r);
        add(`${an} รับดาเมจสะท้อน ${r}!`, "damage");
        if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
      }
    }
    if (target.currentHp <= 0) add(`${tn} หมดแรง!`, "faint");
  }

  // ── End-of-turn effects ───────────────────────────────────────────────────

  for (const p of [...pt, ...ot]) {
    if (p.currentHp <= 0) continue;
    const n = p.nameTh || p.nameEn;
    const magicGuard = p.ability === "magic-guard";

    // Status damage
    if (p.status === "burn") {
      if (!magicGuard) {
        const d = Math.max(1, Math.floor(p.maxHp / 16));
        p.currentHp = Math.max(0, p.currentHp - d);
        add(`🔥 ${n} รับ ${d} แดมเมจจากการถูกเผา`, "status");
        if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; }
      }
    } else if (p.status === "poison") {
      if (p.ability === "poison-heal") {
        const h = Math.max(1, Math.floor(p.maxHp / 8));
        p.currentHp = Math.min(p.maxHp, p.currentHp + h);
        add(`💚 Poison Heal ของ ${n} ฟื้น ${h} HP!`, "heal");
      } else if (!magicGuard) {
        const d = Math.max(1, Math.floor(p.maxHp / 8));
        p.currentHp = Math.max(0, p.currentHp - d);
        add(`☠️ ${n} รับ ${d} แดมเมจจากพิษ`, "status");
        if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; }
      }
    }

    if (p.currentHp <= 0) continue;

    // Speed Boost
    if (p.ability === "speed-boost") {
      p.stages.speed = Math.min(6, p.stages.speed + 1);
      add(`⚡ Speed Boost ของ ${n} เพิ่ม Speed!`, "status");
    }

    // Item effects
    if (!p.heldItem) continue;

    if (p.heldItem === "leftovers") {
      const h = Math.max(1, Math.floor(p.maxHp / 16));
      p.currentHp = Math.min(p.maxHp, p.currentHp + h);
      add(`🍃 ${n} ฟื้น ${h} HP จาก Leftovers!`, "heal");
    } else if (p.heldItem === "black-sludge") {
      if (p.types.includes("poison")) {
        const h = Math.max(1, Math.floor(p.maxHp / 16));
        p.currentHp = Math.min(p.maxHp, p.currentHp + h);
        add(`🖤 ${n} ฟื้น ${h} HP จาก Black Sludge!`, "heal");
      } else if (!magicGuard) {
        const d = Math.max(1, Math.floor(p.maxHp / 8));
        p.currentHp = Math.max(0, p.currentHp - d);
        add(`🖤 Black Sludge ทำอันตราย ${n} ${d} HP!`, "status");
        if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; }
      }
    } else if (p.heldItem === "flame-orb") {
      if (canApplyStatus(p, "burn")) { p.status = "burn"; add(`🔥 Flame Orb เผา ${n}!`, "status"); }
    } else if (p.heldItem === "toxic-orb") {
      if (canApplyStatus(p, "poison")) { p.status = "poison"; add(`☠️ Toxic Orb วางพิษ ${n}!`, "status"); }
    }

    if (p.currentHp <= 0) continue;

    // Sitrus Berry
    if (p.heldItem === "sitrus-berry" && p.currentHp <= Math.floor(p.maxHp / 2)) {
      const h = Math.max(1, Math.floor(p.maxHp / 4));
      p.currentHp = Math.min(p.maxHp, p.currentHp + h);
      p.heldItem = null;
      add(`🍊 ${n} กินผลไม้ซิตรัส ฟื้น ${h} HP!`, "heal");
    }

    // Lum Berry
    if (p.heldItem === "lum-berry" && p.status !== "none") {
      p.status = "none"; p.statusTurns = 0; p.heldItem = null;
      add(`🫐 ${n} กินผลไม้ลัม หายจากสถานะ!`, "heal");
    }
  }

  // ── Auto-switch fainted ───────────────────────────────────────────────────

  let newPlayerActive = [...state.playerActive];
  let newOpponentActive = [...state.opponentActive];

  const updateActive = (team: SimPokemon[], active: number[], side: "p" | "o", otherActive: number[]): number[] =>
    active.map(ai => {
      if (team[ai].currentHp > 0) return ai;
      const next = team.findIndex((p, i) => p.currentHp > 0 && !active.includes(i));
      if (next >= 0) {
        add(`${team[next].nameTh || team[next].nameEn} ออกมาต่อสู้!`);
        applyEntry(team[next], side, pt, ot, side === "p" ? [next] : active, side === "p" ? otherActive : [next], add);
        return next;
      }
      return ai;
    });

  newPlayerActive = updateActive(pt, newPlayerActive, "p", newOpponentActive);
  newOpponentActive = updateActive(ot, newOpponentActive, "o", newPlayerActive);

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
