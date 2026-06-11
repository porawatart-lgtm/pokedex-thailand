import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return res.json();
}

function parseGeneration(url: string): number {
  const match = url.match(/\/generation\/(\d+)\//);
  return match ? parseInt(match[1]) : 1;
}

async function seedAbilities() {
  console.log("🌱 Fetching abilities from PokeAPI...");

  // Get all ability IDs (PokeAPI has ~307 abilities)
  const list = await fetchJson("https://pokeapi.co/api/v2/ability?limit=400") as {
    results: { name: string; url: string }[];
  };

  console.log(`Found ${list.results.length} abilities`);

  let count = 0;
  for (const item of list.results) {
    try {
      const data = await fetchJson(item.url) as {
        id: number;
        name: string;
        is_main_series: boolean;
        generation: { url: string };
        names: { name: string; language: { name: string } }[];
        effect_entries: { effect: string; short_effect: string; language: { name: string } }[];
      };

      const nameEn = data.names.find((n) => n.language.name === "en")?.name ?? data.name;
      const nameJa = data.names.find((n) => n.language.name === "ja")?.name ?? null;
      const effectEn = data.effect_entries.find((e) => e.language.name === "en");

      await prisma.ability.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          slug: data.name,
          nameEn,
          nameJa,
          generation: parseGeneration(data.generation.url),
          effect: effectEn?.effect ?? null,
          shortEffect: effectEn?.short_effect ?? null,
          isMainSeries: data.is_main_series,
        },
        update: {
          nameEn,
          nameJa,
          generation: parseGeneration(data.generation.url),
          effect: effectEn?.effect ?? null,
          shortEffect: effectEn?.short_effect ?? null,
          isMainSeries: data.is_main_series,
        },
      });

      count++;
      if (count % 20 === 0) console.log(`  ${count}/${list.results.length} abilities done`);
    } catch (e) {
      console.warn(`  Skipped ${item.name}: ${e}`);
    }
  }

  console.log(`✅ Seeded ${count} abilities`);
}

async function seedPokemonAbilities() {
  console.log("🌱 Seeding PokemonAbility links...");

  // Get all pokemon from DB
  const allPokemon = await prisma.pokemon.findMany({
    select: { id: true, slug: true },
    orderBy: { id: "asc" },
  });

  console.log(`Processing ${allPokemon.length} Pokémon...`);

  let count = 0;
  for (const pokemon of allPokemon) {
    try {
      const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${pokemon.slug}`) as {
        abilities: {
          ability: { name: string; url: string };
          is_hidden: boolean;
          slot: number;
        }[];
      };

      for (const a of data.abilities) {
        const abilityId = parseInt(a.ability.url.split("/").filter(Boolean).pop() ?? "0");
        if (!abilityId) continue;

        // Ensure ability exists
        const exists = await prisma.ability.findUnique({ where: { id: abilityId } });
        if (!exists) continue;

        await prisma.pokemonAbility.upsert({
          where: { pokemonId_slot: { pokemonId: pokemon.id, slot: a.slot } },
          create: {
            pokemonId: pokemon.id,
            abilityId,
            slot: a.slot,
            isHidden: a.is_hidden,
          },
          update: {
            abilityId,
            isHidden: a.is_hidden,
          },
        });
      }

      count++;
      if (count % 50 === 0) console.log(`  ${count}/${allPokemon.length} Pokémon processed`);
    } catch (e) {
      console.warn(`  Skipped ${pokemon.slug}: ${e}`);
    }
  }

  console.log(`✅ Seeded abilities for ${count} Pokémon`);
}

async function main() {
  try {
    await seedAbilities();
    await seedPokemonAbilities();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
