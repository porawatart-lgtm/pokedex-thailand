import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PokemonTypeName } from "@/types/pokemon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDexNumber(num: number): string {
  return `#${String(num).padStart(4, "0")}`;
}

export function formatHeight(heightDm: number | null): string {
  if (!heightDm) return "—";
  const meters = heightDm / 10;
  const feet = Math.floor(meters * 3.28084);
  const inches = Math.round((meters * 3.28084 - feet) * 12);
  return `${meters.toFixed(1)} m (${feet}'${inches}")`;
}

export function formatWeight(weightHg: number | null): string {
  if (!weightHg) return "—";
  const kg = weightHg / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  return `${kg.toFixed(1)} kg (${lbs} lbs)`;
}

export function formatGenderRatio(genderRate: number | null): string {
  if (genderRate === null || genderRate === -1) return "Genderless";
  if (genderRate === 0) return "100% Male";
  if (genderRate === 8) return "100% Female";
  const femaleRatio = (genderRate / 8) * 100;
  const maleRatio = 100 - femaleRatio;
  return `${maleRatio}% Male / ${femaleRatio}% Female`;
}

export function formatCatchRate(rate: number | null): string {
  if (!rate) return "—";
  const percent = ((rate / 255) * 100).toFixed(1);
  return `${rate} (${percent}% at full HP with Pokéball)`;
}

export function formatStatName(stat: string): string {
  const names: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    specialAttack: "Sp. Atk",
    specialDefense: "Sp. Def",
    speed: "Speed",
  };
  return names[stat] ?? stat;
}

export function formatStatNameTh(stat: string): string {
  const names: Record<string, string> = {
    hp: "HP",
    attack: "โจมตี",
    defense: "ป้องกัน",
    specialAttack: "โจมตีพิเศษ",
    specialDefense: "ป้องกันพิเศษ",
    speed: "ความเร็ว",
  };
  return names[stat] ?? stat;
}

export function getStatColor(value: number): string {
  if (value >= 150) return "text-purple-400";
  if (value >= 120) return "text-blue-400";
  if (value >= 90) return "text-green-400";
  if (value >= 60) return "text-yellow-400";
  if (value >= 30) return "text-orange-400";
  return "text-red-400";
}

export function getStatBarColor(value: number): string {
  if (value >= 150) return "bg-purple-500";
  if (value >= 120) return "bg-blue-500";
  if (value >= 90) return "bg-green-500";
  if (value >= 60) return "bg-yellow-500";
  if (value >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function getTypeColor(type: PokemonTypeName | string): string {
  const colors: Record<string, string> = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
  };
  return colors[type] ?? "#888888";
}

export function getGenerationName(gen: number): string {
  const names: Record<number, string> = {
    1: "Generation I (Kanto)",
    2: "Generation II (Johto)",
    3: "Generation III (Hoenn)",
    4: "Generation IV (Sinnoh)",
    5: "Generation V (Unova)",
    6: "Generation VI (Kalos)",
    7: "Generation VII (Alola)",
    8: "Generation VIII (Galar)",
    9: "Generation IX (Paldea)",
  };
  return names[gen] ?? `Generation ${gen}`;
}

export function getGenerationNameTh(gen: number): string {
  const names: Record<number, string> = {
    1: "เจนเนอเรชั่น I (คันโต)",
    2: "เจนเนอเรชั่น II (โจโต)",
    3: "เจนเนอเรชั่น III (โฮเอ็น)",
    4: "เจนเนอเรชั่น IV (ชินโนห์)",
    5: "เจนเนอเรชั่น V (ยูโนวา)",
    6: "เจนเนอเรชั่น VI (คาโลส)",
    7: "เจนเนอเรชั่น VII (อาโลลา)",
    8: "เจนเนอเรชั่น VIII (กาลาร์)",
    9: "เจนเนอเรชั่น IX (ปัลเดีย)",
  };
  return names[gen] ?? `เจนเนอเรชั่น ${gen}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: NodeJS.Timeout;
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  } as T;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatMoveName(name: string): string {
  return name.split("-").map(capitalize).join(" ");
}

export function getEffectivenessLabel(multiplier: number): {
  label: string;
  labelTh: string;
  color: string;
} {
  if (multiplier === 0) return { label: "Immune", labelTh: "ภูมิคุ้มกัน", color: "text-gray-400" };
  if (multiplier === 0.25) return { label: "¼×", labelTh: "¼×", color: "text-blue-400" };
  if (multiplier === 0.5) return { label: "½×", labelTh: "½×", color: "text-blue-300" };
  if (multiplier === 1) return { label: "1×", labelTh: "1×", color: "text-gray-300" };
  if (multiplier === 2) return { label: "2×", labelTh: "2×", color: "text-orange-400" };
  if (multiplier === 4) return { label: "4×", labelTh: "4×", color: "text-red-400" };
  return { label: `${multiplier}×`, labelTh: `${multiplier}×`, color: "text-gray-300" };
}
