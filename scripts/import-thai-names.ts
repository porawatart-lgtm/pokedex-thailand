import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ThaiNameEntry {
  dexNumber: number;
  nameEn: string;
  nameTh: string;
  rtgs: string;
}

async function fetchThaiNames(): Promise<ThaiNameEntry[]> {
  console.log("🌐 กำลังดึงข้อมูลชื่อภาษาไทยจาก Bulbapedia...");

  const response = await fetch(
    "https://bulbapedia.bulbagarden.net/wiki/List_of_Thai_Pok%C3%A9mon_names",
    {
      headers: {
        "User-Agent": "PokedexThailand/1.0 (educational/non-commercial project)",
        "Accept": "text/html",
      },
    }
  );

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  const html = await response.text();
  const results: ThaiNameEntry[] = [];

  // Split by <tr to process row by row
  const rows = html.split("<tr");

  for (const row of rows) {
    // Must have a dex number like #0001
    const dexMatch = row.match(/#(\d{4})/);
    if (!dexMatch) continue;

    const dexNumber = parseInt(dexMatch[1], 10);
    if (isNaN(dexNumber) || dexNumber < 1 || dexNumber > 9999) continue;

    // English name: <td><a href="...">Name</a>
    const enMatch = row.match(/<td><a[^>]+>([^<]+)<\/a>/);
    if (!enMatch) continue;
    const nameEn = enMatch[1].trim();

    // Thai name: <td lang="th">ชื่อ
    const thMatch = row.match(/lang="th"[^>]*>\s*([^\n<]+)/);
    if (!thMatch) continue;
    const nameTh = thMatch[1].trim();

    // RTGS: the <td> right after the Thai <td>
    const afterThaiIdx = row.indexOf('lang="th"');
    const afterThai = row.substring(afterThaiIdx);
    const rtgsMatch = afterThai.match(/<\/td>\s*\n?<td>([^\n<]+)/);
    const rtgs = rtgsMatch ? rtgsMatch[1].trim() : "";

    if (nameTh && nameTh.length > 0) {
      results.push({ dexNumber, nameEn, nameTh, rtgs });
    }
  }

  return results;
}

async function main() {
  try {
    const thaiNames = await fetchThaiNames();

    if (thaiNames.length === 0) {
      console.error("❌ ไม่พบข้อมูล — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
      return;
    }

    console.log(`📋 พบชื่อภาษาไทย ${thaiNames.length} ตัว\n`);

    // Preview first 5
    console.log("ตัวอย่าง:");
    thaiNames.slice(0, 5).forEach((e) => {
      console.log(`  #${String(e.dexNumber).padStart(4, "0")} ${e.nameEn.padEnd(15)} → ${e.nameTh} (${e.rtgs})`);
    });
    console.log("");

    let updated = 0;
    let skipped = 0;

    for (const entry of thaiNames) {
      const result = await prisma.pokemon.updateMany({
        where: { dexNumber: entry.dexNumber },
        data: { nameTh: entry.nameTh },
      });

      if (result.count > 0) {
        updated++;
        if (updated <= 20 || updated % 50 === 0) {
          console.log(
            `  ✅ #${String(entry.dexNumber).padStart(4, "0")} ${entry.nameEn.padEnd(15)} → ${entry.nameTh}`
          );
        } else if (updated === 21) {
          console.log("  ... (แสดงทุก 50 ตัว) ...");
        }
      } else {
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ อัปเดตสำเร็จ : ${updated} ตัว`);
    if (skipped > 0) {
      console.log(`⚠️  ไม่พบใน DB  : ${skipped} ตัว (นำเข้า Gen เพิ่มเติมก่อน)`);
    }
    console.log("=".repeat(50));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
