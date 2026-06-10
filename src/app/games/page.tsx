import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Calendar, MapPin, Zap, Users } from "lucide-react";
import { GAMES, GEN_INFO, PLATFORM_COLORS, PLATFORM_GAMES } from "@/lib/games-data";
import type { GameEntry } from "@/lib/games-data";
import { Trophy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Group games by gen in order 9 → 1
const GENS = [9, 8, 7, 6, 5, 4, 3, 2, 1];
const GAMES_BY_GEN_ORDERED: [number, GameEntry[]][] = GENS.map((g) => [
  g,
  GAMES.filter((game) => game.gen === g),
]);

function SpriteImg({ id, size = 40 }: { id: number; size?: number }) {
  return (
    <Image
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
      alt={`pokemon ${id}`}
      width={size}
      height={size}
      className="object-contain"
      unoptimized
    />
  );
}

function GameCard({ game }: { game: GameEntry }) {
  const platformClass = PLATFORM_COLORS[game.platform] ?? "text-muted-foreground bg-secondary";

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Color bar top */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(to right, ${game.color1}, ${game.color2 ?? game.color1})` }}
      />

      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${game.color1}, transparent 60%)`,
        }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl shrink-0">{game.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm leading-tight line-clamp-1">{game.nameTh}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{game.nameEn}</p>
          </div>
          <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border border-border bg-secondary">
            {game.nameShort}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", platformClass)}>
            {game.platform}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-0.5">
            <Calendar className="h-2.5 w-2.5" />
            {game.year}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {game.regionTh}
          </span>
        </div>

        {/* Mechanic badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold mb-3"
          style={{
            background: `${game.color1}20`,
            color: game.color1,
            border: `1px solid ${game.color1}30`,
          }}
        >
          <Zap className="h-3 w-3" />
          {game.mechanicTh}
        </div>

        {/* Starters row */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-1">Starters:</span>
          {game.starters.slice(0, 3).map((id) => (
            <div key={id} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <SpriteImg id={id} size={32} />
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {game.totalPokemon} Pokémon
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" />
          เลือกโดย <span className="text-gradient">เกม</span>
        </h1>
        <p className="text-muted-foreground max-w-xl">
          เลือกเกมที่คุณกำลังเล่นเพื่อดูข้อมูล Pokédex, ไอเทม, ท่าโจมตี และ Competitive ที่เกี่ยวข้อง
        </p>
      </div>

      {/* Platform / Spin-off Games */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Platform & Spin-offs
            </h2>
            <p className="text-xs text-muted-foreground">GO, HOME, Champions — แพลตฟอร์มโปเกมอนนอกซีรีส์หลัก</p>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLATFORM_GAMES.map((g) => (
            <Link
              key={g.slug}
              href={g.metaHref}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 p-5"
              style={{ borderColor: `${g.color1}30` }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 20%, ${g.color1}, transparent 60%)` }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{g.icon}</span>
                  <div>
                    <p className="font-black text-base">{g.nameTh}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", PLATFORM_COLORS[g.platform] ?? "text-muted-foreground bg-secondary")}>{g.platform}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{g.descriptionTh}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {g.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{f}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: g.color1 }}>
                  <Trophy className="h-3.5 w-3.5" />
                  ดู Meta Rankings
                  <ExternalLink className="h-3 w-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Gens */}
      {GAMES_BY_GEN_ORDERED.map(([gen, games]) => {
        if (games.length === 0) return null;
        const info = GEN_INFO[gen];
        return (
          <div key={gen} className="mb-10">
            {/* Gen header */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h2 className="text-lg font-black">{info?.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {info?.years} · {info?.platform}
                </p>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Game cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
