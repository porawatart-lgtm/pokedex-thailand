/**
 * Pokemon Data Importer
 * Fetches all Pokemon from PokéAPI and seeds the database
 *
 * Usage: npx tsx scripts/import-pokemon.ts [--gen=1] [--limit=100]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const POKEAPI = "https://pokeapi.co/api/v2";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json() as T;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries} for ${url}`);
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error("Max retries exceeded");
}

async function importPokemon(id: number) {
  try {
    const [pokemon, species] = await Promise.all([
      fetchWithRetry<Record<string, unknown>>(`${POKEAPI}/pokemon/${id}`),
      fetchWithRetry<Record<string, unknown>>(`${POKEAPI}/pokemon-species/${id}`),
    ]);

    const p = pokemon as {
      id: number;
      name: string;
      height: number;
      weight: number;
      base_experience: number;
      is_default: boolean;
      order: number;
      sprites: {
        front_default: string | null;
        front_shiny: string | null;
        back_default: string | null;
        other: {
          "official-artwork": { front_default: string | null; front_shiny: string | null };
          home: { front_default: string | null; front_shiny: string | null };
        };
      };
      cries: { latest: string | null; legacy: string | null };
      types: Array<{ slot: number; type: { name: string; url: string } }>;
      stats: Array<{ base_stat: number; effort: number; stat: { name: string } }>;
      abilities: Array<{ ability: { name: string; url: string }; is_hidden: boolean; slot: number }>;
      moves: Array<{
        move: { name: string; url: string };
        version_group_details: Array<{
          level_learned_at: number;
          move_learn_method: { name: string };
          version_group: { name: string };
        }>;
      }>;
      species: { name: string; url: string };
    };

    const s = species as {
      id: number;
      name: string;
      gender_rate: number;
      capture_rate: number;
      base_happiness: number;
      is_baby: boolean;
      is_legendary: boolean;
      is_mythical: boolean;
      hatch_counter: number;
      has_gender_differences: boolean;
      growth_rate: { name: string };
      egg_groups: Array<{ name: string }>;
      color: { name: string };
      shape: { name: string } | null;
      habitat: { name: string } | null;
      generation: { url: string };
      names: Array<{ language: { name: string }; name: string }>;
      flavor_text_entries: Array<{ flavor_text: string; language: { name: string }; version: { name: string } }>;
      genera: Array<{ genus: string; language: { name: string } }>;
    };

    const thName = s.names.find((n) => n.language.name === "th")?.name ?? null;
    const jaName = s.names.find((n) => n.language.name === "ja")?.name ?? null;
    const enGenus = s.genera.find((g) => g.language.name === "en")?.genus ?? null;

    const genNum = parseInt(s.generation.url.split("/").filter(Boolean).pop()?.replace(/\D/g, "") ?? "1");

    // Upsert Pokemon
    await prisma.pokemon.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.name,
        nameEn: p.name.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        nameTh: thName,
        nameJa: jaName,
        dexNumber: p.id,
        generation: genNum,
        color: s.color.name,
        shape: s.shape?.name ?? null,
        habitat: s.habitat?.name ?? null,
        isMythical: s.is_mythical,
        isLegendary: s.is_legendary,
        isBaby: s.is_baby,
        hasGenderDiff: s.has_gender_differences,
        genderRate: s.gender_rate,
        captureRate: s.capture_rate,
        baseHappiness: s.base_happiness,
        baseExpYield: p.base_experience,
        growthRate: s.growth_rate.name,
        hatchCounter: s.hatch_counter,
        heightDm: p.height,
        weightHg: p.weight,
        isDefault: p.is_default,
        species: enGenus,
      },
      update: {
        nameTh: thName,
        nameJa: jaName,
      },
    });

    // Upsert sprites
    await prisma.pokemonSprite.upsert({
      where: { pokemonId: p.id },
      create: {
        pokemonId: p.id,
        frontDefault: p.sprites.front_default,
        frontShiny: p.sprites.front_shiny,
        backDefault: p.sprites.back_default,
        officialArtwork: p.sprites.other?.["official-artwork"]?.front_default,
        officialArtworkShiny: p.sprites.other?.["official-artwork"]?.front_shiny,
        homeSprite: p.sprites.other?.home?.front_default,
        homeShiny: p.sprites.other?.home?.front_shiny,
      },
      update: {
        frontDefault: p.sprites.front_default,
        officialArtwork: p.sprites.other?.["official-artwork"]?.front_default,
      },
    });

    // Upsert cries
    await prisma.pokemonCry.upsert({
      where: { pokemonId: p.id },
      create: {
        pokemonId: p.id,
        latest: p.cries.latest,
        legacy: p.cries.legacy,
      },
      update: { latest: p.cries.latest },
    });

    // Delete and re-create types
    await prisma.pokemonType.deleteMany({ where: { pokemonId: p.id } });
    for (const t of p.types) {
      const typeId = parseInt(t.type.url.split("/").filter(Boolean).pop() ?? "0");
      await prisma.pokemonType.create({
        data: { pokemonId: p.id, typeId, slot: t.slot },
      });
    }

    // Delete and re-create stats
    await prisma.pokemonStat.deleteMany({ where: { pokemonId: p.id } });
    const statNameMap: Record<string, string> = {
      "hp": "hp", "attack": "attack", "defense": "defense",
      "special-attack": "specialAttack", "special-defense": "specialDefense", "speed": "speed",
    };
    for (const stat of p.stats) {
      const mappedName = statNameMap[stat.stat.name] ?? stat.stat.name;
      await prisma.pokemonStat.create({
        data: { pokemonId: p.id, statName: mappedName, baseStat: stat.base_stat, effort: stat.effort },
      });
    }

    // Egg groups
    await prisma.pokemonEggGroup.deleteMany({ where: { pokemonId: p.id } });
    for (const eg of s.egg_groups) {
      await prisma.pokemonEggGroup.create({
        data: { pokemonId: p.id, eggGroupName: eg.name },
      });
    }

    // Flavor texts (just English and Thai)
    await prisma.pokemonFlavorText.deleteMany({ where: { pokemonId: p.id } });
    const flavorTexts = s.flavor_text_entries.filter(
      (ft) => ft.language.name === "en" || ft.language.name === "th"
    ).slice(0, 30);
    for (const ft of flavorTexts) {
      await prisma.pokemonFlavorText.create({
        data: {
          pokemonId: p.id,
          flavorText: ft.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "),
          language: ft.language.name,
          versionName: ft.version.name,
        },
      });
    }

    console.log(`  ✅ #${String(p.id).padStart(4, "0")} ${p.name}`);
  } catch (err) {
    console.error(`  ❌ Failed to import Pokemon ${id}:`, err instanceof Error ? err.message : err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const genArg = args.find((a) => a.startsWith("--gen="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const startArg = args.find((a) => a.startsWith("--start="));

  const targetGen = genArg ? parseInt(genArg.split("=")[1]!) : null;
  const limit = limitArg ? parseInt(limitArg.split("=")[1]!) : 1025;
  const start = startArg ? parseInt(startArg.split("=")[1]!) : 1;

  // Generation ranges
  const GEN_RANGES: Record<number, [number, number]> = {
    1: [1, 151], 2: [152, 251], 3: [252, 386],
    4: [387, 493], 5: [494, 649], 6: [650, 721],
    7: [722, 809], 8: [810, 905], 9: [906, 1025],
  };

  let startId = start;
  let endId = Math.min(start + limit - 1, 1025);

  if (targetGen && GEN_RANGES[targetGen]) {
    [startId, endId] = GEN_RANGES[targetGen]!;
  }

  console.log(`\n🚀 Importing Pokemon #${startId} to #${endId}...\n`);

  let imported = 0;
  for (let id = startId; id <= endId; id++) {
    await importPokemon(id);
    imported++;
    // Rate limit: 100ms between requests
    await sleep(100);
    if (imported % 50 === 0) {
      console.log(`\n📊 Progress: ${imported}/${endId - startId + 1} (${Math.round((imported / (endId - startId + 1)) * 100)}%)\n`);
    }
  }

  console.log(`\n✅ Import complete! ${imported} Pokemon imported.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
