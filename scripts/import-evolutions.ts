/**
 * Evolution Importer
 * Scrapes pokemondb.net/evolution and stores all evolution chains in the DB.
 *
 * Usage: npx tsx scripts/import-evolutions.ts
 */

import { PrismaClient, EvolutionTrigger } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

interface RawPair {
  fromSlug: string;
  toSlug: string;
  condText: string;
}

// ──────────────────────────────────────────────
// Condition text → trigger + extras
// ──────────────────────────────────────────────
function parseCondition(text: string): {
  trigger: EvolutionTrigger;
  minLevel?: number;
  itemName?: string;
  condition?: string;
} {
  const t = text.toLowerCase();

  // Level N
  const lvMatch = text.match(/level\s+(\d+)/i);
  if (lvMatch) {
    return { trigger: EvolutionTrigger.LEVEL_UP, minLevel: parseInt(lvMatch[1]), condition: text };
  }

  // Use item  (e.g. "use Water Stone")
  const useMatch = text.match(/use\s+(.+?)(?:\s*\)|$)/i);
  if (useMatch) {
    return { trigger: EvolutionTrigger.USE_ITEM, itemName: useMatch[1].trim(), condition: text };
  }

  // Trade holding item
  const tradeHoldMatch = text.match(/trade.*?holding\s+(.+?)(?:\s*\)|$)/i);
  if (tradeHoldMatch) {
    return { trigger: EvolutionTrigger.TRADE, itemName: tradeHoldMatch[1].trim(), condition: text };
  }

  // Trade
  if (t.includes("trade")) {
    return { trigger: EvolutionTrigger.TRADE, condition: text };
  }

  // Shed (Shedinja)
  if (t.includes("shed")) return { trigger: EvolutionTrigger.SHED, condition: text };

  // Spin (Alcremie)
  if (t.includes("spin")) return { trigger: EvolutionTrigger.SPIN, condition: text };

  // Three critical hits (Sirfetch'd)
  if (t.includes("critical")) return { trigger: EvolutionTrigger.THREE_CRITICAL_HITS, condition: text };

  // Take damage (Runerigus)
  if (t.includes("take") && t.includes("damage")) return { trigger: EvolutionTrigger.TAKE_DAMAGE, condition: text };

  // Recoil damage (Basculegion)
  if (t.includes("recoil")) return { trigger: EvolutionTrigger.RECOIL_DAMAGE, condition: text };

  // Agile/Strong style
  if (t.includes("agile")) return { trigger: EvolutionTrigger.AGILE_STYLE_MOVE, condition: text };
  if (t.includes("strong")) return { trigger: EvolutionTrigger.STRONG_STYLE_MOVE, condition: text };

  // Tower of Darkness/Waters (Urshifu)
  if (t.includes("tower of darkness")) return { trigger: EvolutionTrigger.TOWER_OF_DARKNESS, condition: text };
  if (t.includes("tower of waters")) return { trigger: EvolutionTrigger.TOWER_OF_WATERS, condition: text };

  // Level-up conditions (friendship, location, time, etc.)
  if (
    t.includes("level up") || t.includes("friendship") || t.includes("happiness") ||
    t.includes("affection") || t.includes("at night") || t.includes("at day") ||
    t.includes("knowing") || t.includes("in rain") || t.includes("upside") ||
    t.includes("magnetic") || t.includes("mossy") || t.includes("icy") ||
    t.includes("walking") || t.includes("steps") || t.includes("hungry") ||
    t.includes("craving") || t.includes("stuffed") || t.includes("full") ||
    t.includes("male") || t.includes("female") || t.includes("in a battle") ||
    t.includes("overworld") || t.includes("at location") || t.includes("beauty") ||
    t.includes("party") || t.includes("holding") || t.includes("game boy") ||
    t.includes("sound") || t.includes("music")
  ) {
    return { trigger: EvolutionTrigger.LEVEL_UP, condition: text };
  }

  return { trigger: EvolutionTrigger.OTHER, condition: text };
}

// ──────────────────────────────────────────────
// Fetch & parse pokemondb.net/evolution
// ──────────────────────────────────────────────
async function fetchEvolutions(): Promise<RawPair[]> {
  console.log("🌐 กำลังดึงข้อมูลจาก pokemondb.net/evolution...");

  const res = await fetch("https://pokemondb.net/evolution", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.log(`   ดาวน์โหลดสำเร็จ (${(html.length / 1024).toFixed(0)} KB)`);

  const $ = cheerio.load(html);
  const pairs: RawPair[] = [];

  $(".infocard-filter-block").each((_, block) => {
    // For each top-level infocard-list-evo inside this block
    $(block)
      .children(".infocard-list-evo")
      .each((_, topList) => {
        let lastSlug: string | null = null;
        let pendingCond: string | null = null;

        $(topList)
          .children()
          .each((_, child) => {
            const $c = $(child);

            // ── Pokemon card ──────────────────────────
            if ($c.is("div") && $c.hasClass("infocard")) {
              const href = $c.find("a.ent-name").attr("href");
              const slug = href?.replace("/pokedex/", "").trim() ?? null;

              if (slug) {
                if (lastSlug && pendingCond !== null) {
                  pairs.push({ fromSlug: lastSlug, toSlug: slug, condText: pendingCond });
                }
                lastSlug = slug;
                pendingCond = null;
              }
            }
            // ── Linear arrow ─────────────────────────
            else if ($c.is("span") && $c.hasClass("infocard-arrow")) {
              pendingCond = $c.text().replace(/\s+/g, " ").trim();
            }
            // ── Branching split ──────────────────────
            else if ($c.is("span") && $c.hasClass("infocard-evo-split")) {
              if (lastSlug) {
                const fromSlug = lastSlug;

                $c.children(".infocard-list-evo").each((_, branch) => {
                  const $b = $(branch);
                  const cond = $b
                    .find(".infocard-arrow")
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();
                  const toHref = $b.find("a.ent-name").attr("href");
                  const toSlug = toHref?.replace("/pokedex/", "").trim() ?? null;

                  if (toSlug) {
                    pairs.push({ fromSlug, toSlug, condText: cond });
                  }
                });
              }
            }
          });
      });
  });

  return pairs;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  try {
    const rawPairs = await fetchEvolutions();
    console.log(`\n📋 พบ evolution ${rawPairs.length} คู่`);

    // Preview
    console.log("\nตัวอย่าง 10 รายการแรก:");
    rawPairs.slice(0, 10).forEach((p) => {
      console.log(`  ${p.fromSlug.padEnd(20)} → ${p.toSlug.padEnd(20)} [${p.condText.substring(0, 40)}]`);
    });
    console.log("");

    // ── ลบข้อมูลเก่าก่อน
    const deleted = await prisma.evolution.deleteMany({});
    console.log(`🗑️  ลบข้อมูล evolution เก่า ${deleted.count} รายการ`);

    // ── Insert ใหม่
    let inserted = 0;
    let skipped = 0;
    const notFound = new Set<string>();

    // Cache pokemon slugs → id
    const allPokemon = await prisma.pokemon.findMany({ select: { id: true, slug: true } });
    const slugToId = new Map(allPokemon.map((p) => [p.slug, p.id]));

    // Fallback: pokemondb uses base slug, DB may store form-specific slug
    // e.g. "wormadam" → "wormadam-plant", "darmanitan" → "darmanitan-standard"
    const EXPLICIT_SLUG_MAP: Record<string, string> = {
      "dudunsparce":  "dudunsparce-two-segment",
      "palafin":      "palafin-zero",
      "maushold":     "maushold-family-of-four",
      "oinkologne":   "oinkologne-male",
      "squawkabilly": "squawkabilly-green-plumage",
      "tatsugiri":    "tatsugiri-curly",
    };

    function resolveSlug(slug: string): number | undefined {
      if (slugToId.has(slug)) return slugToId.get(slug);
      // Explicit overrides
      const mapped = EXPLICIT_SLUG_MAP[slug];
      if (mapped && slugToId.has(mapped)) return slugToId.get(mapped);
      // Try common form suffixes
      const formSuffixes = [
        "-plant", "-standard", "-male", "-average", "-red-striped",
        "-shield", "-land", "-aria", "-ordinary", "-altered",
        "-incarnate", "-baile", "-disguised", "-solo",
        "-midday", "-full-belly", "-ice", "-normal",
        "-single-strike", "-amped", "-50",
      ];
      for (const suffix of formSuffixes) {
        const alt = slug + suffix;
        if (slugToId.has(alt)) return slugToId.get(alt);
      }
      return undefined;
    }

    for (const pair of rawPairs) {
      const fromId = resolveSlug(pair.fromSlug);
      const toId = resolveSlug(pair.toSlug);

      if (!fromId || !toId) {
        skipped++;
        if (!fromId) notFound.add(pair.fromSlug);
        if (!toId) notFound.add(pair.toSlug);
        continue;
      }

      const cond = parseCondition(pair.condText);

      await prisma.evolution.create({
        data: {
          fromPokemonId: fromId,
          toPokemonId: toId,
          trigger: cond.trigger,
          minLevel: cond.minLevel ?? null,
          condition: cond.condition ?? pair.condText,
        },
      });

      inserted++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ บันทึก evolution สำเร็จ : ${inserted} คู่`);
    if (skipped > 0) {
      console.log(`⚠️  ข้ามเพราะไม่พบใน DB    : ${skipped} คู่`);
      console.log(`   Pokemon ที่ไม่พบ: ${[...notFound].slice(0, 10).join(", ")}${notFound.size > 10 ? "..." : ""}`);
      console.log(`   (import Gen ที่ยังขาดก่อน แล้วรัน script นี้ซ้ำ)`);
    }
    console.log("=".repeat(60));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
