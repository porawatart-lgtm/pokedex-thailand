// PokéAPI v2 client with caching layer

const POKEAPI_BASE = process.env.POKEAPI_BASE_URL ?? "https://pokeapi.co/api/v2";
const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const ARTWORK_BASE = `${SPRITES_BASE}/other/official-artwork`;

// In-memory cache for server-side requests
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = parseInt(process.env.POKEAPI_CACHE_TTL ?? "3600") * 1000;

async function cachedFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`PokéAPI error: ${res.status} ${res.statusText} for ${url}`);
  }

  const data = await res.json() as T;
  cache.set(url, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}

// ============================================================
// Raw PokéAPI Response Types
// ============================================================

interface PokeAPINamedResource {
  name: string;
  url: string;
}

interface PokeAPIPaginatedList {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPINamedResource[];
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Array<{
    ability: PokeAPINamedResource;
    is_hidden: boolean;
    slot: number;
  }>;
  forms: PokeAPINamedResource[];
  game_indices: Array<{
    game_index: number;
    version: PokeAPINamedResource;
  }>;
  held_items: unknown[];
  location_area_encounters: string;
  moves: Array<{
    move: PokeAPINamedResource;
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: PokeAPINamedResource;
      version_group: PokeAPINamedResource;
    }>;
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    front_female: string | null;
    front_shiny_female: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      showdown?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
    versions?: Record<string, Record<string, {
      front_default: string | null;
      front_shiny: string | null;
      animated?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    }>>;
  };
  cries: {
    latest: string | null;
    legacy: string | null;
  };
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: PokeAPINamedResource;
  }>;
  types: Array<{
    slot: number;
    type: PokeAPINamedResource;
  }>;
  past_types: unknown[];
  species: PokeAPINamedResource;
}

interface PokeAPIPokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: PokeAPINamedResource;
  pokedex_numbers: Array<{
    entry_number: number;
    pokedex: PokeAPINamedResource;
  }>;
  egg_groups: PokeAPINamedResource[];
  color: PokeAPINamedResource;
  shape: PokeAPINamedResource;
  evolves_from_species: PokeAPINamedResource | null;
  evolution_chain: { url: string };
  habitat: PokeAPINamedResource | null;
  generation: PokeAPINamedResource;
  names: Array<{
    language: PokeAPINamedResource;
    name: string;
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: PokeAPINamedResource;
    version: PokeAPINamedResource;
  }>;
  form_descriptions: unknown[];
  genera: Array<{
    genus: string;
    language: PokeAPINamedResource;
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: PokeAPINamedResource;
  }>;
}

// ============================================================
// Public API Functions
// ============================================================

export async function fetchPokemonList(limit = 20, offset = 0) {
  const data = await cachedFetch<PokeAPIPaginatedList>(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`
  );
  return data;
}

export async function fetchPokemon(idOrSlug: string | number) {
  const data = await cachedFetch<PokeAPIPokemon>(
    `${POKEAPI_BASE}/pokemon/${idOrSlug}`
  );
  return data;
}

export async function fetchPokemonSpecies(idOrSlug: string | number) {
  const data = await cachedFetch<PokeAPIPokemonSpecies>(
    `${POKEAPI_BASE}/pokemon-species/${idOrSlug}`
  );
  return data;
}

export async function fetchEvolutionChain(url: string) {
  const data = await cachedFetch<{
    id: number;
    chain: EvolutionChainNode;
  }>(url);
  return data;
}

interface EvolutionChainNode {
  is_baby: boolean;
  species: PokeAPINamedResource;
  evolution_details: Array<{
    min_level: number | null;
    trigger: PokeAPINamedResource;
    item: PokeAPINamedResource | null;
    held_item: PokeAPINamedResource | null;
    known_move: PokeAPINamedResource | null;
    known_move_type: PokeAPINamedResource | null;
    location: PokeAPINamedResource | null;
    min_happiness: number | null;
    min_beauty: number | null;
    min_affection: number | null;
    needs_overworld_rain: boolean;
    party_species: PokeAPINamedResource | null;
    party_type: PokeAPINamedResource | null;
    relative_physical_stats: number | null;
    time_of_day: string;
    trade_species: PokeAPINamedResource | null;
    turn_upside_down: boolean;
    gender: number | null;
  }>;
  evolves_to: EvolutionChainNode[];
}

export function flattenEvolutionChain(
  node: EvolutionChainNode,
  fromId?: number,
  result: Array<{
    fromId: number;
    toSlug: string;
    details: EvolutionChainNode["evolution_details"][0] | null;
  }> = []
) {
  const speciesId = parseInt(node.species.url.split("/").filter(Boolean).pop() ?? "0");

  if (fromId !== undefined && node.evolution_details.length > 0) {
    result.push({
      fromId,
      toSlug: node.species.name,
      details: node.evolution_details[0] ?? null,
    });
  } else if (fromId !== undefined) {
    result.push({
      fromId,
      toSlug: node.species.name,
      details: null,
    });
  }

  for (const next of node.evolves_to) {
    flattenEvolutionChain(next, speciesId, result);
  }

  return result;
}

export async function fetchMove(idOrSlug: string | number) {
  const data = await cachedFetch<{
    id: number;
    name: string;
    accuracy: number | null;
    effect_chance: number | null;
    pp: number;
    priority: number;
    power: number | null;
    contest_combos: unknown | null;
    contest_type: PokeAPINamedResource | null;
    contest_effect: { url: string } | null;
    damage_class: PokeAPINamedResource;
    effect_entries: Array<{
      effect: string;
      short_effect: string;
      language: PokeAPINamedResource;
    }>;
    effect_changes: unknown[];
    generation: PokeAPINamedResource;
    meta: {
      ailment: PokeAPINamedResource;
      category: PokeAPINamedResource;
      min_hits: number | null;
      max_hits: number | null;
      min_turns: number | null;
      max_turns: number | null;
      drain: number;
      healing: number;
      crit_rate: number;
      ailment_chance: number;
      flinch_chance: number;
      stat_chance: number;
    } | null;
    names: Array<{
      language: PokeAPINamedResource;
      name: string;
    }>;
    past_values: unknown[];
    stat_changes: unknown[];
    super_contest_effect: { url: string } | null;
    target: PokeAPINamedResource;
    type: PokeAPINamedResource;
    learned_by_pokemon: PokeAPINamedResource[];
    machines: unknown[];
    flavor_text_entries: unknown[];
  }>(`${POKEAPI_BASE}/move/${idOrSlug}`);
  return data;
}

export async function fetchAbility(idOrSlug: string | number) {
  const data = await cachedFetch<{
    id: number;
    name: string;
    is_main_series: boolean;
    generation: PokeAPINamedResource;
    names: Array<{
      language: PokeAPINamedResource;
      name: string;
    }>;
    effect_entries: Array<{
      effect: string;
      short_effect: string;
      language: PokeAPINamedResource;
    }>;
    effect_changes: unknown[];
    flavor_text_entries: unknown[];
    pokemon: Array<{
      is_hidden: boolean;
      slot: number;
      pokemon: PokeAPINamedResource;
    }>;
  }>(`${POKEAPI_BASE}/ability/${idOrSlug}`);
  return data;
}

export async function fetchItem(idOrSlug: string | number) {
  const data = await cachedFetch<{
    id: number;
    name: string;
    cost: number;
    fling_power: number | null;
    fling_effect: PokeAPINamedResource | null;
    attributes: PokeAPINamedResource[];
    category: PokeAPINamedResource;
    effect_entries: Array<{
      effect: string;
      short_effect: string;
      language: PokeAPINamedResource;
    }>;
    flavor_text_entries: unknown[];
    game_indices: unknown[];
    names: Array<{
      language: PokeAPINamedResource;
      name: string;
    }>;
    sprites: {
      default: string | null;
    };
    held_by_pokemon: unknown[];
    baby_trigger_for: unknown | null;
    machines: unknown[];
  }>(`${POKEAPI_BASE}/item/${idOrSlug}`);
  return data;
}

export async function fetchType(idOrSlug: string | number) {
  const data = await cachedFetch<{
    id: number;
    name: string;
    damage_relations: {
      no_damage_to: PokeAPINamedResource[];
      half_damage_to: PokeAPINamedResource[];
      double_damage_to: PokeAPINamedResource[];
      no_damage_from: PokeAPINamedResource[];
      half_damage_from: PokeAPINamedResource[];
      double_damage_from: PokeAPINamedResource[];
    };
    past_damage_relations: unknown[];
    game_indices: unknown[];
    generation: PokeAPINamedResource;
    move_damage_class: PokeAPINamedResource | null;
    names: Array<{
      language: PokeAPINamedResource;
      name: string;
    }>;
    pokemon: Array<{
      slot: number;
      pokemon: PokeAPINamedResource;
    }>;
    moves: PokeAPINamedResource[];
  }>(`${POKEAPI_BASE}/type/${idOrSlug}`);
  return data;
}

// Sprite URL builders
export function getSpriteUrl(id: number): string {
  return `${SPRITES_BASE}/${id}.png`;
}

export function getShinyUrl(id: number): string {
  return `${SPRITES_BASE}/shiny/${id}.png`;
}

export function getArtworkUrl(id: number): string {
  return `${ARTWORK_BASE}/${id}.png`;
}

export function getShinyArtworkUrl(id: number): string {
  return `${ARTWORK_BASE}/shiny/${id}.png`;
}

export function getShowdownSprite(slug: string): string {
  return `https://play.pokemonshowdown.com/sprites/xyani/${slug}.gif`;
}

export function getShowdownShiny(slug: string): string {
  return `https://play.pokemonshowdown.com/sprites/xyani-shiny/${slug}.gif`;
}

// Parse PokéAPI generation number from URL
export function parseGenerationFromUrl(url: string): number {
  const name = url.split("/").filter(Boolean).pop() ?? "";
  const genMap: Record<string, number> = {
    "generation-i": 1, "generation-ii": 2, "generation-iii": 3,
    "generation-iv": 4, "generation-v": 5, "generation-vi": 6,
    "generation-vii": 7, "generation-viii": 8, "generation-ix": 9,
  };
  return genMap[name] ?? 1;
}

export function parseIdFromUrl(url: string): number {
  return parseInt(url.split("/").filter(Boolean).pop() ?? "0");
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
