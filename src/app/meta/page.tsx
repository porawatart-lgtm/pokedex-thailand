"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Zap, Package, Sword, Star, ChevronRight, Info, ExternalLink } from "lucide-react";
import { cn, getTypeColor } from "@/lib/utils";
import { META_TEAMS, type MetaTeam, type MetaTeamMember } from "@/lib/championship-teams";
import { GO_LEAGUES, type GOPokemon } from "@/lib/go-meta";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormatTab = "vgc" | "ou" | "go" | "champions" | "home";
type GOLeague = "great" | "ultra" | "master";

// ─── Derive rankings from meta teams ─────────────────────────────────────────

function deriveRankings(teams: MetaTeam[]) {
  const pokemonCount: Record<string, { count: number; member: MetaTeamMember }> = {};
  const itemCount: Record<string, number> = {};
  const moveCount: Record<string, number> = {};

  for (const team of teams) {
    for (const m of team.members) {
      const key = m.nameEn;
      if (!pokemonCount[key]) pokemonCount[key] = { count: 0, member: m };
      pokemonCount[key].count++;
      if (m.item) itemCount[m.item] = (itemCount[m.item] ?? 0) + 1;
      for (const move of m.moves) moveCount[move] = (moveCount[move] ?? 0) + 1;
    }
  }

  const totalTeams = teams.length;
  const pokemon = Object.entries(pokemonCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 12)
    .map(([, v], i) => ({ ...v, rank: i + 1, pct: Math.round((v.count / totalTeams) * 100) }));

  const items = Object.entries(itemCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, pct: Math.round((count / (totalTeams * 6)) * 100) }));

  const moves = Object.entries(moveCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, pct: Math.round((count / (totalTeams * 6 * 4)) * 100) }));

  return { pokemon, items, moves };
}

// ─── Champions meta (based on standard competitive) ──────────────────────────

const CHAMPIONS_TOP = [
  { id: 987, slug: "flutter-mane", nameEn: "Flutter Mane", nameTh: "ฟลัทเทอร์ เมน", tier: "S", role: "Special Attacker", roleTh: "Special Attacker ความเร็วสูง", item: "Choice Specs / Booster Energy", moves: ["Moonblast", "Shadow Ball", "Mystical Fire", "Dazzling Gleam"] },
  { id: 727, slug: "incineroar", nameEn: "Incineroar", nameTh: "อินซิเนอโรร์", tier: "S", role: "Support", roleTh: "ซัพพอร์ต Intimidate", item: "Safety Goggles / Assault Vest", moves: ["Fake Out", "Parting Shot", "Flare Blitz", "Will-O-Wisp"] },
  { id: 984, slug: "great-tusk", nameEn: "Great Tusk", nameTh: "เกรท ทัสก์", tier: "S", role: "Hazard Control", roleTh: "ตั้ง Stealth Rock + Rapid Spin", item: "Leftovers / Heavy-Duty Boots", moves: ["Stealth Rock", "Rapid Spin", "Earthquake", "Ice Spinner"] },
  { id: 1000, slug: "gholdengo", nameEn: "Gholdengo", nameTh: "โกลเด็นโก้", tier: "S", role: "Spin Blocker", roleTh: "บล็อก Spin + Special", item: "Choice Specs / Air Balloon", moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Trick"] },
  { id: 983, slug: "kingambit", nameEn: "Kingambit", nameTh: "คิงแกมบิต", tier: "S", role: "Late Game Cleaner", roleTh: "ปิดเกม Swords Dance", item: "Black Glasses / Leftovers", moves: ["Swords Dance", "Kowtow Cleave", "Sucker Punch", "Iron Head"] },
  { id: 641, slug: "tornadus", nameEn: "Tornadus", nameTh: "ทอร์นาดัส", tier: "A", role: "Speed Control", roleTh: "ตั้ง Tailwind ควบคุมความเร็ว", item: "Focus Sash / Safety Goggles", moves: ["Tailwind", "Bleakwind Storm", "Protect", "Rain Dance"] },
  { id: 887, slug: "dragapult", nameEn: "Dragapult", nameTh: "ดราก้าพัลท์", tier: "A", role: "Fast Attacker", roleTh: "ตัวโจมตีความเร็วสูง", item: "Choice Specs / Life Orb", moves: ["Shadow Ball", "Draco Meteor", "Dragon Darts", "Flamethrower"] },
  { id: 812, slug: "rillaboom", nameEn: "Rillaboom", nameTh: "ริลลาบูม", tier: "A", role: "Terrain Setter", roleTh: "ตั้ง Grassy Terrain", item: "Assault Vest / Choice Band", moves: ["Grassy Glide", "Fake Out", "Wood Hammer", "U-turn"] },
  { id: 892, slug: "urshifu-rapid-strike", nameEn: "Urshifu-Rapid-Strike", nameTh: "อุชิฟุ (น้ำ)", tier: "A", role: "Attacker", roleTh: "ทะลุ Protect", item: "Choice Scarf / Focus Sash", moves: ["Surging Strikes", "Close Combat", "Aqua Jet", "Poison Jab"] },
  { id: 472, slug: "gliscor", nameEn: "Gliscor", nameTh: "กลิสคอร์", tier: "A", role: "Sweeper", roleTh: "Swords Dance Sweeper", item: "Toxic Orb", moves: ["Swords Dance", "Earthquake", "Ice Fang", "Knock Off"] },
  { id: 645, slug: "landorus-therian", nameEn: "Landorus-T", nameTh: "แลนโดรัส (Therian)", tier: "A", role: "Pivot", roleTh: "Pivot + Stealth Rock", item: "Leftovers / Rocky Helmet", moves: ["Stealth Rock", "Earthquake", "U-turn", "Stone Edge"] },
  { id: 823, slug: "corviknight", nameEn: "Corviknight", nameTh: "คอร์วิไนท์", tier: "B", role: "Physical Wall", roleTh: "Physical Wall + Defog", item: "Rocky Helmet / Leftovers", moves: ["Roost", "Defog", "Body Press", "Iron Head"] },
];

const CHAMPIONS_ITEMS = [
  { name: "Choice Specs", pct: 28 }, { name: "Assault Vest", pct: 24 },
  { name: "Focus Sash", pct: 21 }, { name: "Life Orb", pct: 19 },
  { name: "Choice Scarf", pct: 17 }, { name: "Leftovers", pct: 15 },
  { name: "Heavy-Duty Boots", pct: 13 }, { name: "Rocky Helmet", pct: 11 },
];

const CHAMPIONS_MOVES = [
  { name: "Fake Out", pct: 42 }, { name: "Protect", pct: 38 },
  { name: "Tailwind", pct: 31 }, { name: "Stealth Rock", pct: 28 },
  { name: "Rapid Spin / Defog", pct: 25 }, { name: "Parting Shot", pct: 22 },
  { name: "Trick Room", pct: 18 }, { name: "Will-O-Wisp / Thunder Wave", pct: 16 },
];

// ─── HOME popular transfer rankings ──────────────────────────────────────────

const HOME_RANKINGS = [
  { id: 150, slug: "mewtwo", nameEn: "Mewtwo", nameTh: "มิวทู", transferPct: 88, from: "GO / Let's Go", reason: "Legendary ยอดนิยม ใช้ได้ทุกเกม" },
  { id: 384, slug: "rayquaza", nameEn: "Rayquaza", nameTh: "เรควาซา", transferPct: 82, from: "GO", reason: "Mega Rayquaza ต้องโอนมาก่อน" },
  { id: 445, slug: "garchomp", nameEn: "Garchomp", nameTh: "การ์ชอมป์", transferPct: 76, from: "GO / SV", reason: "Pseudo-legendary ยอดนิยม Competitive" },
  { id: 448, slug: "lucario", nameEn: "Lucario", nameTh: "ลูคาริโอ", transferPct: 71, from: "GO / older games", reason: "โปเกมอนยอดนิยมตลอดกาล" },
  { id: 381, slug: "latios", nameEn: "Latios / Latias", nameTh: "ลาทิออส / ลาทิอัส", transferPct: 68, from: "GO", reason: "Eon Duo ต้องโอนสำหรับ Competitive" },
  { id: 249, slug: "lugia", nameEn: "Lugia", nameTh: "ลูเกีย", transferPct: 65, from: "GO / HGSS", reason: "Shadow Lugia เป็นที่ต้องการ" },
  { id: 612, slug: "haxorus", nameEn: "Haxorus", nameTh: "แฮ็กโซรัส", transferPct: 61, from: "GO", reason: "Dragon ราคาถูก โอนมาเก็บ Dex" },
  { id: 6, slug: "charizard", nameEn: "Charizard", nameTh: "ชาริซาร์ด", transferPct: 58, from: "GO / Let's Go", reason: "โปเกมอน #1 ตลอดกาล มีทุก Mega Form" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PokeBadge({ pct, color = "#e74c3c" }: { pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BarRank({ items, color }: { items: { name: string; pct: number }[]; color?: string }) {
  const max = items[0]?.pct ?? 100;
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-4 text-right font-mono">{i + 1}</span>
          <span className="text-xs font-medium flex-1 truncate">{item.name}</span>
          <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.pct / max) * 100}%`, background: color ?? "#e74c3c" }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-7 text-right">{item.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── VGC / OU Tab ─────────────────────────────────────────────────────────────

function CompetitiveTab({ format }: { format: "vgc" | "ou" }) {
  const teams = META_TEAMS.filter((t) => format === "vgc" ? t.format === "VGC" : t.format === "OU");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { pokemon, items, moves } = useMemo(() => deriveRankings(teams), [teams]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pokemon */}
        <SectionCard title="โปเกมอนยอดนิยม" icon={Star} className="lg:col-span-1">
          <div className="space-y-2">
            {pokemon.map(({ rank, member, pct }) => (
              <Link key={member.nameEn} href={`/pokedex/${member.id}`} className="flex items-center gap-2 group hover:bg-secondary rounded-lg p-1 transition-colors">
                <span className="text-xs font-mono text-muted-foreground w-4">{rank}</span>
                <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.id}.png`} alt={member.nameEn} width={32} height={32} className="object-contain" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{member.nameTh || member.nameEn}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.roleTh}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{pct}%</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        {/* Items + Moves */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="ไอเทมยอดนิยม" icon={Package}>
            <BarRank items={items} color="#f39c12" />
          </SectionCard>
          <SectionCard title="ท่ายอดนิยม" icon={Sword}>
            <BarRank items={moves} color="#3498db" />
          </SectionCard>
        </div>
      </div>

      {/* Teams */}
      <div>
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          ทีม Championship ยอดนิยม
        </h3>
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === team.id ? null : team.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  team.tier === "S" ? "bg-yellow-400/20 text-yellow-400" :
                  team.tier === "A" ? "bg-green-400/20 text-green-400" : "bg-blue-400/20 text-blue-400"
                )}>Tier {team.tier}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{team.nameTh}</p>
                  <p className="text-xs text-muted-foreground">{team.archetypeTh} · {team.season}</p>
                </div>
                <div className="flex -space-x-2 mr-2">
                  {team.members.slice(0, 4).map((m) => (
                    <Image key={m.nameEn} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`} alt={m.nameEn} width={28} height={28} className="rounded-full bg-secondary border border-border" />
                  ))}
                </div>
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded === team.id && "rotate-90")} />
              </button>

              {expanded === team.id && (
                <div className="border-t border-border p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">{team.strategyTh}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {team.members.map((m) => (
                      <Link key={m.nameEn} href={`/pokedex/${m.id}`} className="group flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-secondary/30 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`} alt={m.nameEn} width={40} height={40} className="object-contain" />
                          <div>
                            <p className="text-xs font-bold leading-tight">{m.nameTh || m.nameEn}</p>
                            <p className="text-[10px] text-muted-foreground">{m.roleTh}</p>
                          </div>
                        </div>
                        <div className="text-[10px] space-y-0.5">
                          <p><span className="text-muted-foreground">ไอเทม:</span> {m.item}</p>
                          <p><span className="text-muted-foreground">Nature:</span> {m.nature}</p>
                          <p><span className="text-muted-foreground">Ability:</span> {m.ability}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.moves.map((mv) => (
                              <span key={mv} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-medium">{mv}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GO Battle League Tab ──────────────────────────────────────────────────────

function GOTab() {
  const [league, setLeague] = useState<GOLeague>("great");
  const leagueData = GO_LEAGUES.find((l) => l.id === league)!;

  return (
    <div className="space-y-5">
      {/* League selector */}
      <div className="flex gap-2 flex-wrap">
        {GO_LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeague(l.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              league === l.id ? "text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground"
            )}
            style={league === l.id ? { background: l.color } : {}}
          >
            <span>{l.icon}</span>
            <span>{l.leagueTh}</span>
            <span className="text-xs opacity-70">{l.cpLimit}</span>
          </button>
        ))}
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>Pokémon GO ไม่มี held items หรือ EVs — ใช้ Fast Move + Charged Moves เป็นหลัก คะแนน PvPoke score 0-100</span>
      </div>

      {/* Pokemon table */}
      <SectionCard title={`Top 10 — ${leagueData.leagueTh} (${leagueData.cpLimit})`} icon={Star}>
        <div className="space-y-2">
          {leagueData.topPokemon.map((p) => (
            <GOPokemonRow key={p.slug} pokemon={p} color={leagueData.color} />
          ))}
        </div>
      </SectionCard>

      {/* Moves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title="Fast Moves ยอดนิยม" icon={Zap}>
          <BarRank
            items={[
              { name: "Counter", pct: 34 }, { name: "Mud Shot", pct: 28 },
              { name: "Shadow Claw", pct: 25 }, { name: "Powder Snow", pct: 22 },
              { name: "Bubble", pct: 18 }, { name: "Charm", pct: 16 },
              { name: "Incinerate", pct: 14 }, { name: "Psycho Cut", pct: 12 },
            ]}
            color={leagueData.color}
          />
        </SectionCard>
        <SectionCard title="Charged Moves ยอดนิยม" icon={Sword}>
          <BarRank
            items={[
              { name: "Earthquake", pct: 38 }, { name: "Shadow Ball", pct: 32 },
              { name: "Rock Slide", pct: 28 }, { name: "Ice Beam / Icicle Spear", pct: 25 },
              { name: "Play Rough", pct: 21 }, { name: "Moonblast", pct: 18 },
              { name: "Hydro Cannon", pct: 16 }, { name: "Focus Blast", pct: 14 },
            ]}
            color={leagueData.color}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function GOPokemonRow({ pokemon: p, color }: { pokemon: GOPokemon; color: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
      <span className="text-xs font-mono text-muted-foreground w-4 text-right">{p.rank}</span>
      <Link href={`/pokedex/${p.id}`}>
        <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.nameEn} width={36} height={36} className="object-contain" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link href={`/pokedex/${p.id}`} className="text-sm font-bold hover:text-primary transition-colors">{p.nameTh}</Link>
          <span className="text-[10px] text-muted-foreground hidden sm:block">{p.nameEn}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
          <span className="bg-secondary rounded px-1.5 py-0.5">{p.fastMove}</span>
          {p.chargedMoves.map((m) => (
            <span key={m} className="bg-secondary rounded px-1.5 py-0.5">{m}</span>
          ))}
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">{p.roleTh}</span>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: color }} />
          </div>
          <span className="text-[10px] font-bold" style={{ color }}>{p.score}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Champions Tab ────────────────────────────────────────────────────────────

function ChampionsTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-400" />
        <span>Pokémon Champions ใช้ format เดียวกับ VGC + Smogon Standard — ข้อมูลอ้างอิงจากทัวร์นาเมนต์ปี 2024-2025</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pokemon */}
        <SectionCard title="โปเกมอน Tier List (Champions Meta)" icon={Star} className="lg:col-span-1">
          <div className="space-y-1">
            {CHAMPIONS_TOP.map((p, i) => (
              <Link key={p.slug} href={`/pokedex/${p.id}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors group">
                <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.nameEn} width={32} height={32} className="object-contain" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{p.nameTh}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.roleTh}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  p.tier === "S" ? "bg-yellow-400/20 text-yellow-400" :
                  p.tier === "A" ? "bg-green-400/20 text-green-400" : "bg-blue-400/20 text-blue-400"
                )}>{p.tier}</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="ไอเทมยอดนิยม" icon={Package}>
            <BarRank items={CHAMPIONS_ITEMS} color="#e9c46a" />
          </SectionCard>
          <SectionCard title="ท่ายอดนิยม" icon={Sword}>
            <BarRank items={CHAMPIONS_MOVES} color="#f4a261" />
          </SectionCard>
        </div>
      </div>

      {/* Featured builds */}
      <div>
        <h3 className="font-bold text-sm mb-3">Sets ยอดนิยม</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHAMPIONS_TOP.slice(0, 6).map((p) => (
            <div key={p.slug} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === p.slug ? null : p.slug)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.nameEn} width={40} height={40} className="object-contain" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{p.nameTh}</p>
                  <p className="text-xs text-muted-foreground">{p.roleTh}</p>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full mr-2",
                  p.tier === "S" ? "bg-yellow-400/20 text-yellow-400" : "bg-green-400/20 text-green-400"
                )}>Tier {p.tier}</span>
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded === p.slug && "rotate-90")} />
              </button>
              {expanded === p.slug && (
                <div className="border-t border-border p-3 space-y-2 text-xs">
                  <p><span className="text-muted-foreground">ไอเทม:</span> {p.item}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.moves.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOME Tab ────────────────────────────────────────────────────────────────

function HOMETab() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-cyan-400/10 border border-cyan-400/20 rounded-xl p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-cyan-400" />
        <span>Pokémon HOME เป็นระบบโอนและฝากโปเกมอน — ข้อมูลด้านล่างคือโปเกมอนที่ผู้เล่นโอนย้ายบ่อยที่สุดระหว่างเกม</span>
      </div>

      <SectionCard title="โปเกมอนที่โอนย้ายมากที่สุด" icon={Star}>
        <div className="space-y-3">
          {HOME_RANKINGS.map((p, i) => (
            <div key={p.slug} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
              <span className="text-xs font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
              <Link href={`/pokedex/${p.id}`}>
                <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.nameEn} width={40} height={40} className="object-contain" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/pokedex/${p.id}`} className="text-sm font-bold hover:text-primary transition-colors">{p.nameTh}</Link>
                <p className="text-xs text-muted-foreground">{p.reason}</p>
                <p className="text-[10px] text-muted-foreground">โอนจาก: {p.from}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-bold text-primary">{p.transferPct}%</span>
                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${p.transferPct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "🔄", title: "Wonder Box", desc: "สุ่มแลกโปเกมอนกับผู้เล่นทั่วโลกโดยไม่เปิดเผยชื่อ" },
          { icon: "🌐", title: "GTS (Global Trade System)", desc: "ตั้งเงื่อนไขโปเกมอนที่ต้องการแลก หาคู่แลกทั่วโลก" },
          { icon: "📦", title: "Storage", desc: "ฝากโปเกมอนได้สูงสุด 6,000 ตัว เข้าถึงได้ทุกเกม" },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <p className="font-bold text-sm mb-1">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "vgc" as const, label: "VGC 2024", labelTh: "VGC 2024", icon: "🏆", color: "#e9c46a", desc: "Video Game Championship Regulation H" },
  { id: "ou" as const, label: "Gen 9 OU", labelTh: "Smogon OU", icon: "⚔️", color: "#3498db", desc: "Smogon Gen 9 Overused" },
  { id: "go" as const, label: "GO Battle League", labelTh: "GO Battle League", icon: "📍", color: "#27ae60", desc: "Great · Ultra · Master League" },
  { id: "champions" as const, label: "Pokémon Champions", labelTh: "Champions", icon: "🎮", color: "#f4a261", desc: "แพลตฟอร์มแข่งขันอย่างเป็นทางการ" },
  { id: "home" as const, label: "Pokémon HOME", labelTh: "HOME", icon: "🏠", color: "#00b4d8", desc: "โอนย้ายและโปเกมอนยอดนิยม" },
];

export default function MetaPage() {
  const [activeTab, setActiveTab] = useState<FormatTab>("vgc");
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Trophy className="h-4 w-4" />
          <span>Meta Rankings</span>
        </div>
        <h1 className="text-3xl font-black mb-1">Meta Rankings & ทีมยอดนิยม</h1>
        <p className="text-muted-foreground text-sm">
          ข้อมูลโปเกมอน ท่า และไอเทมยอดนิยมจากทุกแพลตฟอร์ม — VGC, Smogon OU, GO Battle League, Pokémon Champions
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap mb-6 pb-4 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as FormatTab)}
            className={cn(
              "flex flex-col items-start px-4 py-2.5 rounded-2xl text-sm transition-all border",
              activeTab === t.id
                ? "text-black border-transparent shadow-sm"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            style={activeTab === t.id ? { background: t.color } : {}}
          >
            <span className="font-bold flex items-center gap-1.5">
              <span>{t.icon}</span>
              {t.labelTh}
            </span>
            <span className={cn("text-[10px] mt-0.5", activeTab === t.id ? "text-black/70" : "text-muted-foreground")}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "vgc" && <CompetitiveTab format="vgc" />}
      {activeTab === "ou" && <CompetitiveTab format="ou" />}
      {activeTab === "go" && <GOTab />}
      {activeTab === "champions" && <ChampionsTab />}
      {activeTab === "home" && <HOMETab />}

      {/* Footer sources */}
      <div className="mt-10 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>แหล่งข้อมูล:</span>
        <a href="https://pikalytics.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1">Pikalytics <ExternalLink className="h-3 w-3" /></a>
        <a href="https://www.smogon.com/stats/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1">Smogon Stats <ExternalLink className="h-3 w-3" /></a>
        <a href="https://pvpoke.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1">PvPoke <ExternalLink className="h-3 w-3" /></a>
        <a href="https://gobattlelog.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1">GO Battle Log <ExternalLink className="h-3 w-3" /></a>
      </div>
    </div>
  );
}
