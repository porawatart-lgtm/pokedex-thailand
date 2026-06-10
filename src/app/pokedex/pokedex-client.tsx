"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Grid3X3, List, ChevronLeft, ChevronRight,
  SlidersHorizontal, MoveRight, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { TypeBadge } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import { ALL_TYPES } from "@/lib/type-chart";
import type { PokemonListItem } from "@/types/pokemon";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const REGION_NAMES: Record<number, string> = {
  1: "Kanto", 2: "Johto", 3: "Hoenn", 4: "Sinnoh",
  5: "Unova", 6: "Kalos", 7: "Alola", 8: "Galar", 9: "Paldea",
};
const REGION_DEX: Record<number, string> = {
  1: "#0001–0151", 2: "#0152–0251", 3: "#0252–0386", 4: "#0387–0493",
  5: "#0494–0649", 6: "#0650–0721", 7: "#0722–0809", 8: "#0810–0905", 9: "#0906–1025",
};
const REGION_STARTER: Record<number, number> = {
  1: 1, 2: 152, 3: 252, 4: 387, 5: 494, 6: 650, 7: 722, 8: 810, 9: 906,
};
const GEN_COUNT: Record<number, number> = {
  1: 151, 2: 100, 3: 135, 4: 107, 5: 156, 6: 72, 7: 88, 8: 96, 9: 120,
};
const GEN_COLOR: Record<number, string> = {
  1: "#FF0000", 2: "#C0A000", 3: "#0070D0", 4: "#7038F8",
  5: "#606060", 6: "#1C6CA8", 7: "#F4A800", 8: "#003080", 9: "#A00020",
};

// ─── API helper ──────────────────────────────────────────────────────────────

async function fetchPokemonApi(params: {
  page?: number; limit?: number;
  q?: string; type?: string; generation?: number;
}) {
  const query = new URLSearchParams({
    page:  String(params.page  ?? 1),
    limit: String(params.limit ?? 20),
    ...(params.q          && { q:          params.q }),
    ...(params.type       && { type:       params.type }),
    ...(params.generation && { generation: String(params.generation) }),
  });
  const res = await fetch(`/api/pokemon?${query}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<{
    data: PokemonListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }>;
}

// ─── Generation Section (one per gen in "all" view) ──────────────────────────

interface GenSectionProps {
  gen: number;
  viewMode: "grid" | "list";
  onSelectGen: (gen: number) => void;
}

function GenSection({ gen, viewMode, onSelectGen }: GenSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shiny, setShiny] = useState(false);

  // Lazy load: only fetch when section scrolls into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["pokemon-gen-section", gen],
    queryFn: () => fetchPokemonApi({ generation: gen, limit: 200 }),
    enabled: visible,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const pokemon = data?.data ?? [];
  const color = GEN_COLOR[gen];

  return (
    <div ref={ref} className="space-y-4">
      {/* Section Header */}
      <div
        className="flex items-center gap-4 rounded-2xl border p-4"
        style={{ borderColor: color + "40", backgroundColor: color + "0A" }}
      >
        {/* Starter sprite */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${REGION_STARTER[gen]}.png`}
          alt={REGION_NAMES[gen]}
          width={48}
          height={48}
          className="object-contain pixelated flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black" style={{ color }}>
              Generation {gen}
            </h2>
            <span className="text-sm font-bold text-muted-foreground">
              {REGION_NAMES[gen]}
            </span>
            <span className="text-xs text-muted-foreground/60">{REGION_DEX[gen]}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? "กำลังโหลด..." : `${pokemon.length} ตัว`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Shiny toggle for this gen */}
          <button
            onClick={() => setShiny((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all",
              shiny
                ? "border-yellow-400/60 bg-yellow-400/15 text-yellow-300"
                : "border-transparent text-muted-foreground/50 hover:text-muted-foreground hover:border-border"
            )}
            title={shiny ? "ดูร่างปกติ" : "ดูร่างชายนี่"}
          >
            <Sparkles className={cn("h-3 w-3", shiny && "text-yellow-300")} />
            {shiny && <span>✨</span>}
          </button>
          <button
            onClick={() => onSelectGen(gen)}
            className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            style={{ borderColor: color + "40" }}
          >
            ดูทั้งหมด
            <MoveRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Pokemon Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: GEN_COUNT[gen] > 20 ? 20 : GEN_COUNT[gen] }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-card border border-border h-[140px]" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3",
            viewMode === "grid"
              ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
              : "grid-cols-1"
          )}
        >
          {pokemon.map((p, i) => (
            <PokemonCard key={p.id} pokemon={p} variant={viewMode === "list" ? "list" : "compact"} index={i} shiny={shiny} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filtered Grid (search / type / single-gen mode) ─────────────────────────

interface FilteredGridProps {
  page: number;
  debouncedSearch: string;
  selectedType: string;
  selectedGen: number | undefined;
  viewMode: "grid" | "list";
  onPageChange: (page: number) => void;
}

function FilteredGrid({
  page, debouncedSearch, selectedType, selectedGen, viewMode, onPageChange,
}: FilteredGridProps) {
  const limit = 24;
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["pokemon-filtered", page, debouncedSearch, selectedType, selectedGen],
    queryFn:  () => fetchPokemonApi({
      page, limit,
      q:          debouncedSearch  || undefined,
      type:       selectedType     || undefined,
      generation: selectedGen,
    }),
    placeholderData: (prev) => prev,
    staleTime: debouncedSearch ? 0 : 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const pokemon = data?.data ?? [];
  const meta    = data?.meta;

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        viewMode === "grid"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-1"
      )}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-card border border-border h-[200px]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Result count */}
      {meta && (
        <p className="text-sm text-muted-foreground mb-4">
          พบ <span className="font-bold text-foreground">{meta.total.toLocaleString()}</span> ตัว
          {selectedGen && ` · Generation ${selectedGen} (${REGION_NAMES[selectedGen]})`}
        </p>
      )}

      {/* Grid */}
      <div className={cn(
        isFetching && "opacity-70 transition-opacity",
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          : "flex flex-col gap-2"
      )}>
        {pokemon.map((p, i) => (
          <PokemonCard key={p.id} pokemon={p} variant={viewMode} index={i} />
        ))}
      </div>

      {/* Empty */}
      {pokemon.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">ไม่พบโปเกมอน</h3>
          <p className="text-muted-foreground">ลองค้นหาด้วยชื่ออื่น หรือเปลี่ยนตัวกรอง</p>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!meta.hasPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(meta.totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              const total = meta.totalPages;
              if (total <= 7)             pageNum = i + 1;
              else if (page <= 4)         pageNum = i + 1;
              else if (page >= total - 3) pageNum = total - 6 + i;
              else                        pageNum = page - 3 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium",
                    pageNum === page
                      ? "bg-primary text-white"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!meta.hasNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="text-sm text-muted-foreground ml-2">
            หน้า {meta.page}/{meta.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PokedexPageClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");
  const [showFilters,  setShowFilters]  = useState(false);
  const [searchInput,  setSearchInput]  = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  const page        = parseInt(searchParams.get("page")   ?? "1");
  const selectedType = searchParams.get("type")           ?? "";
  const selectedGen  = searchParams.get("generation")
    ? parseInt(searchParams.get("generation")!)
    : undefined;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const handlePageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // "All gens" view: no gen, search, or type filter active
  const isAllView = !selectedGen && !debouncedSearch && !selectedType;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          โปเกเด็กซ์ <span className="text-gradient">ไทยแลนด์</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          โปเกมอนทุกตัว Generation 1–9 · 1,025 ชนิด พร้อมชื่อภาษาไทย
        </p>
      </div>

      {/* ── Generation Tabs ── */}
      <div className="mb-6 -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
          {/* All tab */}
          <button
            onClick={() => updateParams({ generation: undefined })}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl border px-4 py-2.5 text-xs font-medium transition-all min-w-[68px]",
              isAllView && !debouncedSearch && !selectedType
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <span className="text-lg">🌐</span>
            <span className="font-bold">ทั้งหมด</span>
            <span className="text-[9px] opacity-60">1,025 ตัว</span>
          </button>

          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => updateParams({ generation: selectedGen === gen ? undefined : String(gen) })}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-0.5 rounded-2xl border px-3 py-2 text-xs font-medium transition-all min-w-[76px]",
                selectedGen === gen
                  ? "text-white"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              style={
                selectedGen === gen
                  ? { borderColor: GEN_COLOR[gen], backgroundColor: GEN_COLOR[gen] }
                  : {}
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${REGION_STARTER[gen]}.png`}
                alt={REGION_NAMES[gen]}
                width={32}
                height={32}
                className="object-contain pixelated"
              />
              <span className="font-black">Gen {gen}</span>
              <span className="text-[9px] opacity-80">{REGION_NAMES[gen]}</span>
              <span className="text-[9px] opacity-60">{GEN_COUNT[gen]} ตัว</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาโปเกมอน (ชื่อ, เลข Dex)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              showFilters || selectedType
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            ตัวกรอง
            {selectedType && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                1
              </span>
            )}
          </button>

          {/* View Mode */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2.5 text-sm transition-colors",
                viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2.5 text-sm transition-colors",
                viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Type Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4">
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  กรองตามประเภท
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => updateParams({ type: undefined })}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                      !selectedType
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    ทั้งหมด
                  </button>
                  {ALL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateParams({ type: selectedType === type ? undefined : type })}
                    >
                      <TypeBadge
                        type={type}
                        size="xs"
                        showTh
                        className={cn(
                          "cursor-pointer transition-opacity",
                          selectedType === type
                            ? "ring-2 ring-white ring-offset-1 ring-offset-card"
                            : "opacity-70 hover:opacity-100"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {selectedType && (
                  <button
                    onClick={() => updateParams({ type: undefined })}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Content ── */}
      {isAllView ? (
        // All generations view: 9 sections
        <div className="space-y-12">
          {GENERATIONS.map((gen) => (
            <GenSection
              key={gen}
              gen={gen}
              viewMode={viewMode}
              onSelectGen={(g) => updateParams({ generation: String(g) })}
            />
          ))}
        </div>
      ) : (
        // Filtered / single-gen view
        <FilteredGrid
          page={page}
          debouncedSearch={debouncedSearch}
          selectedType={selectedType}
          selectedGen={selectedGen}
          viewMode={viewMode}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
