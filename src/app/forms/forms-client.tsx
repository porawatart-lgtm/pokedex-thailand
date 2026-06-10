"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Globe, Zap, Sparkles, Sword, ChevronLeft, ChevronRight } from "lucide-react";
import { TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import type { FormItem } from "@/app/api/pokemon/forms/route";
import type { SpecialFormType, PokemonTypeName } from "@/types/pokemon";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: Array<{
  key: SpecialFormType | "all" | "mega-x" | "mega-y";
  labelTh: string;
  color: string;
  icon: React.ElementType;
}> = [
  { key: "all",        labelTh: "ทั้งหมด",        color: "bg-secondary text-foreground border-border",                          icon: Globe },
  { key: "mega",       labelTh: "เมก้า",           color: "bg-purple-500/15 text-purple-300 border-purple-500/40",              icon: Zap },
  { key: "gigantamax", labelTh: "กิกะแมกซ์",       color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",             icon: Sparkles },
  { key: "alolan",     labelTh: "อาโลล่า",         color: "bg-teal-500/15 text-teal-300 border-teal-500/40",                   icon: Globe },
  { key: "galarian",   labelTh: "กาล่า",           color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",             icon: Globe },
  { key: "hisuian",    labelTh: "ชิซุย",           color: "bg-amber-500/15 text-amber-300 border-amber-500/40",                icon: Globe },
  { key: "paldean",    labelTh: "ปัลเดียน",        color: "bg-orange-500/15 text-orange-300 border-orange-500/40",             icon: Globe },
  { key: "other",      labelTh: "ร่างอื่น",        color: "bg-slate-500/15 text-slate-300 border-slate-500/40",               icon: Sword },
];

const CAT_COLOR: Record<string, string> = {
  mega:       "bg-purple-500/15 text-purple-300 border-purple-500/40",
  "mega-x":   "bg-blue-500/15 text-blue-300 border-blue-500/40",
  "mega-y":   "bg-red-500/15 text-red-300 border-red-500/40",
  gigantamax: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  alolan:     "bg-teal-500/15 text-teal-300 border-teal-500/40",
  galarian:   "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
  hisuian:    "bg-amber-500/15 text-amber-300 border-amber-500/40",
  paldean:    "bg-orange-500/15 text-orange-300 border-orange-500/40",
  other:      "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

const STAT_COLORS: Record<string, string> = {
  hp:             "#FF5959",
  attack:         "#F5AC78",
  defense:        "#FAE078",
  specialAttack:  "#9DB7F5",
  specialDefense: "#A7DB8D",
  speed:          "#FA92B2",
};
const STAT_LABELS: Record<string, string> = {
  hp:             "HP",
  attack:         "ATK",
  defense:        "DEF",
  specialAttack:  "SPA",
  specialDefense: "SPD",
  speed:          "SPE",
};

// ─── API fetch ────────────────────────────────────────────────────────────────

async function fetchForms(params: {
  category: string; q: string; page: number; limit: number;
}) {
  const qs = new URLSearchParams({
    category: params.category,
    q:        params.q,
    page:     String(params.page),
    limit:    String(params.limit),
  });
  const res = await fetch(`/api/pokemon/forms?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<{
    data: FormItem[];
    meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
    categoryCounts: Record<string, number>;
  }>;
}

// ─── Stat Bar ─────────────────────────────────────────────────────────────────

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 255) * 100);
  const color = value >= 120 ? "#4ade80" : value >= 80 ? "#facc15" : value >= 50 ? "#fb923c" : "#f87171";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 text-[10px] text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-[10px] font-bold tabular-nums text-right">{value}</span>
    </div>
  );
}

// ─── Form Card ────────────────────────────────────────────────────────────────

function FormCard({ form, index, forceShiny = false }: { form: FormItem; index: number; forceShiny?: boolean }) {
  const [localShiny, setLocalShiny] = useState(false);
  const isShiny = forceShiny || localShiny;
  const catColor = CAT_COLOR[form.formCategory] ?? CAT_COLOR.other;
  const hasShiny = !!form.artworkShiny;

  const imgSrc = isShiny && form.artworkShiny
    ? form.artworkShiny
    : form.artwork ??
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.pokemonId}.png`;

  const statEntries = [
    ["hp",             form.stats.hp],
    ["attack",         form.stats.attack],
    ["defense",        form.stats.defense],
    ["specialAttack",  form.stats.specialAttack],
    ["specialDefense", form.stats.specialDefense],
    ["speed",          form.stats.speed],
  ] as [string, number][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link href={`/pokedex/${form.baseSlug}`} className={cn(
        "group relative rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden flex flex-col h-full",
        isShiny
          ? "border-yellow-400/50 shadow-yellow-400/10 shadow-md"
          : "border-border hover:border-primary/40"
      )}>
        {/* Shiny glow overlay */}
        {isShiny && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-yellow-400/5 to-transparent rounded-2xl" />
        )}

        {/* Form badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", catColor)}>
            {form.formNameTh}
          </span>
        </div>

        {/* Shiny toggle — stopPropagation so Link doesn't navigate */}
        {hasShiny && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLocalShiny((v) => !v); }}
            className={cn(
              "absolute top-2.5 right-2.5 z-10 rounded-full border p-1 transition-all",
              isShiny
                ? "border-yellow-400/60 bg-yellow-400/20 text-yellow-300"
                : "border-border bg-card/80 text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
            title={isShiny ? "ดูร่างปกติ" : "ดูร่างชายนี่"}
          >
            <Sparkles className="h-3 w-3" />
          </button>
        )}

        {/* Artwork */}
        <div className="relative flex justify-center items-center h-36 bg-gradient-to-b from-secondary/30 to-transparent pt-8">
          <Image
            src={imgSrc}
            alt={isShiny ? `${form.formNameEn} (Shiny)` : form.formNameEn}
            width={100}
            height={100}
            className={cn(
              "object-contain drop-shadow-md group-hover:scale-105 transition-all duration-300",
              isShiny && "drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.pokemonId}.png`;
            }}
          />
          {isShiny && (
            <span className="absolute bottom-1 right-2 text-[10px] font-bold text-yellow-300">✨ ชายนี่</span>
          )}
        </div>

          {/* Info */}
          <div className="p-3 flex flex-col gap-2 flex-1">
            {/* Names */}
            <div>
              <p className="font-bold text-sm leading-snug">{form.formNameTh}</p>
              <p className="text-[11px] text-muted-foreground">{form.formNameEn}</p>
            </div>

            {/* Types */}
            <TypeBadgeList types={form.types as PokemonTypeName[]} size="xs" showTh />

            {/* Method */}
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              {form.method}
            </p>

            {/* Stats */}
            <div className="space-y-1 border-t border-border pt-2 mt-auto">
              {statEntries.map(([key, val]) => (
                <StatBar key={key} label={STAT_LABELS[key]!} value={val} />
              ))}
              <div className="flex justify-between text-[10px] pt-0.5">
                <span className="text-muted-foreground">BST</span>
                <span className="font-bold text-primary">{form.stats.total}</span>
              </div>
            </div>

            {/* Flavor text */}
            {form.flavorText && (
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed line-clamp-3 border-t border-border pt-2">
                {form.flavorText}
              </p>
            )}
          </div>
        </Link>
    </motion.div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function FormsPageClient() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const pathname      = usePathname();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [globalShiny, setGlobalShiny] = useState(false);
  const selectedCat   = searchParams.get("category") ?? "all";
  const page          = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["forms", selectedCat, search, page],
    queryFn:  () => fetchForms({ category: selectedCat, q: search, page, limit: 60 }),
    staleTime: 300_000,
  });

  const forms            = data?.data ?? [];
  const meta             = data?.meta;
  const categoryCounts   = data?.categoryCounts ?? {};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", search || null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">ร่างพิเศษ</h1>
          <p className="text-muted-foreground text-sm">
            รวมทุกร่างพิเศษ — เมก้า, ไพรมอล, กิกะแมกซ์, อาโลล่า, กาล่า, ชิซุย, ปัลเดียน
          </p>
        </div>
        <button
          onClick={() => setGlobalShiny((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shrink-0 transition-all",
            globalShiny
              ? "border-yellow-400/60 bg-yellow-400/15 text-yellow-300 shadow-md shadow-yellow-400/10"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Sparkles className={cn("h-4 w-4", globalShiny && "text-yellow-300")} />
          {globalShiny ? "✨ ชายนี่ทั้งหมด" : "ดูชายนี่"}
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาร่างพิเศษ…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </form>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const count = cat.key === "all"
            ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
            : (categoryCounts[cat.key] ?? 0);

          const isActive = selectedCat === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setParam("category", cat.key === "all" ? null : cat.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                isActive ? cat.color : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <cat.icon className="h-3 w-3" />
              {cat.labelTh}
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-card border border-border h-[340px]" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-medium">ยังไม่มีข้อมูลร่างพิเศษ</p>
          <p className="text-sm mt-1">รัน <code className="font-mono bg-secondary px-1 py-0.5 rounded">npx tsx scripts/import-forms.ts</code> ก่อน</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && forms.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">ไม่พบร่างพิเศษ</p>
          {!data && (
            <p className="text-sm mt-1">รัน <code className="font-mono bg-secondary px-1 py-0.5 rounded">npx tsx scripts/import-forms.ts</code> ก่อน</p>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && forms.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {forms.map((form, i) => (
              <FormCard key={form.id} form={form} index={i} forceShiny={globalShiny} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setParam("page", String(page - 1))}
                disabled={!meta.hasPrev}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>
              <span className="text-sm text-muted-foreground">
                หน้า {meta.page} / {meta.totalPages}
                <span className="ml-2 text-xs">({meta.total} รายการ)</span>
              </span>
              <button
                onClick={() => setParam("page", String(page + 1))}
                disabled={!meta.hasNext}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
