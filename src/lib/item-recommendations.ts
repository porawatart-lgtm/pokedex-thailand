// Curated held-item recommendations per Pokémon (signature items + competitive staples)
// Keyed by Pokémon slug. Shown on the Pokémon detail page.

export interface ItemDef {
  nameEn: string;
  nameTh: string;
  /** Explicit sprite URL when the auto-resolved ones are wrong/missing */
  sprite?: string;
}

// Item metadata keyed by item slug (PokeAPI slug)
export const ITEM_DEFS: Record<string, ItemDef> = {
  "light-ball":       { nameEn: "Light Ball",       nameTh: "ไลท์บอล" },
  "thick-club":       { nameEn: "Thick Club",       nameTh: "กระดูกหนา" },
  "leek":             { nameEn: "Leek",             nameTh: "ต้นหอม" },
  "soul-dew":         { nameEn: "Soul Dew",         nameTh: "โซลดิว" },
  "adamant-orb":      { nameEn: "Adamant Orb",      nameTh: "อดาแมนต์ออร์บ" },
  "lustrous-orb":     { nameEn: "Lustrous Orb",     nameTh: "ลัสเทรียสออร์บ" },
  "griseous-orb":     { nameEn: "Griseous Orb",     nameTh: "กรีเซียสออร์บ" },
  "red-orb":          { nameEn: "Red Orb",          nameTh: "ลูกแก้วแดง" },
  "blue-orb":         { nameEn: "Blue Orb",         nameTh: "ลูกแก้วน้ำเงิน" },
  "rusted-sword":     { nameEn: "Rusted Sword",     nameTh: "ดาบขึ้นสนิม" },
  "rusted-shield":    { nameEn: "Rusted Shield",    nameTh: "โล่ขึ้นสนิม" },
  "eviolite":         { nameEn: "Eviolite",         nameTh: "เอวิโอไลต์" },
  "choice-band":      { nameEn: "Choice Band",      nameTh: "ช้อยส์แบนด์" },
  "choice-specs":     { nameEn: "Choice Specs",     nameTh: "ช้อยส์สเปกส์" },
  "choice-scarf":     { nameEn: "Choice Scarf",     nameTh: "ช้อยส์สการ์ฟ" },
  "life-orb":         { nameEn: "Life Orb",         nameTh: "ไลฟ์ออร์บ" },
  "leftovers":        { nameEn: "Leftovers",        nameTh: "เลฟต์โอเวอร์ส" },
  "black-sludge":     { nameEn: "Black Sludge",     nameTh: "ตะกอนดำ" },
  "focus-sash":       { nameEn: "Focus Sash",       nameTh: "โฟกัสซาช" },
  "assault-vest":     { nameEn: "Assault Vest",     nameTh: "เสื้อจู่โจม" },
  "rocky-helmet":     { nameEn: "Rocky Helmet",     nameTh: "หมวกหนาม" },
  "heavy-duty-boots": {
    nameEn: "Heavy-Duty Boots",
    nameTh: "บูตลุยงานหนัก",
    sprite: "https://www.serebii.net/itemdex/sprites/heavy-dutyboots.png",
  },
  "flame-orb":        { nameEn: "Flame Orb",        nameTh: "เฟลมออร์บ" },
  "toxic-orb":        { nameEn: "Toxic Orb",        nameTh: "ท็อกซิกออร์บ" },
  "air-balloon":      { nameEn: "Air Balloon",      nameTh: "ลูกโป่งลม" },
  "weakness-policy":  { nameEn: "Weakness Policy",  nameTh: "กรมธรรม์จุดอ่อน" },
  "booster-energy":   { nameEn: "Booster Energy",   nameTh: "บูสเตอร์เอเนอร์จี" },
  "loaded-dice":      { nameEn: "Loaded Dice",      nameTh: "ลูกเต๋าถ่วง" },
  "light-clay":       { nameEn: "Light Clay",       nameTh: "ดินเหนียวแสง" },
  "sitrus-berry":     { nameEn: "Sitrus Berry",     nameTh: "ผลซิตรัส" },
  "chesto-berry":     { nameEn: "Chesto Berry",     nameTh: "ผลเชสโต" },
  "electric-seed":    { nameEn: "Electric Seed",    nameTh: "เมล็ดไฟฟ้า" },
  "throat-spray":     { nameEn: "Throat Spray",     nameTh: "สเปรย์พ่นคอ" },
  "black-glasses":    { nameEn: "Black Glasses",    nameTh: "แว่นดำ" },
  "mystic-water":     { nameEn: "Mystic Water",     nameTh: "น้ำลึกลับ" },
  "quick-powder":     { nameEn: "Quick Powder",     nameTh: "ผงไว" },
};

export interface ItemRecommendation {
  /** PokeAPI item slug — must exist in ITEM_DEFS */
  item: string;
  /** Why this item fits this Pokémon (Thai) */
  reason: string;
}

export const ITEM_RECOMMENDATIONS: Record<string, ItemRecommendation[]> = {
  // ─── Signature items ────────────────────────────────────────────────────────
  pikachu: [
    { item: "light-ball", reason: "ไอเทมเฉพาะของปิกาจู — เพิ่ม Attack และ Sp.Atk เป็น 2 เท่า" },
  ],
  cubone: [
    { item: "thick-club", reason: "ไอเทมเฉพาะสายคาราคาระ — เพิ่ม Attack เป็น 2 เท่า" },
    { item: "eviolite", reason: "ยังไม่วิวัฒนาการ จึงได้ Defense/Sp.Def เพิ่ม 50%" },
  ],
  marowak: [
    { item: "thick-club", reason: "ไอเทมเฉพาะของการาการะ — เพิ่ม Attack เป็น 2 เท่า กลายเป็นสายตีแรงทันที" },
  ],
  farfetchd: [
    { item: "leek", reason: "ไอเทมเฉพาะ — เพิ่มอัตราคริติคอลอย่างมาก" },
  ],
  sirfetchd: [
    { item: "leek", reason: "ไอเทมเฉพาะ — เพิ่มอัตราคริติคอล เข้ากับท่าคริสูงของมัน" },
  ],
  latios: [
    { item: "soul-dew", reason: "ไอเทมเฉพาะ — เพิ่มพลังท่าธาตุ Psychic และ Dragon 20%" },
  ],
  latias: [
    { item: "soul-dew", reason: "ไอเทมเฉพาะ — เพิ่มพลังท่าธาตุ Psychic และ Dragon 20%" },
  ],
  dialga: [
    { item: "adamant-orb", reason: "ไอเทมเฉพาะ — เพิ่มพลังท่าธาตุ Steel และ Dragon 20%" },
  ],
  palkia: [
    { item: "lustrous-orb", reason: "ไอเทมเฉพาะ — เพิ่มพลังท่าธาตุ Water และ Dragon 20%" },
  ],
  giratina: [
    { item: "griseous-orb", reason: "ไอเทมเฉพาะ — เพิ่มพลังท่าธาตุ Ghost และ Dragon และเปลี่ยนเป็น Origin Forme" },
  ],
  groudon: [
    { item: "red-orb", reason: "ไอเทมเฉพาะ — เปลี่ยนร่างเป็น Primal Groudon ในสนามรบ" },
  ],
  kyogre: [
    { item: "blue-orb", reason: "ไอเทมเฉพาะ — เปลี่ยนร่างเป็น Primal Kyogre ในสนามรบ" },
  ],
  zacian: [
    { item: "rusted-sword", reason: "ไอเทมเฉพาะ — เปลี่ยนเป็นร่าง Crowned Sword และท่า Behemoth Blade" },
  ],
  zamazenta: [
    { item: "rusted-shield", reason: "ไอเทมเฉพาะ — เปลี่ยนเป็นร่าง Crowned Shield และท่า Behemoth Bash" },
  ],
  ditto: [
    { item: "choice-scarf", reason: "Imposter ก๊อปปี้สเตตัสคู่ต่อสู้ — Scarf ทำให้เร็วกว่าตัวต้นแบบเสมอ" },
    { item: "quick-powder", reason: "ไอเทมเฉพาะของเมตามอน — เพิ่ม Speed 2 เท่า (เฉพาะตอนยังไม่แปลงร่าง)" },
  ],

  // ─── Eviolite users ─────────────────────────────────────────────────────────
  chansey: [
    { item: "eviolite", reason: "ตัวรับดาเมจที่อึดที่สุดตัวหนึ่งของเกม — Eviolite เพิ่ม Def/Sp.Def อีก 50%" },
  ],
  porygon2: [
    { item: "eviolite", reason: "ยังวิวัฒนาการได้ จึงรับโบนัส Def/Sp.Def +50% กลายเป็นกำแพงสารพัดประโยชน์" },
  ],
  dusclops: [
    { item: "eviolite", reason: "อึดกว่าร่างสุดท้าย Dusknoir เมื่อถือ Eviolite" },
  ],
  bisharp: [
    { item: "eviolite", reason: "หลังมี Kingambit ใน Gen 9 — Bisharp ถือ Eviolite เป็นตัวกลางที่แกร่งมาก" },
  ],

  // ─── Kanto–Johto staples ────────────────────────────────────────────────────
  charizard: [
    { item: "heavy-duty-boots", reason: "แพ้ Stealth Rock x4 — บูตช่วยกัน entry hazard ทั้งหมด" },
    { item: "choice-specs", reason: "คู่กับ Solar Power ในทีมแดด เพิ่มความแรงท่าพิเศษมหาศาล" },
  ],
  alakazam: [
    { item: "focus-sash", reason: "เปราะมาก — Sash การันตีรอด 1 ฮิตเพื่อตอบโต้ด้วย Sp.Atk สูงลิ่ว" },
    { item: "life-orb", reason: "Magic Guard ทำให้ไม่เสีย HP จาก Life Orb — ได้พลัง 30% ฟรี" },
  ],
  machamp: [
    { item: "flame-orb", reason: "กระตุ้น Guts เพิ่ม Attack 50% และกันสถานะอื่น" },
    { item: "assault-vest", reason: "เพิ่ม Sp.Def 50% ให้สายลุยถึก" },
  ],
  gengar: [
    { item: "choice-specs", reason: "Sp.Atk สูงและท่าหลากหลาย — Specs เพิ่มความแรง 50%" },
    { item: "focus-sash", reason: "เปราะ — Sash ช่วยให้ได้วาง hazard หรือยิงครบ" },
  ],
  gyarados: [
    { item: "leftovers", reason: "ตั้ง Dragon Dance ได้หลายเทิร์นขึ้นด้วยการฟื้น HP ทุกเทิร์น" },
  ],
  snorlax: [
    { item: "leftovers", reason: "HP มหาศาล — ฟื้น 1/16 ต่อเทิร์นยิ่งทำให้ล้มยาก" },
    { item: "chesto-berry", reason: "คอมโบ Rest + Chesto ฟื้น HP เต็มแล้วตื่นทันที" },
  ],
  blissey: [
    { item: "leftovers", reason: "กำแพงฝั่งพิเศษอันดับหนึ่ง — Leftovers ช่วยยืนยาวขึ้นอีก" },
  ],
  scizor: [
    { item: "choice-band", reason: "Technician + Bullet Punch — Band ทำให้ priority ตีหนักมาก" },
    { item: "life-orb", reason: "เซ็ต Swords Dance ต้องการพลังเสริมแบบไม่ล็อกท่า" },
  ],
  umbreon: [
    { item: "leftovers", reason: "กำแพงสาย Wish/Protect — ฟื้น HP ต่อเนื่อง" },
  ],

  // ─── Gen 3–4 staples ────────────────────────────────────────────────────────
  blaziken: [
    { item: "life-orb", reason: "Speed Boost เร่งความเร็วให้แล้ว — Life Orb เติมความแรงปิดเกม" },
  ],
  gardevoir: [
    { item: "choice-specs", reason: "Sp.Atk สูง ท่า Fairy/Psychic แรงทะลุด้วย Specs" },
    { item: "choice-scarf", reason: "แก้ปัญหา Speed กลางๆ ให้กลายเป็นตัวรีเวนจ์" },
  ],
  salamence: [
    { item: "choice-scarf", reason: "Attack สูง — Scarf ทำให้เร็วแซงเกือบทั้งเกม" },
    { item: "life-orb", reason: "เซ็ต Dragon Dance ต้องการความแรงแบบเปลี่ยนท่าได้" },
  ],
  metagross: [
    { item: "assault-vest", reason: "เสริม Sp.Def ที่เป็นจุดอ่อน ให้ยืนแลกหมัดได้" },
    { item: "choice-band", reason: "Attack 135 + Band = Meteor Mash ทุบทะลุทุกอย่าง" },
  ],
  swampert: [
    { item: "leftovers", reason: "ตัวรับกายภาพ + วาง Stealth Rock — ต้องการความยืนระยะ" },
  ],
  milotic: [
    { item: "flame-orb", reason: "ติดเผาเองเพื่อกระตุ้น Marvel Scale (Defense +50%) และกันสถานะอื่น" },
    { item: "leftovers", reason: "สายกำแพง Recover ฟื้นต่อเนื่อง" },
  ],
  garchomp: [
    { item: "rocky-helmet", reason: "ล่อท่ากายภาพแล้วสะท้อนดาเมจ + Rough Skin บาดเพิ่ม" },
    { item: "choice-scarf", reason: "ความเร็ว 102 + Scarf แซง Dragon เกือบทุกตัว" },
    { item: "life-orb", reason: "เซ็ต Swords Dance สายบุกเต็มตัว" },
  ],
  lucario: [
    { item: "life-orb", reason: "สาย sweeper สองทาง (กายภาพ/พิเศษ) ต้องการพลังเสริมแบบยืดหยุ่น" },
    { item: "focus-sash", reason: "เปราะ — Sash ช่วยการันตีได้ตั้ง Swords Dance" },
  ],
  togekiss: [
    { item: "leftovers", reason: "สาย para-flinch (Thunder Wave + Air Slash) ยืนนานยิ่งโหด" },
    { item: "choice-scarf", reason: "แก้ Speed ช้า ใช้ Air Slash กดดันเร็วขึ้น" },
  ],
  rotom: [
    { item: "choice-scarf", reason: "ฟอร์มเครื่องใช้ไฟฟ้า (Wash/Heat) ใช้ Scarf รีเวนจ์ + Trick ก่อกวน" },
    { item: "leftovers", reason: "สาย pivot Volt Switch ยืนระยะ" },
  ],
  mamoswine: [
    { item: "focus-sash", reason: "ลีดวาง hazard + Ice Shard กันสวน — Sash การันตี 1 ฮิต" },
    { item: "life-orb", reason: "Ice/Ground โจมตีครอบคลุมมาก เสริมพลังให้ปิดเกมได้" },
  ],
  gliscor: [
    { item: "toxic-orb", reason: "Poison Heal ฟื้น HP 1/8 ต่อเทิร์นแทนที่จะเสีย — แกนหลักของตัวนี้" },
  ],

  // ─── Gen 5–7 staples ────────────────────────────────────────────────────────
  conkeldurr: [
    { item: "flame-orb", reason: "Guts + เผาตัวเอง = Attack +50% และไม่กลัวโดน burn จากศัตรู" },
  ],
  ferrothorn: [
    { item: "leftovers", reason: "กำแพงเหล็กวาง hazard — ฟื้น HP ต่อเนื่องคู่กับ Leech Seed" },
    { item: "rocky-helmet", reason: "Iron Barbs + Helmet = แตะทีเสีย 1/3 HP" },
  ],
  excadrill: [
    { item: "focus-sash", reason: "ลีด Stealth Rock + Rapid Spin — Sash กันโดนจบก่อนทำงาน" },
    { item: "choice-scarf", reason: "ในทีมพายุทราย Sand Rush + Scarf เร็วเกินทุกสิ่ง" },
  ],
  volcarona: [
    { item: "heavy-duty-boots", reason: "แพ้ Stealth Rock x4 — ขาดบูตแทบลงสนามไม่ได้" },
    { item: "leftovers", reason: "เซ็ต Quiver Dance หลายชั้นต้องการความยืนระยะ" },
  ],
  hydreigon: [
    { item: "choice-specs", reason: "Draco Meteor + Dark Pulse แรงจัดด้วย Specs" },
    { item: "leftovers", reason: "เซ็ต Nasty Plot ตั้งบูสต์เองแบบยืดหยุ่น" },
  ],
  breloom: [
    { item: "toxic-orb", reason: "Poison Heal ฟื้น HP ต่อเทิร์น + กันสถานะ — คอมโบประจำตัว" },
    { item: "focus-sash", reason: "Spore + Sash กดดันสุดๆ ตั้งแต่เทิร์นแรก" },
  ],
  amoonguss: [
    { item: "sitrus-berry", reason: "ตัวซัพพอร์ต VGC — ฟื้น 25% ทันทีเมื่อ HP ต่ำกว่าครึ่ง" },
    { item: "rocky-helmet", reason: "ล่อท่ากายภาพ + Spore ก่อกวน" },
  ],
  talonflame: [
    { item: "heavy-duty-boots", reason: "แพ้ Stealth Rock x4 — บูตจำเป็นมากสำหรับนกไฟ" },
  ],
  aegislash: [
    { item: "leftovers", reason: "สลับ Blade/Shield ด้วย King's Shield — ยืนระยะเล่นจังหวะ" },
    { item: "weakness-policy", reason: "ล่อให้ตีจุดอ่อนตอน Shield Forme แล้วสวนด้วยบูสต์ x2" },
  ],
  sylveon: [
    { item: "leftovers", reason: "สาย cleric (Wish/Heal Bell) ต้องยืนนาน" },
    { item: "choice-specs", reason: "Pixilate Hyper Voice แรงทะลุด้วย Specs" },
  ],
  hawlucha: [
    { item: "electric-seed", reason: "รับบูสต์ Defense จาก Electric Terrain แล้ว Unburden เพิ่ม Speed 2 เท่า" },
  ],
  mimikyu: [
    { item: "life-orb", reason: "Disguise กันฮิตแรกฟรี — ตั้ง Swords Dance แล้วกวาดด้วย Life Orb" },
  ],
  greninja: [
    { item: "choice-specs", reason: "Protean + Specs ทำให้ Hydro Pump/Dark Pulse แรงทะลุ" },
    { item: "life-orb", reason: "สาย mixed attacker เปลี่ยนท่าอิสระพร้อมพลังเสริม 30%" },
    { item: "focus-sash", reason: "เปราะ — Sash ช่วยให้ได้วาง Spikes หรือ Toxic Spikes ครบ" },
  ],
  toxapex: [
    { item: "black-sludge", reason: "ฟื้น HP เหมือน Leftovers สำหรับธาตุพิษ และลงโทษคนขโมยไอเทม" },
  ],
  kommo_o: [
    { item: "throat-spray", reason: "ใช้ Clangorous Soul/Clanging Scales แล้วได้ Sp.Atk +1 เพิ่มฟรี" },
  ],

  // ─── Gen 8 staples ──────────────────────────────────────────────────────────
  rillaboom: [
    { item: "assault-vest", reason: "Grassy Glide priority + Vest ทำให้แลกหมัดฝั่งพิเศษได้" },
    { item: "choice-band", reason: "Grassy Glide ใต้สนามหญ้า + Band = priority ที่แรงที่สุดท่าหนึ่ง" },
  ],
  cinderace: [
    { item: "heavy-duty-boots", reason: "Libero เปลี่ยนธาตุตลอด — บูตช่วยให้สลับเข้าออกบ่อยได้" },
    { item: "life-orb", reason: "Pyro Ball + ท่าครอบคลุม แรงขึ้น 30%" },
  ],
  inteleon: [
    { item: "choice-specs", reason: "Snipe Shot + Sp.Atk สูง ยิงแรงสุดด้วย Specs" },
    { item: "focus-sash", reason: "เปราะมาก — Sash ช่วยยิงได้อย่างน้อย 2 ครั้ง" },
  ],
  corviknight: [
    { item: "leftovers", reason: "กำแพงกายภาพ + Roost — Leftovers เพิ่มความยืนระยะ" },
    { item: "rocky-helmet", reason: "ลงโทษ U-turn และท่ากายภาพที่มาแตะ" },
  ],
  grimmsnarl: [
    { item: "light-clay", reason: "ตัวตั้งจอ (Reflect/Light Screen) ด้วย Prankster — Clay ยืดเหลือ 8 เทิร์น" },
  ],
  dragapult: [
    { item: "choice-specs", reason: "Speed 142 + Shadow Ball/Draco Meteor — สาย special sweeper" },
    { item: "choice-band", reason: "Dragon Darts สองฮิตกับ Band แรงเกินคาด" },
  ],
  urshifu: [
    { item: "choice-band", reason: "Wicked Blow/Surging Strikes คริการันตี ทะลุทุกบูสต์ — Band โหดสุด" },
    { item: "focus-sash", reason: "ใน VGC ช่วยรอดเทิร์นแรกแล้วสวนแรง" },
  ],
  ursaluna: [
    { item: "flame-orb", reason: "Guts + Facade = หมีที่ตีแรงที่สุดในเกม" },
  ],

  // ─── Gen 9 staples ──────────────────────────────────────────────────────────
  meowscarada: [
    { item: "choice-band", reason: "Flower Trick คริทุกครั้ง + Band = ทะลุแม้กระทั่งตัวบูสต์ Def" },
    { item: "focus-sash", reason: "ลีดเปราะ — Sash ช่วยวาง Spikes หรือ Knock Off ได้ครบ" },
  ],
  skeledirge: [
    { item: "heavy-duty-boots", reason: "ตัวรับสายไฟ/ผี — บูตกัน hazard ให้สลับเข้าบ่อยได้" },
    { item: "leftovers", reason: "Torch Song บูสต์เอง + Slack Off ยืนยาว" },
  ],
  quaquaval: [
    { item: "life-orb", reason: "Aqua Step บูสต์ Speed เอง — Life Orb เติมแรงให้กวาดทีม" },
  ],
  gholdengo: [
    { item: "air-balloon", reason: "ลอยหนีท่า Ground ที่เป็นจุดอ่อนหลัก + Good as Gold กันท่าสถานะ" },
    { item: "choice-scarf", reason: "Make It Rain + Scarf เป็นตัวรีเวนจ์/ปิดเกม" },
    { item: "leftovers", reason: "เซ็ต Nasty Plot + Recover ยืนระยะ" },
  ],
  annihilape: [
    { item: "leftovers", reason: "Rage Fist ยิ่งโดนตียิ่งแรง — Leftovers + Bulk Up ยืนสะสมพลัง" },
    { item: "choice-scarf", reason: "รีเวนจ์ด้วย Rage Fist ที่ชาร์จไว้แล้ว" },
  ],
  kingambit: [
    { item: "leftovers", reason: "Supreme Overlord ยิ่งเพื่อนล้มยิ่งแรง — ยืนท้ายเกมด้วย Leftovers" },
    { item: "black-glasses", reason: "เพิ่มพลัง Kowtow Cleave/Sucker Punch 20% โดยไม่ล็อกท่า" },
    { item: "assault-vest", reason: "แลกหมัดฝั่งพิเศษได้ดีขึ้นมาก" },
  ],
  garganacl: [
    { item: "leftovers", reason: "Salt Cure บั่น HP ศัตรูทุกเทิร์น — ตัวมันยืนนานสุดๆ ด้วย Leftovers" },
  ],
  dondozo: [
    { item: "leftovers", reason: "HP 150 + Unaware ไม่สนบูสต์ศัตรู — กำแพงกายภาพอันดับต้นๆ" },
  ],
  palafin: [
    { item: "choice-band", reason: "ร่าง Hero + Jet Punch priority + Band = ตีแรงทะลุ" },
    { item: "mystic-water", reason: "เพิ่มพลังท่าน้ำ 20% โดยไม่ล็อกท่า" },
  ],
  ceruledge: [
    { item: "focus-sash", reason: "ตั้ง Swords Dance ได้แน่นอนแล้วกวาดด้วย Bitter Blade" },
    { item: "leftovers", reason: "Bitter Blade ดูด HP — เสริมความยืนระยะ" },
  ],
  armarouge: [
    { item: "weakness-policy", reason: "ล่อให้ตีจุดอ่อนแล้วสวนด้วย Armor Cannon ที่บูสต์ x2" },
  ],
  baxcalibur: [
    { item: "heavy-duty-boots", reason: "แพ้ Stealth Rock — บูตช่วยให้ลงสนามบ่อยได้" },
    { item: "loaded-dice", reason: "Icicle Spear ออก 4-5 ฮิตเสมอ ทะลุ Focus Sash และ Substitute" },
  ],
  "flutter-mane": [
    { item: "booster-energy", reason: "กระตุ้น Protosynthesis บูสต์ Sp.Atk/Speed ทันทีโดยไม่ต้องพึ่งแดด" },
    { item: "choice-specs", reason: "Moonblast/Shadow Ball แรงสุดขีดด้วย Specs" },
  ],
  "iron-bundle": [
    { item: "booster-energy", reason: "กระตุ้น Quark Drive บูสต์ Speed ที่สูงอยู่แล้วให้ขาดลอย" },
  ],
  "roaring-moon": [
    { item: "booster-energy", reason: "บูสต์ Attack/Speed แล้วตั้ง Dragon Dance ต่อ — กวาดทีมได้เลย" },
  ],
  "iron-valiant": [
    { item: "booster-energy", reason: "บูสต์สเตตัสเด่นทันที — sweeper สองทางที่คาดเดายาก" },
  ],
  "great-tusk": [
    { item: "booster-energy", reason: "บูสต์ Attack/Speed สำหรับสายบุก" },
    { item: "leftovers", reason: "สาย Rapid Spin + กำแพงกายภาพ ยืนระยะยาว" },
  ],
  "iron-hands": [
    { item: "assault-vest", reason: "ชดเชย Sp.Def ต่ำ — แลกหมัดได้ทั้งสองฝั่งใน VGC" },
  ],
  "walking-wake": [
    { item: "booster-energy", reason: "กระตุ้น Protosynthesis โดยไม่ต้องรอแดด — Hydro Steam แรงจัด" },
  ],
  "iron-moth": [
    { item: "booster-energy", reason: "บูสต์ Sp.Atk/Speed — Fiery Dance กดดันต่อเนื่อง" },
  ],

  // ─── More classics ──────────────────────────────────────────────────────────
  tyranitar: [
    { item: "assault-vest", reason: "Sp.Def +50% รวมกับโบนัสพายุทราย — รับท่าพิเศษได้เหลือเชื่อ" },
    { item: "leftovers", reason: "ตัววาง Stealth Rock ที่ยืนนาน" },
    { item: "weakness-policy", reason: "จุดอ่อนเยอะ — ล่อให้ตีแล้วสวนด้วยบูสต์ x2" },
  ],
  dragonite: [
    { item: "heavy-duty-boots", reason: "กัน Stealth Rock เพื่อรักษา Multiscale ให้รับฮิตแรกแกร่ง" },
    { item: "choice-band", reason: "Extreme Speed + Band = priority สุดแรง" },
  ],
  heatran: [
    { item: "leftovers", reason: "ตัววาง hazard + กับดัก Magma Storm ต้องยืนระยะ" },
    { item: "air-balloon", reason: "ลอยหนีท่า Ground ที่เป็นจุดอ่อน x4" },
  ],
  magnezone: [
    { item: "air-balloon", reason: "ลอยหนีท่า Ground ระหว่างดัก Steel ด้วย Magnet Pull" },
    { item: "choice-specs", reason: "Sp.Atk 130 + Specs ยิงทะลุแม้แต่ตัวรับ" },
  ],
  azumarill: [
    { item: "choice-band", reason: "Huge Power + Band = Aqua Jet/Play Rough แรงระดับตำนาน" },
    { item: "sitrus-berry", reason: "เซ็ต Belly Drum — ฟื้น HP ทันทีหลังตัดเลือดครึ่งหนึ่ง" },
  ],
  clefable: [
    { item: "life-orb", reason: "Magic Guard ไม่เสีย HP จาก Life Orb — ได้พลัง 30% ฟรี" },
    { item: "leftovers", reason: "กำแพงสารพัดประโยชน์วาง Stealth Rock" },
  ],
  weavile: [
    { item: "heavy-duty-boots", reason: "แพ้ Stealth Rock — บูตช่วยให้กดดันได้ตลอดเกม" },
    { item: "choice-band", reason: "Triple Axel/Knock Off + Band ตีทะลุทุกอย่าง" },
  ],
  hippowdon: [
    { item: "leftovers", reason: "กำแพงกายภาพเรียกพายุทราย + Slack Off ยืนทั้งเกม" },
  ],
  slowbro: [
    { item: "leftovers", reason: "กำแพงกายภาพ Regenerator — ฟื้นทั้งตอนยืนและตอนสลับ" },
  ],
  slowking: [
    { item: "assault-vest", reason: "Regenerator + Vest = ฟองน้ำรับท่าพิเศษที่ฆ่าไม่ตาย" },
  ],
  goodra: [
    { item: "assault-vest", reason: "Sp.Def 150 + Vest = รับท่าพิเศษได้แทบทุกท่าในเกม" },
  ],
  whimsicott: [
    { item: "focus-sash", reason: "Prankster Tailwind ใน VGC — Sash การันตีได้เปิด Tailwind" },
  ],
  galvantula: [
    { item: "focus-sash", reason: "ลีดวาง Sticky Web — Sash กันโดนจบก่อนวางใย" },
  ],
  staraptor: [
    { item: "choice-band", reason: "Reckless + Brave Bird/Double-Edge + Band = แรงแบบแลกชีวิต" },
    { item: "choice-scarf", reason: "รีเวนจ์ด้วย Brave Bird ความเร็วสูง" },
  ],
  infernape: [
    { item: "focus-sash", reason: "ลีดวาง Stealth Rock + Taunt — Sash ช่วยทำงานครบ" },
    { item: "life-orb", reason: "สาย mixed attacker ตีได้สองฝั่ง" },
  ],
  empoleon: [
    { item: "leftovers", reason: "ตัวรับฝั่งพิเศษ + Roost — ธาตุ Steel/Water ต้านทานเยอะ" },
  ],
  flareon: [
    { item: "toxic-orb", reason: "Guts + Facade ช่วยชดเชย Attack ที่ใช้ยาก" },
  ],
  jolteon: [
    { item: "choice-specs", reason: "Speed สูง + Volt Switch — pivot สายยิงแรง" },
  ],
  vaporeon: [
    { item: "leftovers", reason: "สาย Wish ซัพพอร์ตทีม — ยืนนานด้วย HP สูง" },
  ],
  zoroark: [
    { item: "focus-sash", reason: "Illusion หลอกแล้วยิงแรง — Sash กันพลาด" },
    { item: "life-orb", reason: "เพิ่มแรง Nasty Plot sweep" },
  ],
  hariyama: [
    { item: "flame-orb", reason: "Guts + Close Combat ใน Trick Room โหดมาก" },
    { item: "assault-vest", reason: "HP สูงมาก + Vest รับท่าพิเศษ" },
  ],
  sableye: [
    { item: "leftovers", reason: "Prankster Will-O-Wisp/Recover ก่อกวนยืนระยะ" },
  ],
};

// Pokemon slugs with hyphens can't be object keys with hyphens in some spots above;
// normalize: kommo_o key is actually "kommo-o" in PokeAPI.
const NORMALIZED: Record<string, ItemRecommendation[]> = {};
for (const [key, recs] of Object.entries(ITEM_RECOMMENDATIONS)) {
  NORMALIZED[key.replace(/_/g, "-")] = recs;
}

const SPRITES_ITEM_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

export function getItemSpriteUrls(itemSlug: string): string[] {
  const def = ITEM_DEFS[itemSlug];
  const urls: string[] = [];
  if (def?.sprite) urls.push(def.sprite);
  urls.push(`${SPRITES_ITEM_BASE}/${itemSlug}.png`);
  urls.push(`https://www.serebii.net/itemdex/sprites/${itemSlug.replace(/-/g, "")}.png`);
  return urls;
}

export function getItemRecommendations(pokemonSlug: string) {
  const recs = NORMALIZED[pokemonSlug];
  if (!recs) return [];
  return recs
    .filter((r) => ITEM_DEFS[r.item])
    .map((r) => ({ ...r, def: ITEM_DEFS[r.item]! }));
}
