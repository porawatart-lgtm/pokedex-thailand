import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import type { PokemonListItem } from "@/types/pokemon";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit      = Math.min(parseInt(searchParams.get("limit")    ?? "20"), 300);
  const query      = searchParams.get("q")          ?? "";
  const typeFilter = searchParams.get("type")        ?? "";
  const genFilter  = searchParams.get("generation");
  const offset     = (page - 1) * limit;

  // ── Cache key ────────────────────────────────────────────────────────────────
  const cacheKey = `pokemon:list:${page}:${limit}:${query}:${typeFilter}:${genFilter ?? "all"}`;
  const cached = await cacheGet<{ data: PokemonListItem[]; meta: unknown }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  }

  try {
    // Build where clause
    const where: Prisma.PokemonWhereInput = {};

    if (genFilter) {
      where.generation = parseInt(genFilter);
    }

    if (query.trim()) {
      const num = parseInt(query);
      where.OR = [
        { nameEn: { contains: query, mode: "insensitive" } },
        { nameTh: { contains: query, mode: "insensitive" } },
        ...(!isNaN(num) ? [{ dexNumber: num }] : []),
      ];
    }

    if (typeFilter) {
      where.types = { some: { type: { slug: typeFilter } } };
    }

    const [total, rows] = await Promise.all([
      db.pokemon.count({ where }),
      db.pokemon.findMany({
        where,
        orderBy: { dexNumber: "asc" },
        skip:    offset,
        take:    limit,
        include: {
          types:   { include: { type: { select: { slug: true } } }, orderBy: { slot: "asc" } },
          stats:   { select: { statName: true, baseStat: true } },
          sprites: { select: { frontDefault: true, officialArtwork: true } },
        },
      }),
    ]);

    const data: PokemonListItem[] = rows.map((p) => {
      const s = Object.fromEntries(p.stats.map((x) => [x.statName, x.baseStat]));
      const hp  = s["hp"]             ?? 0;
      const atk = s["attack"]         ?? 0;
      const def = s["defense"]        ?? 0;
      const spa = s["special-attack"] ?? 0;
      const spd = s["special-defense"]?? 0;
      const spe = s["speed"]          ?? 0;

      return {
        id:         p.id,
        slug:       p.slug,
        nameEn:     p.nameEn,
        nameTh:     p.nameTh,
        dexNumber:  p.dexNumber,
        generation: p.generation,
        types:      p.types.map((t) => t.type.slug) as PokemonListItem["types"],
        sprites: {
          frontDefault:   p.sprites?.frontDefault   ?? null,
          officialArtwork:
            p.sprites?.officialArtwork ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
        },
        stats: { hp, attack: atk, defense: def, specialAttack: spa, specialDefense: spd, speed: spe,
                 total: hp + atk + def + spa + spd + spe },
      };
    });

    const response = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext:    offset + limit < total,
        hasPrev:    page > 1,
      },
    };
    // Cache for 1 hour (gen/type queries never change)
    await cacheSet(cacheKey, response, 3600);
    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("Pokemon list error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
