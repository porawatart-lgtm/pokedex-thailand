"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Clock, Leaf, Zap } from "lucide-react";
import { TypeBadge } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import type { PokemonTypeName } from "@/types/pokemon";

interface FlavorEntry {
  flavor: { name: string };
  potency: number;
}

interface BerryData {
  id: number;
  slug: string;
  displayName: string;
  sprite: string | null;
  cost: number;
  naturalGiftType: string;
  naturalGiftPower: number;
  firmness: string;
  growthTime: number;
  maxHarvest: number;
  size: number;
  smoothness: number;
  flavors: FlavorEntry[];
  shortEffect: string;
}

interface ApiResponse {
  data: BerryData[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const FLAVOR_INFO: Record<string, { emoji: string; label: string; color: string; bar: string }> = {
  spicy: { emoji: "🌶️", label: "เผ็ด", color: "text-red-400", bar: "bg-red-500" },
  dry:   { emoji: "🫙",  label: "แห้ง",  color: "text-blue-400", bar: "bg-blue-500" },
  sweet: { emoji: "🍬",  label: "หวาน",  color: "text-pink-400", bar: "bg-pink-500" },
  bitter:{ emoji: "🌿",  label: "ขม",    color: "text-green-400", bar: "bg-green-600" },
  sour:  { emoji: "🍋",  label: "เปรี้ยว",color: "text-yellow-400", bar: "bg-yellow-500" },
};

const FIRMNESS_INFO: Record<string, { label: string; icon: string; color: string }> = {
  "very-soft":  { label: "นิ่มมาก",  icon: "🫧", color: "text-blue-300" },
  "soft":       { label: "นิ่ม",     icon: "🟦", color: "text-blue-400" },
  "hard":       { label: "แน่น",     icon: "🟫", color: "text-amber-500" },
  "very-hard":  { label: "แน่นมาก", icon: "⬜", color: "text-gray-400" },
  "super-hard": { label: "แน่นสุด",  icon: "🪨", color: "text-gray-300" },
};

async function fetchBerries(page: number, q: string): Promise<ApiResponse> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (q) params.set("q", q);
  const res = await fetch(`/api/items/berries?${params}`);
  if (!res.ok) throw new Error("Failed to fetch berries");
  return res.json() as Promise<ApiResponse>;
}

export default function BerriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["berries", page, debouncedSearch],
    queryFn: () => fetchBerries(page, debouncedSearch),
    placeholderData: (prev) => prev,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <span className="text-3xl">🫐</span>
          เบอร์รี่ <span className="text-gradient">ทั้งหมด</span>
        </h1>
        <p className="text-muted-foreground">
          เบอร์รี่ทุกชนิด พร้อม Natural Gift Type, ความแน่น และรสชาติ
          {data?.meta && (
            <span className="ml-1">· {data.meta.total} ชนิด</span>
          )}
        </p>
      </div>

      {/* Flavor legend */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-2xl border border-border bg-card">
        <p className="text-xs font-semibold text-muted-foreground w-full mb-1">รสชาติเบอร์รี่</p>
        {Object.entries(FLAVOR_INFO).map(([key, f]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary text-xs"
          >
            <div className={cn("h-2 w-2 rounded-full", f.bar)} />
            <span>{f.emoji}</span>
            <span className={f.color}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ค้นหาเบอร์รี่ เช่น cheri, sitrus, lum..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.data.map((berry) => (
            <BerryCard key={berry.id} berry={berry} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">ไม่พบเบอร์รี่</p>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!data.meta.hasPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            หน้า {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function BerryCard({ berry }: { berry: BerryData }) {
  const firmness = FIRMNESS_INFO[berry.firmness];
  const maxFlavor = 40;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-all">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
          {berry.sprite ? (
            <Image
              src={berry.sprite}
              alt={berry.displayName}
              width={56}
              height={56}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="text-3xl">🫐</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">{berry.displayName}</p>
          <p className="text-[10px] text-muted-foreground font-mono">#{String(berry.id).padStart(2, "0")}</p>
          {berry.cost > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">₽{berry.cost.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Natural Gift */}
      <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-secondary/50">
        <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
        <span className="text-[11px] text-muted-foreground">Natural Gift</span>
        <TypeBadge type={berry.naturalGiftType as PokemonTypeName} size="xs" />
        <span className="text-[11px] font-mono text-foreground ml-auto font-bold">
          {berry.naturalGiftPower}
        </span>
      </div>

      {/* Firmness + Growth row */}
      <div className="flex items-center gap-3 mb-3">
        {firmness && (
          <div className="flex items-center gap-1 text-[11px]">
            <Leaf className={cn("h-3 w-3", firmness.color)} />
            <span className="text-muted-foreground">ความแน่น:</span>
            <span className={cn("font-medium", firmness.color)}>{firmness.label}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[11px] ml-auto">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{berry.growthTime}h</span>
        </div>
      </div>

      {/* Flavor bars */}
      {berry.flavors.length > 0 ? (
        <div className="space-y-1.5 mb-2">
          {berry.flavors.map((f) => {
            const info = FLAVOR_INFO[f.flavor.name];
            return (
              <div key={f.flavor.name} className="flex items-center gap-2">
                <span className="text-sm shrink-0" title={f.flavor.name}>
                  {info?.emoji ?? "•"}
                </span>
                <span className="text-[10px] text-muted-foreground w-8 shrink-0">
                  {info?.label ?? f.flavor.name}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      info?.bar ?? "bg-primary"
                    )}
                    style={{ width: `${(f.potency / maxFlavor) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono w-4 text-right shrink-0">
                  {f.potency}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground mb-2">ไม่มีรสชาติ</p>
      )}

      {/* Effect */}
      {berry.shortEffect && (
        <p className="text-[11px] text-muted-foreground pt-2 border-t border-border line-clamp-2 leading-snug">
          {berry.shortEffect}
        </p>
      )}
    </div>
  );
}
