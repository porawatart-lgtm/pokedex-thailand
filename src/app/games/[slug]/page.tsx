import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2, Calendar, MapPin, Zap, ChevronRight,
  Book, Package, Sword, Trophy, Bot, Users,
} from "lucide-react";
import { GAMES, PLATFORM_COLORS } from "@/lib/games-data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const game = GAMES.find((g) => g.slug === slug);
  if (!game) return {};
  return {
    title: `${game.nameTh} (${game.nameEn})`,
    description: `ข้อมูล Pokémon, ไอเทม, Competitive สำหรับ ${game.nameTh}`,
  };
}

const QUICK_LINKS = [
  {
    icon: Book,
    label: "Pokédex",
    labelTh: "โปเกเด็กซ์",
    desc: "โปเกมอนทั้งหมดในเกมนี้",
    color: "text-red-400",
    bg: "bg-red-400/10",
    href: (gen: number) => `/pokedex?generation=${gen}`,
  },
  {
    icon: Package,
    label: "Items",
    labelTh: "ไอเทม",
    desc: "ยา, ไอเทมถือ, เบอร์รี่",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    href: () => `/items`,
  },
  {
    icon: Sword,
    label: "Moves",
    labelTh: "ท่าโจมตี",
    desc: "ท่าโจมตีทุกท่า",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    href: () => `/moves`,
  },
  {
    icon: Trophy,
    label: "Competitive",
    labelTh: "Competitive",
    desc: "Tier List & Usage Stats",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    href: (_: number, smogon?: string) => `/competitive${smogon ? `?format=${smogon}` : ""}`,
  },
  {
    icon: Users,
    label: "Team Builder",
    labelTh: "สร้างทีม",
    desc: "สร้างและวิเคราะห์ทีม",
    color: "text-green-400",
    bg: "bg-green-400/10",
    href: () => `/team-builder`,
  },
  {
    icon: Bot,
    label: "AI Team",
    labelTh: "AI สร้างทีม",
    desc: "ให้ AI แนะนำทีม",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    href: () => `/ai-team`,
  },
];

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = GAMES.find((g) => g.slug === slug);
  if (!game) notFound();

  const platformClass = PLATFORM_COLORS[game.platform] ?? "text-muted-foreground bg-secondary";
  const allStarters = [...game.starters, ...game.mascots].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/games" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Gamepad2 className="h-3.5 w-3.5" />
          เกม
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{game.nameTh}</span>
      </div>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl border border-border mb-8 p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${game.color1}20, ${game.color2 ?? game.color1}10)`,
          borderColor: `${game.color1}30`,
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${game.color1}, transparent 70%)` }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Icon + name */}
          <div className="flex items-center gap-4">
            <span className="text-6xl">{game.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">{game.nameTh}</h1>
              <p className="text-muted-foreground text-sm">{game.nameEn}</p>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <span className={cn("text-xs px-3 py-1 rounded-full font-semibold", platformClass)}>
              {game.platform}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {game.year}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> ภูมิภาค{game.regionTh}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mt-6">
          <div>
            <p className="text-xs text-muted-foreground">Generation</p>
            <p className="text-xl font-black" style={{ color: game.color1 }}>Gen {game.gen}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">โปเกมอนทั้งหมด</p>
            <p className="text-xl font-black">{game.totalPokemon}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">กลไกพิเศษ</p>
            <div
              className="flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-xl text-sm font-bold"
              style={{ background: `${game.color1}20`, color: game.color1 }}
            >
              <Zap className="h-3.5 w-3.5" />
              {game.mechanicTh}
            </div>
          </div>
        </div>

        {/* Pokemon row */}
        <div className="mt-6 flex items-center gap-2">
          <p className="text-xs text-muted-foreground mr-1">Starters & Mascots:</p>
          {allStarters.slice(0, 6).map((id) => (
            <Link key={id} href={`/pokedex/${id}`}>
              <div className="h-12 w-12 rounded-xl bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                  alt={`pokemon ${id}`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links grid */}
      <h2 className="text-lg font-bold mb-4">เครื่องมือสำหรับ {game.nameTh}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {QUICK_LINKS.map((link) => {
          const href = link.href(game.gen, game.smogonFormat);
          return (
            <Link
              key={link.label}
              href={href}
              className="group flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 transition-all"
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", link.bg)}>
                <link.icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{link.labelTh}</p>
                <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Other games in same gen */}
      {(() => {
        const sameGen = GAMES.filter((g) => g.gen === game.gen && g.slug !== game.slug);
        if (sameGen.length === 0) return null;
        return (
          <div>
            <h2 className="text-lg font-bold mb-4">เกมอื่นใน Generation {game.gen}</h2>
            <div className="flex flex-wrap gap-3">
              {sameGen.map((g) => (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-sm"
                >
                  <span>{g.icon}</span>
                  <span className="font-medium">{g.nameTh}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
