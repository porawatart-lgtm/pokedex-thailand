// Pokémon GO Battle League meta — PvPoke & Go Battle Log data (2024-2025)

export interface GOPokemon {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string;
  rank: number;
  score: number; // PvPoke rating 0-100
  fastMove: string;
  chargedMoves: [string, string];
  role: string;
  roleTh: string;
  type1: string;
  type2?: string;
}

export interface GOLeagueMeta {
  id: "great" | "ultra" | "master";
  league: string;
  leagueTh: string;
  cpLimit: string;
  color: string;
  icon: string;
  topPokemon: GOPokemon[];
}

export const GO_LEAGUES: GOLeagueMeta[] = [
  {
    id: "great",
    league: "Great League",
    leagueTh: "เกรต ลีก",
    cpLimit: "≤ 1,500 CP",
    color: "#27ae60",
    icon: "🟢",
    topPokemon: [
      { id: 308, slug: "medicham", nameEn: "Medicham", nameTh: "เมดิแชม", rank: 1, score: 94, fastMove: "Counter", chargedMoves: ["Ice Punch", "Psychic"], role: "Attacker", roleTh: "ตัวโจมตีหลัก", type1: "fighting", type2: "psychic" },
      { id: 184, slug: "azumarill", nameEn: "Azumarill", nameTh: "อาซูมาริล", rank: 2, score: 92, fastMove: "Bubble", chargedMoves: ["Ice Beam", "Play Rough"], role: "Flexible", roleTh: "อเนกประสงค์", type1: "water", type2: "fairy" },
      { id: 260, slug: "swampert", nameEn: "Swampert", nameTh: "สวอมเพิร์ต", rank: 3, score: 91, fastMove: "Mud Shot", chargedMoves: ["Hydro Cannon", "Earthquake"], role: "Lead", roleTh: "ตัวนำ", type1: "water", type2: "ground" },
      { id: 411, slug: "bastiodon", nameEn: "Bastiodon", nameTh: "แบสทิโอดอน", rank: 4, score: 90, fastMove: "Smack Down", chargedMoves: ["Stone Edge", "Flamethrower"], role: "Tank", roleTh: "แทงค์/ดูด Shield", type1: "rock", type2: "steel" },
      { id: 365, slug: "walrein", nameEn: "Walrein", nameTh: "วอล์เรน", rank: 5, score: 88, fastMove: "Powder Snow", chargedMoves: ["Icicle Spear", "Earthquake"], role: "Closer", roleTh: "ปิดเกม", type1: "ice", type2: "water" },
      { id: 709, slug: "trevenant", nameEn: "Trevenant", nameTh: "เทรวีนันท์", rank: 6, score: 87, fastMove: "Shadow Claw", chargedMoves: ["Shadow Ball", "Seed Bomb"], role: "Lead", roleTh: "ตัวนำ", type1: "ghost", type2: "grass" },
      { id: 227, slug: "skarmory", nameEn: "Skarmory", nameTh: "สการ์มอรี", rank: 7, score: 85, fastMove: "Air Slash", chargedMoves: ["Brave Bird", "Sky Attack"], role: "Safe Switch", roleTh: "สลับปลอดภัย", type1: "steel", type2: "flying" },
      { id: 618, slug: "stunfisk-galar", nameEn: "Galarian Stunfisk", nameTh: "สตันฟิสก์ กาล่า", rank: 8, score: 84, fastMove: "Mud Shot", chargedMoves: ["Rock Slide", "Earthquake"], role: "Lead", roleTh: "ตัวนำ", type1: "ground", type2: "steel" },
      { id: 31, slug: "nidoqueen", nameEn: "Nidoqueen", nameTh: "ไนโดควีน", rank: 9, score: 83, fastMove: "Poison Jab", chargedMoves: ["Poison Fang", "Earth Power"], role: "Closer", roleTh: "ปิดเกม", type1: "poison", type2: "ground" },
      { id: 357, slug: "tropius", nameEn: "Tropius", nameTh: "โทรปิอุส", rank: 10, score: 82, fastMove: "Razor Leaf", chargedMoves: ["Leaf Blade", "Aerial Ace"], role: "Closer", roleTh: "ปิดเกม/ดูด Shield", type1: "grass", type2: "flying" },
    ],
  },
  {
    id: "ultra",
    league: "Ultra League",
    leagueTh: "อัลตร้า ลีก",
    cpLimit: "≤ 2,500 CP",
    color: "#2471a3",
    icon: "🔵",
    topPokemon: [
      { id: 487, slug: "giratina-altered", nameEn: "Giratina (Altered)", nameTh: "กิราตินา (Altered)", rank: 1, score: 96, fastMove: "Shadow Claw", chargedMoves: ["Shadow Ball", "Dragon Claw"], role: "Attacker", roleTh: "ตัวโจมตีหลัก", type1: "ghost", type2: "dragon" },
      { id: 365, slug: "walrein", nameEn: "Walrein", nameTh: "วอล์เรน", rank: 2, score: 91, fastMove: "Powder Snow", chargedMoves: ["Icicle Spear", "Earthquake"], role: "Closer", roleTh: "ปิดเกม", type1: "ice", type2: "water" },
      { id: 379, slug: "registeel", nameEn: "Registeel", nameTh: "เรจิสตีล", rank: 3, score: 90, fastMove: "Lock-On", chargedMoves: ["Focus Blast", "Flash Cannon"], role: "Tank", roleTh: "แทงค์", type1: "steel" },
      { id: 488, slug: "cresselia", nameEn: "Cresselia", nameTh: "เครสเซลียา", rank: 4, score: 89, fastMove: "Psycho Cut", chargedMoves: ["Grass Knot", "Moonblast"], role: "Flexible", roleTh: "อเนกประสงค์", type1: "psychic" },
      { id: 862, slug: "obstagoon", nameEn: "Obstagoon", nameTh: "อ็อบสตาคูน", rank: 5, score: 87, fastMove: "Counter", chargedMoves: ["Hyper Beam", "Night Slash"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "dark", type2: "normal" },
      { id: 663, slug: "talonflame", nameEn: "Talonflame", nameTh: "ทาลอนเฟลม", rank: 6, score: 86, fastMove: "Incinerate", chargedMoves: ["Brave Bird", "Flame Charge"], role: "Closer", roleTh: "ปิดเกม", type1: "fire", type2: "flying" },
      { id: 788, slug: "tapu-fini", nameEn: "Tapu Fini", nameTh: "ทาปู ฟินี", rank: 7, score: 85, fastMove: "Water Gun", chargedMoves: ["Surf", "Moonblast"], role: "Safe Switch", roleTh: "สลับปลอดภัย", type1: "water", type2: "fairy" },
      { id: 593, slug: "jellicent", nameEn: "Jellicent", nameTh: "เจลลิเซนต์", rank: 8, score: 83, fastMove: "Hex", chargedMoves: ["Bubble Beam", "Shadow Ball"], role: "Flexible", roleTh: "อเนกประสงค์", type1: "water", type2: "ghost" },
      { id: 794, slug: "buzzwole", nameEn: "Buzzwole", nameTh: "บัซโวล", rank: 9, score: 82, fastMove: "Counter", chargedMoves: ["Superpower", "Lunge"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "bug", type2: "fighting" },
      { id: 638, slug: "cobalion", nameEn: "Cobalion", nameTh: "โคเบลิออน", rank: 10, score: 81, fastMove: "Metal Claw", chargedMoves: ["Sacred Sword", "Stone Edge"], role: "Lead", roleTh: "ตัวนำ", type1: "steel", type2: "fighting" },
    ],
  },
  {
    id: "master",
    league: "Master League",
    leagueTh: "มาสเตอร์ ลีก",
    cpLimit: "ไม่จำกัด CP",
    color: "#8e44ad",
    icon: "🟣",
    topPokemon: [
      { id: 888, slug: "zacian-crowned", nameEn: "Zacian (Crowned)", nameTh: "ซาเซียน (Crowned)", rank: 1, score: 98, fastMove: "Snarl", chargedMoves: ["Play Rough", "Wild Charge"], role: "Attacker", roleTh: "ตัวโจมตีหลัก", type1: "fairy", type2: "steel" },
      { id: 382, slug: "kyogre", nameEn: "Kyogre", nameTh: "ไคโอกรี", rank: 2, score: 95, fastMove: "Waterfall", chargedMoves: ["Surf", "Blizzard"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "water" },
      { id: 383, slug: "groudon", nameEn: "Groudon", nameTh: "กราวดอน", rank: 3, score: 94, fastMove: "Mud Shot", chargedMoves: ["Fire Punch", "Earthquake"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "ground" },
      { id: 150, slug: "mewtwo", nameEn: "Mewtwo", nameTh: "มิวทู", rank: 4, score: 93, fastMove: "Psycho Cut", chargedMoves: ["Psystrike", "Shadow Ball"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "psychic" },
      { id: 384, slug: "rayquaza", nameEn: "Rayquaza", nameTh: "เรควาซา", rank: 5, score: 92, fastMove: "Air Slash", chargedMoves: ["Dragon Ascent", "Breaking Swipe"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "dragon", type2: "flying" },
      { id: 445, slug: "garchomp", nameEn: "Garchomp", nameTh: "การ์ชอมป์", rank: 6, score: 90, fastMove: "Mud Shot", chargedMoves: ["Earth Power", "Sand Tomb"], role: "Closer", roleTh: "ปิดเกม", type1: "dragon", type2: "ground" },
      { id: 468, slug: "togekiss", nameEn: "Togekiss", nameTh: "โทเกคิส", rank: 7, score: 89, fastMove: "Charm", chargedMoves: ["Aerial Ace", "Ancient Power"], role: "Closer", roleTh: "ปิดเกม", type1: "fairy", type2: "flying" },
      { id: 890, slug: "eternatus", nameEn: "Eternatus", nameTh: "อีทีร์นาตุส", rank: 8, score: 88, fastMove: "Dragon Tail", chargedMoves: ["Dynamax Cannon", "Sludge Bomb"], role: "Attacker", roleTh: "ตัวโจมตี", type1: "poison", type2: "dragon" },
      { id: 250, slug: "ho-oh", nameEn: "Ho-Oh", nameTh: "โฮโอห์", rank: 9, score: 87, fastMove: "Incinerate", chargedMoves: ["Sacred Fire", "Brave Bird"], role: "Flexible", roleTh: "อเนกประสงค์", type1: "fire", type2: "flying" },
      { id: 483, slug: "dialga-origin", nameEn: "Dialga (Origin)", nameTh: "ไดอัลกา (Origin)", rank: 10, score: 86, fastMove: "Dragon Breath", chargedMoves: ["Roar of Time", "Iron Head"], role: "Tank", roleTh: "แทงค์", type1: "steel", type2: "dragon" },
    ],
  },
];

// GO popular moves overall
export const GO_POPULAR_FAST_MOVES = [
  { name: "Counter", pct: 34, type: "fighting" },
  { name: "Mud Shot", pct: 28, type: "ground" },
  { name: "Shadow Claw", pct: 25, type: "ghost" },
  { name: "Powder Snow", pct: 22, type: "ice" },
  { name: "Bubble", pct: 18, type: "water" },
  { name: "Charm", pct: 16, type: "fairy" },
  { name: "Incinerate", pct: 14, type: "fire" },
  { name: "Psycho Cut", pct: 12, type: "psychic" },
];

export const GO_POPULAR_CHARGED_MOVES = [
  { name: "Earthquake", pct: 38, type: "ground" },
  { name: "Shadow Ball", pct: 32, type: "ghost" },
  { name: "Rock Slide", pct: 28, type: "rock" },
  { name: "Ice Beam / Icicle Spear", pct: 25, type: "ice" },
  { name: "Play Rough", pct: 21, type: "fairy" },
  { name: "Moonblast", pct: 18, type: "fairy" },
  { name: "Hydro Cannon", pct: 16, type: "water" },
  { name: "Focus Blast", pct: 14, type: "fighting" },
];
