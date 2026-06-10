// Popular competitive meta teams — VGC & Smogon OU
// Sources: Pikalytics, Smogon forums, World Championship public teams

export interface MetaTeamMember {
  nameEn: string;
  nameTh: string;
  id: number;
  role: string;
  roleTh: string;
  item: string;
  ability: string;
  nature: string;
  moves: string[];
  evs: string;
}

export interface MetaTeam {
  id: string;
  name: string;
  nameTh: string;
  format: string;
  season: string;
  archetype: string;
  archetypeTh: string;
  strategy: string;
  strategyTh: string;
  coreSlugs: string[];  // PokeAPI slugs that trigger this team as relevant
  members: MetaTeamMember[];
  tier: "S" | "A" | "B";
  source: string;
}

// ─── VGC 2024 Regulation H ────────────────────────────────────────────────────
const VGC_2024: MetaTeam[] = [
  {
    id: "vgc24-calyrex-ice-incirill",
    name: "Calyrex-Ice + Incineroar Core",
    nameTh: "Calyrex-Ice + Incineroar คอร์ (VGC 2024 #1)",
    format: "VGC",
    season: "VGC 2024 Regulation H",
    archetype: "Trick Room + Intimidate Support",
    archetypeTh: "Trick Room พร้อม Intimidate",
    strategy: "Set up Trick Room with Farigiraf's Armor Tail blocking priority. Calyrex-Ice sweeps under Trick Room. Incineroar provides Intimidate + Fake Out + Parting Shot support. Rillaboom's Grassy Surge boosts Grassy Glide priority.",
    strategyTh: "ตั้ง Trick Room ด้วย Farigiraf ที่ป้องกัน priority ด้วย Armor Tail จากนั้น Calyrex-Ice ทำลายทุกอย่างภายใต้ Trick Room โดยมี Incineroar คอยให้ Intimidate, Fake Out, Parting Shot ช่วย และ Rillaboom สร้าง Grassy Terrain เพิ่ม priority ให้ Grassy Glide",
    coreSlugs: ["calyrex-ice", "incineroar", "rillaboom", "urshifu-rapid-strike", "flutter-mane", "farigiraf"],
    tier: "S",
    source: "Pikalytics VGC 2024 Worlds",
    members: [
      {
        nameEn: "Calyrex-Ice Rider", nameTh: "Calyrex-Ice Rider", id: 898,
        role: "Restricted Sweeper", roleTh: "Restricted Sweeper (ตัวเก็บสกอร์หลัก)",
        item: "Choice Band", ability: "As One (Chilling Neigh)", nature: "Brave",
        moves: ["Glacial Lance", "High Horsepower", "Trick Room", "Protect"],
        evs: "252 HP / 252 Atk / 4 Def",
      },
      {
        nameEn: "Incineroar", nameTh: "อินซิเนอโรร์", id: 727,
        role: "Support / Intimidate", roleTh: "ซัพพอร์ต Intimidate",
        item: "Safety Goggles", ability: "Intimidate", nature: "Careful",
        moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Will-O-Wisp"],
        evs: "252 HP / 4 Atk / 252 SpD",
      },
      {
        nameEn: "Rillaboom", nameTh: "ริลลาบูม", id: 812,
        role: "Terrain Setter / Physical Attacker", roleTh: "ตั้ง Grassy Terrain",
        item: "Assault Vest", ability: "Grassy Surge", nature: "Adamant",
        moves: ["Grassy Glide", "Wood Hammer", "Fake Out", "U-turn"],
        evs: "252 HP / 252 Atk / 4 SpD",
      },
      {
        nameEn: "Urshifu-Rapid-Strike", nameTh: "อุชิฟุ (น้ำ)", id: 892,
        role: "Physical Attacker / Bypasses Protect", roleTh: "ตัวโจมตีทะลุ Protect",
        item: "Choice Scarf", ability: "Unseen Fist", nature: "Jolly",
        moves: ["Surging Strikes", "Close Combat", "Aqua Jet", "Poison Jab"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Flutter Mane", nameTh: "ฟลัทเทอร์ เมน", id: 987,
        role: "Special Attacker / Speed Control", roleTh: "Special Attacker ความเร็วสูง",
        item: "Choice Specs", ability: "Protosynthesis", nature: "Timid",
        moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Mystical Fire"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Farigiraf", nameTh: "ฟาริจิราฟ", id: 981,
        role: "Trick Room Setter / Priority Blocker", roleTh: "ตั้ง Trick Room + บล็อก priority",
        item: "Colbur Berry", ability: "Armor Tail", nature: "Quiet",
        moves: ["Trick Room", "Psyshock", "Helping Hand", "Protect"],
        evs: "252 HP / 4 SpA / 252 SpD",
      },
    ],
  },
  {
    id: "vgc24-miraidon-offense",
    name: "Miraidon Electric Terrain Offense",
    nameTh: "Miraidon Electric Terrain Offense (VGC 2024)",
    format: "VGC",
    season: "VGC 2024 Regulation H",
    archetype: "Electric Terrain + Speed Control",
    archetypeTh: "Electric Terrain + Speed Control",
    strategy: "Miraidon's Hadron Engine boosts Electric moves massively under Electric Terrain. Iron Hands and Raging Bolt both benefit from Quark Drive in Electric Terrain. Tornadus provides Tailwind for speed control. Flutter Mane cleans up with Choice Scarf.",
    strategyTh: "Miraidon สร้าง Electric Terrain ด้วย Hadron Engine เพิ่มพลัง Electric อย่างมาก Iron Hands และ Raging Bolt ได้ Quark Drive ใน Electric Terrain Tornadus ตั้ง Tailwind ควบคุมความเร็ว Flutter Mane ปิดเกมด้วย Choice Scarf",
    coreSlugs: ["miraidon", "iron-hands", "flutter-mane", "raging-bolt", "urshifu-rapid-strike", "tornadus"],
    tier: "S",
    source: "Pikalytics VGC 2024 Worlds",
    members: [
      {
        nameEn: "Miraidon", nameTh: "มิไรดอน", id: 1007,
        role: "Restricted Attacker / Terrain Setter", roleTh: "Restricted + ตั้ง Electric Terrain",
        item: "Choice Specs", ability: "Hadron Engine", nature: "Timid",
        moves: ["Electro Drift", "Draco Meteor", "Volt Switch", "Dazzling Gleam"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Iron Hands", nameTh: "ไอรอน แฮนดส์", id: 992,
        role: "Physical Powerhouse / Fake Out", roleTh: "Physical Powerhouse + Fake Out",
        item: "Assault Vest", ability: "Quark Drive", nature: "Brave",
        moves: ["Drain Punch", "Wild Charge", "Fake Out", "Heavy Slam"],
        evs: "252 HP / 252 Atk / 4 SpD",
      },
      {
        nameEn: "Raging Bolt", nameTh: "เรจิ้ง โบลท์", id: 1021,
        role: "Special Attacker / Thunderclap Priority", roleTh: "Special + priority Thunderclap",
        item: "Life Orb", ability: "Protosynthesis", nature: "Modest",
        moves: ["Thunderclap", "Draco Meteor", "Dragon Pulse", "Tera Blast"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Flutter Mane", nameTh: "ฟลัทเทอร์ เมน", id: 987,
        role: "Fast Special Attacker", roleTh: "Special Attacker ความเร็วสูง",
        item: "Choice Scarf", ability: "Protosynthesis", nature: "Timid",
        moves: ["Moonblast", "Shadow Ball", "Mystical Fire", "Dazzling Gleam"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Urshifu-Rapid-Strike", nameTh: "อุชิฟุ (น้ำ)", id: 892,
        role: "Physical Attacker", roleTh: "Physical Attacker ทะลุ Protect",
        item: "Focus Sash", ability: "Unseen Fist", nature: "Jolly",
        moves: ["Surging Strikes", "Close Combat", "Protect", "Aqua Jet"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Tornadus", nameTh: "ทอร์นาดัส", id: 641,
        role: "Speed Control / Weather Setter", roleTh: "ตั้ง Tailwind ควบคุมความเร็ว",
        item: "Focus Sash", ability: "Prankster", nature: "Timid",
        moves: ["Tailwind", "Rain Dance", "Bleakwind Storm", "Protect"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
    ],
  },
  {
    id: "vgc24-koraidon-sun",
    name: "Koraidon Sun Team",
    nameTh: "Koraidon Sun Team (VGC 2024)",
    format: "VGC",
    season: "VGC 2024 Regulation H",
    archetype: "Sun Offense",
    archetypeTh: "Sun Offense",
    strategy: "Koraidon's Orichalcum Pulse sets harsh sunlight, powering up its own Fire-type moves. Chi-Yu's Beads of Ruin drops SpDef of all foes, making Flutter Mane's Moonblast devastating. Tornadus sets Tailwind for speed advantage.",
    strategyTh: "Koraidon สร้างแสงแดดด้วย Orichalcum Pulse เพิ่มพลัง Fire ของตัวเอง Chi-Yu ใช้ Beads of Ruin ลด SpDef ของศัตรูทั้งหมด ทำให้ Moonblast ของ Flutter Mane แรงมาก Tornadus ตั้ง Tailwind เพิ่มความเร็ว",
    coreSlugs: ["koraidon", "chi-yu", "flutter-mane", "incineroar", "tornadus", "rillaboom"],
    tier: "S",
    source: "Pikalytics VGC 2024 Regulation H",
    members: [
      {
        nameEn: "Koraidon", nameTh: "โคไรดอน", id: 1007,
        role: "Restricted Attacker / Sun Setter", roleTh: "Restricted + ตั้งแสงแดด",
        item: "Life Orb", ability: "Orichalcum Pulse", nature: "Adamant",
        moves: ["Collision Course", "Flare Blitz", "Dragon Claw", "Protect"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Chi-Yu", nameTh: "ชิ-ยู", id: 1004,
        role: "Special Attacker / Ruinous Ability", roleTh: "Special + ลด SpDef ศัตรู",
        item: "Choice Specs", ability: "Beads of Ruin", nature: "Timid",
        moves: ["Overheat", "Dark Pulse", "Heat Wave", "Snarl"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Flutter Mane", nameTh: "ฟลัทเทอร์ เมน", id: 987,
        role: "Fast Special Attacker", roleTh: "Special Attacker ความเร็วสูง",
        item: "Choice Scarf", ability: "Protosynthesis", nature: "Timid",
        moves: ["Moonblast", "Shadow Ball", "Mystical Fire", "Dazzling Gleam"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Tornadus", nameTh: "ทอร์นาดัส", id: 641,
        role: "Speed Control", roleTh: "Tailwind + Speed Control",
        item: "Focus Sash", ability: "Prankster", nature: "Timid",
        moves: ["Tailwind", "Rain Dance", "Bleakwind Storm", "Protect"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Incineroar", nameTh: "อินซิเนอโรร์", id: 727,
        role: "Support / Intimidate", roleTh: "ซัพพอร์ต Intimidate",
        item: "Rocky Helmet", ability: "Intimidate", nature: "Careful",
        moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Darkest Lariat"],
        evs: "252 HP / 4 Atk / 252 SpD",
      },
      {
        nameEn: "Rillaboom", nameTh: "ริลลาบูม", id: 812,
        role: "Terrain Setter / Physical Attacker", roleTh: "ตั้ง Grassy Terrain",
        item: "Assault Vest", ability: "Grassy Surge", nature: "Adamant",
        moves: ["Grassy Glide", "Wood Hammer", "Fake Out", "U-turn"],
        evs: "252 HP / 252 Atk / 4 SpD",
      },
    ],
  },
];

// ─── Gen 9 OU Popular Archetypes ─────────────────────────────────────────────
const GEN9_OU: MetaTeam[] = [
  {
    id: "gen9ou-balance",
    name: "Gen 9 OU Balance",
    nameTh: "Gen 9 OU Balance (ทีมยอดนิยมอันดับ 1)",
    format: "OU",
    season: "Gen 9 OU Season 2024",
    archetype: "Balanced Offense / Hazard Control",
    archetypeTh: "Balance + Hazard Control",
    strategy: "Great Tusk sets Stealth Rock and spins away hazards. Gholdengo blocks rapid spin attempts while dealing Special damage. Dragapult is a fast Ghost/Dragon threat. Kingambit cleans up weakened teams with Swords Dance. Corviknight provides reliable Flying-type defense.",
    strategyTh: "Great Tusk ตั้ง Stealth Rock และ Rapid Spin เก็บหนาม Gholdengo บล็อก Rapid Spin ของศัตรูพร้อมทำความเสียหาย Dragapult เป็น Ghost/Dragon ความเร็วสูง Kingambit ปิดเกมด้วย Swords Dance Corviknight เป็น Defensive Flying type",
    coreSlugs: ["great-tusk", "gholdengo", "dragapult", "kingambit", "corviknight", "zapdos"],
    tier: "S",
    source: "Smogon Gen 9 OU Viability Rankings",
    members: [
      {
        nameEn: "Great Tusk", nameTh: "เกรท ทัสก์", id: 984,
        role: "Physical Attacker / Hazard Control", roleTh: "Hazard Control + ตั้ง Stealth Rock",
        item: "Leftovers", ability: "Protosynthesis", nature: "Impish",
        moves: ["Stealth Rock", "Earthquake", "Rapid Spin", "Ice Spinner"],
        evs: "252 HP / 252 Def / 4 Spe",
      },
      {
        nameEn: "Gholdengo", nameTh: "โกลเด็นโก้", id: 1000,
        role: "Special Attacker / Spin Blocker", roleTh: "Spin Blocker + Special Attacker",
        item: "Choice Specs", ability: "Good as Gold", nature: "Timid",
        moves: ["Make It Rain", "Shadow Ball", "Trick", "Recover"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Dragapult", nameTh: "ดราก้าพัลท์", id: 887,
        role: "Fast Special/Mixed Attacker", roleTh: "ตัวโจมตีความเร็วสูง",
        item: "Choice Specs", ability: "Clear Body", nature: "Timid",
        moves: ["Shadow Ball", "U-turn", "Draco Meteor", "Flamethrower"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Corviknight", nameTh: "คอร์วิไนท์", id: 823,
        role: "Physical Wall / Defog", roleTh: "Physical Wall + Defog",
        item: "Rocky Helmet", ability: "Pressure", nature: "Careful",
        moves: ["Iron Head", "Roost", "Defog", "Body Press"],
        evs: "252 HP / 4 Def / 252 SpD",
      },
      {
        nameEn: "Kingambit", nameTh: "คิงแกมบิต", id: 983,
        role: "Late Game Cleaner", roleTh: "ปิดเกมช่วงท้าย",
        item: "Black Glasses", ability: "Defiant", nature: "Adamant",
        moves: ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"],
        evs: "4 HP / 252 Atk / 252 SpD",
      },
      {
        nameEn: "Zapdos", nameTh: "แซปโดส", id: 145,
        role: "Special Attacker / Pivot", roleTh: "Special Attacker / Pivot",
        item: "Heavy-Duty Boots", ability: "Static", nature: "Bold",
        moves: ["Thunderbolt", "Hurricane", "Roost", "Defog"],
        evs: "252 HP / 252 Def / 4 SpA",
      },
    ],
  },
  {
    id: "gen9ou-iron-valiant-offense",
    name: "Iron Valiant + Gholdengo Offense",
    nameTh: "Iron Valiant + Gholdengo Offense (Gen 9 OU)",
    format: "OU",
    season: "Gen 9 OU Season 2024",
    archetype: "Hyper Offense",
    archetypeTh: "Hyper Offense",
    strategy: "Iron Valiant threatens a wide range of Pokemon with its diverse coverage. Gholdengo blocks Rapid Spin and threatens Ghost/Steel coverage. Gliscor handles Ground coverage while threatening with Swords Dance. Kingambit absorbs Knock Offs and sweeps late game.",
    strategyTh: "Iron Valiant คุกคาม Pokemon หลายๆ ตัวด้วย type coverage ที่หลากหลาย Gholdengo บล็อก Rapid Spin และคุกคามด้วย Ghost/Steel Gliscor จัดการ Ground และ Swords Dance ช่วงท้าย Kingambit ดูด Knock Off และปิดเกม",
    coreSlugs: ["iron-valiant", "gholdengo", "great-tusk", "dragapult", "gliscor", "kingambit"],
    tier: "S",
    source: "Smogon Gen 9 OU Sample Teams",
    members: [
      {
        nameEn: "Iron Valiant", nameTh: "ไอรอน วาเลียนท์", id: 1006,
        role: "Versatile Attacker", roleTh: "ตัวโจมตีหลากหลาย",
        item: "Choice Scarf", ability: "Quark Drive", nature: "Naive",
        moves: ["Close Combat", "Moonblast", "Shadow Ball", "Thunderbolt"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Gholdengo", nameTh: "โกลเด็นโก้", id: 1000,
        role: "Special Attacker / Spin Blocker", roleTh: "Spin Blocker + Special Attacker",
        item: "Choice Specs", ability: "Good as Gold", nature: "Timid",
        moves: ["Make It Rain", "Shadow Ball", "Trick", "Recover"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Great Tusk", nameTh: "เกรท ทัสก์", id: 984,
        role: "Hazard Setter / Spinner", roleTh: "ตั้งและเก็บ Hazard",
        item: "Leftovers", ability: "Protosynthesis", nature: "Impish",
        moves: ["Stealth Rock", "Earthquake", "Rapid Spin", "Ice Spinner"],
        evs: "252 HP / 252 Def / 4 Spe",
      },
      {
        nameEn: "Dragapult", nameTh: "ดราก้าพัลท์", id: 887,
        role: "Fast Attacker / Revenge Killer", roleTh: "ตัวรุก Revenge Killer",
        item: "Life Orb", ability: "Infiltrator", nature: "Timid",
        moves: ["Dragon Darts", "Shadow Ball", "Draco Meteor", "Will-O-Wisp"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Gliscor", nameTh: "กลิสคอร์", id: 472,
        role: "Physical Sweeper / Stall Breaker", roleTh: "Swords Dance Sweeper",
        item: "Toxic Orb", ability: "Poison Heal", nature: "Jolly",
        moves: ["Swords Dance", "Earthquake", "Ice Fang", "Knock Off"],
        evs: "252 HP / 4 Atk / 252 Spe",
      },
      {
        nameEn: "Kingambit", nameTh: "คิงแกมบิต", id: 983,
        role: "Late Game Cleaner", roleTh: "ปิดเกมช่วงท้าย",
        item: "Black Glasses", ability: "Defiant", nature: "Adamant",
        moves: ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"],
        evs: "4 HP / 252 Atk / 252 SpD",
      },
    ],
  },
  {
    id: "gen9ou-sun-offense",
    name: "Sun Offense (Torkoal + Gouging Fire)",
    nameTh: "Sun Offense Torkoal + Gouging Fire (Gen 9 OU)",
    format: "OU",
    season: "Gen 9 OU Season 2024",
    archetype: "Sun Hyper Offense",
    archetypeTh: "Sun Hyper Offense",
    strategy: "Torkoal's Drought sets permanent sun. Gouging Fire Dragon Dances under sun with boosted Flare Blitz. Walking Wake abuses sun with Hydro Steam + Draco Meteor. Landorus-T provides Stealth Rock and Intimidate pivot.",
    strategyTh: "Torkoal ตั้งแสงแดดถาวรด้วย Drought Gouging Fire Dragon Dance ภายใต้แสงแดดพร้อม Flare Blitz ที่แรงมาก Walking Wake ใช้ Hydro Steam + Draco Meteor Landorus-T ตั้ง Stealth Rock และ Intimidate pivot",
    coreSlugs: ["torkoal", "gouging-fire", "walking-wake", "landorus-therian", "gholdengo", "iron-valiant"],
    tier: "A",
    source: "Smogon Gen 9 OU Sample Teams",
    members: [
      {
        nameEn: "Torkoal", nameTh: "ทอร์โคล", id: 324,
        role: "Drought Setter / Hazard Control", roleTh: "ตั้งแสงแดด + ควบคุม Hazard",
        item: "Heat Rock", ability: "Drought", nature: "Bold",
        moves: ["Stealth Rock", "Rapid Spin", "Lava Plume", "Body Press"],
        evs: "248 HP / 252 Def / 8 SpA",
      },
      {
        nameEn: "Gouging Fire", nameTh: "กูจิ้ง ไฟร์", id: 1020,
        role: "Physical Sun Sweeper", roleTh: "Physical Sweeper ใต้แสงแดด",
        item: "Life Orb", ability: "Protosynthesis", nature: "Adamant",
        moves: ["Dragon Dance", "Flare Blitz", "Dragon Claw", "Morning Sun"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Walking Wake", nameTh: "วอล์คกิ้ง เวค", id: 1009,
        role: "Special Sun Attacker", roleTh: "Special Attacker ใต้แสงแดด",
        item: "Choice Specs", ability: "Protosynthesis", nature: "Timid",
        moves: ["Hydro Steam", "Draco Meteor", "Heat Wave", "Dragon Pulse"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Landorus-Therian", nameTh: "แลนโดรัส (Therian)", id: 645,
        role: "Pivot / Stealth Rock", roleTh: "Pivot + ตั้ง Stealth Rock",
        item: "Leftovers", ability: "Intimidate", nature: "Jolly",
        moves: ["Earthquake", "U-turn", "Stone Edge", "Stealth Rock"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
      {
        nameEn: "Gholdengo", nameTh: "โกลเด็นโก้", id: 1000,
        role: "Special Attacker / Spin Blocker", roleTh: "Spin Blocker",
        item: "Choice Specs", ability: "Good as Gold", nature: "Timid",
        moves: ["Make It Rain", "Shadow Ball", "Trick", "Recover"],
        evs: "4 HP / 252 SpA / 252 Spe",
      },
      {
        nameEn: "Iron Valiant", nameTh: "ไอรอน วาเลียนท์", id: 1006,
        role: "Fast Cleaner / Coverage", roleTh: "ตัวปิดเกมความเร็วสูง",
        item: "Choice Scarf", ability: "Quark Drive", nature: "Naive",
        moves: ["Close Combat", "Moonblast", "Shadow Ball", "Thunderbolt"],
        evs: "4 HP / 252 Atk / 252 Spe",
      },
    ],
  },
];

// ─── All meta teams ────────────────────────────────────────────────────────────
export const META_TEAMS: MetaTeam[] = [...VGC_2024, ...GEN9_OU];

// Find relevant meta teams for a given Pokemon slug and format
export function getMetaTeamsForPokemon(slug: string, format: string): MetaTeam[] {
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return META_TEAMS.filter((team) => {
    const formatMatch = format === "VGC"
      ? team.format === "VGC"
      : team.format === "OU" || team.format === format;
    const pokemonMatch = team.coreSlugs.some((s) =>
      s === normalizedSlug ||
      normalizedSlug.startsWith(s) ||
      s.startsWith(normalizedSlug)
    );
    return formatMatch || pokemonMatch;
  }).slice(0, 3);
}
