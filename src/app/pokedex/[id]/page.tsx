import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { CryPlayer } from "@/components/pokemon/cry-player";
import { PokemonArtworkSwitcher, PokemonForms } from "@/components/pokemon/pokemon-forms";
import { TypeBadgeList } from "@/components/pokemon/type-badge";
import { StatSet } from "@/components/pokemon/stat-bar";
import { TypeChartTable } from "@/components/pokemon/type-chart-table";
import { getDualTypeDefenses } from "@/lib/type-chart";
import { formatDexNumber, formatHeight, formatWeight, formatGenderRatio, formatCatchRate, getTypeColor, getEffectivenessLabel } from "@/lib/utils";
import type { PokemonDetail, PokemonTypeName } from "@/types/pokemon";
import { cn } from "@/lib/utils";

async function getPokemonDetail(id: string): Promise<PokemonDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/pokemon/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json() as { data: PokemonDetail };
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pokemon = await getPokemonDetail(id);
  if (!pokemon) return { title: "ไม่พบโปเกมอน" };
  return {
    title: `${pokemon.nameTh ?? pokemon.nameEn} (#${String(pokemon.dexNumber).padStart(4, "0")})`,
    description: `ข้อมูล ${pokemon.nameEn} ประเภท ${pokemon.types.join("/")} BST: ${pokemon.stats.total}`,
  };
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <h2 className="text-base font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pokemon = await getPokemonDetail(id);

  if (!pokemon) notFound();

  const primaryType = pokemon.types[0] as PokemonTypeName;
  const typeColor = getTypeColor(primaryType);
  const defenses = getDualTypeDefenses(pokemon.types as PokemonTypeName[]);

  const prevId = pokemon.dexNumber > 1 ? pokemon.dexNumber - 1 : null;
  const nextId = pokemon.dexNumber < 1025 ? pokemon.dexNumber + 1 : null;

  // Get the latest flavor text in English
  const flavorText = pokemon.flavorTexts.find((f) => f.language === "en");
  const flavorTextTh = pokemon.flavorTexts.find((f) => f.language === "th");

  // Group type defenses
  const immunities = (Object.entries(defenses) as [PokemonTypeName, number][])
    .filter(([, v]) => v === 0).map(([t]) => t);
  const superWeaknesses = (Object.entries(defenses) as [PokemonTypeName, number][])
    .filter(([, v]) => v >= 4).map(([t]) => t);
  const weaknesses = (Object.entries(defenses) as [PokemonTypeName, number][])
    .filter(([, v]) => v === 2).map(([t]) => t);
  const resistances = (Object.entries(defenses) as [PokemonTypeName, number][])
    .filter(([, v]) => v === 0.5).map(([t]) => t);
  const superResistances = (Object.entries(defenses) as [PokemonTypeName, number][])
    .filter(([, v]) => v === 0.25).map(([t]) => t);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden py-12"
        style={{
          background: `linear-gradient(135deg, ${typeColor}15 0%, transparent 60%)`,
        }}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/pokedex"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับไปโปเกเด็กซ์
            </Link>

            {/* Prev/Next */}
            <div className="flex items-center gap-2">
              {prevId && (
                <Link
                  href={`/pokedex/${prevId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  #{String(prevId).padStart(4, "0")}
                </Link>
              )}
              {nextId && (
                <Link
                  href={`/pokedex/${nextId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  #{String(nextId).padStart(4, "0")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Pokemon Header */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
            {/* Artwork + Shiny Toggle */}
            <div className="relative flex justify-center">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: typeColor }}
              />
              <PokemonArtworkSwitcher
                artworkUrl={
                  pokemon.sprites.officialArtwork ??
                  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
                }
                artworkShinyUrl={pokemon.sprites.officialArtworkShiny}
                name={pokemon.nameEn}
                size={280}
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-mono text-muted-foreground">
                  {formatDexNumber(pokemon.dexNumber)}
                </span>
                {pokemon.isLegendary && (
                  <span className="rounded-full bg-yellow-500/20 text-yellow-400 px-2 py-0.5 text-xs font-semibold">
                    Legendary
                  </span>
                )}
                {pokemon.isMythical && (
                  <span className="rounded-full bg-purple-500/20 text-purple-400 px-2 py-0.5 text-xs font-semibold">
                    Mythical
                  </span>
                )}
                {pokemon.isBaby && (
                  <span className="rounded-full bg-pink-500/20 text-pink-400 px-2 py-0.5 text-xs font-semibold">
                    Baby
                  </span>
                )}
              </div>

              <h1 className="text-5xl font-black mb-1">
                {pokemon.nameTh ?? pokemon.nameEn}
              </h1>
              <p className="text-xl text-muted-foreground mb-1">{pokemon.nameEn}</p>
              {pokemon.nameJa && (
                <p className="text-base text-muted-foreground/70 mb-4">
                  {pokemon.nameJa}
                  {pokemon.nameJaRomaji && ` (${pokemon.nameJaRomaji})`}
                </p>
              )}

              {pokemon.species && (
                <p className="text-sm text-muted-foreground mb-3">
                  {pokemon.speciesTh ?? pokemon.species} Pokémon
                </p>
              )}

              <TypeBadgeList types={pokemon.types as PokemonTypeName[]} size="lg" showTh className="mb-6" />

              {/* Cry Player */}
              {pokemon.cries.latest && (
                <div className="flex items-center gap-3">
                  <CryPlayer cryUrl={pokemon.cries.latest} pokemonName={pokemon.nameEn} />
                </div>
              )}
            </div>
          </div>

          {/* Flavor Text */}
          {(flavorTextTh ?? flavorText) && (
            <div className="mt-8 max-w-2xl">
              <p className="text-base text-muted-foreground italic leading-relaxed border-l-2 border-primary/50 pl-4">
                {flavorTextTh?.text ?? flavorText?.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sprites Row */}
      <div className="border-y border-border bg-card/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: "ด้านหน้า", src: pokemon.sprites.frontDefault },
              { label: "ชายนี่", src: pokemon.sprites.frontShiny },
              { label: "ด้านหลัง", src: pokemon.sprites.backDefault },
              { label: "แอนิเมชั่น", src: pokemon.sprites.animated },
              { label: "HOME", src: pokemon.sprites.homeSprite },
            ]
              .filter((s) => s.src)
              .map((sprite) => (
                <div key={sprite.label} className="text-center">
                  <Image
                    src={sprite.src!}
                    alt={`${pokemon.nameEn} ${sprite.label}`}
                    width={80}
                    height={80}
                    className="object-contain mx-auto"
                    unoptimized={sprite.src!.endsWith(".gif")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{sprite.label}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Base Stats */}
            <SectionCard title="Base Stats">
              <StatSet stats={pokemon.stats} showTh animated />
            </SectionCard>

            {/* Info Table */}
            <SectionCard title="ข้อมูลพื้นฐาน">
              <InfoRow label="เลข Dex" value={formatDexNumber(pokemon.dexNumber)} />
              <InfoRow label="Generation" value={`Generation ${pokemon.generation}`} />
              <InfoRow label="ส่วนสูง" value={formatHeight(pokemon.heightDm)} />
              <InfoRow label="น้ำหนัก" value={formatWeight(pokemon.weightHg)} />
              <InfoRow label="สัดส่วนเพศ" value={formatGenderRatio(pokemon.genderRate)} />
              <InfoRow label="Capture Rate" value={formatCatchRate(pokemon.captureRate)} />
              <InfoRow label="Growth Rate" value={pokemon.growthRate ?? "—"} />
              <InfoRow label="Base Happiness" value={pokemon.baseHappiness ?? "—"} />
              <InfoRow label="Hatch Counter" value={pokemon.hatchCounter ? `${pokemon.hatchCounter} ก้าว` : "—"} />
              <InfoRow label="สี" value={pokemon.color ?? "—"} />
              <InfoRow label="Habitat" value={pokemon.habitat ?? "—"} />
              {pokemon.eggGroups.length > 0 && (
                <InfoRow label="Egg Group" value={pokemon.eggGroups.join(", ")} />
              )}
            </SectionCard>

            {/* Abilities */}
            <SectionCard title="ความสามารถ (Abilities)">
              <div className="space-y-3">
                {pokemon.abilities.map((a) => (
                  <div key={a.slot} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
                    >
                      {a.slot}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/abilities/${a.slug}`}
                          className="font-semibold text-sm hover:text-primary transition-colors"
                        >
                          {a.nameEn}
                        </Link>
                        {a.isHidden && (
                          <span className="rounded text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5">
                            Hidden
                          </span>
                        )}
                      </div>
                      {a.shortEffect && (
                        <p className="text-xs text-muted-foreground mt-0.5">{a.shortEffect}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Defenses */}
            <SectionCard title="ความต้านทาน Type">
              <div className="space-y-4">
                {superWeaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">จุดอ่อน 4x</p>
                    <TypeBadgeList types={superWeaknesses} size="sm" showTh />
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-400 mb-2">จุดอ่อน 2x</p>
                    <TypeBadgeList types={weaknesses} size="sm" showTh />
                  </div>
                )}
                {resistances.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-2">ต้านทาน ½x</p>
                    <TypeBadgeList types={resistances} size="sm" showTh />
                  </div>
                )}
                {superResistances.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-2">ต้านทาน ¼x</p>
                    <TypeBadgeList types={superResistances} size="sm" showTh />
                  </div>
                )}
                {immunities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">ภูมิคุ้มกัน 0x</p>
                    <TypeBadgeList types={immunities} size="sm" showTh />
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Evolution Chain */}
            {pokemon.evolutions.length > 0 && (
              <SectionCard title="สายวิวัฒนาการ">
                <div className="flex items-center gap-2 flex-wrap">
                  {pokemon.evolutions.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-center">
                        <Link
                          href={`/pokedex/${ev.toSlug}`}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ev.toId || ev.fromId}.png`}
                            alt={ev.toName}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                          <span className="text-xs font-medium">{ev.toNameTh ?? ev.toName}</span>
                        </Link>
                      </div>
                      {i < pokemon.evolutions.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  {pokemon.evolutions.map((ev, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      → {ev.toName}:{" "}
                      {ev.minLevel ? `Level ${ev.minLevel}` : ""}
                      {ev.itemName ? `ใช้ ${ev.itemName}` : ""}
                      {ev.trigger === "trade" ? "Trade" : ""}
                      {ev.condition ? ` (${ev.condition})` : ""}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Special Forms */}
            {pokemon.forms.length > 0 && (
              <SectionCard title="ร่างพิเศษ">
                <PokemonForms forms={pokemon.forms} />
              </SectionCard>
            )}

            {/* Moves Table */}
            <SectionCard title="ท่าโจมตี">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                      <th className="text-left pb-2 font-semibold">ท่า</th>
                      <th className="text-left pb-2 font-semibold">Type</th>
                      <th className="text-center pb-2 font-semibold">Cat</th>
                      <th className="text-right pb-2 font-semibold">Pwr</th>
                      <th className="text-right pb-2 font-semibold">Acc</th>
                      <th className="text-right pb-2 font-semibold">PP</th>
                      <th className="text-right pb-2 font-semibold">วิธี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pokemon.moves.slice(0, 20).map((move) => (
                      <tr key={`${move.id}-${move.learnMethod}`} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-1.5 pr-2">
                          <Link
                            href={`/moves/${move.slug}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {move.nameTh ?? move.nameEn}
                          </Link>
                        </td>
                        <td className="py-1.5 pr-2">
                          {move.typeName && (
                            <TypeBadgeList types={[move.typeName]} size="xs" />
                          )}
                        </td>
                        <td className="py-1.5 text-center pr-2">
                          <span className={cn(
                            "text-xs font-medium",
                            move.category === "physical" && "text-orange-400",
                            move.category === "special" && "text-blue-400",
                            move.category === "status" && "text-gray-400",
                          )}>
                            {move.category === "physical" ? "PHY" : move.category === "special" ? "SPC" : "STS"}
                          </span>
                        </td>
                        <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                          {move.power ?? "—"}
                        </td>
                        <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                          {move.accuracy ? `${move.accuracy}%` : "—"}
                        </td>
                        <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                          {move.pp ?? "—"}
                        </td>
                        <td className="py-1.5 text-right text-xs text-muted-foreground">
                          {move.learnMethod === "level-up"
                            ? `Lv.${move.levelLearnedAt ?? "?"}`
                            : move.learnMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pokemon.moves.length > 20 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    แสดง 20 ท่าแรก จากทั้งหมด {pokemon.moves.length} ท่า
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
