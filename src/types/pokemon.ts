// ============================================================
// Core Pokemon Types
// ============================================================

export type PokemonTypeName =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export type MoveCategory = "physical" | "special" | "status";

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PokemonListItem {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  dexNumber: number;
  generation: number;
  types: PokemonTypeName[];
  sprites: {
    frontDefault: string | null;
    officialArtwork: string | null;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
}

export interface PokemonDetail extends PokemonListItem {
  nameJa: string | null;
  nameJaRomaji: string | null;
  species: string | null;
  speciesTh: string | null;
  color: string | null;
  shape: string | null;
  habitat: string | null;
  isMythical: boolean;
  isLegendary: boolean;
  isBaby: boolean;
  hasGenderDiff: boolean;
  genderRate: number | null;
  captureRate: number | null;
  baseHappiness: number | null;
  baseExpYield: number | null;
  growthRate: string | null;
  hatchCounter: number | null;
  heightDm: number | null;
  weightHg: number | null;
  isDefault: boolean;
  formName: string | null;
  abilities: PokemonAbilityInfo[];
  moves: PokemonMoveInfo[];
  sprites: PokemonSprites;
  cries: PokemonCries;
  eggGroups: string[];
  evolutions: EvolutionChain[];
  locations: LocationInfo[];
  forms: FormInfo[];
  flavorTexts: FlavorText[];
}

export interface PokemonAbilityInfo {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  slot: number;
  isHidden: boolean;
  shortEffect: string | null;
  shortEffectTh: string | null;
}

export interface PokemonMoveInfo {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  typeName: PokemonTypeName | null;
  category: MoveCategory | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  learnMethod: string;
  levelLearnedAt: number | null;
  versionGroup: string | null;
}

export interface PokemonSprites {
  frontDefault: string | null;
  frontShiny: string | null;
  frontFemale: string | null;
  frontShinyFemale: string | null;
  backDefault: string | null;
  backShiny: string | null;
  officialArtwork: string | null;
  officialArtworkShiny: string | null;
  homeSprite: string | null;
  homeShiny: string | null;
  showdownFront: string | null;
  showdownShiny: string | null;
  animated: string | null;
  animatedShiny: string | null;
}

export interface PokemonCries {
  latest: string | null;
  legacy: string | null;
}

export interface EvolutionChain {
  fromId: number;
  toId: number;
  toSlug: string;
  toName: string;
  toNameTh: string | null;
  toSprite: string | null;
  trigger: string;
  minLevel: number | null;
  itemName: string | null;
  condition: string | null;
}

export interface LocationInfo {
  id: number;
  nameEn: string;
  nameTh: string | null;
  regionName: string | null;
}

export type SpecialFormType =
  | "mega" | "mega-x" | "mega-y"
  | "gigantamax"
  | "alolan" | "galarian" | "hisuian" | "paldean"
  | "shiny"
  | "other";

export interface FormInfo {
  slug: string;
  formName: string;
  formNameTh: string;
  formType: SpecialFormType;
  method: string;
  artworkUrl: string | null;
  artworkShinyUrl: string | null;
  spriteUrl: string | null;
  types: PokemonTypeName[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
}

export interface FlavorText {
  text: string;
  language: string;
  version: string;
}

// ============================================================
// Type System
// ============================================================

export interface TypeInfo {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  color: string;
  generation: number | null;
  effectiveness: TypeEffectivenessMap;
}

export type TypeMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export type TypeEffectivenessMap = Record<PokemonTypeName, TypeMultiplier>;

// ============================================================
// Moves
// ============================================================

export interface MoveDetail {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  nameJa: string | null;
  typeName: PokemonTypeName | null;
  category: MoveCategory | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effectChance: number | null;
  generation: number | null;
  target: string | null;
  effect: string | null;
  effectTh: string | null;
  shortEffect: string | null;
  shortEffectTh: string | null;
  isContactMove: boolean;
  isZMove: boolean;
  isMaxMove: boolean;
}

// ============================================================
// Abilities
// ============================================================

export interface AbilityDetail {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  generation: number | null;
  effect: string | null;
  effectTh: string | null;
  shortEffect: string | null;
  shortEffectTh: string | null;
  isMainSeries: boolean;
  pokemon: Array<{
    id: number;
    nameEn: string;
    nameTh: string | null;
    sprite: string | null;
    isHidden: boolean;
    slot: number;
  }>;
}

// ============================================================
// Items
// ============================================================

export interface ItemDetail {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  category: string | null;
  cost: number | null;
  effect: string | null;
  effectTh: string | null;
  shortEffect: string | null;
  sprite: string | null;
  generation: number | null;
  flingPower: number | null;
  flingEffect: string | null;
  attributes: string[];
}

// ============================================================
// Team Builder
// ============================================================

export interface TeamPokemon {
  id: string;
  pokemonId: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  sprite: string | null;
  officialArtwork: string | null;
  slot: number;
  nickname: string | null;
  level: number;
  gender: string | null;
  shiny: boolean;
  nature: string | null;
  ability: {
    id: number;
    nameEn: string;
    nameTh: string | null;
    isHidden: boolean;
  } | null;
  heldItem: {
    id: number;
    nameEn: string;
    nameTh: string | null;
    sprite: string | null;
  } | null;
  moves: Array<{
    id: number;
    nameEn: string;
    nameTh: string | null;
    typeName: PokemonTypeName | null;
    category: MoveCategory | null;
    power: number | null;
    slot: number;
  }>;
  evs: StatSet;
  ivs: StatSet;
  types: PokemonTypeName[];
  stats: StatSet;
  teraType: PokemonTypeName | null;
}

export interface StatSet {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface TeamAnalysis {
  weaknesses: Record<PokemonTypeName, number>;
  resistances: Record<PokemonTypeName, number>;
  immunities: PokemonTypeName[];
  offensiveCoverage: PokemonTypeName[];
  missingCoverage: PokemonTypeName[];
  suggestions: TeamSuggestion[];
}

export interface TeamSuggestion {
  type: "weakness" | "coverage" | "role" | "synergy";
  message: string;
  messageTh: string;
  severity: "low" | "medium" | "high";
  suggestedPokemon?: Array<{
    id: number;
    nameEn: string;
    nameTh: string | null;
    sprite: string | null;
    reason: string;
    reasonTh: string;
  }>;
}

// ============================================================
// Battle Calculator
// ============================================================

export interface BattleCalcInput {
  attacker: {
    pokemon: PokemonListItem;
    nature: string;
    evs: StatSet;
    ivs: StatSet;
    level: number;
    ability: string | null;
    heldItem: string | null;
    move: MoveDetail;
  };
  defender: {
    pokemon: PokemonListItem;
    nature: string;
    evs: StatSet;
    ivs: StatSet;
    level: number;
    ability: string | null;
    heldItem: string | null;
  };
  weather: WeatherCondition | null;
  terrain: TerrainCondition | null;
}

export type WeatherCondition = "sun" | "rain" | "sand" | "snow" | "fog" | "harshSunlight" | "heavyRain" | "strongWinds";
export type TerrainCondition = "electric" | "grassy" | "misty" | "psychic";

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  rolls: number[];
  effectiveness: number;
  isOHKO: boolean;
  is2HKO: boolean;
  description: string;
  descriptionTh: string;
}

// ============================================================
// AI Features
// ============================================================

export interface AITeamSuggestion {
  pokemon: Array<{
    id: number;
    nameEn: string;
    nameTh: string | null;
    sprite: string | null;
    officialArtwork: string | null;
    role: string;
    roleTh: string;
    suggestedMoves: string[];
    suggestedAbility: string;
    suggestedItem: string;
    reasoning: string;
    reasoningTh: string;
  }>;
  teamStrategy: string;
  teamStrategyTh: string;
  threats: string[];
  coverageAnalysis: string;
}

// ============================================================
// Competitive
// ============================================================

export interface CompetitiveData {
  pokemonId: number;
  nameEn: string;
  nameTh: string | null;
  tier: string;
  format: string;
  generation: number;
  usagePercent: number;
  rank: number | null;
  commonMoves: Array<{
    moveEn: string;
    usagePercent: number;
  }>;
  commonAbilities: Array<{
    abilityEn: string;
    usagePercent: number;
  }>;
  commonItems: Array<{
    itemEn: string;
    usagePercent: number;
  }>;
}

// ============================================================
// Filters & Search
// ============================================================

export interface PokemonFilter {
  query?: string;
  types?: PokemonTypeName[];
  generation?: number[];
  legendary?: boolean;
  mythical?: boolean;
  baby?: boolean;
  hasGigantamax?: boolean;
  hasMega?: boolean;
  abilities?: string[];
  eggGroups?: string[];
  colors?: string[];
  minBST?: number;
  maxBST?: number;
  minStat?: Partial<StatSet>;
  maxStat?: Partial<StatSet>;
  sortBy?: "id" | "name" | "bst" | "hp" | "attack" | "defense" | "speed";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
