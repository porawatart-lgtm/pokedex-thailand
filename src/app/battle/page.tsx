"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Swords, RefreshCw, X, Loader2, Trophy, Skull, Zap, Shield, Dumbbell, Package, ArrowLeftRight } from "lucide-react";
import { cn, getTypeColor } from "@/lib/utils";
import { TYPE_NAMES_TH } from "@/lib/type-chart";
import type { PokemonTypeName } from "@/types/pokemon";
import {
  buildSimPokemon, processTurn, getSimEff, simCalcHp, simCalcStat,
  applyTeamEntryEffects, BATTLE_ABILITIES, HELD_ITEMS, BERRIES, MEGA_STONE_ITEMS, Z_CRYSTAL_ITEMS,
  type SimMove, type SimPokemon, type BattleMode, type BattleState, type BattleLogEntry, type PlayerAction,
} from "@/lib/battle-sim";

// ─── PokeAPI helpers ──────────────────────────────────────────────────────────

interface PokeAbility { slug: string; nameEn: string; isHidden: boolean }

interface PokeData {
  id: number; slug: string; nameEn: string; nameTh: string;
  types: PokemonTypeName[];
  baseStats: { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
  levelUpMoves: { slug: string; nameEn: string; level: number }[];
  abilities: PokeAbility[];
}

async function fetchPokeData(query: string): Promise<PokeData | null> {
  try {
    const q = query.trim().toLowerCase().replace(/\s+/g, "-");
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
    if (!pokeRes.ok) return null;
    const poke = await pokeRes.json();
    const spec = await (await fetch(poke.species.url)).json();
    const thName = spec.names.find((n: { language: { name: string }; name: string }) => n.language.name === "th")?.name ?? null;
    const luMoves = poke.moves
      .filter((m: { version_group_details: { move_learn_method: { name: string }; level_learned_at: number }[] }) => m.version_group_details.some((d) => d.move_learn_method.name === "level-up"))
      .map((m: { move: { name: string }; version_group_details: { move_learn_method: { name: string }; level_learned_at: number }[] }) => ({
        slug: m.move.name,
        nameEn: m.move.name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        level: Math.max(...m.version_group_details.filter((d) => d.move_learn_method.name === "level-up").map((d) => d.level_learned_at)),
      }))
      .sort((a: { level: number }, b: { level: number }) => b.level - a.level)
      .slice(0, 24);
    const abilities: PokeAbility[] = poke.abilities.map((a: { ability: { name: string }; is_hidden: boolean }) => ({
      slug: a.ability.name,
      nameEn: a.ability.name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      isHidden: a.is_hidden,
    }));
    return {
      id: poke.id, slug: poke.name,
      nameEn: poke.name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      nameTh: thName,
      types: poke.types.map((t: { type: { name: string } }) => t.type.name),
      baseStats: {
        hp: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "hp")?.base_stat ?? 0,
        attack: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "attack")?.base_stat ?? 0,
        defense: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "defense")?.base_stat ?? 0,
        specialAttack: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "special-attack")?.base_stat ?? 0,
        specialDefense: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "special-defense")?.base_stat ?? 0,
        speed: poke.stats.find((s: { stat: { name: string }; base_stat: number }) => s.stat.name === "speed")?.base_stat ?? 0,
      },
      levelUpMoves: luMoves,
      abilities,
    };
  } catch { return null; }
}

async function fetchMoveDetail(slug: string): Promise<SimMove | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${slug}`);
    if (!res.ok) return null;
    const d = await res.json();
    const thName = d.names.find((n: { language: { name: string }; name: string }) => n.language.name === "th")?.name
      ?? d.names.find((n: { language: { name: string }; name: string }) => n.language.name === "en")?.name
      ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const enName = d.names.find((n: { language: { name: string }; name: string }) => n.language.name === "en")?.name ?? thName;
    return {
      slug: d.name, nameEn: enName, nameTh: thName,
      type: d.type.name as PokemonTypeName,
      category: d.damage_class.name as "physical" | "special" | "status",
      power: d.power ?? 0, accuracy: d.accuracy ?? 0, pp: d.pp ?? 10,
      priority: d.priority ?? 0,
      ailment: d.meta?.ailment?.name ?? "none",
      ailmentChance: d.meta?.ailment_chance ?? 0,
      drain: Math.max(0, d.meta?.drain ?? 0),
      recoil: (d.meta?.recoil ?? 0) < 0 ? Math.abs(d.meta.recoil) : 0,
      target: d.target?.name ?? "selected-pokemon",
    };
  } catch { return null; }
}

// ─── AI pool and auto-fill ────────────────────────────────────────────────────

// Starmie (#121) included per request; popular competitive roster
const AI_POOL = [6, 9, 3, 121, 130, 149, 143, 248, 373, 445, 376, 462, 448, 612, 635, 625, 700, 717, 719, 384, 249, 250, 483, 484, 643, 644, 380, 381, 197, 282, 373];

// Quick Pick shortcuts: popular Pokemon with their IDs
const QUICK_PICKS: { id: number; slug: string; name: string }[] = [
  { id: 6,   slug: "charizard",   name: "ชาริซาร์ด" },
  { id: 9,   slug: "blastoise",   name: "บลาสทัวส์" },
  { id: 25,  slug: "pikachu",     name: "ปิกาจู" },
  { id: 121, slug: "starmie",     name: "สตาร์มี" },
  { id: 130, slug: "gyarados",    name: "กาย่าราดอส" },
  { id: 149, slug: "dragonite",   name: "ดราโกไนต์" },
  { id: 248, slug: "tyranitar",   name: "ไทรานิทาร์" },
  { id: 384, slug: "rayquaza",    name: "เรควาซ่า" },
  { id: 445, slug: "garchomp",    name: "การ์ชอมพ์" },
  { id: 448, slug: "lucario",     name: "ลูคาริโอ" },
  { id: 150, slug: "mewtwo",      name: "มิวทู" },
  { id: 143, slug: "snorlax",     name: "สโนแล็กซ์" },
];

async function autoFillTeam(teamSize: number): Promise<PokeData[]> {
  const shuffled = [...AI_POOL].sort(() => Math.random() - 0.5).slice(0, teamSize);
  const results = await Promise.all(shuffled.map(id => fetchPokeData(String(id))));
  return results.filter(Boolean) as PokeData[];
}

async function autoPickMoves(poke: PokeData): Promise<SimMove[]> {
  const details = await Promise.all(poke.levelUpMoves.slice(0, 12).map(m => fetchMoveDetail(m.slug)));
  const valid = details.filter((m): m is SimMove => m !== null);
  const damaging = valid.filter(m => m.power > 0).sort((a, b) => b.power - a.power);
  const status = valid.filter(m => m.power === 0);
  const picked = [...damaging.slice(0, 4), ...status.slice(0, Math.max(0, 4 - Math.min(4, damaging.length)))].slice(0, 4);
  if (picked.length === 0) {
    return [{ slug: "struggle", nameEn: "Struggle", nameTh: "สตรักเกิล", type: "normal", category: "physical", power: 50, accuracy: 0, pp: 1, priority: 0, ailment: "none", ailmentChance: 0, drain: 0, recoil: 25, target: "selected-pokemon" }];
  }
  return picked;
}

// ─── Setup Types ──────────────────────────────────────────────────────────────

interface SlotState {
  pokemon: PokeData | null;
  moves: SimMove[];
  availableMoves: SimMove[];
  loadingMoves: boolean;
  selectedAbility: string;
  selectedItem: string | null;
}
const emptySlot = (): SlotState => ({ pokemon: null, moves: [], availableMoves: [], loadingMoves: false, selectedAbility: "", selectedItem: null });

// ─── Sub-components ───────────────────────────────────────────────────────────

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const color = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (!status || status === "none") return null;
  const map: Record<string, [string, string]> = { burn: ["BRN", "bg-orange-600"], paralysis: ["PAR", "bg-yellow-500"], poison: ["PSN", "bg-purple-600"], sleep: ["SLP", "bg-blue-600"], freeze: ["FRZ", "bg-cyan-600"] };
  const [label, color] = map[status] ?? [status.slice(0, 3).toUpperCase(), "bg-gray-600"];
  return <span className={cn("text-[9px] font-bold text-white px-1 py-0.5 rounded", color)}>{label}</span>;
}

function TypeTag({ type }: { type: PokemonTypeName }) {
  return <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: getTypeColor(type) }}>{TYPE_NAMES_TH[type] ?? type}</span>;
}

function MoveTag({ category }: { category: string }) {
  if (category === "physical") return <span className="text-[9px] font-semibold text-orange-300 flex items-center gap-0.5"><Dumbbell className="h-2.5 w-2.5" />กายภาพ</span>;
  if (category === "special") return <span className="text-[9px] font-semibold text-purple-300 flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" />พิเศษ</span>;
  return <span className="text-[9px] font-semibold text-gray-400 flex items-center gap-0.5"><Shield className="h-2.5 w-2.5" />สถานะ</span>;
}

function MoveRoleTag({ mv }: { mv: { category: string; target: string } }) {
  if (mv.category !== "status") {
    return <span className="text-[9px] font-semibold text-red-400 bg-red-950/40 border border-red-700/40 px-1.5 py-0.5 rounded-full">⚔️ โจมตี</span>;
  }
  const t = mv.target;
  if (t === "user" || t === "users-field") {
    return <span className="text-[9px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-700/40 px-1.5 py-0.5 rounded-full">🔄 ตัวเอง</span>;
  }
  if (t === "ally" || t === "all-allies" || t === "user-or-ally" || t === "entire-field") {
    return <span className="text-[9px] font-semibold text-green-400 bg-green-950/40 border border-green-700/40 px-1.5 py-0.5 rounded-full">💚 เพื่อน</span>;
  }
  return <span className="text-[9px] font-semibold text-yellow-400 bg-yellow-950/40 border border-yellow-700/40 px-1.5 py-0.5 rounded-full">💔 ลดสถิติ</span>;
}

// ─── Item picker constants ────────────────────────────────────────────────────

// Berries merged: sitrus/lum from HELD_ITEMS + all BERRIES
const ALL_BERRIES: Record<string, { nameTh: string; descTh: string }> = {
  "sitrus-berry": { nameTh: "ผลไม้ซิตรัส", descTh: "ฟื้น 25% HP เมื่อ HP ≤50%" },
  "lum-berry":    { nameTh: "ผลไม้ลัม",    descTh: "รักษาทุกสถานะครั้งเดียว" },
  ...BERRIES,
};
const BERRY_GROUPS: Record<string, string[]> = {
  "🍊 ฟื้น HP":    ["sitrus-berry","oran-berry","figy-berry","wiki-berry","mago-berry","aguav-berry","iapapa-berry"],
  "💊 รักษาสถานะ": ["lum-berry","cheri-berry","chesto-berry","pecha-berry","rawst-berry","aspear-berry"],
  "⚡ เพิ่มสถิติ":  ["liechi-berry","petaya-berry","salac-berry","apicot-berry","ganlon-berry","starf-berry","micle-berry"],
  "🛡️ ต้านธาตุ":   ["occa-berry","passho-berry","wacan-berry","rindo-berry","yache-berry","chople-berry","kebia-berry","shuca-berry","coba-berry","payapa-berry","tanga-berry","charti-berry","kasib-berry","haban-berry","colbur-berry","babiri-berry","roseli-berry","chilan-berry"],
};
// Regular items (no berries)
const REGULAR_ITEMS = Object.fromEntries(Object.entries(HELD_ITEMS).filter(([k]) => !k.includes("berry")));

// ─── Pokemon Slot (setup) ─────────────────────────────────────────────────────

function PokemonSlot({ slot, label, onSet, onClear, onOpenMovePicker, onAbilityChange, onItemChange }: {
  slot: SlotState; label: string;
  onSet: (p: PokeData) => void; onClear: () => void; onOpenMovePicker: () => void;
  onAbilityChange: (slug: string) => void; onItemChange: (slug: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemTab, setItemTab] = useState<"items"|"berries"|"mega"|"z">("items");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError("");
    const p = await fetchPokeData(query);
    setLoading(false);
    if (p) { onSet(p); setQuery(""); }
    else setError("ไม่พบโปเกมอน");
  };

  if (slot.pokemon) {
    const p = slot.pokemon;
    const ready = slot.moves.length > 0;
    const selectedAbilityInfo = BATTLE_ABILITIES[slot.selectedAbility];
    const itemIsMegaStone = slot.selectedItem ? !!MEGA_STONE_ITEMS[slot.selectedItem] : false;
    const itemIsZCrystal = slot.selectedItem ? !!Z_CRYSTAL_ITEMS[slot.selectedItem] : false;

    return (
      <div className="rounded-xl border border-border bg-card/50 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.nameEn} width={48} height={48} className="object-contain" style={{ imageRendering: "pixelated" }} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{p.nameTh ?? p.nameEn}</p>
            <p className="text-[11px] text-muted-foreground">{p.nameEn}</p>
            <div className="flex gap-1 mt-0.5">{p.types.map(t => <TypeTag key={t} type={t} />)}</div>
          </div>
          <button type="button" title="ลบโปเกมอน" onClick={onClear} className="text-muted-foreground hover:text-foreground p-1"><X className="h-3.5 w-3.5" /></button>
        </div>

        <div className="text-[10px] text-muted-foreground grid grid-cols-3 gap-1">
          <span>HP: {simCalcHp(p.baseStats.hp)}</span>
          <span>Atk: {simCalcStat(p.baseStats.attack)}</span>
          <span>Def: {simCalcStat(p.baseStats.defense)}</span>
          <span>SpA: {simCalcStat(p.baseStats.specialAttack)}</span>
          <span>SpD: {simCalcStat(p.baseStats.specialDefense)}</span>
          <span>Spe: {simCalcStat(p.baseStats.speed)}</span>
        </div>

        {/* Ability picker */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">Ability:</p>
          <div className="flex flex-wrap gap-1">
            {p.abilities.map(a => {
              const isSelected = slot.selectedAbility === a.slug;
              const info = BATTLE_ABILITIES[a.slug];
              return (
                <button key={a.slug} type="button" onClick={() => onAbilityChange(a.slug)}
                  title={info?.descTh ?? a.nameEn}
                  className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", isSelected ? "border-primary bg-primary/20 text-primary font-semibold" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80")}>
                  {info?.nameTh ?? a.nameEn}{a.isHidden ? " *" : ""}
                </button>
              );
            })}
          </div>
          {selectedAbilityInfo && <p className="text-[10px] text-primary/70">{selectedAbilityInfo.descTh}</p>}
        </div>

        {/* Item picker — tabbed pill buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1"><Package className="h-2.5 w-2.5" />Held Item:</p>
            {slot.selectedItem && (
              <button type="button" onClick={() => onItemChange(null)} className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-0.5">
                <X className="h-2.5 w-2.5" />ล้าง
              </button>
            )}
          </div>

          {/* Selected item badge */}
          {slot.selectedItem && (
            <div className={cn("text-[10px] px-2 py-1 rounded-lg font-medium",
              itemIsMegaStone ? "bg-purple-950/40 border border-purple-600/50 text-purple-300" :
              itemIsZCrystal ? "bg-yellow-950/40 border border-yellow-600/50 text-yellow-300" :
              ALL_BERRIES[slot.selectedItem] ? "bg-green-950/40 border border-green-600/50 text-green-300" :
              "bg-primary/10 border border-primary/30 text-primary"
            )}>
              {itemIsMegaStone ? "🔮 " : itemIsZCrystal ? "💥 " : ALL_BERRIES[slot.selectedItem] ? "🍇 " : "🎒 "}
              {HELD_ITEMS[slot.selectedItem]?.nameTh ?? ALL_BERRIES[slot.selectedItem]?.nameTh ?? MEGA_STONE_ITEMS[slot.selectedItem]?.nameTh ?? Z_CRYSTAL_ITEMS[slot.selectedItem]?.nameTh ?? slot.selectedItem}
              {itemIsMegaStone && <span className="text-purple-400/70 ml-1">— กดปุ่ม 🔮 ระหว่างต่อสู้เพื่อเมก้า</span>}
              {itemIsZCrystal && <span className="text-yellow-400/70 ml-1">— ประเภท {TYPE_NAMES_TH[Z_CRYSTAL_ITEMS[slot.selectedItem]?.type ?? "normal"]}</span>}
              {ALL_BERRIES[slot.selectedItem] && <span className="text-green-400/70 ml-1">— {ALL_BERRIES[slot.selectedItem].descTh}</span>}
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-1">
            {(["items","berries","mega","z"] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setItemTab(tab)}
                className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors font-medium",
                  itemTab === tab ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                {tab === "items" ? "🎒 ไอเทม" : tab === "berries" ? "🍇 เบอร์รี่" : tab === "mega" ? "🔮 เมก้า" : "💥 Z"}
              </button>
            ))}
          </div>

          {/* Tab: regular items */}
          {itemTab === "items" && (
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
              {Object.entries(REGULAR_ITEMS).map(([slug, item]) => (
                <button key={slug} type="button" onClick={() => onItemChange(slug === slot.selectedItem ? null : slug)}
                  title={item.descTh}
                  className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                    slot.selectedItem === slug ? "border-primary bg-primary/20 text-primary font-semibold" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border")}>
                  {item.nameTh}
                </button>
              ))}
            </div>
          )}

          {/* Tab: berries */}
          {itemTab === "berries" && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {Object.entries(BERRY_GROUPS).map(([group, slugs]) => (
                <div key={group}>
                  <p className="text-[9px] text-muted-foreground/60 mb-0.5">{group}</p>
                  <div className="flex flex-wrap gap-1">
                    {slugs.map(slug => {
                      const b = ALL_BERRIES[slug]; if (!b) return null;
                      return (
                        <button key={slug} type="button" onClick={() => onItemChange(slug === slot.selectedItem ? null : slug)}
                          title={b.descTh}
                          className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                            slot.selectedItem === slug ? "border-green-500 bg-green-950/40 text-green-300 font-semibold" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-green-600/50")}>
                          {b.nameTh}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Mega Stones — filtered to this Pokemon */}
          {itemTab === "mega" && (() => {
            const baseSlug = p.slug.split("-")[0];
            const relevant = Object.entries(MEGA_STONE_ITEMS).filter(([, s]) => s.megaSlug.startsWith(baseSlug));
            const rest = Object.entries(MEGA_STONE_ITEMS).filter(([, s]) => !s.megaSlug.startsWith(baseSlug));
            return (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {relevant.length > 0 && (
                  <div>
                    <p className="text-[9px] text-purple-400/70 mb-0.5">⭐ สำหรับ {p.nameTh ?? p.nameEn}</p>
                    <div className="flex flex-wrap gap-1">
                      {relevant.map(([slug, stone]) => (
                        <button key={slug} type="button" onClick={() => onItemChange(slug === slot.selectedItem ? null : slug)}
                          className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                            slot.selectedItem === slug ? "border-purple-400 bg-purple-950/40 text-purple-200 font-semibold" : "border-purple-700/50 text-purple-400 hover:border-purple-400")}>
                          {stone.nameTh}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[9px] text-muted-foreground/60 mb-0.5">หินเมก้าทั้งหมด</p>
                  <div className="flex flex-wrap gap-1">
                    {rest.map(([slug, stone]) => (
                      <button key={slug} type="button" onClick={() => onItemChange(slug === slot.selectedItem ? null : slug)}
                        className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                          slot.selectedItem === slug ? "border-purple-400 bg-purple-950/40 text-purple-200 font-semibold" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-purple-700/50")}>
                        {stone.nameTh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tab: Z-Crystals */}
          {itemTab === "z" && (
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
              {Object.entries(Z_CRYSTAL_ITEMS).map(([slug, crystal]) => (
                <button key={slug} type="button" onClick={() => onItemChange(slug === slot.selectedItem ? null : slug)}
                  title={`ประเภท ${TYPE_NAMES_TH[crystal.type]}`}
                  className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                    slot.selectedItem === slug ? "border-yellow-400 bg-yellow-950/40 text-yellow-200 font-semibold" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-yellow-700/50")}>
                  {crystal.nameTh}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Moves button */}
        <button type="button" onClick={onOpenMovePicker} className={cn("w-full text-xs py-1.5 rounded-lg border transition-colors", ready ? "border-green-600 bg-green-950/40 text-green-400" : "border-orange-600/50 bg-orange-950/30 text-orange-400 hover:bg-orange-950/50")}>
          {slot.loadingMoves ? <span className="flex items-center justify-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />กำลังโหลดท่า...</span> : ready ? `✓ ${slot.moves.map(m => m.nameTh && m.nameTh !== m.nameEn ? m.nameTh : m.nameEn).join(", ")}` : `เลือกท่า (${slot.moves.length}/4)`}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-card/20 p-3 space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex gap-1.5">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="ชื่อ/เลขโปเกมอน..." className="flex-1 text-xs bg-secondary/50 border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary/50" />
        <button type="button" onClick={search} disabled={loading} className="px-2 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Quick Pick shortcuts */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground">Quick Pick:</p>
        <div className="flex flex-wrap gap-1">
          {QUICK_PICKS.map(qp => (
            <button key={qp.id} type="button" onClick={async () => {
              setLoading(true);
              const p = await fetchPokeData(qp.slug);
              setLoading(false);
              if (p) onSet(p);
            }}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${qp.id}.png`} alt="" width={20} height={20} className="inline-block" style={{ imageRendering: "pixelated" }} />
              {qp.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Move Picker Modal ────────────────────────────────────────────────────────

function MovePickerModal({ poke, availableMoves, selectedMoves, loading, onToggle, onClose, onAddMove }: {
  poke: PokeData; availableMoves: SimMove[]; selectedMoves: SimMove[]; loading: boolean;
  onToggle: (m: SimMove) => void; onClose: () => void; onAddMove: (m: SimMove) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchErr("");
    const slug = searchQuery.trim().toLowerCase().replace(/\s+/g, "-");
    const already = availableMoves.find(m => m.slug === slug);
    if (already) { setSearchQuery(""); setSearching(false); return; }
    const move = await fetchMoveDetail(slug);
    setSearching(false);
    if (move) { onAddMove(move); setSearchQuery(""); }
    else setSearchErr(`ไม่พบท่า "${searchQuery}" — ลองชื่อภาษาอังกฤษ เช่น flamethrower, ice-beam, earthquake`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`} alt="" width={36} height={36} style={{ imageRendering: "pixelated" }} />
            <div>
              <p className="font-bold text-sm">{poke.nameTh ?? poke.nameEn}</p>
              <p className="text-[11px] text-muted-foreground">เลือกได้สูงสุด 4 ท่า ({selectedMoves.length}/4)</p>
            </div>
          </div>
          <button type="button" title="ปิด" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-3 space-y-1.5">
          <p className="text-[10px] text-muted-foreground font-medium">🔍 ค้นหาท่าจากทั่วจักรวาลโปเกมอน (พิมพ์ชื่อภาษาอังกฤษ):</p>
          <div className="flex gap-1.5">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="เช่น flamethrower, close-combat, dragon-dance..."
              className="flex-1 text-xs bg-secondary/50 border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary/50" />
            <button type="button" onClick={handleSearch} disabled={searching || !searchQuery.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs transition-colors disabled:opacity-50 flex items-center gap-1">
              {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </button>
          </div>
          {searchErr && <p className="text-[10px] text-red-400">{searchErr}</p>}
        </div>

        <div className="border-t border-border/30 mb-2" />

        {loading ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">กำลังโหลดท่า...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <p className="text-[10px] text-muted-foreground mb-1">ท่าในคลัง ({availableMoves.length} ท่า):</p>
            {availableMoves.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">ไม่มีท่าในคลัง — ค้นหาท่าด้านบน</p>}
            {availableMoves.map(mv => {
              const sel = selectedMoves.some(s => s.slug === mv.slug);
              const disabled = !sel && selectedMoves.length >= 4;
              return (
                <button key={mv.slug} type="button" onClick={() => !disabled && onToggle(mv)} disabled={disabled}
                  className={cn("w-full text-left rounded-xl p-2.5 border transition-colors", sel ? "border-primary bg-primary/15" : disabled ? "border-border/30 opacity-40 cursor-not-allowed" : "border-border/50 bg-secondary/20 hover:bg-secondary/40")}>
                  <div className="flex items-center gap-2">
                    <TypeTag type={mv.type} />
                    <span className="font-semibold text-sm flex-1">{mv.nameTh && mv.nameTh !== mv.nameEn ? mv.nameTh : mv.nameEn}</span>
                    <MoveTag category={mv.category} />
                    <span className="text-xs text-muted-foreground w-14 text-right">{mv.power ? `พลัง ${mv.power}` : "—"}</span>
                    <span className="text-[10px] text-muted-foreground">PP {mv.pp}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {selectedMoves.length === 4 && (
          <button type="button" onClick={onClose} className="mt-4 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            ยืนยัน {selectedMoves.length} ท่า
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Battle Card ──────────────────────────────────────────────────────────────

function BattleCard({ pokemon, side, isActive }: { pokemon: SimPokemon; side: "player" | "opponent"; isActive: boolean }) {
  const pct = pokemon.maxHp > 0 ? (pokemon.currentHp / pokemon.maxHp) * 100 : 0;
  const spriteUrl = side === "player" ? pokemon.backSpriteUrl : pokemon.spriteUrl;
  const abilityInfo = BATTLE_ABILITIES[pokemon.ability];
  const itemInfo = pokemon.heldItem && HELD_ITEMS[pokemon.heldItem] ? HELD_ITEMS[pokemon.heldItem]
    : pokemon.heldItem && BERRIES[pokemon.heldItem] ? { nameTh: BERRIES[pokemon.heldItem].nameTh, descTh: "เบอร์รี่" }
    : pokemon.heldItem && MEGA_STONE_ITEMS[pokemon.heldItem] ? { nameTh: MEGA_STONE_ITEMS[pokemon.heldItem].nameTh, descTh: "หินเมก้า" }
    : pokemon.heldItem && Z_CRYSTAL_ITEMS[pokemon.heldItem] ? { nameTh: Z_CRYSTAL_ITEMS[pokemon.heldItem].nameTh, descTh: "คริสตัล Z" }
    : null;
  const isMega = pokemon.megaEvolved;
  const isDynamax = pokemon.dynamaxTurnsLeft > 0;

  return (
    <div className={cn("rounded-xl border p-3 transition-all", isActive ? "border-primary/40 bg-primary/5" : "border-border/30 bg-card/30 opacity-60",
      isMega && "border-purple-500/50 bg-purple-950/10",
      isDynamax && "border-red-500/50 bg-red-950/10")}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <img src={spriteUrl} alt={pokemon.nameEn}
            onError={e => { (e.target as HTMLImageElement).src = pokemon.spriteUrl; }}
            width={side === "player" ? 80 : 72} height={side === "player" ? 80 : 72}
            className={cn("object-contain", pokemon.currentHp <= 0 && "opacity-30 grayscale", isDynamax && "scale-110")}
            style={{ imageRendering: "pixelated" }} />
          {pokemon.currentHp <= 0 && <div className="absolute inset-0 flex items-center justify-center"><Skull className="h-6 w-6 text-red-500/70" /></div>}
          {isDynamax && <div className="absolute -top-1 -right-1 text-[10px]">🌟</div>}
          {isMega && !isDynamax && <div className="absolute -top-1 -right-1 text-[10px]">🔮</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="font-bold text-sm">{pokemon.nameTh || pokemon.nameEn}</span>
            <StatusPill status={pokemon.status} />
            {pokemon.choiceLockedMove !== null && <span className="text-[8px] bg-yellow-900/60 text-yellow-300 px-1 rounded">ล็อค</span>}
            {isMega && <span className="text-[8px] bg-purple-900/60 text-purple-300 px-1 rounded font-bold">MEGA</span>}
            {isDynamax && <span className="text-[8px] bg-red-900/60 text-red-300 px-1 rounded font-bold">DMX {pokemon.dynamaxTurnsLeft}</span>}
            {pokemon.flashFireActive && <span className="text-[8px]">🔥</span>}
          </div>
          <div className="flex gap-1 mb-1.5">{pokemon.types.map(t => <TypeTag key={t} type={t} />)}</div>
          <HpBar current={pokemon.currentHp} max={pokemon.maxHp} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>{pokemon.currentHp}/{pokemon.maxHp} HP</span>
            <span>{Math.round(pct)}%</span>
          </div>
          {(abilityInfo || itemInfo) && (
            <div className="mt-1 text-[9px] text-muted-foreground/70 truncate">
              {abilityInfo && <span>✨ {abilityInfo.nameTh}</span>}
              {itemInfo && <span> · 🎒 {(itemInfo as { nameTh: string }).nameTh}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Battle Log ───────────────────────────────────────────────────────────────

function BattleLog({ entries }: { entries: BattleLogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [entries]);
  return (
    <div ref={ref} className="h-36 overflow-y-auto rounded-xl border border-border bg-black/30 p-3 space-y-0.5 text-xs">
      {entries.length === 0 && <p className="text-muted-foreground/50 italic">รอการต่อสู้...</p>}
      {entries.map(e => (
        <p key={e.id} className={cn("leading-relaxed", {
          "text-red-400 font-semibold": e.kind === "damage",
          "text-yellow-400": e.kind === "status",
          "text-green-400": e.kind === "heal",
          "text-orange-400 font-bold": e.kind === "faint",
          "text-primary font-bold text-sm": e.kind === "result",
          "text-muted-foreground": e.kind === "info",
        })}>
          {e.text}
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = "mode" | "setup" | "battle" | "end";

export default function BattlePage() {
  const [phase, setPhase] = useState<Phase>("mode");
  const [mode, setMode] = useState<BattleMode>("single");
  const teamSize = mode === "single" ? 3 : 4;

  const [playerSlots, setPlayerSlots] = useState<SlotState[]>([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);
  const [opponentSlots, setOpponentSlots] = useState<SlotState[]>([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);
  const [movePicker, setMovePicker] = useState<{ side: "player" | "opponent"; idx: number } | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);

  const [battle, setBattle] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [inputSlot, setInputSlot] = useState(0);
  const [pendingMoveIdx, setPendingMoveIdx] = useState<number | null>(null);
  const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mega / Z / Dynamax toggle state for current action
  const [pendingMega, setPendingMega] = useState(false);
  const [pendingZMove, setPendingZMove] = useState(false);
  const [pendingDynamax, setPendingDynamax] = useState(false);
  // Switch panel state
  const [switchingSlot, setSwitchingSlot] = useState<number | null>(null);
  // Forced switch after faint state
  const [forcedSwitchFor, setForcedSwitchFor] = useState<number | null>(null); // activeSlot index that needs replacement

  const currentPlayerPokemon = battle ? battle.playerTeam[battle.playerActive[inputSlot] ?? battle.playerActive[0]] : null;

  // ── Slot helpers ──────────────────────────────────────────────────────────

  const setSlot = (side: "player" | "opponent", idx: number, update: Partial<SlotState>) => {
    const setter = side === "player" ? setPlayerSlots : setOpponentSlots;
    setter(prev => prev.map((s, i) => i === idx ? { ...s, ...update } : s));
  };

  const handleSetPokemon = (side: "player" | "opponent", idx: number, p: PokeData) => {
    const firstAbility = p.abilities.find(a => !a.isHidden)?.slug ?? p.abilities[0]?.slug ?? "";
    setSlot(side, idx, { pokemon: p, moves: [], availableMoves: [], loadingMoves: false, selectedAbility: firstAbility, selectedItem: null });
  };

  const openMovePicker = async (side: "player" | "opponent", idx: number) => {
    const slots = side === "player" ? playerSlots : opponentSlots;
    const slot = slots[idx];
    if (!slot.pokemon) return;
    setMovePicker({ side, idx });
    if (slot.availableMoves.length === 0) {
      setSlot(side, idx, { loadingMoves: true });
      const details = (await Promise.all(slot.pokemon.levelUpMoves.map(m => fetchMoveDetail(m.slug)))).filter(Boolean) as SimMove[];
      setSlot(side, idx, { availableMoves: details, loadingMoves: false });
    }
  };

  const toggleMove = (side: "player" | "opponent", idx: number, mv: SimMove) => {
    const slots = side === "player" ? playerSlots : opponentSlots;
    const slot = slots[idx];
    const already = slot.moves.some(s => s.slug === mv.slug);
    const newMoves = already ? slot.moves.filter(s => s.slug !== mv.slug) : slot.moves.length < 4 ? [...slot.moves, mv] : slot.moves;
    setSlot(side, idx, { moves: newMoves });
  };

  const addMoveToAvailable = (side: "player" | "opponent", idx: number, mv: SimMove) => {
    const slots = side === "player" ? playerSlots : opponentSlots;
    const slot = slots[idx];
    if (!slot.availableMoves.some(m => m.slug === mv.slug)) {
      setSlot(side, idx, { availableMoves: [...slot.availableMoves, mv] });
    }
  };

  // ── Auto-fill opponent ─────────────────────────────────────────────────────

  const handleAutoFill = async () => {
    setAutoFilling(true);
    const pokemons = await autoFillTeam(teamSize);
    const newSlots = await Promise.all(pokemons.map(async (p) => {
      const moves = await autoPickMoves(p);
      const firstAbility = p.abilities.find(a => !a.isHidden)?.slug ?? p.abilities[0]?.slug ?? "";
      return { pokemon: p, moves, availableMoves: [], loadingMoves: false, selectedAbility: firstAbility, selectedItem: null } as SlotState;
    }));
    setOpponentSlots(prev => prev.map((s, i) => newSlots[i] ?? s));
    setAutoFilling(false);
  };

  // ── Build team ────────────────────────────────────────────────────────────

  const buildTeam = (slots: SlotState[], prefix: string): SimPokemon[] => {
    return slots.slice(0, teamSize).filter(s => s.pokemon && s.moves.length > 0).map((s, i) =>
      buildSimPokemon({
        uid: `${prefix}${i}`,
        id: s.pokemon!.id,
        slug: s.pokemon!.slug,
        nameEn: s.pokemon!.nameEn,
        nameTh: s.pokemon!.nameTh ?? s.pokemon!.nameEn,
        types: s.pokemon!.types,
        baseStats: s.pokemon!.baseStats,
        moves: s.moves,
        ability: s.selectedAbility,
        heldItem: s.selectedItem,
      })
    );
  };

  const canStart = () => {
    const playerReady = playerSlots.slice(0, teamSize).some(s => s.pokemon && s.moves.length > 0);
    const opponentReady = opponentSlots.slice(0, teamSize).some(s => s.pokemon && s.moves.length > 0);
    return playerReady && opponentReady;
  };

  // ── Start battle ──────────────────────────────────────────────────────────

  const startBattle = () => {
    const playerTeam = buildTeam(playerSlots, "p");
    const opponentTeam = buildTeam(opponentSlots, "o");
    if (!playerTeam.length || !opponentTeam.length) return;
    const playerActive = mode === "single" ? [0] : [0, Math.min(1, playerTeam.length - 1)];
    const opponentActive = mode === "single" ? [0] : [0, Math.min(1, opponentTeam.length - 1)];
    const initialState: BattleState = {
      mode, playerTeam, opponentTeam, playerActive, opponentActive,
      turn: 1, logSeed: 1, winner: null,
      playerMegaUsed: false, opponentMegaUsed: false,
    };
    const { state, log } = applyTeamEntryEffects(initialState);
    setBattle(state);
    setBattleLog(log);
    setPendingActions([]);
    setInputSlot(0);
    setPendingMoveIdx(null);
    setPendingMega(false);
    setPendingZMove(false);
    setPendingDynamax(false);
    setSwitchingSlot(null);
    setForcedSwitchFor(null);
    setPhase("battle");
  };

  // ── Battle actions ────────────────────────────────────────────────────────

  const handlePickMove = (moveIdx: number) => {
    if (!battle || isProcessing) return;
    if (mode === "single") {
      executeTurn([{ activeSlot: 0, moveIndex: moveIdx, targetSlot: 0, useMega: pendingMega, useZMove: pendingZMove, useDynamax: pendingDynamax }]);
      setPendingMega(false); setPendingZMove(false); setPendingDynamax(false);
    } else {
      setPendingMoveIdx(moveIdx);
    }
  };

  const handlePickTarget = (targetSlot: number) => {
    if (!battle || isProcessing || pendingMoveIdx === null) return;
    const action: PlayerAction = { activeSlot: inputSlot, moveIndex: pendingMoveIdx, targetSlot, useMega: pendingMega, useZMove: pendingZMove, useDynamax: pendingDynamax };
    const newPending = [...pendingActions, action];
    setPendingMoveIdx(null);
    setPendingMega(false); setPendingZMove(false); setPendingDynamax(false);
    const numActive = mode === "double" ? Math.min(2, battle.playerActive.length) : 1;
    if (newPending.length >= numActive) {
      setPendingActions([]);
      setInputSlot(0);
      executeTurn(newPending);
    } else {
      setPendingActions(newPending);
      setInputSlot(inputSlot + 1);
    }
  };

  // Voluntary switch during battle
  const handleSwitchRequest = (activeSlotIdx: number) => {
    setSwitchingSlot(activeSlotIdx);
    setPendingMoveIdx(null);
  };

  const handleSwitchPick = (benchTeamIdx: number) => {
    if (!battle || switchingSlot === null) return;
    const activeTeamIdx = battle.playerActive[switchingSlot];
    const action: PlayerAction = { activeSlot: switchingSlot, moveIndex: -1, targetSlot: 0, switchTo: benchTeamIdx };
    setSwitchingSlot(null);
    if (mode === "single") {
      executeTurn([action]);
    } else {
      const newPending = [...pendingActions, action];
      const numActive = Math.min(2, battle.playerActive.length);
      if (newPending.length >= numActive) {
        setPendingActions([]); setInputSlot(0);
        executeTurn(newPending);
      } else {
        setPendingActions(newPending);
        setInputSlot(switchingSlot === 0 ? 1 : 0);
      }
    }
    void activeTeamIdx;
  };

  // Forced switch after fainting (player must choose next Pokemon)
  const handleForcedSwitch = (benchTeamIdx: number) => {
    if (!battle || forcedSwitchFor === null) return;
    // Apply the switch immediately to playerActive before any more actions
    const newPlayerActive = [...battle.playerActive];
    newPlayerActive[forcedSwitchFor] = benchTeamIdx;
    setBattle(prev => prev ? { ...prev, playerActive: newPlayerActive } : prev);
    setForcedSwitchFor(null);
  };

  const executeTurn = async (actions: PlayerAction[]) => {
    if (!battle) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 200));
    const { state, log } = processTurn(battle, actions);
    setBattle(state);
    setBattleLog(prev => [...prev, ...log]);
    setIsProcessing(false);

    if (state.winner) {
      setPhase("end");
      return;
    }

    // Check if any of player's active Pokemon fainted and need manual replacement
    const needsSwitch = state.playerActive.findIndex(ai => {
      const p = state.playerTeam[ai];
      return p.currentHp <= 0 && state.playerTeam.some((q, qi) => q.currentHp > 0 && !state.playerActive.includes(qi));
    });

    if (needsSwitch >= 0) {
      setForcedSwitchFor(needsSwitch);
    } else {
      setForcedSwitchFor(null);
      setInputSlot(0);
      setPendingMoveIdx(null);
    }
  };

  const resetAll = () => {
    setBattle(null); setBattleLog([]);
    setPendingActions([]); setInputSlot(0); setPendingMoveIdx(null);
    setPendingMega(false); setPendingZMove(false); setPendingDynamax(false);
    setSwitchingSlot(null); setForcedSwitchFor(null);
    setPhase("mode");
    setPlayerSlots([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);
    setOpponentSlots([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);
  };

  const pickerSlot = movePicker ? (movePicker.side === "player" ? playerSlots : opponentSlots)[movePicker.idx] : null;

  // Helper to compute bench (player Pokemon not currently active, with HP > 0)
  const getPlayerBench = () => {
    if (!battle) return [];
    return battle.playerTeam.map((p, i) => ({ p, i })).filter(({ p, i }) =>
      p.currentHp > 0 && !battle.playerActive.includes(i)
    );
  };

  // Helper: does current pokemon have a valid Z-Crystal match?
  const getZMoveType = (pk: SimPokemon | null) => {
    if (!pk || !pk.heldItem) return null;
    return Z_CRYSTAL_ITEMS[pk.heldItem]?.type ?? null;
  };

  const canMegaEvolve = (pk: SimPokemon | null) =>
    pk && pk.heldItem && MEGA_STONE_ITEMS[pk.heldItem] && !pk.megaEvolved && !battle?.playerMegaUsed;

  const canDynamax = (pk: SimPokemon | null) =>
    pk && !pk.dynamaxUsed && pk.dynamaxTurnsLeft === 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  const bench = getPlayerBench();
  const zMoveType = getZMoveType(currentPlayerPokemon);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="h-6 w-6 text-primary" />จำลองการต่อสู้</h1>
        <p className="text-sm text-muted-foreground">เลือกโปเกมอน Ability ไอเทม และท่าได้อย่างอิสระ · รองรับ Mega / Z-Move / Dynamax</p>
      </div>

      {/* ─── MODE SELECT ─────────────────────────────────────────────────── */}
      {phase === "mode" && (
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-12">
          {(["single", "double"] as BattleMode[]).map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setPhase("setup"); }}
              className="flex-1 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 p-6 text-center transition-all group">
              <div className="text-3xl mb-2">{m === "single" ? "⚔️" : "🏆"}</div>
              <p className="font-bold text-lg">{m === "single" ? "1 vs 1" : "2 vs 2"}</p>
              <p className="text-sm text-muted-foreground mt-1">{m === "single" ? "สู้เดี่ยว" : "สู้เป็นคู่"}</p>
            </button>
          ))}
        </div>
      )}

      {/* ─── SETUP ───────────────────────────────────────────────────────── */}
      {phase === "setup" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPhase("mode")} className="text-muted-foreground hover:text-foreground text-sm">← เลือกโหมด</button>
            <span className="text-sm text-muted-foreground">โหมด: <strong className="text-foreground">{mode === "single" ? "1v1 เดี่ยว" : "2v2 คู่"}</strong> · ต้องการ {teamSize} โปเกมอน/ฝ่าย</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold mb-3 text-blue-400">🛡️ ทีมของคุณ</h2>
              <div className="space-y-3">
                {Array.from({ length: teamSize }).map((_, i) => (
                  <PokemonSlot key={i} slot={playerSlots[i]} label={`ช่อง ${i + 1}`}
                    onSet={p => handleSetPokemon("player", i, p)}
                    onClear={() => setSlot("player", i, emptySlot())}
                    onOpenMovePicker={() => openMovePicker("player", i)}
                    onAbilityChange={slug => setSlot("player", i, { selectedAbility: slug })}
                    onItemChange={slug => setSlot("player", i, { selectedItem: slug })} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-red-400">⚔️ ฝ่ายตรงข้าม</h2>
                <button type="button" onClick={handleAutoFill} disabled={autoFilling} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  {autoFilling ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  สุ่มทีม AI
                </button>
              </div>
              <div className="space-y-3">
                {Array.from({ length: teamSize }).map((_, i) => (
                  <PokemonSlot key={i} slot={opponentSlots[i]} label={`ช่อง ${i + 1}`}
                    onSet={p => handleSetPokemon("opponent", i, p)}
                    onClear={() => setSlot("opponent", i, emptySlot())}
                    onOpenMovePicker={() => openMovePicker("opponent", i)}
                    onAbilityChange={slug => setSlot("opponent", i, { selectedAbility: slug })}
                    onItemChange={slug => setSlot("opponent", i, { selectedItem: slug })} />
                ))}
              </div>
            </div>
          </div>

          <button type="button" onClick={startBattle} disabled={!canStart()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Swords className="h-5 w-5" />เริ่มต่อสู้!
          </button>
        </div>
      )}

      {/* ─── BATTLE ──────────────────────────────────────────────────────── */}
      {(phase === "battle" || phase === "end") && battle && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">เทิร์น {battle.turn}</span>
            <button type="button" onClick={resetAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" />เริ่มใหม่</button>
          </div>

          {/* Field */}
          <div className="rounded-2xl border border-border bg-gradient-to-b from-slate-900 to-slate-800 p-4 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-red-400/70 uppercase tracking-wider">ฝ่ายตรงข้าม</p>
              <div className={cn("grid gap-3", mode === "double" ? "grid-cols-2" : "grid-cols-1 max-w-xs")}>
                {battle.opponentActive.map((teamIdx, slot) => (
                  <BattleCard key={slot} pokemon={battle.opponentTeam[teamIdx]} side="opponent" isActive={battle.opponentTeam[teamIdx].currentHp > 0} />
                ))}
              </div>
            </div>
            <div className="border-t border-border/30 my-2" />
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-wider">ทีมของคุณ</p>
              <div className={cn("grid gap-3", mode === "double" ? "grid-cols-2" : "grid-cols-1 max-w-xs ml-auto")}>
                {battle.playerActive.map((teamIdx, slot) => (
                  <BattleCard key={slot} pokemon={battle.playerTeam[teamIdx]} side="player" isActive={battle.playerTeam[teamIdx].currentHp > 0} />
                ))}
              </div>
            </div>
          </div>

          {/* Bench overview */}
          {bench.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {bench.map(({ p, i }) => (
                <div key={i} className="flex items-center gap-1 rounded-lg border border-border/40 px-2 py-1 bg-card/30">
                  <img src={p.spriteUrl} alt="" width={28} height={28} style={{ imageRendering: "pixelated" }} />
                  <div className="text-[10px]">
                    <p className="font-semibold">{p.nameTh || p.nameEn}</p>
                    <HpBar current={p.currentHp} max={p.maxHp} />
                    <p className="text-muted-foreground">{p.currentHp}/{p.maxHp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* End screen */}
          {phase === "end" && (
            <div className={cn("rounded-2xl border p-6 text-center", battle.winner === "player" ? "border-yellow-500/40 bg-yellow-950/30" : "border-red-500/40 bg-red-950/30")}>
              {battle.winner === "player" ? (
                <><Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-2" /><p className="text-2xl font-extrabold text-yellow-400">คุณชนะ! 🎉</p><p className="text-muted-foreground text-sm mt-1">เยี่ยมมาก! ใน {battle.turn - 1} เทิร์น</p></>
              ) : (
                <><Skull className="h-12 w-12 text-red-400 mx-auto mb-2" /><p className="text-2xl font-extrabold text-red-400">คุณแพ้...</p><p className="text-muted-foreground text-sm mt-1">สู้ต่อไปนะ!</p></>
              )}
              <div className="flex gap-3 justify-center mt-4">
                <button type="button" onClick={startBattle} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />รีแมตช์
                </button>
                <button type="button" onClick={resetAll} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary transition-colors">ตั้งทีมใหม่</button>
              </div>
            </div>
          )}

          {/* Battle action panel */}
          {phase === "battle" && (
            <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">กำลังประมวลผล...</span>
                </div>

              ) : forcedSwitchFor !== null ? (
                /* Forced switch panel after fainting */
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-orange-400">⚠️ โปเกมอนหมดแรง! เลือกตัวต่อไป:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {bench.map(({ p, i }) => (
                      <button key={i} type="button" onClick={() => handleForcedSwitch(i)}
                        className="rounded-xl p-3 border border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/40 text-left transition-colors">
                        <div className="flex items-center gap-2">
                          <img src={p.spriteUrl} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
                          <div>
                            <p className="font-semibold text-sm">{p.nameTh || p.nameEn}</p>
                            <HpBar current={p.currentHp} max={p.maxHp} />
                            <p className="text-[10px] text-muted-foreground">{p.currentHp}/{p.maxHp}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              ) : switchingSlot !== null ? (
                /* Voluntary switch panel */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-400">🔄 เลือกโปเกมอนที่จะส่งเข้า:</p>
                    <button type="button" onClick={() => setSwitchingSlot(null)} className="text-xs text-muted-foreground hover:text-foreground">ยกเลิก</button>
                  </div>
                  {bench.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">ไม่มีโปเกมอนในม้านั่งสำรอง</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {bench.map(({ p, i }) => (
                        <button key={i} type="button" onClick={() => handleSwitchPick(i)}
                          className="rounded-xl p-3 border border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/40 text-left transition-colors">
                          <div className="flex items-center gap-2">
                            <img src={p.spriteUrl} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
                            <div>
                              <p className="font-semibold text-sm">{p.nameTh || p.nameEn}</p>
                              <HpBar current={p.currentHp} max={p.maxHp} />
                              <p className="text-[10px] text-muted-foreground">{p.currentHp}/{p.maxHp}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              ) : currentPlayerPokemon && currentPlayerPokemon.currentHp > 0 ? (
                <>
                  {mode === "double" && (
                    <p className="text-xs text-muted-foreground">
                      เลือกการกระทำสำหรับ <span className="font-bold text-foreground">{currentPlayerPokemon.nameTh || currentPlayerPokemon.nameEn}</span>
                      {pendingMoveIdx !== null && " → เลือกเป้าหมาย"}
                    </p>
                  )}

                  {pendingMoveIdx === null && (
                    <div className="space-y-2">
                      {/* Mega / Dynamax / Z-Move toggles */}
                      <div className="flex gap-2 flex-wrap">
                        {canMegaEvolve(currentPlayerPokemon) && (
                          <button type="button" onClick={() => { setPendingMega(!pendingMega); setPendingDynamax(false); }}
                            className={cn("text-xs px-3 py-1 rounded-full border transition-colors font-semibold", pendingMega ? "border-purple-400 bg-purple-900/50 text-purple-200" : "border-purple-600/50 text-purple-400 hover:border-purple-400")}>
                            🔮 เมก้า{pendingMega ? " ✓" : ""}
                          </button>
                        )}
                        {canDynamax(currentPlayerPokemon) && (
                          <button type="button" onClick={() => { setPendingDynamax(!pendingDynamax); setPendingMega(false); }}
                            className={cn("text-xs px-3 py-1 rounded-full border transition-colors font-semibold", pendingDynamax ? "border-red-400 bg-red-900/50 text-red-200" : "border-red-600/50 text-red-400 hover:border-red-400")}>
                            🌟 Dynamax{pendingDynamax ? " ✓" : ""}
                          </button>
                        )}
                        {zMoveType && (
                          <button type="button" onClick={() => setPendingZMove(!pendingZMove)}
                            className={cn("text-xs px-3 py-1 rounded-full border transition-colors font-semibold", pendingZMove ? "border-yellow-400 bg-yellow-900/50 text-yellow-200" : "border-yellow-600/50 text-yellow-400 hover:border-yellow-400")}>
                            💥 Z-Move{pendingZMove ? " ✓" : ""}
                          </button>
                        )}
                        {bench.length > 0 && (
                          <button type="button" onClick={() => handleSwitchRequest(inputSlot)}
                            className="text-xs px-3 py-1 rounded-full border border-blue-600/50 text-blue-400 hover:border-blue-400 transition-colors flex items-center gap-1">
                            <ArrowLeftRight className="h-3 w-3" />สลับตัว
                          </button>
                        )}
                      </div>

                      {currentPlayerPokemon.choiceLockedMove !== null && (
                        <p className="text-[10px] text-yellow-400 flex items-center gap-1">🔒 Choice Item: ล็อคท่า {currentPlayerPokemon.moves[currentPlayerPokemon.choiceLockedMove]?.nameTh || "—"}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {currentPlayerPokemon.moves.map((mv, i) => {
                          const noPp = mv.currentPp <= 0;
                          const isLocked = currentPlayerPokemon.choiceLockedMove !== null && currentPlayerPokemon.choiceLockedMove !== i;
                          const disabled = noPp || isLocked;
                          const isZEligible = pendingZMove && zMoveType === mv.type;
                          const isDmxActive = pendingDynamax || currentPlayerPokemon.dynamaxTurnsLeft > 0;
                          return (
                            <button key={i} type="button" onClick={() => !disabled && handlePickMove(i)} disabled={disabled}
                              className={cn("rounded-xl p-3 border text-left transition-colors",
                                disabled ? "border-border/30 opacity-40 cursor-not-allowed" :
                                  isZEligible ? "border-yellow-500/70 bg-yellow-950/30 hover:bg-yellow-950/50" :
                                    isDmxActive ? "border-red-500/40 bg-red-950/20 hover:bg-red-950/40" :
                                      "border-border/50 bg-secondary/20 hover:bg-secondary/50")}>
                              <div className="flex items-center gap-1 mb-1 flex-wrap">
                                <TypeTag type={mv.type} />
                                <MoveTag category={mv.category} />
                                {isZEligible && <span className="text-[9px] bg-yellow-700 text-yellow-100 px-1 rounded font-bold">Z!</span>}
                                {isDmxActive && mv.category !== "status" && <span className="text-[9px] bg-red-800 text-red-100 px-1 rounded font-bold">MAX</span>}
                              </div>
                              <p className="font-semibold text-sm leading-tight">{mv.nameTh && mv.nameTh !== mv.nameEn ? mv.nameTh : mv.nameEn}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <MoveRoleTag mv={mv} />
                                <span className="text-[10px] text-muted-foreground">{mv.power ? `พลัง ${mv.power}` : ""}</span>
                                <span className="text-[10px] text-muted-foreground">PP {mv.currentPp}/{mv.pp}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {mode === "double" && pendingMoveIdx !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">เลือกเป้าหมาย:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {battle.opponentActive.map((ti, slot) => {
                          const target = battle.opponentTeam[ti];
                          if (!target || target.currentHp <= 0) return null;
                          return (
                            <button key={slot} type="button" onClick={() => handlePickTarget(slot)}
                              className="rounded-xl p-3 border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-left transition-colors">
                              <div className="flex items-center gap-2">
                                <img src={target.spriteUrl} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
                                <div>
                                  <p className="font-semibold text-sm">{target.nameTh || target.nameEn}</p>
                                  <HpBar current={target.currentHp} max={target.maxHp} />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {mode === "single" && pendingMoveIdx !== null && (() => { handlePickTarget(0); return null; })()}
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">โปเกมอนของคุณหมดแรงแล้ว...</p>
              )}
            </div>
          )}

          <BattleLog entries={battleLog} />
        </div>
      )}

      {movePicker && pickerSlot?.pokemon && (
        <MovePickerModal
          poke={pickerSlot.pokemon}
          availableMoves={pickerSlot.availableMoves}
          selectedMoves={pickerSlot.moves}
          loading={pickerSlot.loadingMoves}
          onToggle={mv => toggleMove(movePicker.side, movePicker.idx, mv)}
          onClose={() => setMovePicker(null)}
          onAddMove={mv => addMoveToAvailable(movePicker.side, movePicker.idx, mv)}
        />
      )}
    </div>
  );
}
