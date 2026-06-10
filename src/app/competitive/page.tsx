"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ChevronLeft, ChevronRight, Trophy, TrendingUp,
  Package, Sword, Zap, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PokemonEntry {
  rank: number;
  name: string;
  slug: string;
  usage: number;
  raw: number;
  items: Array<{ name: string; pct: number }>;
  moves: Array<{ name: string; pct: number }>;
  abilities: Array<{ name: string; pct: number }>;
  teammates: Array<{ name: string; slug: string; pct: number }>;
}

interface ApiResponse {
  data: PokemonEntry[];
  meta: { total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  info: { metagame: string; month: string; battles: number };
}

const FORMATS = [
  { key: "gen9ou", label: "Gen 9 OU", desc: "OverUsed — มาตรฐานสูงสุด", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  { key: "gen9ubers", label: "Ubers", desc: "โปเกมอนแข็งแกร่งเกิน OU", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
  { key: "gen9uu", label: "Gen 9 UU", desc: "UnderUsed", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  { key: "gen9ru", label: "Gen 9 RU", desc: "RarelyUsed", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  { key: "gen9nu", label: "Gen 9 NU", desc: "NeverUsed", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
  { key: "gen9vgc2024regh", label: "VGC 2024", desc: "Video Game Championship", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
];

function showdownSprite(slug: string) {
  return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
}

async function fetchCompetitive(format: string, page: number, q: string): Promise<ApiResponse> {
  const params = new URLSearchParams({ format, page: String(page), limit: "24" });
  if (q) params.set("q", q);
  const res = await fetch(`/api/competitive?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<ApiResponse>;
}

export default function CompetitivePage() {
  const [format, setFormat] = useState("gen9ou");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["competitive", format, page, debounced],
    queryFn: () => fetchCompetitive(format, page, debounced),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDebounced(v); setPage(1); }, 400);
  };

  const handleFormat = (key: string) => {
    setFormat(key);
    setPage(1);
    setSearch("");
    setDebounced("");
  };

  const activeFormat = FORMATS.find((f) => f.key === format)!;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          Competitive <span className="text-gradient">Center</span>
        </h1>
        <p className="text-muted-foreground">
          Usage stats, ไอเทมยอดนิยม, ท่าโจมตี และเพื่อนร่วมทีม อ้างอิงจาก Smogon
          {data?.info && (
            <span className="ml-1">
              · {data.info.month} · {data.info.battles.toLocaleString()} battles
            </span>
          )}
        </p>
      </div>

      {/* Format tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFormat(f.key)}
            className={cn(
              "flex flex-col items-start px-4 py-2.5 rounded-xl border text-sm transition-all",
              format === f.key
                ? `${f.bg} ${f.border} border`
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className={cn("font-bold", format === f.key ? f.color : "text-foreground")}>
              {f.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{f.desc}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`ค้นหา Pokémon ใน ${activeFormat.label}...`}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {data?.meta && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {data.meta.total} Pokémon
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-6">
          <p className="text-red-400 text-sm">ไม่สามารถโหลดข้อมูล Smogon ได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      )}

      {/* Pokemon grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((p) => (
            <PokemonCard key={p.slug} pokemon={p} format={format} formatColor={activeFormat.color} />
          ))}
        </div>
      ) : !error ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">ไม่พบโปเกมอน</p>
        </div>
      ) : null}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!data.meta.hasPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            หน้า {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function PokemonCard({
  pokemon: p,
  format,
  formatColor,
}: {
  pokemon: PokemonEntry;
  format: string;
  formatColor: string;
}) {
  return (
    <Link href={`/competitive/${p.slug}?format=${format}`}>
      <div className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer">
        {/* Header: sprite + name + rank */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <Image
              src={showdownSprite(p.slug)}
              alt={p.name}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  `https://play.pokemonshowdown.com/sprites/gen5/unknown.png`;
              }}
            />
            <span className="absolute -bottom-1 -left-1 text-[10px] font-mono bg-card border border-border rounded px-1">
              #{p.rank}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{p.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <TrendingUp className={cn("h-3 w-3", formatColor)} />
              <span className={cn("text-xs font-mono font-bold", formatColor)}>
                {p.usage.toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({p.raw.toLocaleString()} battles)
              </span>
            </div>
            {/* Usage bar */}
            <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(p.usage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Items */}
        {p.items.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Package className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">ไอเทม</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.items.slice(0, 3).map((item) => (
                <span
                  key={item.name}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300"
                >
                  {item.name} <span className="opacity-70">{item.pct}%</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Moves */}
        {p.moves.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Sword className="h-3 w-3 text-red-400" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">ท่า</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.moves.slice(0, 3).map((move) => (
                <span
                  key={move.name}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-300"
                >
                  {move.name} <span className="opacity-70">{move.pct}%</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teammates mini row */}
        {p.teammates.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">ทีม</span>
            </div>
            <div className="flex -space-x-1">
              {p.teammates.slice(0, 5).map((t) => (
                <div
                  key={t.slug}
                  title={`${t.name} ${t.pct}%`}
                  className="h-7 w-7 rounded-full bg-secondary border-2 border-card overflow-hidden flex items-center justify-center"
                >
                  <Image
                    src={showdownSprite(t.slug)}
                    alt={t.name}
                    width={28}
                    height={28}
                    className="object-contain scale-150"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 text-[10px] text-primary/60 group-hover:text-primary transition-colors">
          คลิกเพื่อดูรายละเอียด →
        </div>
      </div>
    </Link>
  );
}
