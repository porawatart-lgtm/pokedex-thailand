"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AbilityListItem {
  slug: string;
  nameEn: string;
  nameTh: string | null;
  nameJa: string | null;
  generation: number | null;
  shortEffect: string | null;
  shortEffectTh: string | null;
  pokemonCount: number;
}

export function AbilitiesList({ abilities }: { abilities: AbilityListItem[] }) {
  const [query, setQuery] = useState("");
  const [gen, setGen] = useState<number | null>(null);

  const generations = useMemo(
    () => [...new Set(abilities.map((a) => a.generation).filter((g): g is number => g !== null))].sort((a, b) => a - b),
    [abilities]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return abilities.filter((a) => {
      if (gen !== null && a.generation !== gen) return false;
      if (!q) return true;
      return (
        a.nameEn.toLowerCase().includes(q) ||
        (a.nameTh?.toLowerCase().includes(q) ?? false) ||
        a.slug.includes(q) ||
        (a.shortEffectTh?.toLowerCase().includes(q) ?? false) ||
        (a.shortEffect?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [abilities, query, gen]);

  return (
    <div>
      {/* Search + Generation filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา Ability…"
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setGen(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              gen === null
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            ทุก Gen
          </button>
          {generations.map((g) => (
            <button
              key={g}
              onClick={() => setGen(g === gen ? null : g)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                gen === g
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              Gen {g}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} รายการ</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">ไม่พบ Ability ที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`/abilities/${a.slug}`}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-secondary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                    {a.nameTh ?? a.nameEn}
                  </p>
                  {a.nameTh && (
                    <p className="text-[11px] text-muted-foreground">{a.nameEn}</p>
                  )}
                </div>
                {a.generation && (
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    Gen {a.generation}
                  </span>
                )}
              </div>
              {(a.shortEffectTh ?? a.shortEffect) && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                  {a.shortEffectTh ?? a.shortEffect}
                </p>
              )}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <Users className="h-3 w-3" />
                {a.pokemonCount} ตัว
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
