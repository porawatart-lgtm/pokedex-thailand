"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, Trophy, TrendingUp, Package, Sword,
  Users, Zap, Shield, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpreadData {
  name: string;
  pct: number;
  nature: string;
  evs: Record<string, number>;
}

interface PokemonDetail {
  name: string;
  slug: string;
  usage: number;
  raw: number;
  viabilityCeiling: number;
  items: Array<{ name: string; pct: number }>;
  moves: Array<{ name: string; pct: number }>;
  abilities: Array<{ name: string; pct: number }>;
  teammates: Array<{ name: string; slug: string; pct: number }>;
  spreads: SpreadData[];
  checksAndCounters: Array<{ name: string; slug: string; ko: number; switched: number }>;
  info: { metagame: string; month: string; battles: number };
}

const FORMAT_LABELS: Record<string, string> = {
  gen9ou: "Gen 9 OU", gen9ubers: "Gen 9 Ubers",
  gen9uu: "Gen 9 UU", gen9ru: "Gen 9 RU",
  gen9nu: "Gen 9 NU", gen9vgc2024regh: "VGC 2024",
};

function showdownSprite(slug: string) {
  return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
}

function showdownArtwork(slug: string) {
  return `https://play.pokemonshowdown.com/sprites/dex/${slug}.png`;
}

async function fetchDetail(slug: string, format: string): Promise<PokemonDetail> {
  const res = await fetch(`/api/competitive/${slug}?format=${format}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Not found" }));
    throw new Error((err as { error: string }).error || "Not found");
  }
  return res.json() as Promise<PokemonDetail>;
}

const STAT_NAMES = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const STAT_COLORS: Record<string, string> = {
  HP: "bg-red-500", Atk: "bg-orange-500", Def: "bg-yellow-500",
  SpA: "bg-blue-500", SpD: "bg-green-500", Spe: "bg-pink-500",
};

export default function CompetitiveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const format = searchParams.get("format") ?? "gen9ou";
  const formatLabel = FORMAT_LABELS[format] ?? format;

  const { data, isLoading, error } = useQuery({
    queryKey: ["competitive-detail", slug, format],
    queryFn: () => fetchDetail(slug, format),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 rounded-xl bg-card animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400">ไม่พบข้อมูล {slug} ใน {formatLabel}</p>
        <Link href="/competitive" className="mt-4 inline-block text-primary hover:underline text-sm">
          ← กลับ
        </Link>
      </div>
    );
  }

  const topItem = data.items[0];
  const topMove = data.moves[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/competitive" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Competitive
        </Link>
        <span>/</span>
        <span className="text-foreground">{data.name}</span>
        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{formatLabel}</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-6">
          {/* Sprite */}
          <div className="shrink-0">
            <Image
              src={showdownArtwork(slug)}
              alt={data.name}
              width={120}
              height={120}
              className="object-contain"
              unoptimized
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = showdownSprite(slug);
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-black mb-1">{data.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-bold">
                {formatLabel}
              </span>
              <div className="flex items-center gap-1.5 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold">{data.usage.toFixed(1)}% usage</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {data.raw.toLocaleString()} battles · {data.info.month}
              </span>
            </div>

            {/* Usage bar */}
            <div className="h-2 rounded-full bg-secondary overflow-hidden max-w-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                style={{ width: `${Math.min(data.usage, 100)}%` }}
              />
            </div>

            {/* Quick highlights */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              {topItem && (
                <div className="flex items-center gap-1.5 text-yellow-300">
                  <Package className="h-3.5 w-3.5" />
                  <span>{topItem.name}</span>
                  <span className="text-muted-foreground">{topItem.pct}%</span>
                </div>
              )}
              {topMove && (
                <div className="flex items-center gap-1.5 text-red-300">
                  <Sword className="h-3.5 w-3.5" />
                  <span>{topMove.name}</span>
                  <span className="text-muted-foreground">{topMove.pct}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Items */}
        <StatSection
          title="ไอเทมยอดนิยม"
          icon={<Package className="h-4 w-4 text-yellow-400" />}
          items={data.items}
          barColor="bg-yellow-500"
          maxPct={data.items[0]?.pct ?? 100}
        />

        {/* Moves */}
        <StatSection
          title="ท่าโจมตียอดนิยม"
          icon={<Sword className="h-4 w-4 text-red-400" />}
          items={data.moves}
          barColor="bg-red-500"
          maxPct={data.moves[0]?.pct ?? 100}
        />

        {/* Abilities */}
        <StatSection
          title="ความสามารถยอดนิยม"
          icon={<Zap className="h-4 w-4 text-purple-400" />}
          items={data.abilities}
          barColor="bg-purple-500"
          maxPct={data.abilities[0]?.pct ?? 100}
        />
      </div>

      {/* Teammates + Spreads row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Teammates */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            เพื่อนร่วมทีมยอดนิยม
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {data.teammates.map((t) => (
              <Link
                key={t.slug}
                href={`/competitive/${t.slug}?format=${format}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <Image
                  src={showdownSprite(t.slug)}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{t.name}</p>
                  <p className="text-[10px] text-blue-400 font-mono">{t.pct > 0 ? "+" : ""}{t.pct}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* EV Spreads */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            EV Spreads ยอดนิยม
          </h3>
          <div className="space-y-3">
            {data.spreads.map((s) => (
              <div key={s.name} className="rounded-xl bg-secondary/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-green-400">{s.nature}</span>
                  <span className="text-[10px] text-muted-foreground">{s.pct}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {STAT_NAMES.filter((stat) => (s.evs[stat] ?? 0) > 0).map((stat) => (
                    <span key={stat} className="flex items-center gap-0.5 text-[10px]">
                      <span className={cn("h-1.5 w-1.5 rounded-full", STAT_COLORS[stat])} />
                      <span className="text-muted-foreground">{stat}</span>
                      <span className="font-mono font-bold">{s.evs[stat]}</span>
                    </span>
                  ))}
                  {Object.keys(s.evs).length === 0 && (
                    <span className="text-[10px] text-muted-foreground">0 EVs everywhere</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checks & Counters */}
      {data.checksAndCounters.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Checks & Counters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.checksAndCounters.map((c) => (
              <Link
                key={c.slug}
                href={`/competitive/${c.slug}?format=${format}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <Image
                  src={showdownSprite(c.slug)}
                  alt={c.name}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">KO {c.ko}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatSection({
  title, icon, items, barColor, maxPct,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ name: string; pct: number }>;
  barColor: string;
  maxPct: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium truncate max-w-[70%]">{item.name}</span>
              <span className="font-mono text-muted-foreground shrink-0">{item.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${(item.pct / maxPct) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
