import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { db } from "@/lib/db";

async function getAbility(slug: string) {
  const ability = await db.ability.findUnique({
    where: { slug },
    include: {
      pokemonAbilities: {
        include: {
          pokemon: {
            select: {
              id: true,
              slug: true,
              nameEn: true,
              nameTh: true,
              dexNumber: true,
            },
          },
        },
        orderBy: [{ isHidden: "asc" }, { pokemon: { dexNumber: "asc" } }],
      },
    },
  });
  return ability;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ability = await getAbility(slug);
  if (!ability) return { title: "ไม่พบ Ability" };
  return {
    title: `${ability.nameTh ?? ability.nameEn} — Ability`,
    description: ability.shortEffect ?? undefined,
  };
}

export default async function AbilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ability = await getAbility(slug);

  if (!ability) notFound();

  const normalPokemon = ability.pokemonAbilities.filter((pa) => !pa.isHidden);
  const hiddenPokemon = ability.pokemonAbilities.filter((pa) => pa.isHidden);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/pokedex"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปโปเกเด็กซ์
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black">
                {ability.nameTh ?? ability.nameEn}
              </h1>
              {ability.nameTh && (
                <p className="text-muted-foreground text-sm">{ability.nameEn}</p>
              )}
            </div>
          </div>

          {ability.nameJa && (
            <p className="text-muted-foreground/60 text-sm ml-13 pl-1">
              {ability.nameJa}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 ml-[52px]">
            {ability.generation && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                Generation {ability.generation}
              </span>
            )}
            {!ability.isMainSeries && (
              <span className="rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 text-xs">
                ไม่ใช่ Main Series
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Effect */}
        {(ability.shortEffect || ability.shortEffectTh) && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
              ผลของ Ability
            </h2>
            <p className="text-base leading-relaxed">
              {ability.shortEffectTh ?? ability.shortEffect}
            </p>
            {ability.shortEffectTh && ability.shortEffect && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {ability.shortEffect}
              </p>
            )}
          </div>
        )}

        {(ability.effect || ability.effectTh) && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
              คำอธิบายเพิ่มเติม
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {ability.effectTh ?? ability.effect}
            </p>
          </div>
        )}

        {/* Pokemon with this ability */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
            โปเกมอนที่มี Ability นี้ ({ability.pokemonAbilities.length} ตัว)
          </h2>

          {normalPokemon.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground mb-3">
                Ability ปกติ ({normalPokemon.length} ตัว)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {normalPokemon.map((pa) => (
                  <PokemonCard key={pa.pokemonId} pa={pa} />
                ))}
              </div>
            </div>
          )}

          {hiddenPokemon.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-400 mb-3">
                Hidden Ability ({hiddenPokemon.length} ตัว)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {hiddenPokemon.map((pa) => (
                  <PokemonCard key={pa.pokemonId} pa={pa} hidden />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PokemonCard({
  pa,
  hidden,
}: {
  pa: {
    pokemonId: number;
    pokemon: {
      id: number;
      slug: string;
      nameEn: string;
      nameTh: string | null;
      dexNumber: number;
    };
  };
  hidden?: boolean;
}) {
  const p = pa.pokemon;
  const num = String(p.dexNumber).padStart(4, "0");
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

  return (
    <Link
      href={`/pokedex/${p.slug}`}
      className={`group flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all hover:bg-secondary/50 ${
        hidden
          ? "border-purple-500/30 hover:border-purple-400/50"
          : "border-border hover:border-primary/30"
      }`}
    >
      <span className="text-[10px] text-muted-foreground">#{num}</span>
      <Image
        src={sprite}
        alt={p.nameEn}
        width={48}
        height={48}
        className="object-contain"
        unoptimized
      />
      <p className="text-[10px] font-medium leading-tight line-clamp-2">
        {p.nameTh ?? p.nameEn}
      </p>
    </Link>
  );
}
