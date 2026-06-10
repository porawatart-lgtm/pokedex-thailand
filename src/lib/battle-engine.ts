import { getTypeEffectiveness } from "./type-chart";
import type {
  BattleCalcInput,
  DamageResult,
  StatSet,
  PokemonTypeName,
  WeatherCondition,
  TerrainCondition,
} from "@/types/pokemon";

const NATURES: Record<string, { increased: keyof StatSet | null; decreased: keyof StatSet | null }> = {
  hardy: { increased: null, decreased: null },
  lonely: { increased: "attack", decreased: "defense" },
  brave: { increased: "attack", decreased: "speed" },
  adamant: { increased: "attack", decreased: "specialAttack" },
  naughty: { increased: "attack", decreased: "specialDefense" },
  bold: { increased: "defense", decreased: "attack" },
  docile: { increased: null, decreased: null },
  relaxed: { increased: "defense", decreased: "speed" },
  impish: { increased: "defense", decreased: "specialAttack" },
  lax: { increased: "defense", decreased: "specialDefense" },
  timid: { increased: "speed", decreased: "attack" },
  hasty: { increased: "speed", decreased: "defense" },
  serious: { increased: null, decreased: null },
  jolly: { increased: "speed", decreased: "specialAttack" },
  naive: { increased: "speed", decreased: "specialDefense" },
  modest: { increased: "specialAttack", decreased: "attack" },
  mild: { increased: "specialAttack", decreased: "defense" },
  quiet: { increased: "specialAttack", decreased: "speed" },
  bashful: { increased: null, decreased: null },
  rash: { increased: "specialAttack", decreased: "specialDefense" },
  calm: { increased: "specialDefense", decreased: "attack" },
  gentle: { increased: "specialDefense", decreased: "defense" },
  sassy: { increased: "specialDefense", decreased: "speed" },
  careful: { increased: "specialDefense", decreased: "specialAttack" },
  quirky: { increased: null, decreased: null },
};

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: string,
  statName: keyof StatSet
): number {
  let stat: number;

  if (statName === "hp") {
    stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100 + level + 10);
  } else {
    const natureData = NATURES[nature.toLowerCase()] ?? { increased: null, decreased: null };
    let natureMultiplier = 1.0;
    if (natureData.increased === statName) natureMultiplier = 1.1;
    if (natureData.decreased === statName) natureMultiplier = 0.9;

    stat = Math.floor(
      (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100 + 5) * natureMultiplier)
    );
  }

  return stat;
}

export function calculateAllStats(
  baseStats: StatSet,
  evs: StatSet,
  ivs: StatSet,
  level: number,
  nature: string
): StatSet {
  return {
    hp: calculateStat(baseStats.hp, ivs.hp, evs.hp, level, nature, "hp"),
    attack: calculateStat(baseStats.attack, ivs.attack, evs.attack, level, nature, "attack"),
    defense: calculateStat(baseStats.defense, ivs.defense, evs.defense, level, nature, "defense"),
    specialAttack: calculateStat(baseStats.specialAttack, ivs.specialAttack, evs.specialAttack, level, nature, "specialAttack"),
    specialDefense: calculateStat(baseStats.specialDefense, ivs.specialDefense, evs.specialDefense, level, nature, "specialDefense"),
    speed: calculateStat(baseStats.speed, ivs.speed, evs.speed, level, nature, "speed"),
  };
}

function getWeatherMultiplier(
  moveType: PokemonTypeName,
  weather: WeatherCondition | null
): number {
  if (!weather) return 1;
  if ((weather === "sun" || weather === "harshSunlight") && moveType === "fire") return 1.5;
  if ((weather === "sun" || weather === "harshSunlight") && moveType === "water") return 0.5;
  if ((weather === "rain" || weather === "heavyRain") && moveType === "water") return 1.5;
  if ((weather === "rain" || weather === "heavyRain") && moveType === "fire") return 0.5;
  return 1;
}

function getTerrainMultiplier(
  moveType: PokemonTypeName,
  terrain: TerrainCondition | null,
  isGrounded: boolean
): number {
  if (!terrain || !isGrounded) return 1;
  if (terrain === "electric" && moveType === "electric") return 1.3;
  if (terrain === "grassy" && moveType === "grass") return 1.3;
  if (terrain === "psychic" && moveType === "psychic") return 1.3;
  return 1;
}

export function calculateDamage(input: BattleCalcInput): DamageResult {
  const { attacker, defender, weather, terrain } = input;

  const atkStats = calculateAllStats(
    attacker.pokemon.stats,
    attacker.evs,
    attacker.ivs,
    attacker.level,
    attacker.nature
  );

  const defStats = calculateAllStats(
    defender.pokemon.stats,
    defender.evs,
    defender.ivs,
    defender.level,
    defender.nature
  );

  const isSpecial = attacker.move.category === "special";
  const atkStat = isSpecial ? atkStats.specialAttack : atkStats.attack;
  const defStat = isSpecial ? defStats.specialDefense : defStats.defense;
  const defHp = defStats.hp;

  const power = attacker.move.power ?? 0;
  if (power === 0) {
    return {
      minDamage: 0, maxDamage: 0, minPercent: 0, maxPercent: 0,
      rolls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      effectiveness: 1, isOHKO: false, is2HKO: false,
      description: "Status move — no damage",
      descriptionTh: "ท่าสถานะ — ไม่มีดาเมจ",
    };
  }

  const moveType = (attacker.move.typeName ?? "normal") as PokemonTypeName;
  const attackerTypes = attacker.pokemon.types as PokemonTypeName[];
  const defenderTypes = defender.pokemon.types as PokemonTypeName[];

  // STAB (Same Type Attack Bonus)
  const stab = attackerTypes.includes(moveType) ? 1.5 : 1;

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(moveType, defenderTypes);

  // Weather
  const weatherMult = getWeatherMultiplier(moveType, weather);

  // Terrain
  const terrainMult = getTerrainMultiplier(moveType, terrain, true);

  // Base damage formula
  const baseDamage = Math.floor(
    (Math.floor(((2 * attacker.level) / 5 + 2) * power * (atkStat / defStat)) / 50 + 2) *
      stab *
      effectiveness *
      weatherMult *
      terrainMult
  );

  // Random roll (85-100%)
  const rolls: number[] = [];
  for (let i = 0; i <= 15; i++) {
    rolls.push(Math.floor((baseDamage * (85 + i)) / 100));
  }

  const minDmg = rolls[0]!;
  const maxDmg = rolls[15]!;
  const minPct = (minDmg / defHp) * 100;
  const maxPct = (maxDmg / defHp) * 100;

  const isOHKO = minPct >= 100;
  const is2HKO = minPct * 2 >= 100 && !isOHKO;

  let description: string;
  let descriptionTh: string;

  if (effectiveness === 0) {
    description = "No effect!";
    descriptionTh = "ไม่ได้ผล!";
  } else if (effectiveness >= 4) {
    description = "Super effective x4!";
    descriptionTh = "ได้ผลดีมาก x4!";
  } else if (effectiveness >= 2) {
    description = "Super effective!";
    descriptionTh = "ได้ผลดีมาก!";
  } else if (effectiveness <= 0.25) {
    description = "Not very effective x0.25";
    descriptionTh = "ได้ผลน้อยมาก x0.25";
  } else if (effectiveness < 1) {
    description = "Not very effective";
    descriptionTh = "ได้ผลน้อย";
  } else {
    description = "Normal effectiveness";
    descriptionTh = "ประสิทธิภาพปกติ";
  }

  if (isOHKO) {
    description += " — OHKO guaranteed!";
    descriptionTh += " — น็อคเอาท์รอบเดียว!";
  } else if (is2HKO) {
    description += " — 2HKO";
    descriptionTh += " — ต้องใช้ 2 ครั้ง";
  }

  return {
    minDamage: minDmg,
    maxDamage: maxDmg,
    minPercent: Math.round(minPct * 10) / 10,
    maxPercent: Math.round(maxPct * 10) / 10,
    rolls,
    effectiveness,
    isOHKO,
    is2HKO,
    description: `${description} (${Math.round(minPct * 10) / 10}% - ${Math.round(maxPct * 10) / 10}%)`,
    descriptionTh: `${descriptionTh} (${Math.round(minPct * 10) / 10}% - ${Math.round(maxPct * 10) / 10}%)`,
  };
}

export { NATURES };
