import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

interface SmogonPokemonData {
  "Raw count": number;
  "Viability Ceiling": number;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Spreads: Record<string, number>;
  Moves: Record<string, number>;
  Teammates: Record<string, number>;
  "Checks and Counters"?: Record<string, [number, number]>;
  usage: number;
}

interface SmogonChaosData {
  info: { metagame: string; "number of battles": number };
  data: Record<string, SmogonPokemonData>;
}

const cache = new Map<string, { data: SmogonChaosData; month: string; ts: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

async function getSmogonStats(format: string) {
  const hit = cache.get(format);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit;

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
        const data = (await res.json()) as SmogonChaosData;
        cache.set(format, { data, month, ts: Date.now() });
        return { data, month };
      }
    } catch { /* continue */ }
  }
  throw new Error(`No stats for ${format}`);
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function topN(
  obj: Record<string, number> | null | undefined,
  n: number,
  rawCount: number
) {
  if (!obj || rawCount <= 0) return [];
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({
      name,
      pct: parseFloat(Math.min((count / rawCount) * 100, 100).toFixed(1)),
    }));
}

function parseSpread(spreadKey: string) {
  // Format: "Nature:HP,Atk,Def,SpA,SpD,Spe"
  const [nature, evStr] = spreadKey.split(":");
  const evs = (evStr ?? "").split(",").map(Number);
  const statNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
  const evMap: Record<string, number> = {};
  statNames.forEach((s, i) => { if ((evs[i] ?? 0) > 0) evMap[s] = evs[i] ?? 0; });
  return { nature: nature ?? "Neutral", evs: evMap };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "gen9ou";

  try {
    const { data, month } = await getSmogonStats(format);

    // Find the Pokemon by matching slug
    const entry = Object.entries(data.data).find(
      ([name]) => toSlug(name) === slug
    );

    if (!entry) {
      return NextResponse.json(
        { error: `${slug} not found in ${format}` },
        { status: 404 }
      );
    }

    const [name, d] = entry;
    const raw = d["Raw count"];

    // Checks & Counters — can be missing or have varying structure
    const rawCC = d["Checks and Counters"] ?? {};
    const checksEntries = Object.entries(rawCC)
      .filter(([, val]) => Array.isArray(val))
      .sort(([, a], [, b]) => {
        const aArr = a as number[];
        const bArr = b as number[];
        return (bArr[0] ?? 0) - (aArr[0] ?? 0);
      })
      .slice(0, 8)
      .map(([cName, val]) => {
        const arr = val as number[];
        return {
          name: cName,
          slug: toSlug(cName),
          ko: parseFloat((arr[0] ?? 0).toFixed(1)),
          switched: parseFloat((arr[1] ?? 0).toFixed(1)),
        };
      });

    return NextResponse.json({
      name,
      slug,
      usage: parseFloat((d.usage * 100).toFixed(2)),
      raw,
      viabilityCeiling: d["Viability Ceiling"],
      items: topN(d.Items, 8, raw),
      moves: topN(d.Moves, 8, raw),
      abilities: topN(d.Abilities, 5, raw),
      teammates: topN(d.Teammates, 8, raw).map((t) => ({ ...t, slug: toSlug(t.name) })),
      spreads: topN(d.Spreads, 6, raw).map((s) => ({
        ...s,
        ...parseSpread(s.name),
      })),
      checksAndCounters: checksEntries,
      info: { metagame: data.info.metagame, month, battles: data.info["number of battles"] },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
