import { NextRequest, NextResponse } from "next/server";
import {
  fetchPokemon,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  flattenEvolutionChain,
  getArtworkUrl,
  parseGenerationFromUrl,
} from "@/lib/pokeapi";
import type { PokemonDetail, FormInfo, PokemonTypeName, SpecialFormType } from "@/types/pokemon";

export const runtime = "nodejs";
export const revalidate = 3600;

// ─── Form helpers ───────────────────────────────────────────────────────────

function classifyForm(slug: string): SpecialFormType {
  if (slug.endsWith("-mega-x")) return "mega-x";
  if (slug.endsWith("-mega-y")) return "mega-y";
  if (slug.includes("-mega")) return "mega";
  if (slug.includes("-gmax")) return "gigantamax";
  if (slug.includes("-alola")) return "alolan";
  if (slug.includes("-galar")) return "galarian";
  if (slug.includes("-hisui")) return "hisuian";
  if (slug.includes("-paldea")) return "paldean";
  return "other";
}

const FORM_TYPE_LABEL: Record<SpecialFormType, string> = {
  "mega":       "Mega",
  "mega-x":     "Mega X",
  "mega-y":     "Mega Y",
  "gigantamax": "Gigantamax",
  "alolan":     "Alolan",
  "galarian":   "Galarian",
  "hisuian":    "Hisuian",
  "paldean":    "Paldean",
  "shiny":      "Shiny",
  "other":      "",
};

const FORM_TYPE_TH: Record<SpecialFormType, string> = {
  "mega":       "เมก้า",
  "mega-x":     "เมก้า X",
  "mega-y":     "เมก้า Y",
  "gigantamax": "กิกะแมกซ์",
  "alolan":     "อาโลล่า",
  "galarian":   "กาล่า",
  "hisuian":    "ชิซุย",
  "paldean":    "ปัลเดียน",
  "shiny":      "ชายนี่",
  "other":      "ร่างอื่น",
};

const FORM_METHOD_TH: Record<SpecialFormType, string> = {
  "mega":       "ใช้ Mega Stone ในสนามรบ",
  "mega-x":     "ใช้ Mega Stone X ในสนามรบ",
  "mega-y":     "ใช้ Mega Stone Y ในสนามรบ",
  "gigantamax": "Dynamax ในสนามรบที่รองรับ",
  "alolan":     "ร่างประจำภูมิภาค Alola",
  "galarian":   "ร่างประจำภูมิภาค Galar",
  "hisuian":    "ร่างประจำภูมิภาค Hisui",
  "paldean":    "ร่างประจำภูมิภาค Paldea",
  "shiny":      "โปเกมอนหายาก",
  "other":      "ร่างพิเศษ",
};

function buildFormName(baseName: string, formType: SpecialFormType, slug: string): string {
  const label = FORM_TYPE_LABEL[formType];
  if (formType === "mega-x") return `Mega ${baseName} X`;
  if (formType === "mega-y") return `Mega ${baseName} Y`;
  if (formType === "other") {
    // e.g. "deoxys-attack" → "Deoxys Attack"
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return `${label} ${baseName}`;
}

async function fetchForms(
  baseName: string,
  varieties: Array<{ is_default: boolean; pokemon: { name: string; url: string } }>
): Promise<FormInfo[]> {
  const nonDefault = varieties.filter((v) => !v.is_default);
  if (nonDefault.length === 0) return [];

  const results: FormInfo[] = [];

  for (const v of nonDefault) {
    try {
      const fd = await fetchPokemon(v.pokemon.name);
      const formType = classifyForm(fd.name);
      const stats = {
        hp:            fd.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
        attack:        fd.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0,
        defense:       fd.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0,
        specialAttack: fd.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0,
        specialDefense:fd.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0,
        speed:         fd.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0,
        total:         0,
      };
      stats.total =
        stats.hp + stats.attack + stats.defense +
        stats.specialAttack + stats.specialDefense + stats.speed;

      const formNameEn = buildFormName(baseName, formType, fd.name);
      const formNameTh = `${FORM_TYPE_TH[formType]}${formType !== "other" ? ` ${baseName}` : ""}`;

      results.push({
        slug: fd.name,
        formName: formNameEn,
        formNameTh,
        formType,
        method: FORM_METHOD_TH[formType],
        artworkUrl:
          fd.sprites.other?.["official-artwork"]?.front_default ??
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fd.id}.png`,
        artworkShinyUrl: fd.sprites.other?.["official-artwork"]?.front_shiny ?? null,
        spriteUrl: fd.sprites.front_default ?? null,
        types: fd.types.map((t) => t.type.name) as PokemonTypeName[],
        stats,
      });
    } catch {
      // Skip unavailable forms silently
    }
  }

  return results;
}

// ─── Main route ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [pokemon, species] = await Promise.all([
      fetchPokemon(id),
      fetchPokemonSpecies(id),
    ]);

    const [evChainData, forms] = await Promise.all([
      fetchEvolutionChain(species.evolution_chain.url),
      fetchForms(
        pokemon.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        species.varieties
      ),
    ]);

    const evolutions = flattenEvolutionChain(evChainData.chain);

    const thName = species.names.find((n) => n.language.name === "th")?.name ?? null;
    const jaName = species.names.find((n) => n.language.name === "ja")?.name ?? null;
    const jaRomaji = species.names.find((n) => n.language.name === "ja-Hrkt")?.name ?? null;

    const enGenus = species.genera.find((g) => g.language.name === "en")?.genus ?? null;
    const thGenus = species.genera.find((g) => g.language.name === "th")?.genus ?? null;

    const stats = {
      hp:            pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
      attack:        pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0,
      defense:       pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0,
      specialAttack: pokemon.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0,
      specialDefense:pokemon.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0,
      speed:         pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0,
      total: 0,
    };
    stats.total = stats.hp + stats.attack + stats.defense + stats.specialAttack + stats.specialDefense + stats.speed;

    const flavorTexts = species.flavor_text_entries
      .filter((ft) => ft.language.name === "en" || ft.language.name === "th")
      .slice(0, 20)
      .map((ft) => ({
        text: ft.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "),
        language: ft.language.name,
        version: ft.version.name,
      }));

    const baseName = pokemon.name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const detail: PokemonDetail = {
      id: pokemon.id,
      slug: pokemon.name,
      nameEn: baseName,
      nameTh: thName,
      nameJa: jaName,
      nameJaRomaji: jaRomaji,
      dexNumber: pokemon.id,
      generation: parseGenerationFromUrl(species.generation.url),
      species: enGenus,
      speciesTh: thGenus,
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
      formName: null,
      types: pokemon.types.map((t) => t.type.name) as PokemonDetail["types"],
      stats,
      abilities: pokemon.abilities.map((a) => ({
        id: parseInt(a.ability.url.split("/").filter(Boolean).pop() ?? "0"),
        slug: a.ability.name,
        nameEn: a.ability.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        nameTh: null,
        slot: a.slot,
        isHidden: a.is_hidden,
        shortEffect: null,
        shortEffectTh: null,
      })),
      moves: pokemon.moves.slice(0, 50).map((m) => {
        const vd = m.version_group_details[0];
        return {
          id: parseInt(m.move.url.split("/").filter(Boolean).pop() ?? "0"),
          slug: m.move.name,
          nameEn: m.move.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          nameTh: null,
          typeName: null,
          category: null,
          power: null,
          accuracy: null,
          pp: null,
          learnMethod: vd?.move_learn_method.name ?? "level-up",
          levelLearnedAt: vd?.level_learned_at ?? null,
          versionGroup: vd?.version_group.name ?? null,
        };
      }),
      sprites: {
        frontDefault: pokemon.sprites.front_default,
        frontShiny: pokemon.sprites.front_shiny,
        frontFemale: pokemon.sprites.front_female,
        frontShinyFemale: pokemon.sprites.front_shiny_female,
        backDefault: pokemon.sprites.back_default,
        backShiny: pokemon.sprites.back_shiny,
        officialArtwork:
          pokemon.sprites.other?.["official-artwork"]?.front_default ??
          getArtworkUrl(pokemon.id),
        officialArtworkShiny:
          pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? null,
        homeSprite: pokemon.sprites.other?.home?.front_default ?? null,
        homeShiny: pokemon.sprites.other?.home?.front_shiny ?? null,
        showdownFront: pokemon.sprites.other?.showdown?.front_default ?? null,
        showdownShiny: pokemon.sprites.other?.showdown?.front_shiny ?? null,
        animated:
          pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
            ?.front_default ?? null,
        animatedShiny:
          pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
            ?.front_shiny ?? null,
      },
      cries: {
        latest: pokemon.cries.latest,
        legacy: pokemon.cries.legacy,
      },
      eggGroups: species.egg_groups.map((eg) => eg.name),
      evolutions: evolutions.map((ev) => ({
        fromId: ev.fromId,
        fromSlug: ev.fromSlug,
        fromName: ev.fromSlug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        toId: ev.toId,
        toSlug: ev.toSlug,
        toName: ev.toSlug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        toNameTh: null,
        toSprite: null,
        trigger: ev.details?.trigger.name ?? "level-up",
        minLevel: ev.details?.min_level ?? null,
        itemName: ev.details?.item?.name ?? ev.details?.held_item?.name ?? null,
        heldItemName: ev.details?.held_item?.name ?? null,
        knownMove: ev.details?.known_move?.name ?? null,
        minHappiness: ev.details?.min_happiness ?? null,
        location: ev.details?.location?.name ?? null,
        condition: ev.details?.time_of_day || null,
      })),
      locations: [],
      forms,
      flavorTexts,
    };

    return NextResponse.json({ data: detail });
  } catch (error) {
    console.error(`Pokemon ${id} error:`, error);
    return NextResponse.json(
      { error: `Pokemon ${id} not found`, details: error instanceof Error ? error.message : "Unknown error" },
      { status: 404 }
    );
  }
}
