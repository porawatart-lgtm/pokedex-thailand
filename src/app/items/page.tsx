"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ChevronLeft, ChevronRight, Package, Pill, Gem,
  FlaskConical, Sparkles, Sword, ShieldPlus, Zap, Wind,
  Flame, Snowflake, Droplets, Star, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemData {
  id: number;
  slug: string;
  displayName: string;
  sprite: string | null;
  cost: number;
  category: string;
  flingPower: number | null;
  attributes: string[];
  shortEffect: string;
}

interface ApiResponse {
  data: ItemData[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const CATEGORIES = [
  {
    key: "medicine",
    label: "ยา & ฟื้นฟู",
    labelEn: "Medicine",
    icon: "💊",
    LucideIcon: Pill,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    activeBg: "bg-green-500",
    desc: "โพชั่น, ยาแก้พิษ, ชุบชีวิต, ไล่หญ้า",
  },
  {
    key: "held",
    label: "ไอเทมถือ",
    labelEn: "Held Items",
    icon: "💎",
    LucideIcon: Gem,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    activeBg: "bg-purple-500",
    desc: "Choice, Life Orb, Leftovers, Silk Scarf",
  },
  {
    key: "vitamins",
    label: "วิตามิน",
    labelEn: "Vitamins",
    icon: "🧪",
    LucideIcon: FlaskConical,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    activeBg: "bg-orange-500",
    desc: "HP Up, Protein, Iron, Calcium, Carbos",
  },
  {
    key: "evolution",
    label: "วิวัฒน์",
    labelEn: "Evolution",
    icon: "🌟",
    LucideIcon: Sparkles,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    activeBg: "bg-yellow-500",
    desc: "Fire Stone, Water Stone, Moon Stone",
  },
  {
    key: "battle",
    label: "ไอเทมต่อสู้",
    labelEn: "Battle Items",
    icon: "⚔️",
    LucideIcon: Sword,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    activeBg: "bg-red-500",
    desc: "X-Attack, X-Speed, X-Defense",
  },
];

// Icons for specific item slugs / keywords
const ITEM_ICONS: Array<{ match: RegExp; icon: React.ElementType; color: string }> = [
  { match: /potion|restore|hyper|elixir|ether/, icon: Heart, color: "text-green-400" },
  { match: /revive|max-revive/, icon: Sparkles, color: "text-yellow-400" },
  { match: /antidote|poison/, icon: Pill, color: "text-purple-400" },
  { match: /burn-heal|burn/, icon: Flame, color: "text-orange-400" },
  { match: /ice-heal|ice/, icon: Snowflake, color: "text-blue-300" },
  { match: /paralyze|parlyz|full-heal|heal/, icon: Zap, color: "text-yellow-300" },
  { match: /repel/, icon: Wind, color: "text-teal-400" },
  { match: /awakening|deep-sea-tooth|sleep/, icon: ShieldPlus, color: "text-indigo-400" },
  { match: /choice/, icon: Gem, color: "text-purple-400" },
  { match: /life-orb|orb/, icon: Flame, color: "text-orange-500" },
  { match: /leftovers/, icon: Heart, color: "text-green-500" },
  { match: /silk-scarf|charcoal|magnet|miracle-seed|mystic-water|never-melt-ice|poison-barb|sharp-beak|silver-powder|soft-sand|spell-tag|twisted-spoon|black-belt|black-glasses|hard-stone/, icon: Star, color: "text-yellow-400" },
  { match: /stone|fire-stone|water-stone|thunder-stone|leaf-stone|moon-stone|sun-stone|shiny-stone|dusk-stone|dawn-stone|ice-stone/, icon: Sparkles, color: "text-amber-400" },
  { match: /hp-up|protein|iron|carbos|calcium|zinc|pp-up|pp-max/, icon: FlaskConical, color: "text-orange-400" },
  { match: /water/, icon: Droplets, color: "text-blue-400" },
];

function getItemIcon(slug: string): { Icon: React.ElementType; color: string } | null {
  for (const rule of ITEM_ICONS) {
    if (rule.match.test(slug)) return { Icon: rule.icon, color: rule.color };
  }
  return null;
}

const CATEGORY_COLORS: Record<string, string> = {
  medicine: "text-green-400 border-green-400/30 bg-green-400/10",
  "status-cures": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  healing: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  vitamins: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  choice: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "type-enhancement": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  "held-items-in-battle": "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  "long-term": "text-teal-400 border-teal-400/30 bg-teal-400/10",
  evolution: "text-pink-400 border-pink-400/30 bg-pink-400/10",
  "mega-stones": "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  "in-a-pinch": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "bad-held-items": "text-red-400 border-red-400/30 bg-red-400/10",
  "stat-boosts": "text-red-400 border-red-400/30 bg-red-400/10",
};

async function fetchItems(category: string, page: number, q: string): Promise<ApiResponse> {
  const params = new URLSearchParams({ category, page: String(page), limit: "24" });
  if (q) params.set("q", q);
  const res = await fetch(`/api/items?${params}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json() as Promise<ApiResponse>;
}

export default function ItemsPage() {
  const [activeCategory, setActiveCategory] = useState("medicine");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["items", activeCategory, page, debouncedSearch],
    queryFn: () => fetchItems(activeCategory, page, debouncedSearch),
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

  const handleCategory = (key: string) => {
    setActiveCategory(key);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory)!;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Package className="h-8 w-8 text-yellow-400" />
          ไอเทม <span className="text-gradient">ทั้งหมด</span>
        </h1>
        <p className="text-muted-foreground">
          ไอเทมทุกชนิดใน Pokémon Games พร้อมคุณสมบัติ
          {data?.meta && (
            <span className="ml-1">· {data.meta.total.toLocaleString()} ชิ้น</span>
          )}
        </p>
      </div>

      {/* Berry shortcut card */}
      <Link
        href="/berries"
        className="flex items-center gap-4 p-4 mb-8 rounded-2xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 transition-all group"
      >
        <div className="h-14 w-14 rounded-2xl bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-3xl shrink-0">
          🫐
        </div>
        <div className="flex-1">
          <p className="font-bold">เบอร์รี่ทั้งหมด 64 ชนิด</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Natural Gift Type · ความแน่น · รสชาติ · เวลาเก็บเกี่ยว
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                isActive
                  ? `${cat.bg} ${cat.border} border-2`
                  : "border-border bg-card hover:border-primary/30 hover:-translate-y-0.5"
              )}
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center text-2xl",
                  isActive ? cat.bg : "bg-secondary"
                )}
              >
                {cat.icon}
              </div>
              <div className="text-center">
                <p className={cn("font-bold text-sm", isActive ? cat.color : "text-foreground")}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{cat.labelEn}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active category desc */}
      <div className={cn("flex items-center gap-2 mb-6 px-3 py-2 rounded-xl text-sm", activeCat.bg)}>
        <activeCat.LucideIcon className={cn("h-4 w-4 shrink-0", activeCat.color)} />
        <span className="text-muted-foreground">{activeCat.desc}</span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ค้นหาไอเทม..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Items grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data.data.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">ไม่พบไอเทมในหมวดนี้</p>
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

function ItemCard({ item }: { item: ItemData }) {
  const catColor =
    CATEGORY_COLORS[item.category] ??
    "text-muted-foreground border-border bg-secondary/50";

  const fallback = getItemIcon(item.slug);

  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
      {/* Sprite or fallback icon */}
      <div className="shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
        {item.sprite ? (
          <Image
            src={item.sprite}
            alt={item.displayName}
            width={48}
            height={48}
            className="object-contain"
            unoptimized
          />
        ) : fallback ? (
          <fallback.Icon className={cn("h-6 w-6", fallback.color)} />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="font-semibold text-sm leading-tight line-clamp-1">
            {item.displayName}
          </p>
          {item.cost > 0 && (
            <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
              ₽{item.cost.toLocaleString()}
            </span>
          )}
        </div>

        {/* Category badge */}
        <span
          className={cn(
            "inline-block text-[10px] px-1.5 py-0.5 rounded-full border font-medium mt-0.5",
            catColor
          )}
        >
          {item.category.replace(/-/g, " ")}
        </span>

        {/* Effect */}
        {item.shortEffect && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
            {item.shortEffect}
          </p>
        )}

        {/* Fling power */}
        {item.flingPower !== null && item.flingPower > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Fling: <span className="font-mono">{item.flingPower}</span>
          </p>
        )}
      </div>
    </div>
  );
}
