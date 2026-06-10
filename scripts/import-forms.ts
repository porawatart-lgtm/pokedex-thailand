/**
 * Import Special Pokemon Forms
 * Populates PokemonForm table with Mega, Regional, Gigantamax, Primal forms
 *
 * Usage: npx tsx scripts/import-forms.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const POKEAPI = "https://pokeapi.co/api/v2";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSafe<T>(url: string): Promise<T | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      if (i === 2) return null;
      await sleep(800 * (i + 1));
    }
  }
  return null;
}

// ─── Form Classification ─────────────────────────────────────────────────────

function classifyForm(slug: string) {
  const s = slug.toLowerCase();
  if (s.endsWith("-mega-x")) return { formName: "mega-x", isMega: true,  isGmax: false, isBattleOnly: true };
  if (s.endsWith("-mega-y")) return { formName: "mega-y", isMega: true,  isGmax: false, isBattleOnly: true };
  if (s.includes("-mega"))   return { formName: "mega",   isMega: true,  isGmax: false, isBattleOnly: true };
  if (s.includes("-primal")) return { formName: "primal", isMega: true,  isGmax: false, isBattleOnly: true };
  if (s.includes("-gmax"))   return { formName: "gmax",   isMega: false, isGmax: true,  isBattleOnly: true };
  if (s.includes("-alola"))  return { formName: "alola",  isMega: false, isGmax: false, isBattleOnly: false };
  if (s.includes("-galar"))  return { formName: "galar",  isMega: false, isGmax: false, isBattleOnly: false };
  if (s.includes("-hisui"))  return { formName: "hisui",  isMega: false, isGmax: false, isBattleOnly: false };
  if (s.includes("-paldea")) return { formName: "paldea", isMega: false, isGmax: false, isBattleOnly: false };
  return null; // skip other forms
}

// ─── Find base Pokemon ID by matching slug prefix ────────────────────────────

function findBaseId(
  formSlug: string,
  slugMap: Map<string, number>
): number | null {
  const parts = formSlug.split("-");
  for (let len = parts.length - 1; len >= 1; len--) {
    const candidate = parts.slice(0, len).join("-");
    const id = slugMap.get(candidate);
    if (id !== undefined) return id;
  }
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔍 Loading existing Pokemon slugs from DB...");
  const existing = await prisma.pokemon.findMany({ select: { id: true, slug: true } });
  const slugMap = new Map(existing.map((p) => [p.slug, p.id]));
  console.log(`   ${slugMap.size} Pokemon loaded.\n`);

  // Fetch all Pokemon list from PokeAPI (includes forms beyond ID 1025)
  console.log("📡 Fetching form list from PokeAPI...");
  const listData = await fetchSafe<{ results: Array<{ name: string; url: string }> }>(
    `${POKEAPI}/pokemon?limit=2000&offset=1025`
  );
  if (!listData) {
    console.error("Failed to fetch Pokemon list");
    return;
  }

  // Filter to special forms only
  const PATTERNS = ["-mega", "-primal", "-gmax", "-alola", "-galar", "-hisui", "-paldea"];
  const specialForms = listData.results.filter(({ name }) =>
    PATTERNS.some((p) => name.includes(p))
  );

  console.log(`   Found ${specialForms.length} special forms to import.\n`);

  let ok = 0;
  let skip = 0;

  for (const { name: formSlug } of specialForms) {
    const cls = classifyForm(formSlug);
    if (!cls) { skip++; continue; }

    const baseId = findBaseId(formSlug, slugMap);
    if (!baseId) {
      console.log(`  ⚠️  No base Pokemon found for: ${formSlug}`);
      skip++;
      continue;
    }

    // Fetch form data
    const data = await fetchSafe<{
      id: number;
      sprites: { front_default: string | null; other: { "official-artwork": { front_default: string | null; front_shiny: string | null } } };
      types: Array<{ type: { name: string } }>;
      stats: Array<{ base_stat: number; stat: { name: string } }>;
    }>(`${POKEAPI}/pokemon/${formSlug}`);

    if (!data) {
      console.log(`  ⚠️  API fail: ${formSlug}`);
      skip++;
      continue;
    }

    const types = data.types.map((t) => t.type.name);
    const rawStats: Record<string, number> = {};
    for (const s of data.stats) rawStats[s.stat.name] = s.base_stat;
    const stats = {
      hp:             rawStats["hp"]             ?? 0,
      attack:         rawStats["attack"]         ?? 0,
      defense:        rawStats["defense"]        ?? 0,
      specialAttack:  rawStats["special-attack"] ?? 0,
      specialDefense: rawStats["special-defense"]?? 0,
      speed:          rawStats["speed"]          ?? 0,
      total: 0,
    };
    stats.total = stats.hp + stats.attack + stats.defense + stats.specialAttack + stats.specialDefense + stats.speed;

    const sprites = {
      officialArtwork:      data.sprites.other?.["official-artwork"]?.front_default ?? null,
      officialArtworkShiny: data.sprites.other?.["official-artwork"]?.front_shiny   ?? null,
      frontDefault:         data.sprites.front_default ?? null,
      types,
      stats,
    };

    // Upsert: delete existing entry then create
    await prisma.pokemonForm.deleteMany({
      where: { pokemonId: baseId, formName: cls.formName },
    });
    await prisma.pokemonForm.create({
      data: {
        pokemonId:   baseId,
        formName:    cls.formName,
        isDefault:   false,
        isBattleOnly:cls.isBattleOnly,
        isMega:      cls.isMega,
        isGmax:      cls.isGmax,
        sprites,
      },
    });

    console.log(`  ✅ ${formSlug.padEnd(36)} [${cls.formName}] base→${baseId}`);
    ok++;
    await sleep(150);
  }

  console.log(`\n✅ Done! Imported: ${ok}  Skipped: ${skip}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
