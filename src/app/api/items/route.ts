import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const CATEGORY_SLUGS: Record<string, string[]> = {
  medicine: ["medicine", "healing", "status-cures"],
  vitamins: ["vitamins"],
  held: ["choice", "held-items-in-battle", "type-enhancement", "long-term", "in-a-pinch", "bad-held-items"],
  evolution: ["evolution", "mega-stones"],
  battle: ["stat-boosts", "flutes", "miracle-shooter"],
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

interface RawItem {
  id: number;
  name: string;
  cost: number;
  category: { name: string };
  effect_entries: Array<{ short_effect: string; language: { name: string } }>;
  names: Array<{ name: string; language: { name: string } }>;
  sprites: { default: string | null };
  attributes: Array<{ name: string }>;
  fling_power: number | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "medicine";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const q = (searchParams.get("q") ?? "").toLowerCase();

  try {
    const slugs = CATEGORY_SLUGS[category] ?? [category];

    // Fetch all items from each category slug in parallel
    const rawItems: Array<{ id: number; name: string }> = [];

    await Promise.all(
      slugs.map(async (slug) => {
        try {
          const catData = await fetchJson<{
            items: Array<{ name: string; url: string }>;
          }>(`${POKEAPI_BASE}/item-category/${slug}`);

          catData.items.forEach((item) => {
            const id = parseInt(item.url.split("/").filter(Boolean).pop() ?? "0");
            if (id > 0) rawItems.push({ id, name: item.name });
          });
        } catch {
          // Category slug doesn't exist, skip silently
        }
      })
    );

    // Deduplicate and sort by ID
    const seen = new Set<number>();
    const sorted = rawItems
      .filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      })
      .sort((a, b) => a.id - b.id);

    // Filter by search query on slug name (before fetching details)
    const filtered = q ? sorted.filter((i) => i.name.includes(q)) : sorted;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pageItems = filtered.slice(offset, offset + limit);

    // Fetch full details for only the current page
    const settled = await Promise.allSettled(
      pageItems.map((item) =>
        fetchJson<RawItem>(`${POKEAPI_BASE}/item/${item.name}`)
      )
    );

    const items = settled
      .filter(
        (r): r is PromiseFulfilledResult<RawItem> => r.status === "fulfilled"
      )
      .map((r) => {
        const d = r.value;
        const enEffect =
          d.effect_entries.find((e) => e.language.name === "en")
            ?.short_effect ?? "";
        const enName =
          d.names.find((n) => n.language.name === "en")?.name ??
          d.name
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        return {
          id: d.id,
          slug: d.name,
          displayName: enName,
          sprite: d.sprites.default,
          cost: d.cost,
          category: d.category.name,
          flingPower: d.fling_power,
          attributes: d.attributes.map((a) => a.name),
          shortEffect: enEffect,
        };
      });

    // Second-pass search on display names if needed
    const finalItems = q
      ? items.filter(
          (i) =>
            i.slug.includes(q) ||
            i.displayName.toLowerCase().includes(q)
        )
      : items;

    return NextResponse.json({
      data: finalItems,
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
