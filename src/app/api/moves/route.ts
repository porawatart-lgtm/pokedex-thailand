import { NextRequest, NextResponse } from "next/server";
import { fetchMove } from "@/lib/pokeapi";

export const runtime = "nodejs";
export const revalidate = 3600;

// Fetch a batch of moves from PokéAPI
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const category = searchParams.get("category") ?? "";

  const offset = (page - 1) * limit;

  try {
    // Fetch moves list from PokéAPI
    const res = await fetch(
      `https://pokeapi.co/api/v2/move?limit=${limit}&offset=${offset}`,
      { next: { revalidate: 3600 } }
    );
    const list = await res.json() as {
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{ name: string; url: string }>;
    };

    const moveDetails = await Promise.allSettled(
      list.results.map((m) => fetchMove(m.name))
    );

    const moves = moveDetails
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchMove>>> => r.status === "fulfilled")
      .map((r) => {
        const m = r.value;
        const enEffect = m.effect_entries.find((e) => e.language.name === "en");
        return {
          id: m.id,
          slug: m.name,
          nameEn: m.name.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          nameTh: null,
          typeName: m.type.name,
          category: m.damage_class.name,
          power: m.power,
          accuracy: m.accuracy,
          pp: m.pp,
          priority: m.priority,
          effectChance: m.effect_chance,
          generation: parseInt(m.generation.url.split("/").filter(Boolean).pop()?.replace(/\D/g, "") ?? "1"),
          target: m.target.name,
          shortEffect: enEffect?.short_effect ?? null,
          shortEffectTh: null,
          effect: enEffect?.effect ?? null,
          effectTh: null,
        };
      });

    // Apply filters
    let filtered = moves;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((m) => m.nameEn.toLowerCase().includes(q) || m.slug.includes(q));
    }
    if (type) {
      filtered = filtered.filter((m) => m.typeName === type);
    }
    if (category) {
      filtered = filtered.filter((m) => m.category === category);
    }

    return NextResponse.json({
      data: filtered,
      meta: {
        total: list.count,
        page,
        limit,
        totalPages: Math.ceil(list.count / limit),
        hasNext: !!list.next,
        hasPrev: !!list.previous,
      },
    });
  } catch (error) {
    console.error("Moves error:", error);
    return NextResponse.json({ error: "Failed to fetch moves" }, { status: 500 });
  }
}
