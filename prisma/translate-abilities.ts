import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function googleTranslateTh(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json() as unknown[][];
  const parts = (data[0] as unknown[][]).map((p) => (p as unknown[])[0] as string);
  return parts.join("").trim();
}

async function main() {
  const abilities = await prisma.ability.findMany({
    where: { shortEffectTh: null, shortEffect: { not: null } },
    select: { id: true, nameEn: true, shortEffect: true, effect: true },
    orderBy: { id: "asc" },
  });

  console.log(`🌏 Translating ${abilities.length} abilities via Google Translate...`);

  let done = 0;
  for (const a of abilities) {
    try {
      const shortEffectTh = await googleTranslateTh(a.shortEffect!);
      const effectTh = a.effect ? await googleTranslateTh(a.effect) : shortEffectTh;

      await prisma.ability.update({
        where: { id: a.id },
        data: { shortEffectTh, effectTh },
      });

      done++;
      if (done % 20 === 0) console.log(`  ${done}/${abilities.length} done`);

      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.warn(`  Skipped ${a.nameEn}: ${e}`);
    }
  }

  console.log(`✅ Translated ${done} abilities`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
