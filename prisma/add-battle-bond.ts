/**
 * Add/update the Battle Bond ability (Greninja's hidden ability) with Thai text.
 * Run: npx tsx prisma/add-battle-bond.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shortEffect =
    "Transforms this Pokémon into Ash-Greninja after fainting an opponent. Water Shuriken's power is 20 and always hits three times.";
  const effect =
    "Transforms this Pokémon into Ash-Greninja after fainting an opponent. Water Shuriken's power is 20 and always hits three times. This ability cannot be copied or replaced. This ability only takes effect for Greninja.";
  const shortEffectTh =
    "เมื่อทำให้โปเกมอนฝ่ายตรงข้ามสลบ จะแปลงร่างเป็นซาโตชิเกรนินจา (Ash-Greninja) และท่า Water Shuriken จะมีพลัง 20 โจมตี 3 ครั้งเสมอ";
  const effectTh =
    "Ability ติดตัวเฉพาะของเกรนินจา (Greninja) — ใน Gen 7 (Sun/Moon): หลังทำให้โปเกมอนฝ่ายตรงข้ามสลบ จะแปลงร่างเป็นซาโตชิเกรนินจา และท่า Water Shuriken แรงขึ้นเป็นพลัง 20 โจมตี 3 ครั้งเสมอ | ใน Gen 9 (Scarlet/Violet): ไม่แปลงร่างแล้ว แต่เมื่อทำให้โปเกมอนสลบ Attack, Sp.Atk และ Speed จะเพิ่มขึ้นอย่างละ 1 ขั้น (ทำงานครั้งเดียวต่อการต่อสู้) | Ability นี้ไม่สามารถถูกคัดลอกหรือเปลี่ยนแทนที่ได้";

  const ability = await prisma.ability.upsert({
    where: { id: 210 },
    create: {
      id: 210,
      slug: "battle-bond",
      nameEn: "Battle Bond",
      nameTh: "สายใยแห่งการต่อสู้",
      nameJa: "きずなへんげ",
      generation: 7,
      effect,
      effectTh,
      shortEffect,
      shortEffectTh,
      isMainSeries: true,
    },
    update: {
      nameEn: "Battle Bond",
      nameTh: "สายใยแห่งการต่อสู้",
      nameJa: "きずなへんげ",
      generation: 7,
      effect,
      effectTh,
      shortEffect,
      shortEffectTh,
    },
  });
  console.log("✅ upserted ability:", ability.slug, "-", ability.nameTh);

  // Link Battle Bond to Greninja as its hidden ability if not already linked
  const greninja = await prisma.pokemon.findUnique({ where: { slug: "greninja" }, select: { id: true } });
  if (greninja) {
    const existing = await prisma.pokemonAbility.findFirst({
      where: { pokemonId: greninja.id, abilityId: 210 },
    });
    if (!existing) {
      // slot must be unique per pokemon — use the next free slot
      const maxSlot = await prisma.pokemonAbility.aggregate({
        where: { pokemonId: greninja.id },
        _max: { slot: true },
      });
      const slot = (maxSlot._max.slot ?? 0) + 1;
      await prisma.pokemonAbility.create({
        data: { pokemonId: greninja.id, abilityId: 210, slot, isHidden: true },
      });
      console.log(`✅ linked battle-bond to greninja (hidden, slot ${slot})`);
    } else {
      console.log("ℹ️ greninja already linked to battle-bond");
    }
  } else {
    console.log("⚠️ greninja not found in Pokemon table");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
