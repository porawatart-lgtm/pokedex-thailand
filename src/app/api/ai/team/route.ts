import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchPokemon, fetchPokemonSpecies, getArtworkUrl } from "@/lib/pokeapi";
import { getMetaTeamsForPokemon } from "@/lib/championship-teams";
import type { PokemonListItem, AITeamSuggestion } from "@/types/pokemon";

export const runtime = "nodejs";

// ─── Smogon cache (shared logic) ─────────────────────────────────────────────
interface SmogonEntry {
  "Raw count": number;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Moves: Record<string, number>;
  Teammates: Record<string, number>;
  usage: number;
}
interface SmogonChaos {
  info: { metagame: string; "number of battles": number };
  data: Record<string, SmogonEntry>;
}

const smogonCache = new Map<string, { data: SmogonChaos; ts: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

async function fetchSmogon(format: string): Promise<SmogonChaos | null> {
  const hit = smogonCache.get(format);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  const now = new Date();
  for (let back = 1; back <= 8; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    try {
      const res = await fetch(
        `https://www.smogon.com/stats/${month}/chaos/${format}-0.json`,
        { next: { revalidate: 604800 } }
      );
      if (res.ok) {
        const data = (await res.json()) as SmogonChaos;
        smogonCache.set(format, { data, ts: Date.now() });
        return data;
      }
    } catch { /* continue */ }
  }
  return null;
}

function toSmogonSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function topN(obj: Record<string, number> | undefined, n: number, raw: number) {
  if (!obj || raw <= 0) return [];
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({ name, pct: parseFloat(Math.min((count / raw) * 100, 100).toFixed(1)) }));
}

// ─── Format map ───────────────────────────────────────────────────────────────
const FORMAT_MAP: Record<string, string> = {
  OU: "gen9ou", Ubers: "gen9ubers", UU: "gen9uu", RU: "gen9ru",
  NU: "gen9nu", PU: "gen9pu", LC: "gen9lc",
  "Doubles OU": "gen9doublesou", VGC: "gen9vgc2024regh",
};

// ─── Build team from Smogon stats (no AI needed) ─────────────────────────────
async function buildSmogonTeam(
  core: PokemonListItem,
  format: string
): Promise<(AITeamSuggestion & { source: "smogon" }) | null> {
  const smogonFormat = FORMAT_MAP[format] ?? "gen9ou";
  const data = await fetchSmogon(smogonFormat);
  if (!data) return null;

  // Find core Pokemon in Smogon data
  const coreEntry = Object.entries(data.data).find(
    ([name]) => toSmogonSlug(name) === toSmogonSlug(core.slug)
  );
  if (!coreEntry) return null;

  const [, coreStats] = coreEntry;
  const raw = coreStats["Raw count"];
  const teammates = topN(coreStats.Teammates, 5, raw);

  if (teammates.length === 0) return null;

  // Build team members from teammates
  const pokemonList = await Promise.all(
    teammates.map(async (t) => {
      const tmEntry = Object.entries(data.data).find(
        ([name]) => toSmogonSlug(name) === toSmogonSlug(t.name)
      );
      if (!tmEntry) {
        return {
          id: 0,
          nameEn: t.name,
          nameTh: null,
          sprite: null,
          officialArtwork: null,
          role: "Teammate",
          roleTh: "เพื่อนร่วมทีม",
          suggestedMoves: [] as string[],
          suggestedAbility: "",
          suggestedItem: "",
          reasoning: `Paired with ${core.slug} ${t.pct}% of the time`,
          reasoningTh: `ใช้คู่กับ ${core.nameEn} ${t.pct}% ของเวลา จากสถิติ Smogon`,
        };
      }
      const [, tmStats] = tmEntry;
      const tmRaw = tmStats["Raw count"];
      const moves = topN(tmStats.Moves, 4, tmRaw).map((m) => m.name);
      const items = topN(tmStats.Items, 1, tmRaw);
      const abilities = topN(tmStats.Abilities, 1, tmRaw);

      const tmSlug = toSmogonSlug(t.name);
      // Try to get Pokemon ID from PokeAPI name mapping
      let id = 0;
      try {
        const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${tmSlug}`);
        if (r.ok) {
          const d = (await r.json()) as { id: number };
          id = d.id;
        }
      } catch { /* skip */ }

      return {
        id,
        nameEn: t.name,
        nameTh: null as string | null,
        sprite: id > 0 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : null,
        officialArtwork: id > 0 ? getArtworkUrl(id) : null,
        role: `Teammate (${t.pct}% usage)`,
        roleTh: `เพื่อนร่วมทีม (ใช้คู่ ${t.pct}%)`,
        suggestedMoves: moves,
        suggestedAbility: abilities[0]?.name ?? "",
        suggestedItem: items[0]?.name ?? "",
        reasoning: `Used alongside ${core.nameEn} in ${t.pct}% of ${format} games`,
        reasoningTh: `ถูกใช้คู่กับ ${core.nameEn} ใน ${t.pct}% ของเกม ${format} จากสถิติ Smogon`,
      };
    })
  );

  const coreItems = topN(coreStats.Items, 3, raw).map((i) => i.name).join(", ");
  const coreMoves = topN(coreStats.Moves, 4, raw).map((m) => m.name).join(", ");

  return {
    source: "smogon",
    pokemon: pokemonList,
    teamStrategy: `Team built around ${core.nameEn} in ${format} based on Smogon usage statistics. Core item: ${coreItems}. Core moves: ${coreMoves}.`,
    teamStrategyTh: `ทีมที่สร้างจากสถิติ Smogon สำหรับ ${core.nameEn} ใน ${format} ไอเทมยอดนิยม: ${coreItems} ท่ายอดนิยม: ${coreMoves}`,
    threats: [],
    coverageAnalysis: `Based on ${data.info["number of battles"].toLocaleString()} battles (${data.info.metagame})`,
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      pokemonId: number;
      format?: string;
      language?: "th" | "en";
    };

    const { pokemonId, format = "OU", language = "th" } = body;

    if (!pokemonId) {
      return NextResponse.json({ error: "Pokemon ID required" }, { status: 400 });
    }

    // Fetch Pokemon data
    const [pokemon, species] = await Promise.all([
      fetchPokemon(pokemonId),
      fetchPokemonSpecies(pokemonId),
    ]);

    const stats = {
      hp: pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
      attack: pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0,
      defense: pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0,
      specialAttack: pokemon.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0,
      specialDefense: pokemon.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0,
      speed: pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0,
      total: 0,
    };
    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

    const thName = species.names.find((n) => n.language.name === "th")?.name ?? null;

    const core: PokemonListItem = {
      id: pokemon.id,
      slug: pokemon.name,
      nameEn: pokemon.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      nameTh: thName,
      dexNumber: pokemon.id,
      generation: 1,
      types: pokemon.types.map((t) => t.type.name) as PokemonListItem["types"],
      sprites: {
        frontDefault: pokemon.sprites.front_default,
        officialArtwork: pokemon.sprites.other?.["official-artwork"]?.front_default ?? getArtworkUrl(pokemon.id),
      },
      stats,
    };

    // Check for valid Anthropic API key
    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    const hasAI = Boolean(apiKey) && apiKey !== "your-anthropic-api-key" && apiKey.startsWith("sk-ant");

    // Get championship/meta context
    const metaTeams = getMetaTeamsForPokemon(pokemon.name, format);
    const championshipContext = metaTeams.length > 0
      ? `\n\nPopular meta teams that use ${core.nameEn}:\n${metaTeams.map((t) =>
          `- ${t.nameTh}: ${t.strategyTh.slice(0, 200)}`
        ).join("\n")}`
      : "";

    // Get Smogon stats for enriched context
    const smogonFormat = FORMAT_MAP[format] ?? "gen9ou";
    const smogonData = await fetchSmogon(smogonFormat).catch(() => null);
    let smogonContext = "";
    if (smogonData) {
      const entry = Object.entries(smogonData.data).find(
        ([name]) => toSmogonSlug(name) === toSmogonSlug(pokemon.name)
      );
      if (entry) {
        const [, st] = entry;
        const raw = st["Raw count"];
        const topItems = topN(st.Items, 4, raw).map((i) => `${i.name} (${i.pct}%)`).join(", ");
        const topMoves = topN(st.Moves, 6, raw).map((m) => `${m.name} (${m.pct}%)`).join(", ");
        const topAbilities = topN(st.Abilities, 3, raw).map((a) => `${a.name} (${a.pct}%)`).join(", ");
        const topTeammates = topN(st.Teammates, 6, raw).map((t) => `${t.name} (${t.pct}%)`).join(", ");
        smogonContext = `\n\nSmogon ${format} stats for ${core.nameEn}:
- Most used items: ${topItems}
- Most used moves: ${topMoves}
- Most used abilities: ${topAbilities}
- Most common teammates: ${topTeammates}`;
      }
    }

    // ── AI path ────────────────────────────────────────────────────────────────
    if (hasAI) {
      try {
        const client = new Anthropic({ apiKey });
        const prompt = language === "th"
          ? `คุณเป็นผู้เชี่ยวชาญ Pokémon Competitive ระดับโลก

ผู้ใช้ต้องการสร้างทีม ${format} โดยมี ${core.nameEn} (${core.nameTh ?? core.nameEn}) เป็นตัวหลัก

ข้อมูล ${core.nameEn}:
- ประเภท: ${core.types.join(", ")}
- BST: ${stats.total} | HP:${stats.hp}/ATK:${stats.attack}/DEF:${stats.defense}/SpA:${stats.specialAttack}/SpD:${stats.specialDefense}/SPE:${stats.speed}
${smogonContext}${championshipContext}

แนะนำโปเกมอน 5 ตัวที่เข้ากัน พร้อมท่า 4 ท่า, ability, item, บทบาท และเหตุผลภาษาไทย

ตอบด้วย JSON:
{
  "pokemon": [{
    "id": <id>,
    "nameEn": "name",
    "nameTh": "ชื่อไทย",
    "sprite": null,
    "officialArtwork": null,
    "role": "role",
    "roleTh": "บทบาท",
    "suggestedMoves": ["m1","m2","m3","m4"],
    "suggestedAbility": "ability",
    "suggestedItem": "item",
    "reasoning": "reason",
    "reasoningTh": "เหตุผล"
  }],
  "teamStrategy": "strategy",
  "teamStrategyTh": "กลยุทธ์",
  "threats": ["t1","t2","t3"],
  "coverageAnalysis": "analysis"
}`
          : `You are a world-class competitive Pokémon expert.
Build a ${format} team around ${core.nameEn}.
Types: ${core.types.join(", ")} | BST: ${stats.total}
${smogonContext}${championshipContext}
Suggest 5 teammates with moves/ability/item/role/reasoning. Return JSON with same structure.`;

        const message = await client.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }],
        });

        const text = message.content[0]?.type === "text" ? message.content[0].text : "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const suggestion = JSON.parse(jsonMatch[0]) as AITeamSuggestion;
          return NextResponse.json({ data: suggestion, source: "ai" });
        }
      } catch (aiErr) {
        console.error("AI failed, falling back to Smogon:", aiErr);
      }
    }

    // ── Smogon fallback ────────────────────────────────────────────────────────
    const smogonTeam = await buildSmogonTeam(core, format);
    if (smogonTeam) {
      return NextResponse.json({
        data: smogonTeam,
        source: "smogon",
        notice: hasAI
          ? "AI ไม่สามารถสร้างทีมได้ แสดงข้อมูลจากสถิติ Smogon แทน"
          : "ใช้สถิติ Smogon (กรุณาตั้งค่า ANTHROPIC_API_KEY เพื่อใช้ AI)",
      });
    }

    return NextResponse.json(
      { error: "ไม่พบข้อมูลสำหรับโปเกมอนนี้ใน Smogon stats" },
      { status: 404 }
    );
  } catch (error) {
    console.error("AI team error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
