import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

interface RawBerry {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: { name: string };
  flavors: Array<{ flavor: { name: string }; potency: number }>;
  item: { name: string; url: string };
  natural_gift_type: { name: string };
}

interface RawItem {
  cost: number;
  effect_entries: Array<{ short_effect: string; language: { name: string } }>;
  names: Array<{ name: string; language: { name: string } }>;
  sprites: { default: string | null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 64);
  const q = (searchParams.get("q") ?? "").toLowerCase();

  try {
    // All 64 berries — fetch entire list at once (cached for 24h)
    const list = await fetchJson<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(`${POKEAPI_BASE}/berry?limit=100`);

    const filtered = q
      ? list.results.filter((b) => b.name.includes(q))
      : list.results;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pageItems = filtered.slice(offset, offset + limit);

    const settled = await Promise.allSettled(
      pageItems.map(async (b) => {
        const berry = await fetchJson<RawBerry>(`${POKEAPI_BASE}/berry/${b.name}`);
        const item = await fetchJson<RawItem>(`${POKEAPI_BASE}/item/${berry.item.name}`);

        const enEffect =
          item.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? "";
        const enName =
          item.names.find((n) => n.language.name === "en")?.name ??
          berry.item.name
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        return {
          id: berry.id,
          slug: berry.name,
          displayName: enName,
          sprite: item.sprites.default,
          cost: item.cost,
          naturalGiftType: berry.natural_gift_type.name,
          naturalGiftPower: berry.natural_gift_power,
          firmness: berry.firmness.name,
          growthTime: berry.growth_time,
          maxHarvest: berry.max_harvest,
          size: berry.size,
          smoothness: berry.smoothness,
          flavors: berry.flavors
            .filter((f) => f.potency > 0)
            .sort((a, b) => b.potency - a.potency),
          shortEffect: enEffect,
        };
      })
    );

    const berries = settled
      .filter(
        (
          r
        ): r is PromiseFulfilledResult<{
          id: number;
          slug: string;
          displayName: string;
          sprite: string | null;
          cost: number;
          naturalGiftType: string;
          naturalGiftPower: number;
          firmness: string;
          growthTime: number;
          maxHarvest: number;
          size: number;
          smoothness: number;
          flavors: Array<{ flavor: { name: string }; potency: number }>;
          shortEffect: string;
        }> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    return NextResponse.json({
      data: berries,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
