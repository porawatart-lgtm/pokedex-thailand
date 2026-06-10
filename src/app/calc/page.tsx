"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, Zap } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TypeBadge, TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import type { PokemonListItem, DamageResult, BattleCalcInput, StatSet, PokemonTypeName } from "@/types/pokemon";

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

const WEATHER = ["none", "sun", "rain", "sand", "snow", "harshSunlight", "heavyRain", "strongWinds"];
const TERRAIN = ["none", "electric", "grassy", "misty", "psychic"];

async function searchPokemon(q: string): Promise<PokemonListItem[]> {
  const res = await fetch(`/api/pokemon?q=${encodeURIComponent(q)}&limit=8`);
  const data = await res.json() as { data: PokemonListItem[] };
  return data.data;
}

async function getMoves(pokemonId: number) {
  const res = await fetch(`/api/pokemon/${pokemonId}`);
  const data = await res.json() as { data: { moves: Array<{ id: number; slug: string; nameEn: string; typeName: PokemonTypeName | null; category: string | null; power: number | null; accuracy: number | null; pp: number | null }> } };
  return data.data.moves.filter((m) => m.power && m.power > 0).slice(0, 30);
}

async function calcDamage(input: BattleCalcInput): Promise<DamageResult> {
  const res = await fetch("/api/battle/calc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json() as Promise<DamageResult>;
}

function PokemonPicker({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: PokemonListItem | null;
  onSelect: (p: PokemonListItem) => void;
}) {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["calc-search", q],
    queryFn: () => searchPokemon(q),
    enabled: q.length >= 1,
  });

  return (
    <div>
      <p className="text-sm font-semibold mb-2">{label}</p>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ค้นหา..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      {q && data && data.length > 0 && (
        <div className="absolute z-10 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {data.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                setQ(p.nameEn);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-secondary transition-colors text-sm"
            >
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                alt={p.nameEn}
                width={32}
                height={32}
              />
              <span>{p.nameTh ?? p.nameEn}</span>
            </button>
          ))}
        </div>
      )}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${value.id}.png`}
            alt={value.nameEn}
            width={48}
            height={48}
          />
          <div>
            <p className="font-bold text-sm">{value.nameTh ?? value.nameEn}</p>
            <TypeBadgeList types={value.types} size="xs" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DamageCalcPage() {
  const [attacker, setAttacker] = useState<PokemonListItem | null>(null);
  const [defender, setDefender] = useState<PokemonListItem | null>(null);
  const [atkNature, setAtkNature] = useState("Adamant");
  const [defNature, setDefNature] = useState("Bold");
  const [weather, setWeather] = useState("none");
  const [terrain, setTerrain] = useState("none");
  const [selectedMoveId, setSelectedMoveId] = useState<number | null>(null);
  const [result, setResult] = useState<DamageResult | null>(null);

  const { data: attackerMoves } = useQuery({
    queryKey: ["attacker-moves", attacker?.id],
    queryFn: () => getMoves(attacker!.id),
    enabled: !!attacker,
  });

  const defaultEVs: StatSet = { hp: 252, attack: 252, defense: 4, specialAttack: 0, specialDefense: 0, speed: 0 };
  const defaultIVs: StatSet = { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 };

  const selectedMove = attackerMoves?.find((m) => m.id === selectedMoveId);

  const { mutate: calculate, isPending } = useMutation({
    mutationFn: (input: BattleCalcInput) => calcDamage(input),
    onSuccess: (data) => setResult(data),
  });

  const handleCalc = () => {
    if (!attacker || !defender || !selectedMove) return;
    calculate({
      attacker: {
        pokemon: attacker,
        nature: atkNature.toLowerCase(),
        evs: defaultEVs,
        ivs: defaultIVs,
        level: 100,
        ability: null,
        heldItem: null,
        move: {
          id: selectedMove.id,
          slug: selectedMove.slug,
          nameEn: selectedMove.nameEn,
          nameTh: null,
          nameJa: null,
          typeName: selectedMove.typeName,
          category: selectedMove.category as "physical" | "special" | "status" | null,
          power: selectedMove.power,
          accuracy: selectedMove.accuracy,
          pp: selectedMove.pp,
          priority: 0,
          effectChance: null,
          generation: null,
          target: null,
          effect: null,
          effectTh: null,
          shortEffect: null,
          shortEffectTh: null,
          isContactMove: false,
          isZMove: false,
          isMaxMove: false,
        },
      },
      defender: {
        pokemon: defender,
        nature: defNature.toLowerCase(),
        evs: { hp: 252, attack: 0, defense: 252, specialAttack: 0, specialDefense: 4, speed: 0 },
        ivs: defaultIVs,
        level: 100,
        ability: null,
        heldItem: null,
      },
      weather: weather === "none" ? null : weather as BattleCalcInput["weather"],
      terrain: terrain === "none" ? null : terrain as BattleCalcInput["terrain"],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          Damage <span className="text-gradient">Calculator</span>
        </h1>
        <p className="text-muted-foreground">คำนวณดาเมจอย่างละเอียด รองรับ Nature, EV, IV, Weather, Terrain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attacker */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-4 text-orange-400">⚔️ ตัวโจมตี</h2>
          <div className="relative">
            <PokemonPicker label="Pokémon" value={attacker} onSelect={setAttacker} />
          </div>

          {attacker && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nature</label>
                <select
                  value={atkNature}
                  onChange={(e) => setAtkNature(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm focus:outline-none"
                >
                  {NATURES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>

              {attackerMoves && attackerMoves.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ท่าโจมตี</label>
                  <select
                    value={selectedMoveId ?? ""}
                    onChange={(e) => setSelectedMoveId(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">-- เลือกท่า --</option>
                    {attackerMoves.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameEn} ({m.typeName} / Pwr: {m.power ?? "—"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Defender */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-4 text-blue-400">🛡️ ตัวรับ</h2>
          <div className="relative">
            <PokemonPicker label="Pokémon" value={defender} onSelect={setDefender} />
          </div>
          {defender && (
            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Nature</label>
              <select
                value={defNature}
                onChange={(e) => setDefNature(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm focus:outline-none"
              >
                {NATURES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Weather & Terrain */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-xs text-muted-foreground mb-2 block">Weather</label>
          <div className="flex flex-wrap gap-1.5">
            {WEATHER.map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors",
                  weather === w
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {w === "none" ? "ปกติ" : w}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-xs text-muted-foreground mb-2 block">Terrain</label>
          <div className="flex flex-wrap gap-1.5">
            {TERRAIN.map((t) => (
              <button
                key={t}
                onClick={() => setTerrain(t)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors",
                  terrain === t
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {t === "none" ? "ปกติ" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleCalc}
          disabled={!attacker || !defender || !selectedMove || isPending}
          className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
        >
          {isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> กำลังคำนวณ...</>
          ) : (
            <><Zap className="h-5 w-5" /> คำนวณดาเมจ</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-black text-2xl mb-2 text-center">
            {result.minPercent}% — {result.maxPercent}%
          </h3>
          <p className="text-center text-muted-foreground mb-4">{result.descriptionTh}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ดาเมจต่ำสุด</span>
              <span className="font-bold">{result.minDamage} HP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ดาเมจสูงสุด</span>
              <span className="font-bold">{result.maxDamage} HP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Effectiveness</span>
              <span className="font-bold">{result.effectiveness}×</span>
            </div>
          </div>

          {/* Roll visualization */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Damage Rolls (85%-100%)</p>
            <div className="flex gap-1 flex-wrap">
              {result.rolls.map((roll, i) => (
                <span
                  key={i}
                  className="rounded px-1.5 py-0.5 text-xs bg-secondary font-mono"
                >
                  {roll}
                </span>
              ))}
            </div>
          </div>

          {result.isOHKO && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center text-sm text-red-400 font-bold">
              🎯 OHKO GUARANTEED!
            </div>
          )}
          {result.is2HKO && !result.isOHKO && (
            <div className="mt-4 rounded-xl bg-orange-500/10 border border-orange-500/30 p-3 text-center text-sm text-orange-400 font-bold">
              ⚡ 2HKO
            </div>
          )}
        </div>
      )}
    </div>
  );
}
