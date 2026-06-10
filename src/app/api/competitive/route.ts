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
  "Checks and Counters"?: Record<string, unknown>;
  usage: number;
}

interface SmogonChaosData {
  info: {
    metagame: string;
    cutoff: number;
    "cutoff deviation": number;
    "team type": null;
    "number of battles": number;
  };
  data: Record<string, SmogonPokemonData>;
}

// In-memory cache to avoid re-fetching the large chaos JSON
const cache = new Map<string, { data: SmogonChaosData; month: string; ts: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week

async function getSmogonStats(format: string): Promise<{ data: SmogonChaosData; month: string }> {
  const hit = cache.get(format);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit;

  const now = new Date();
  for (let back = 1; back <= 8; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const url = `https://www.smogon.com/stats/${month}/chaos/${format}-0.json`;
    try {
      const res = await fetch(url, { next: { revalidate: 604800 } });
      if (res.ok) {
        const data = (await res.json()) as SmogonChaosData;
        cache.set(format, { data, month, ts: Date.now() });
        return { data, month };
      }
    } catch { /* try earlier month */ }
  }
  throw new Error(`Cannot fetch Smogon stats for ${format}`);
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Smogon chaos JSON stores raw counts, not percentages.
// Normalise by rawCount for Items/Abilities/Teammates; cap at 100%.
// Moves can exceed 100% (used multiple times per battle), so cap at 100.
function topN(obj: Record<string, number>, n: number, rawCount: number) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({
      name,
      pct: parseFloat(Math.min((count / rawCount) * 100, 100).toFixed(1)),
    }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "gen9ou";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 50);
  const q = (searchParams.get("q") ?? "").toLowerCase();

  try {
    const { data, month } = await getSmogonStats(format);

    let entries = Object.entries(data.data)
      .map(([name, d]) => ({ name, slug: toSlug(name), usageRaw: d.usage, d }))
      .sort((a, b) => b.usageRaw - a.usageRaw);

    if (q) {
      entries = entries.filter(
        (e) => e.name.toLowerCase().includes(q) || e.slug.includes(q)
      );
    }

    const total = entries.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;

    const results = entries.slice(offset, offset + limit).map((e, i) => {
      const raw = e.d["Raw count"];
      return {
        rank: offset + i + 1,
        name: e.name,
        slug: e.slug,
        usage: parseFloat((e.usageRaw * 100).toFixed(2)),
        raw,
        items: topN(e.d.Items, 6, raw),
        moves: topN(e.d.Moves, 6, raw),
        abilities: topN(e.d.Abilities, 3, raw),
        teammates: topN(e.d.Teammates, 6, raw).map((t) => ({
          ...t,
          slug: toSlug(t.name),
        })),
      };
    });

    return NextResponse.json({
      data: results,
      meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      info: { metagame: data.info.metagame, month, battles: data.info["number of battles"] },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
