"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface Pokemon {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  dexNumber: number;
  generation: number;
  types: string[];
}

const GENERATIONS = [
  { gen: 0, label: "ทั้งหมด" },
  { gen: 1, label: "Gen 1" },
  { gen: 2, label: "Gen 2" },
  { gen: 3, label: "Gen 3" },
  { gen: 4, label: "Gen 4" },
  { gen: 5, label: "Gen 5" },
  { gen: 6, label: "Gen 6" },
  { gen: 7, label: "Gen 7" },
  { gen: 8, label: "Gen 8" },
  { gen: 9, label: "Gen 9" },
];

export default function ShinyDexPage() {
  const [gen, setGen] = useState(0);
  const [showShiny, setShowShiny] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["shiny-pokemon", gen],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200", page: "1" });
      if (gen > 0) params.set("gen", String(gen));
      const res = await fetch(`/api/pokemon?${params}`);
      const json = await res.json() as { data: Pokemon[]; total: number };
      return json;
    },
    staleTime: 30 * 60 * 1000,
  });

  const pokemon = data?.data ?? [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-7 w-7 text-yellow-400" />
            <h1 className="text-3xl font-bold">ชายนี่เด็กซ์</h1>
          </div>
          <p className="text-muted-foreground">เปรียบเทียบ Normal vs Shiny ของโปเกมอนทุกตัว</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Gen filter */}
          <div className="flex flex-wrap gap-2">
            {GENERATIONS.map((g) => (
              <button
                key={g.gen}
                onClick={() => setGen(g.gen)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  gen === g.gen
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "border-border bg-card hover:bg-secondary text-muted-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Toggle */}
          <button
            onClick={() => setShowShiny(!showShiny)}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
              showShiny
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-border bg-card hover:bg-secondary text-muted-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {showShiny ? "✨ ชายนี่ทั้งหมด" : "ดูชายนี่"}
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pokemon.map((p) => {
              const num = String(p.dexNumber).padStart(4, "0");
              const normalSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
              const shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.id}.png`;

              return (
                <Link
                  key={p.id}
                  href={`/pokedex/${p.slug}`}
                  className="group rounded-xl border border-border bg-card hover:border-yellow-400/50 hover:bg-secondary/50 transition-all p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground">#{num}</span>

                  {/* Normal + Shiny sprites */}
                  <div className="flex items-center gap-1">
                    <img
                      src={normalSprite}
                      alt={p.nameEn}
                      width={56}
                      height={56}
                      className={`pixelated transition-opacity ${showShiny ? "opacity-40" : "opacity-100"}`}
                    />
                    <img
                      src={shinySprite}
                      alt={`${p.nameEn} shiny`}
                      width={56}
                      height={56}
                      className={`pixelated transition-opacity ${showShiny ? "opacity-100" : "opacity-40"}`}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">
                      {p.nameTh ?? p.nameEn}
                    </p>
                    {p.nameTh && (
                      <p className="text-[10px] text-muted-foreground">{p.nameEn}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {pokemon.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-12">ไม่พบโปเกมอน</p>
        )}
      </div>
    </div>
  );
}
