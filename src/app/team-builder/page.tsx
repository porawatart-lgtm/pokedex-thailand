"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, X, Search, Swords, Shield, AlertTriangle, CheckCircle,
  Download, Save, FolderOpen, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeBadge, TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn, getTypeColor } from "@/lib/utils";
import { ALL_TYPES, TYPE_NAMES_TH, getTeamTypeAnalysis } from "@/lib/type-chart";
import type { PokemonListItem, PokemonTypeName } from "@/types/pokemon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamSlotData {
  pokemon: PokemonListItem | null;
}

interface SavedTeam {
  id: string;
  name: string;
  format: string;
  slots: (PokemonListItem | null)[];
  savedAt: number;
}

const STORAGE_KEY = "pokedex-th-teams";

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadSavedTeams(): SavedTeam[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSavedTeams(teams: SavedTeam[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function searchPokemon(q: string): Promise<PokemonListItem[]> {
  const res  = await fetch(`/api/pokemon?q=${encodeURIComponent(q)}&limit=12`);
  const data = await res.json() as { data: PokemonListItem[] };
  return data.data ?? [];
}

// ─── Slot components ──────────────────────────────────────────────────────────

function EmptySlot({ onClick, slotNum }: { onClick: () => void; slotNum: number }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 h-40 w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
    >
      <div className="h-12 w-12 rounded-full border-2 border-dashed border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-xs text-muted-foreground">Slot {slotNum}</span>
    </button>
  );
}

function PokemonSlot({ pokemon, onRemove, onEdit }: {
  pokemon: PokemonListItem;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const typeColor = getTypeColor(pokemon.types[0] ?? "normal");

  return (
    <div
      className="relative rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30 group"
      style={{ boxShadow: `0 4px 20px ${typeColor}10` }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 0%, ${typeColor}, transparent 70%)` }}
      />
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card/80 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <button onClick={onEdit} className="w-full p-3 text-left">
        <div className="flex flex-col items-center gap-1">
          <Image
            src={pokemon.sprites.officialArtwork ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            alt={pokemon.nameEn}
            width={80}
            height={80}
            className="object-contain"
          />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">#{String(pokemon.id).padStart(4, "0")}</p>
            <p className="font-bold text-sm leading-tight">{pokemon.nameTh ?? pokemon.nameEn}</p>
          </div>
          <TypeBadgeList types={pokemon.types} size="xs" showTh />
          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
            <span>BST: <b className="text-foreground">{pokemon.stats.total}</b></span>
            <span>SPE: <b className="text-foreground">{pokemon.stats.speed}</b></span>
          </div>
        </div>
      </button>
    </div>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────

function PokemonSearchModal({ onSelect, onClose }: {
  onSelect: (p: PokemonListItem) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search-pokemon", query],
    queryFn:  () => searchPokemon(query),
    enabled:  query.length >= 1,
    staleTime: 30000,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">เลือกโปเกมอน</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="ค้นหา เช่น Pikachu, 25, ไฟ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query && (
            <p className="text-center text-sm text-muted-foreground py-8">พิมพ์ชื่อโปเกมอนเพื่อค้นหา</p>
          )}
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">กำลังค้นหา...</p>
          )}
          {!isLoading && query && data?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">ไม่พบโปเกมอน</p>
          )}
          <div className="space-y-1">
            {data?.map((p) => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose(); }}
                className="flex items-center gap-3 w-full rounded-xl p-2 hover:bg-secondary transition-colors text-left"
              >
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt={p.nameEn}
                  width={40}
                  height={40}
                  className="object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">#{String(p.id).padStart(4, "0")}</span>
                    <span className="font-semibold text-sm">{p.nameTh ?? p.nameEn}</span>
                    {p.nameTh && <span className="text-xs text-muted-foreground hidden sm:block">{p.nameEn}</span>}
                  </div>
                  <TypeBadgeList types={p.types} size="xs" />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">BST {p.stats.total}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Saved Teams Panel ────────────────────────────────────────────────────────

function SavedTeamsPanel({ savedTeams, onLoad, onDelete }: {
  savedTeams: SavedTeam[];
  onLoad: (team: SavedTeam) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (savedTeams.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          ทีมที่บันทึกไว้ ({savedTeams.length})
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border divide-y divide-border">
              {savedTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Mini sprites */}
                  <div className="flex -space-x-2">
                    {team.slots.filter(Boolean).slice(0, 6).map((p, i) =>
                      p ? (
                        <img
                          key={i}
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                          alt={p.nameEn}
                          width={28}
                          height={28}
                          className="object-contain rounded-full bg-secondary border border-border"
                        />
                      ) : null
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.format} · {team.slots.filter(Boolean).length} ตัว ·{" "}
                      {new Date(team.savedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLoad(team)}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary transition-colors"
                    >
                      โหลด
                    </button>
                    <button
                      onClick={() => onDelete(team.id)}
                      className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Type Coverage Bar ────────────────────────────────────────────────────────

function TypeCoverageBar({ type, count, total, variant }: {
  type: PokemonTypeName;
  count: number;
  total: number;
  variant: "weakness" | "resistance" | "coverage";
}) {
  if (count === 0) return null;
  const color = getTypeColor(type);
  const pct   = Math.min((count / total) * 100, 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <TypeBadge type={type} size="xs" showTh className="w-16 justify-center shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: variant === "weakness" ? "#ef4444" : variant === "resistance" ? "#3b82f6" : color,
          }}
        />
      </div>
      <span className="tabular-nums font-mono shrink-0 text-muted-foreground">{count}/{total}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamBuilderPage() {
  const [slots, setSlots] = useState<TeamSlotData[]>(
    Array.from({ length: 6 }, () => ({ pokemon: null }))
  );
  const [searchingSlot, setSearchingSlot] = useState<number | null>(null);
  const [teamName,      setTeamName]      = useState("ทีมของฉัน");
  const [format,        setFormat]        = useState("OU");
  const [savedTeams,    setSavedTeams]    = useState<SavedTeam[]>([]);
  const [saveMsg,       setSaveMsg]       = useState("");

  // Load saved teams on mount
  useEffect(() => { setSavedTeams(loadSavedTeams()); }, []);

  const filledPokemon  = slots.map((s) => s.pokemon).filter((p): p is PokemonListItem => p !== null);
  const teamTypes      = filledPokemon.map((p) => p.types as PokemonTypeName[]);
  const analysis       = teamTypes.length > 0 ? getTeamTypeAnalysis(teamTypes) : null;
  const worstWeaknesses = analysis
    ? (Object.entries(analysis.weaknesses) as [PokemonTypeName, number][])
        .filter(([, v]) => v >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const handleSelect = useCallback((pokemon: PokemonListItem) => {
    if (searchingSlot === null) return;
    setSlots((prev) => prev.map((s, i) => (i === searchingSlot ? { ...s, pokemon } : s)));
  }, [searchingSlot]);

  const handleRemove = useCallback((idx: number) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { pokemon: null } : s)));
  }, []);

  const handleSave = () => {
    if (filledPokemon.length === 0) return;
    const team: SavedTeam = {
      id:      Date.now().toString(),
      name:    teamName.trim() || "ทีมใหม่",
      format,
      slots:   slots.map((s) => s.pokemon),
      savedAt: Date.now(),
    };
    const updated = [team, ...savedTeams].slice(0, 20); // keep max 20 teams
    setSavedTeams(updated);
    writeSavedTeams(updated);
    setSaveMsg("บันทึกแล้ว ✓");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const handleLoadTeam = (team: SavedTeam) => {
    setTeamName(team.name);
    setFormat(team.format);
    setSlots(team.slots.map((p) => ({ pokemon: p })));
  };

  const handleDeleteTeam = (id: string) => {
    const updated = savedTeams.filter((t) => t.id !== id);
    setSavedTeams(updated);
    writeSavedTeams(updated);
  };

  const handleExport = () => {
    const text = filledPokemon
      .map((p) => `${p.nameEn} @ (item)\nAbility: (ability)\nEVs: 252 HP / 252 Atk / 4 Def\n`)
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => null);
  };

  const handleClear = () => {
    setSlots(Array.from({ length: 6 }, () => ({ pokemon: null })));
    setTeamName("ทีมของฉัน");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">
            <span className="text-gradient">Team</span> Builder
          </h1>
          <p className="text-muted-foreground text-sm">สร้างทีม 6 ตัว · วิเคราะห์ Weakness · บันทึกได้หลายทีม</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {["Ubers", "OU", "UU", "RU", "NU", "PU", "LC", "Doubles OU"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            disabled={filledPokemon.length === 0}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={handleSave}
            disabled={filledPokemon.length === 0}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              saveMsg
                ? "bg-green-600 text-white"
                : "bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            {saveMsg || "บันทึกทีม"}
          </button>

          <Link
            href="/ai-team"
            className="flex items-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            AI สร้างทีม
          </Link>
        </div>
      </div>

      {/* ── Saved Teams Panel ── */}
      <SavedTeamsPanel
        savedTeams={savedTeams}
        onLoad={handleLoadTeam}
        onDelete={handleDeleteTeam}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* ── Left: Team Slots ── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="ชื่อทีม..."
            />
            <span className="text-sm text-muted-foreground font-medium">{format}</span>
            {filledPokemon.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                ล้างทีม
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {slots.map((slot, i) => (
              <div key={i}>
                {slot.pokemon ? (
                  <PokemonSlot
                    pokemon={slot.pokemon}
                    onRemove={() => handleRemove(i)}
                    onEdit={() => setSearchingSlot(i)}
                  />
                ) : (
                  <EmptySlot onClick={() => setSearchingSlot(i)} slotNum={i + 1} />
                )}
              </div>
            ))}
          </div>

          {/* Team Stats */}
          {filledPokemon.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4">
              <h3 className="font-bold mb-3 text-xs text-muted-foreground uppercase tracking-wide">สถิติเฉลี่ยของทีม</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center text-sm">
                {(["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"] as const).map((stat) => {
                  const labels = { hp: "HP", attack: "ATK", defense: "DEF", specialAttack: "SpA", specialDefense: "SpD", speed: "SPE" };
                  const avg = Math.round(filledPokemon.reduce((s, p) => s + p.stats[stat], 0) / filledPokemon.length);
                  return (
                    <div key={stat} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{labels[stat]}</span>
                      <span className="font-bold text-lg tabular-nums">{avg}</span>
                      <span className="text-[10px] text-muted-foreground">เฉลี่ย</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-border text-center">
                <span className="text-xs text-muted-foreground">
                  BST เฉลี่ย{" "}
                  <span className="font-bold text-foreground">
                    {Math.round(filledPokemon.reduce((s, p) => s + p.stats.total, 0) / filledPokemon.length)}
                  </span>
                  {" "}· {filledPokemon.length}/6 ตัว
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Analysis Panel ── */}
        <div className="space-y-4">
          {/* Weakness */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold text-sm">วิเคราะห์ Weakness</h3>
            </div>
            {filledPokemon.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">เพิ่มโปเกมอนเพื่อวิเคราะห์</p>
            ) : (
              <div className="space-y-2">
                {ALL_TYPES.map((type) => {
                  const count = analysis?.weaknesses[type] ?? 0;
                  if (count === 0) return null;
                  return <TypeCoverageBar key={type} type={type} count={count} total={filledPokemon.length} variant="weakness" />;
                })}
              </div>
            )}
          </div>

          {/* Resistance */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <h3 className="font-bold text-sm">ต้านทาน & ภูมิคุ้มกัน</h3>
            </div>
            {filledPokemon.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">เพิ่มโปเกมอนเพื่อวิเคราะห์</p>
            ) : (
              <div className="space-y-2">
                {ALL_TYPES.map((type) => {
                  const count = analysis?.resistances[type] ?? 0;
                  if (count === 0) return null;
                  return <TypeCoverageBar key={type} type={type} count={count} total={filledPokemon.length} variant="resistance" />;
                })}
                {(analysis?.immunities.length ?? 0) > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">ภูมิคุ้มกัน (Immune)</p>
                    <TypeBadgeList types={analysis!.immunities} size="xs" showTh />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {worstWeaknesses.length > 0 && (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <h3 className="font-bold text-sm text-orange-400">คำแนะนำ</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {worstWeaknesses.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <TypeBadge type={type} size="xs" showTh />
                    <span>อ่อนแอ {count} ตัว — ควรเพิ่มตัวต้าน {TYPE_NAMES_TH[type]}</span>
                  </div>
                ))}
              </div>
              <Link href="/ai-team" className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline">
                ให้ AI แนะนำโปเกมอนที่เหมาะสม →
              </Link>
            </div>
          )}

          {/* Offensive Coverage */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Swords className="h-4 w-4 text-orange-400" />
              <h3 className="font-bold text-sm">ประเภทโจมตีในทีม</h3>
            </div>
            {filledPokemon.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">เพิ่มโปเกมอนเพื่อวิเคราะห์</p>
            ) : (
              <TypeBadgeList
                types={[...new Set(filledPokemon.flatMap((p) => p.types))] as PokemonTypeName[]}
                size="xs"
                showTh
                className="flex-wrap gap-1.5"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Search Modal ── */}
      <AnimatePresence>
        {searchingSlot !== null && (
          <PokemonSearchModal
            onSelect={handleSelect}
            onClose={() => setSearchingSlot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
