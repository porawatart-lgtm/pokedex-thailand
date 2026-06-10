import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed type effectiveness chart
async function seedTypes() {
  console.log("🌱 Seeding types...");

  const types = [
    { id: 1, slug: "normal", nameEn: "Normal", nameTh: "ธรรมดา", color: "#A8A77A" },
    { id: 10, slug: "fire", nameEn: "Fire", nameTh: "ไฟ", color: "#EE8130" },
    { id: 11, slug: "water", nameEn: "Water", nameTh: "น้ำ", color: "#6390F0" },
    { id: 13, slug: "electric", nameEn: "Electric", nameTh: "ไฟฟ้า", color: "#F7D02C" },
    { id: 12, slug: "grass", nameEn: "Grass", nameTh: "หญ้า", color: "#7AC74C" },
    { id: 15, slug: "ice", nameEn: "Ice", nameTh: "น้ำแข็ง", color: "#96D9D6" },
    { id: 2, slug: "fighting", nameEn: "Fighting", nameTh: "ต่อสู้", color: "#C22E28" },
    { id: 4, slug: "poison", nameEn: "Poison", nameTh: "พิษ", color: "#A33EA1" },
    { id: 5, slug: "ground", nameEn: "Ground", nameTh: "พื้นดิน", color: "#E2BF65" },
    { id: 3, slug: "flying", nameEn: "Flying", nameTh: "บิน", color: "#A98FF3" },
    { id: 14, slug: "psychic", nameEn: "Psychic", nameTh: "จิตตะ", color: "#F95587" },
    { id: 7, slug: "bug", nameEn: "Bug", nameTh: "แมลง", color: "#A6B91A" },
    { id: 6, slug: "rock", nameEn: "Rock", nameTh: "หิน", color: "#B6A136" },
    { id: 8, slug: "ghost", nameEn: "Ghost", nameTh: "ผี", color: "#735797" },
    { id: 16, slug: "dragon", nameEn: "Dragon", nameTh: "มังกร", color: "#6F35FC" },
    { id: 17, slug: "dark", nameEn: "Dark", nameTh: "มืด", color: "#705746" },
    { id: 9, slug: "steel", nameEn: "Steel", nameTh: "เหล็กกล้า", color: "#B7B7CE" },
    { id: 18, slug: "fairy", nameEn: "Fairy", nameTh: "เทพนิยาย", color: "#D685AD" },
  ];

  for (const type of types) {
    await prisma.type.upsert({
      where: { id: type.id },
      create: type,
      update: type,
    });
  }

  console.log(`✅ Seeded ${types.length} types`);
}

// Seed regions
async function seedRegions() {
  console.log("🌱 Seeding regions...");

  const regions = [
    { id: 1, slug: "kanto", nameEn: "Kanto", nameTh: "คันโต", generation: 1, mainGame: "Red/Blue/Yellow" },
    { id: 2, slug: "johto", nameEn: "Johto", nameTh: "โจโต", generation: 2, mainGame: "Gold/Silver/Crystal" },
    { id: 3, slug: "hoenn", nameEn: "Hoenn", nameTh: "โฮเอ็น", generation: 3, mainGame: "Ruby/Sapphire/Emerald" },
    { id: 4, slug: "sinnoh", nameEn: "Sinnoh", nameTh: "ชินโนห์", generation: 4, mainGame: "Diamond/Pearl/Platinum" },
    { id: 5, slug: "unova", nameEn: "Unova", nameTh: "ยูโนวา", generation: 5, mainGame: "Black/White" },
    { id: 6, slug: "kalos", nameEn: "Kalos", nameTh: "คาโลส", generation: 6, mainGame: "X/Y" },
    { id: 7, slug: "alola", nameEn: "Alola", nameTh: "อาโลลา", generation: 7, mainGame: "Sun/Moon" },
    { id: 8, slug: "galar", nameEn: "Galar", nameTh: "กาลาร์", generation: 8, mainGame: "Sword/Shield" },
    { id: 9, slug: "hisui", nameEn: "Hisui", nameTh: "ฮิซุย", generation: 8, mainGame: "Legends: Arceus" },
    { id: 10, slug: "paldea", nameEn: "Paldea", nameTh: "ปัลเดีย", generation: 9, mainGame: "Scarlet/Violet" },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { id: region.id },
      create: region,
      update: region,
    });
  }

  console.log(`✅ Seeded ${regions.length} regions`);
}

// Seed achievements
async function seedAchievements() {
  console.log("🌱 Seeding achievements...");

  const achievements = [
    {
      slug: "first-team",
      nameEn: "First Team",
      nameTh: "ทีมแรก",
      description: "สร้างทีมครั้งแรก",
      icon: "🏆",
      points: 10,
      category: "team",
      rarity: "COMMON",
    },
    {
      slug: "catch-100",
      nameEn: "Collector",
      nameTh: "นักสะสม",
      description: "จับโปเกมอนครบ 100 ตัว",
      icon: "📦",
      points: 50,
      category: "dex",
      rarity: "UNCOMMON",
    },
    {
      slug: "gen1-complete",
      nameEn: "Kanto Champion",
      nameTh: "แชมเปี้ยนคันโต",
      description: "จับโปเกมอน Gen 1 ครบทั้งหมด",
      icon: "🔴",
      points: 100,
      category: "dex",
      rarity: "RARE",
    },
    {
      slug: "all-gen-complete",
      nameEn: "True Master",
      nameTh: "ปรมาจารย์โปเกมอน",
      description: "จับโปเกมอนครบทุก Generation",
      icon: "👑",
      points: 1000,
      category: "dex",
      rarity: "LEGENDARY",
    },
    {
      slug: "first-shiny",
      nameEn: "Shiny Hunter",
      nameTh: "นักล่า Shiny",
      description: "จับโปเกมอน Shiny ตัวแรก",
      icon: "✨",
      points: 75,
      category: "shiny",
      rarity: "RARE",
    },
    {
      slug: "team-50",
      nameEn: "Team Builder Pro",
      nameTh: "ผู้เชี่ยวชาญสร้างทีม",
      description: "สร้างทีมครบ 50 ทีม",
      icon: "⚡",
      points: 200,
      category: "team",
      rarity: "EPIC",
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      create: ach,
      update: ach,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  await seedTypes();
  await seedRegions();
  await seedAchievements();

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📌 Next steps:");
  console.log("   1. Run: npm run db:migrate");
  console.log("   2. Run the Pokemon import script to fetch data from PokéAPI");
  console.log("   3. Start the dev server: npm run dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
