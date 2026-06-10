"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Bot, Sparkles, ChevronRight, Loader2,
  Trophy, Database, Info, ChevronDown,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TypeBadge, TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import { META_TEAMS } from "@/lib/championship-teams";
import type { MetaTeam } from "@/lib/championship-teams";
import type { PokemonListItem, AITeamSuggestion } from "@/types/pokemon";
import { toast } from "sonner";

const FORMATS = ["OU", "Ubers", "UU", "RU", "NU", "PU", "LC", "Doubles OU", "VGC"];

async function searchPokemon(q: string): Promise<PokemonListItem[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/pokemon?q=${encodeURIComponent(q)}&limit=8`);
  const data = (await res.json()) as { data: PokemonListItem[] };
  return data.data;
}

interface TeamResult {
  data: AITeamSuggestion;
  source: "ai" | "smogon";
  notice?: string;
}

async function generateTeam(pokemonId: number, format: string): Promise<TeamResult> {
  const res = await fetch("/api/ai/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pokemonId, format, language: "th" }),
  });
  const json = (await res.json()) as TeamResult & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "เกิดข้อผิดพลาด");
  return json;
}

// ─── Championship Team Card ───────────────────────────────────────────────────
function ChampionshipTeamCard({ team }: { team: MetaTeam }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              team.tier === "S" ? "bg-yellow-500/20 text-yellow-400" :
              team.tier === "A" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
            )}>
              Tier {team.tier}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {team.format}
            </span>
            <span className="text-[10px] text-muted-foreground">{team.season}</span>
          </div>
          <p className="font-bold text-sm leading-tight">{team.nameTh}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{team.archetypeTh}</p>

          {/* Pokemon sprites row */}
          <div className="flex items-center gap-1 mt-2">
            {team.members.slice(0, 6).map((m) => (
              <div key={m.nameEn} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {m.id > 0 ? (
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`}
                    alt={m.nameEn} width={32} height={32} className="object-contain" unoptimized
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">?</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Strategy */}
          <p className="text-sm text-muted-foreground leading-relaxed">{team.strategyTh}</p>

          {/* Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div key={m.nameEn} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                {m.id > 0 && (
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`}
                    alt={m.nameEn} width={40} height={40} className="object-contain shrink-0" unoptimized
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{m.nameTh}</p>
                  <p className="text-[10px] text-primary mb-1">{m.roleTh}</p>
                  <div className="space-y-0.5 text-[10px] text-muted-foreground">
                    <p><span className="text-foreground font-medium">Item:</span> {m.item}</p>
                    <p><span className="text-foreground font-medium">Ability:</span> {m.ability}</p>
                    <p><span className="text-foreground font-medium">Nature:</span> {m.nature}</p>
                    <p><span className="text-foreground font-medium">Moves:</span> {m.moves.join(" / ")}</p>
                    <p><span className="text-foreground font-medium">EVs:</span> {m.evs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground">ที่มา: {team.source}</p>
        </div>
      )}
    </div>
  );
}

// ─── AI Team Result Card ──────────────────────────────────────────────────────
function TeamMemberCard({ p }: { p: AITeamSuggestion["pokemon"][0] }) {
  const artworkSrc = p.officialArtwork ??
    (p.id > 0
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
      : null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        {artworkSrc && (
          <Image src={artworkSrc} alt={p.nameEn} width={60} height={60} className="object-contain shrink-0" unoptimized />
        )}
        <div>
          <p className="font-bold">{p.nameTh ?? p.nameEn}</p>
          <p className="text-xs text-muted-foreground">{p.nameEn}</p>
          <p className="text-xs text-primary mt-0.5">{p.roleTh}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {p.suggestedAbility && (
          <div><span className="text-muted-foreground">Ability: </span><span className="font-medium">{p.suggestedAbility}</span></div>
        )}
        {p.suggestedItem && (
          <div><span className="text-muted-foreground">Item: </span><span className="font-medium">{p.suggestedItem}</span></div>
        )}
        {p.suggestedMoves.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1">Moves:</p>
            <div className="space-y-0.5">
              {p.suggestedMoves.map((m) => (
                <div key={m} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-border pt-2">
          <p className="text-muted-foreground leading-relaxed">{p.reasoningTh}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AITeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonListItem | null>(null);
  const [format, setFormat] = useState("OU");
  const [result, setResult] = useState<TeamResult | null>(null);
  const [activeTab, setActiveTab] = useState<"build" | "championship">("build");

  // Filter championship teams by format
  const filteredMetaTeams = META_TEAMS.filter(
    (t) => format === "VGC" ? t.format === "VGC" : t.format !== "VGC"
  );

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["ai-team-search", searchQuery],
    queryFn: () => searchPokemon(searchQuery),
    enabled: searchQuery.length >= 1,
    staleTime: 30000,
  });

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: ({ id, fmt }: { id: number; fmt: string }) => generateTeam(id, fmt),
    onSuccess: (data) => {
      setResult(data);
      if (data.source === "ai") {
        toast.success("AI สร้างทีมเสร็จแล้ว!");
      } else {
        toast.success("สร้างทีมจากสถิติ Smogon เสร็จแล้ว");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "ไม่สามารถสร้างทีมได้");
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI + Smogon Stats + Championship Data
        </div>
        <h1 className="text-4xl font-black mb-3">
          <Bot className="inline h-10 w-10 text-primary mr-2 mb-1" />
          AI <span className="text-gradient">Team Builder</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          สร้างทีมจาก AI หรือสถิติ Smogon พร้อมข้อมูลทีมแชมป์จาก VGC &amp; Smogon Tournaments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("build")}
          className={cn(
            "flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === "build" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Bot className="h-4 w-4" />
          สร้างทีม
        </button>
        <button
          onClick={() => setActiveTab("championship")}
          className={cn(
            "flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === "championship" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="h-4 w-4" />
          ทีม Championship &amp; Meta
          <span className="rounded-full bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 font-bold">
            {META_TEAMS.length}
          </span>
        </button>
      </div>

      {/* ── Build Tab ── */}
      {activeTab === "build" && (
        <>
          {/* Step 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">1</span>
              เลือกโปเกมอนหลัก
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาโปเกมอน เช่น Garchomp, Pikachu..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedPokemon(null); }}
                className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {searchQuery && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {searching ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground text-sm">กำลังค้นหา...</div>
                ) : (
                  searchResults?.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPokemon(p); setSearchQuery(p.nameEn); }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                        selectedPokemon?.id === p.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:border-primary/50"
                      )}
                    >
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.nameEn} width={56} height={56} className="object-contain"
                      />
                      <p className="text-xs font-semibold">{p.nameTh ?? p.nameEn}</p>
                      <TypeBadgeList types={p.types} size="xs" />
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedPokemon && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <Image
                  src={selectedPokemon.sprites.officialArtwork ??
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                  alt={selectedPokemon.nameEn} width={80} height={80} className="object-contain"
                />
                <div>
                  <p className="font-bold text-lg">{selectedPokemon.nameTh ?? selectedPokemon.nameEn}</p>
                  <p className="text-sm text-muted-foreground">{selectedPokemon.nameEn}</p>
                  <TypeBadgeList types={selectedPokemon.types} size="sm" showTh className="mt-1" />
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>BST: <b className="text-foreground">{selectedPokemon.stats.total}</b></span>
                    <span>SPE: <b className="text-foreground">{selectedPokemon.stats.speed}</b></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">2</span>
              เลือก Format
            </h2>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium border transition-colors",
                    format === f
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => selectedPokemon && generate({ id: selectedPokemon.id, fmt: format })}
              disabled={!selectedPokemon || generating}
              className="flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-primary/30"
            >
              {generating ? (
                <><Loader2 className="h-5 w-5 animate-spin" />กำลังวิเคราะห์...</>
              ) : (
                <><Bot className="h-5 w-5" />สร้างทีมด้วย AI<Sparkles className="h-4 w-4" /></>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-6">
              {/* Source badge + notice */}
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border",
                result.source === "ai"
                  ? "border-primary/30 bg-primary/5"
                  : "border-yellow-500/30 bg-yellow-500/5"
              )}>
                {result.source === "ai"
                  ? <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  : <Database className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="font-bold text-sm">
                    {result.source === "ai" ? "สร้างโดย Claude AI" : "สร้างจากสถิติ Smogon"}
                  </p>
                  {result.notice && <p className="text-xs text-muted-foreground mt-0.5">{result.notice}</p>}
                  {result.source !== "ai" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ตั้งค่า ANTHROPIC_API_KEY ใน .env เพื่อใช้งาน Claude AI สำหรับคำแนะนำที่ละเอียดขึ้น
                    </p>
                  )}
                </div>
              </div>

              {/* Strategy */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  กลยุทธ์ทีม
                </h3>
                <p className="text-muted-foreground leading-relaxed">{result.data.teamStrategyTh}</p>
                {result.data.threats.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-red-400 mb-1">ภัยคุกคาม</p>
                    <div className="flex flex-wrap gap-2">
                      {result.data.threats.map((t) => (
                        <span key={t} className="rounded-lg bg-red-500/10 text-red-400 px-2 py-1 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.data.coverageAnalysis && (
                  <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                    {result.data.coverageAnalysis}
                  </p>
                )}
              </div>

              {/* Suggested Pokemon */}
              <div>
                <h3 className="font-bold text-lg mb-4">ทีมที่แนะนำ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.data.pokemon.map((p, i) => (
                    <TeamMemberCard key={i} p={p} />
                  ))}
                </div>
              </div>

              {/* Link to competitive page */}
              {selectedPokemon && (
                <div className="text-center">
                  <Link
                    href={`/competitive/${selectedPokemon.slug}?format=${FORMAT_MAP[format] ?? "gen9ou"}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    ดูสถิติ Smogon แบบละเอียดสำหรับ {selectedPokemon.nameEn}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                * ควรปรับทีมตามสไตล์การเล่นและ Tera Type ที่ต้องการ
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Championship Tab ── */}
      {activeTab === "championship" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              ทีม Meta ยอดนิยมจาก VGC World Championships และ Smogon Tournaments อัปเดตตาม Format ที่เลือก
            </p>
          </div>

          {/* Format filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground self-center">Format:</span>
            {["OU", "VGC"].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "rounded-xl px-4 py-1.5 text-sm font-medium border transition-colors",
                  format === f ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {f === "VGC" ? "VGC 2024" : "Gen 9 OU"}
              </button>
            ))}
          </div>

          {filteredMetaTeams.map((team) => (
            <ChampionshipTeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export format map for use in Link
const FORMAT_MAP: Record<string, string> = {
  OU: "gen9ou", Ubers: "gen9ubers", UU: "gen9uu", RU: "gen9ru",
  NU: "gen9nu", PU: "gen9pu", LC: "gen9lc",
  "Doubles OU": "gen9doublesou", VGC: "gen9vgc2024regh",
};
