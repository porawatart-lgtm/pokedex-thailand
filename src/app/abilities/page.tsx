import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { db } from "@/lib/db";
import { AbilitiesList, type AbilityListItem } from "./abilities-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ความสามารถทั้งหมด — Abilities",
  description: "Abilities ทุกตัว พร้อมคำอธิบายภาษาไทย",
};

const FEATURED_ABILITIES = [
  { name: "Speed Boost", slug: "speed-boost", effect: "เพิ่ม Speed ทุกเทิร์น", notable: ["Blaziken", "Sharpedo"] },
  { name: "Drought", slug: "drought", effect: "ตั้งสภาพ Sunny Day เมื่อออกมา", notable: ["Ninetales", "Groudon"] },
  { name: "Drizzle", slug: "drizzle", effect: "ตั้งสภาพ Rain Dance เมื่อออกมา", notable: ["Pelipper", "Kyogre"] },
  { name: "Intimidate", slug: "intimidate", effect: "ลด Attack ฝ่ายตรงข้าม -1", notable: ["Salamence", "Gyarados"] },
  { name: "Levitate", slug: "levitate", effect: "ภูมิคุ้มกัน Ground", notable: ["Gengar", "Rotom"] },
  { name: "Magic Guard", slug: "magic-guard", effect: "ไม่รับดาเมจทางอ้อม", notable: ["Clefable", "Alakazam"] },
  { name: "Regenerator", slug: "regenerator", effect: "ฟื้น HP 1/3 เมื่อสลับ", notable: ["Slowbro", "Tangrowth"] },
  { name: "Prankster", slug: "prankster", effect: "ท่าสถานะมี Priority +1", notable: ["Klefki", "Sableye"] },
];

async function getAbilities(): Promise<AbilityListItem[]> {
  try {
    const abilities = await db.ability.findMany({
      where: { isMainSeries: true },
      select: {
        slug: true,
        nameEn: true,
        nameTh: true,
        nameJa: true,
        generation: true,
        shortEffect: true,
        shortEffectTh: true,
        _count: { select: { pokemonAbilities: true } },
      },
      orderBy: { nameEn: "asc" },
    });
    return abilities.map(({ _count, ...a }) => ({ ...a, pokemonCount: _count.pokemonAbilities }));
  } catch {
    return [];
  }
}

export default async function AbilitiesPage() {
  const abilities = await getAbilities();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-400" />
          ความสามารถ <span className="text-gradient">ทั้งหมด</span>
        </h1>
        <p className="text-muted-foreground">
          Abilities ทุกตัว พร้อมคำอธิบายภาษาไทย ({abilities.length} รายการ)
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Abilities ยอดนิยมใน Competitive</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_ABILITIES.map((ab) => (
            <div key={ab.slug} className="p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
              <Link href={`/abilities/${ab.slug}`} className="font-bold mb-1 block hover:text-primary transition-colors">
                {ab.name}
              </Link>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ab.effect}</p>
              <div className="flex flex-wrap gap-1">
                {ab.notable.map((n) => (
                  <Link
                    key={n}
                    href={`/pokedex/${n.toLowerCase()}`}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {n}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {abilities.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            ฐานข้อมูล Abilities ยังว่าง — รัน <code className="font-mono bg-secondary px-1 py-0.5 rounded">npx tsx prisma/seed-abilities.ts</code> ก่อน
          </p>
        </div>
      ) : (
        <AbilitiesList abilities={abilities} />
      )}
    </div>
  );
}
