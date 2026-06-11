/**
 * Import all 1025 Pokemon from PokeAPI into the database.
 * Run: npx tsx prisma/import-pokemon.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchJson(url: string, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseIdFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1] ?? "0");
}

function parseGeneration(url: string): number {
  const m = url.match(/\/generation\/(\d+)\//);
  return m ? parseInt(m[1]) : 1;
}

function capitalize(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

async function ensureTypes() {
  const types = [
    { id: 1,  slug: "normal",   nameEn: "Normal",   nameTh: "ธรรมดา",     color: "#A8A77A" },
    { id: 10, slug: "fire",     nameEn: "Fire",     nameTh: "ไฟ",          color: "#EE8130" },
    { id: 11, slug: "water",    nameEn: "Water",    nameTh: "น้ำ",          color: "#6390F0" },
    { id: 13, slug: "electric", nameEn: "Electric", nameTh: "ไฟฟ้า",       color: "#F7D02C" },
    { id: 12, slug: "grass",    nameEn: "Grass",    nameTh: "หญ้า",        color: "#7AC74C" },
    { id: 15, slug: "ice",      nameEn: "Ice",      nameTh: "น้ำแข็ง",     color: "#96D9D6" },
    { id: 2,  slug: "fighting", nameEn: "Fighting", nameTh: "ต่อสู้",      color: "#C22E28" },
    { id: 4,  slug: "poison",   nameEn: "Poison",   nameTh: "พิษ",         color: "#A33EA1" },
    { id: 5,  slug: "ground",   nameEn: "Ground",   nameTh: "พื้นดิน",     color: "#E2BF65" },
    { id: 3,  slug: "flying",   nameEn: "Flying",   nameTh: "บิน",         color: "#A98FF3" },
    { id: 14, slug: "psychic",  nameEn: "Psychic",  nameTh: "จิตตะ",       color: "#F95587" },
    { id: 7,  slug: "bug",      nameEn: "Bug",      nameTh: "แมลง",        color: "#A6B91A" },
    { id: 6,  slug: "rock",     nameEn: "Rock",     nameTh: "หิน",         color: "#B6A136" },
    { id: 8,  slug: "ghost",    nameEn: "Ghost",    nameTh: "ผี",          color: "#735797" },
    { id: 16, slug: "dragon",   nameEn: "Dragon",   nameTh: "มังกร",       color: "#6F35FC" },
    { id: 17, slug: "dark",     nameEn: "Dark",     nameTh: "มืด",         color: "#705746" },
    { id: 9,  slug: "steel",    nameEn: "Steel",    nameTh: "เหล็กกล้า",   color: "#B7B7CE" },
    { id: 18, slug: "fairy",    nameEn: "Fairy",    nameTh: "เทพนิยาย",    color: "#D685AD" },
  ];
  for (const t of types) {
    await prisma.type.upsert({ where: { id: t.id }, create: t, update: t });
  }
  console.log(`✅ Types ready (${types.length})`);
}

// ─── Abilities ────────────────────────────────────────────────────────────────

async function ensureAbilities() {
  const count = await prisma.ability.count();
  if (count > 0) {
    console.log(`✅ Abilities already seeded (${count})`);
    return;
  }

  console.log("🌱 Fetching abilities from PokeAPI...");
  const list = await fetchJson("https://pokeapi.co/api/v2/ability?limit=400") as {
    results: { name: string; url: string }[];
  };

  let done = 0;
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
      const eff = data.effect_entries.find((e) => e.language.name === "en");
      await prisma.ability.upsert({
        where: { id: data.id },
        create: {
          id: data.id, slug: data.name, nameEn, nameJa,
          generation: parseGeneration(data.generation.url),
          effect: eff?.effect ?? null,
          shortEffect: eff?.short_effect ?? null,
          isMainSeries: data.is_main_series,
        },
        update: { nameEn, nameJa, effect: eff?.effect ?? null, shortEffect: eff?.short_effect ?? null },
      });
      done++;
      if (done % 50 === 0) console.log(`  Abilities: ${done}/${list.results.length}`);
      await sleep(50);
    } catch (e) {
      console.warn(`  Skip ability ${item.name}: ${e}`);
    }
  }
  console.log(`✅ Abilities seeded: ${done}`);
}

// ─── Pokemon import ───────────────────────────────────────────────────────────

type PokeApiPokemon = {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; effort: number; stat: { name: string } }[];
  abilities: { ability: { name: string; url: string }; is_hidden: boolean; slot: number }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    front_female: string | null;
    front_shiny_female: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null; front_shiny: string | null };
      home?: { front_default: string | null; front_shiny: string | null };
      showdown?: { front_default: string | null; front_shiny: string | null };
    };
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: { front_default: string | null; front_shiny: string | null };
        };
      };
    };
  };
  cries: { latest: string | null; legacy: string | null };
  species: { name: string; url: string };
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      move_learn_method: { name: string };
      level_learned_at: number;
      version_group: { name: string };
    }[];
  }[];
};

type PokeApiSpecies = {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  has_gender_differences: boolean;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  growth_rate: { name: string };
  color: { name: string };
  shape: { name: string } | null;
  habitat: { name: string } | null;
  generation: { url: string };
  names: { name: string; language: { name: string } }[];
  genera: { genus: string; language: { name: string } }[];
  egg_groups: { name: string }[];
  flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
};

const LEARN_METHOD_MAP: Record<string, string> = {
  "level-up": "LEVEL_UP",
  "tm": "TM",
  "tr": "TR",
  "hm": "HM",
  "tutor": "TUTOR",
  "egg": "EGG",
  "record": "RECORD",
  "voucher": "VOUCHER",
};

async function importPokemon(id: number): Promise<boolean> {
  try {
    const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`) as PokeApiPokemon;
    await sleep(100);
    const species = await fetchJson(pokemon.species.url) as PokeApiSpecies;

    const nameEn = species.names.find((n) => n.language.name === "en")?.name ??
      pokemon.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const nameTh = species.names.find((n) => n.language.name === "th")?.name ?? null;
    const nameJa = species.names.find((n) => n.language.name === "ja")?.name ?? null;
    const nameJaRomaji = species.names.find((n) => n.language.name === "ja-Hrkt")?.name ?? null;
    const genusEn = species.genera.find((g) => g.language.name === "en")?.genus ?? null;
    const genusTh = species.genera.find((g) => g.language.name === "th")?.genus ?? null;
    const generation = parseGeneration(species.generation.url);

    // Upsert Pokemon
    await prisma.pokemon.upsert({
      where: { id: pokemon.id },
      create: {
        id: pokemon.id,
        slug: pokemon.name,
        nameEn,
        nameTh,
        nameJa,
        nameJaRomaji,
        species: genusEn,
        speciesTh: genusTh,
        dexNumber: pokemon.id,
        generation,
        color: species.color.name,
        shape: species.shape?.name ?? null,
        habitat: species.habitat?.name ?? null,
        isMythical: species.is_mythical,
        isLegendary: species.is_legendary,
        isBaby: species.is_baby,
        hasGenderDiff: species.has_gender_differences,
        genderRate: species.gender_rate,
        captureRate: species.capture_rate,
        baseHappiness: species.base_happiness,
        baseExpYield: pokemon.base_experience,
        growthRate: species.growth_rate.name,
        hatchCounter: species.hatch_counter,
        heightDm: pokemon.height,
        weightHg: pokemon.weight,
        isDefault: pokemon.is_default,
      },
      update: {
        nameEn, nameTh, nameJa, nameJaRomaji,
        species: genusEn, speciesTh: genusTh,
        generation,
        color: species.color.name,
        shape: species.shape?.name ?? null,
        habitat: species.habitat?.name ?? null,
        isMythical: species.is_mythical,
        isLegendary: species.is_legendary,
        isBaby: species.is_baby,
        hasGenderDiff: species.has_gender_differences,
        genderRate: species.gender_rate,
        captureRate: species.capture_rate,
        baseHappiness: species.base_happiness,
        baseExpYield: pokemon.base_experience,
        growthRate: species.growth_rate.name,
        hatchCounter: species.hatch_counter,
        heightDm: pokemon.height,
        weightHg: pokemon.weight,
      },
    });

    // Types
    for (const t of pokemon.types) {
      const typeId = parseIdFromUrl(t.type.url);
      const typeExists = await prisma.type.findUnique({ where: { id: typeId } });
      if (!typeExists) continue;
      await prisma.pokemonType.upsert({
        where: { pokemonId_slot: { pokemonId: pokemon.id, slot: t.slot } },
        create: { pokemonId: pokemon.id, typeId, slot: t.slot },
        update: { typeId },
      });
    }

    // Stats
    for (const s of pokemon.stats) {
      await prisma.pokemonStat.upsert({
        where: { pokemonId_statName: { pokemonId: pokemon.id, statName: s.stat.name } },
        create: { pokemonId: pokemon.id, statName: s.stat.name, baseStat: s.base_stat, effort: s.effort },
        update: { baseStat: s.base_stat, effort: s.effort },
      });
    }

    // Abilities
    for (const a of pokemon.abilities) {
      const abilityId = parseIdFromUrl(a.ability.url);
      const exists = await prisma.ability.findUnique({ where: { id: abilityId } });
      if (!exists) continue;
      await prisma.pokemonAbility.upsert({
        where: { pokemonId_slot: { pokemonId: pokemon.id, slot: a.slot } },
        create: { pokemonId: pokemon.id, abilityId, slot: a.slot, isHidden: a.is_hidden },
        update: { abilityId, isHidden: a.is_hidden },
      });
    }

    // Sprites
    const sp = pokemon.sprites;
    await prisma.pokemonSprite.upsert({
      where: { pokemonId: pokemon.id },
      create: {
        pokemonId: pokemon.id,
        frontDefault: sp.front_default,
        frontShiny: sp.front_shiny,
        frontFemale: sp.front_female,
        frontShinyFemale: sp.front_shiny_female,
        backDefault: sp.back_default,
        backShiny: sp.back_shiny,
        officialArtwork: sp.other?.["official-artwork"]?.front_default ??
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        officialArtworkShiny: sp.other?.["official-artwork"]?.front_shiny ?? null,
        homeSprite: sp.other?.home?.front_default ?? null,
        homeShiny: sp.other?.home?.front_shiny ?? null,
        showdownFront: sp.other?.showdown?.front_default ?? null,
        showdownShiny: sp.other?.showdown?.front_shiny ?? null,
        animated: sp.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ?? null,
        animatedShiny: sp.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny ?? null,
      },
      update: {
        frontDefault: sp.front_default,
        frontShiny: sp.front_shiny,
        officialArtwork: sp.other?.["official-artwork"]?.front_default ??
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        officialArtworkShiny: sp.other?.["official-artwork"]?.front_shiny ?? null,
        homeSprite: sp.other?.home?.front_default ?? null,
        homeShiny: sp.other?.home?.front_shiny ?? null,
        animated: sp.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ?? null,
      },
    });

    // Cries
    await prisma.pokemonCry.upsert({
      where: { pokemonId: pokemon.id },
      create: { pokemonId: pokemon.id, latest: pokemon.cries.latest, legacy: pokemon.cries.legacy },
      update: { latest: pokemon.cries.latest, legacy: pokemon.cries.legacy },
    });

    // Egg groups
    await prisma.pokemonEggGroup.deleteMany({ where: { pokemonId: pokemon.id } });
    for (const eg of species.egg_groups) {
      await prisma.pokemonEggGroup.create({
        data: { pokemonId: pokemon.id, eggGroupName: eg.name },
      });
    }

    // Flavor texts (EN + TH, max 10 each)
    await prisma.pokemonFlavorText.deleteMany({ where: { pokemonId: pokemon.id } });
    const flavors = species.flavor_text_entries
      .filter((f) => f.language.name === "en" || f.language.name === "th")
      .slice(0, 20);
    for (const f of flavors) {
      await prisma.pokemonFlavorText.create({
        data: {
          pokemonId: pokemon.id,
          flavorText: f.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "),
          language: f.language.name,
          versionName: f.version.name,
        },
      });
    }

    // Ensure Moves exist (minimal upsert) + PokemonMove link
    const movesToLink = pokemon.moves.slice(0, 50);
    for (const m of movesToLink) {
      const moveId = parseIdFromUrl(m.move.url);
      if (!moveId) continue;

      // Ensure move record exists
      await prisma.move.upsert({
        where: { id: moveId },
        create: {
          id: moveId,
          slug: m.move.name,
          nameEn: capitalize(m.move.name),
        },
        update: {},
      });

      // Pick the best version group detail
      const vd = m.version_group_details[m.version_group_details.length - 1];
      if (!vd) continue;

      const rawMethod = vd.move_learn_method.name;
      const learnMethod = LEARN_METHOD_MAP[rawMethod] ?? "LEVEL_UP";

      // Use upsert-like: delete existing then create (no unique key on pokemonId+moveId+learnMethod)
      await prisma.pokemonMove.deleteMany({
        where: { pokemonId: pokemon.id, moveId, learnMethod: learnMethod as never },
      });
      await prisma.pokemonMove.create({
        data: {
          pokemonId: pokemon.id,
          moveId,
          learnMethod: learnMethod as never,
          levelLearnedAt: vd.level_learned_at > 0 ? vd.level_learned_at : null,
          versionGroup: vd.version_group.name,
        },
      });
    }

    return true;
  } catch (e) {
    console.warn(`  ⚠ Skip #${id}: ${e}`);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Pokemon Import Script");
  console.log("========================\n");

  // Step 1: Types
  console.log("Step 1: Ensuring types...");
  await ensureTypes();

  // Step 2: Abilities
  console.log("\nStep 2: Ensuring abilities...");
  await ensureAbilities();

  // Step 3: Pokemon
  console.log("\nStep 3: Importing Pokemon (1–1025)...");
  console.log("This will take ~15-20 minutes. Do not close this window.\n");

  let success = 0;
  let failed = 0;

  for (let id = 1; id <= 1025; id++) {
    const ok = await importPokemon(id);
    if (ok) {
      success++;
    } else {
      failed++;
    }

    if (id % 50 === 0 || id === 1025) {
      const pct = Math.round((id / 1025) * 100);
      console.log(`  [${pct}%] #${id}/1025 — ✅ ${success} imported, ❌ ${failed} failed`);
    }

    // Small delay to respect PokeAPI rate limits
    await sleep(150);
  }

  console.log("\n✅ Import complete!");
  console.log(`   Success: ${success}`);
  console.log(`   Failed:  ${failed}`);

  const total = await prisma.pokemon.count();
  console.log(`   DB total: ${total} Pokemon`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
