import { getDualTypeDefenses, TYPE_CHART } from "./type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

export type WeatherName = "none" | "rain" | "sun" | "sand" | "hail";

// ─── Ability data ─────────────────────────────────────────────────────────────

export const BATTLE_ABILITIES: Record<string, { nameEn: string; nameTh: string; descTh: string }> = {
  "levitate":       { nameEn: "Levitate",       nameTh: "ลอยตัว",            descTh: "ภูมิคุ้มกัน Ground" },
  "flash-fire":     { nameEn: "Flash Fire",      nameTh: "แฟลชไฟร์",         descTh: "ดูด Fire → บูสต์ Fire ×1.5" },
  "water-absorb":   { nameEn: "Water Absorb",    nameTh: "ดูดน้ำ",            descTh: "ดูด Water → ฟื้น 25% HP" },
  "volt-absorb":    { nameEn: "Volt Absorb",     nameTh: "ดูดไฟฟ้า",         descTh: "ดูด Electric → ฟื้น 25% HP" },
  "lightning-rod":  { nameEn: "Lightning Rod",   nameTh: "สายล่อฟ้า",        descTh: "ดูด Electric → SpAtk +1" },
  "storm-drain":    { nameEn: "Storm Drain",     nameTh: "ท่อระบาย",          descTh: "ดูด Water → SpAtk +1" },
  "sap-sipper":     { nameEn: "Sap Sipper",      nameTh: "ดูดน้ำเลี้ยง",     descTh: "ดูด Grass → Atk +1" },
  "wonder-guard":   { nameEn: "Wonder Guard",    nameTh: "วันเดอร์การ์ด",    descTh: "โดนเฉพาะท่า SE เท่านั้น" },
  "thick-fat":      { nameEn: "Thick Fat",       nameTh: "ไขมันหนา",         descTh: "Fire/Ice ดาเมจ ÷2" },
  "heatproof":      { nameEn: "Heatproof",       nameTh: "กันความร้อน",       descTh: "Fire ดาเมจ ÷2" },
  "dry-skin":       { nameEn: "Dry Skin",        nameTh: "หนังแห้ง",          descTh: "ดูด Water → ฟื้น HP; Fire ×1.25" },
  "huge-power":     { nameEn: "Huge Power",      nameTh: "พลังมหึมา",         descTh: "Atk ×2" },
  "pure-power":     { nameEn: "Pure Power",      nameTh: "พลังบริสุทธิ์",    descTh: "Atk ×2" },
  "hustle":         { nameEn: "Hustle",          nameTh: "ขยัน",              descTh: "Atk ×1.5, แม่นยำกายภาพ ×0.8" },
  "guts":           { nameEn: "Guts",            nameTh: "กล้าหาญ",           descTh: "เมื่อมีสถานะ: Atk ×1.5, ไม่โดนลดจากไฟ" },
  "marvel-scale":   { nameEn: "Marvel Scale",    nameTh: "เกล็ดมหัศจรรย์",   descTh: "เมื่อมีสถานะ: Def ×1.5" },
  "quick-feet":     { nameEn: "Quick Feet",      nameTh: "เท้าเร็ว",          descTh: "เมื่อมีสถานะ: Speed ×1.5" },
  "intimidate":     { nameEn: "Intimidate",      nameTh: "ขู่ขวัญ",           descTh: "เมื่อออกมา: Atk ฝ่ายตรงข้าม -1" },
  "speed-boost":    { nameEn: "Speed Boost",     nameTh: "บูสต์ความเร็ว",    descTh: "Speed +1 ทุกสิ้นเทิร์น" },
  "sturdy":         { nameEn: "Sturdy",          nameTh: "แข็งแกร่ง",         descTh: "รอดน็อคเอาท์ครั้งแรกจาก HP เต็ม" },
  "multiscale":     { nameEn: "Multiscale",      nameTh: "หลายชั้น",          descTh: "ดาเมจ ÷2 เมื่อ HP เต็ม" },
  "magic-guard":    { nameEn: "Magic Guard",     nameTh: "การ์ดเวทมนตร์",    descTh: "ไม่เสีย HP จากสถานะ/ไอเทม" },
  "poison-heal":    { nameEn: "Poison Heal",     nameTh: "รักษาพิษ",          descTh: "ฟื้น 1/8 HP ทุกเทิร์นเมื่อถูกพิษ" },
  "adaptability":   { nameEn: "Adaptability",    nameTh: "ปรับตัว",           descTh: "STAB ×2 แทน ×1.5" },
  "blaze":          { nameEn: "Blaze",           nameTh: "ลุกโชน",            descTh: "Fire ×1.5 เมื่อ HP ≤1/3" },
  "torrent":        { nameEn: "Torrent",         nameTh: "กระแสน้ำ",          descTh: "Water ×1.5 เมื่อ HP ≤1/3" },
  "overgrow":       { nameEn: "Overgrow",        nameTh: "เจริญงอกงาม",      descTh: "Grass ×1.5 เมื่อ HP ≤1/3" },
  "swarm":          { nameEn: "Swarm",           nameTh: "ฝูงแมลง",           descTh: "Bug ×1.5 เมื่อ HP ≤1/3" },
  "serene-grace":   { nameEn: "Serene Grace",    nameTh: "เกรซสงบ",           descTh: "โอกาสผลพิเศษ ×2" },
  "sheer-force":    { nameEn: "Sheer Force",     nameTh: "แรงสุทธิ์",         descTh: "ท่าที่มีผลพิเศษ: ดาเมจ ×1.3" },
  "iron-fist":      { nameEn: "Iron Fist",       nameTh: "กำปั้นเหล็ก",      descTh: "ท่าหมัด ×1.2" },
  "technician":     { nameEn: "Technician",      nameTh: "เทคนิเชียน",        descTh: "ท่าที่มีพลัง ≤60: ×1.5" },
  "tinted-lens":    { nameEn: "Tinted Lens",     nameTh: "เลนส์สี",           descTh: "ท่าที่ได้ผลน้อย: ×2" },
  "mold-breaker":   { nameEn: "Mold Breaker",    nameTh: "ทำลายแบบ",          descTh: "เพิกเฉยความสามารถของเป้าหมาย" },
  "no-guard":       { nameEn: "No Guard",        nameTh: "ไม่มีการ์ด",        descTh: "ท่าทั้งสองฝ่ายไม่พลาด" },
  "pressure":       { nameEn: "Pressure",        nameTh: "กดดัน",             descTh: "ฝ่ายตรงข้ามสูญเสีย 2 PP ต่อการใช้ท่า" },
  "download":       { nameEn: "Download",        nameTh: "ดาวน์โหลด",         descTh: "เมื่อออกมา: เพิ่ม Atk หรือ SpAtk" },
  "natural-cure":   { nameEn: "Natural Cure",    nameTh: "รักษาตามธรรมชาติ", descTh: "หายสถานะเมื่อสลับออก" },
  // Mega / G-Max abilities
  "aerilate":       { nameEn: "Aerilate",        nameTh: "แอโรเลต",           descTh: "ท่า Normal → Flying + ×1.2" },
  "pixilate":       { nameEn: "Pixilate",        nameTh: "พิกซิเลต",          descTh: "ท่า Normal → Fairy + ×1.2" },
  "refrigerate":    { nameEn: "Refrigerate",     nameTh: "รีฟริเจอเรต",      descTh: "ท่า Normal → Ice + ×1.2" },
  "galvanize":      { nameEn: "Galvanize",       nameTh: "กัลวาไนซ์",         descTh: "ท่า Normal → Electric + ×1.2" },
  "parental-bond":  { nameEn: "Parental Bond",   nameTh: "ผูกพันแม่ลูก",     descTh: "โจมตี 2 ครั้ง (ครั้งที่ 2 ×0.25)" },
  "tough-claws":    { nameEn: "Tough Claws",     nameTh: "กรงเล็บแกร่ง",     descTh: "ท่าสัมผัส ×1.33" },
  "mega-launcher":  { nameEn: "Mega Launcher",   nameTh: "เมก้าลอนเชอร์",    descTh: "ท่าคลื่น/ลูกกลม ×1.5" },
  "magic-bounce":   { nameEn: "Magic Bounce",    nameTh: "ดีดกลับเวทมนตร์",  descTh: "สะท้อนท่าสถานะกลับ" },
  "shadow-tag":     { nameEn: "Shadow Tag",      nameTh: "ดักเงา",            descTh: "ป้องกันการสลับออก (แสดงผลเท่านั้น)" },
  "sand-force":     { nameEn: "Sand Force",      nameTh: "แรงทราย",           descTh: "Rock/Ground/Steel ×1.3 ในพายุทราย" },
  "sand-stream":    { nameEn: "Sand Stream",     nameTh: "กระแสทราย",         descTh: "เรียกพายุทราย (กิจกรรมเสริม)" },
  "steadfast":      { nameEn: "Steadfast",       nameTh: "มั่นคง",            descTh: "เมื่อ Flinch: Speed +1" },
  "skill-link":     { nameEn: "Skill Link",      nameTh: "ทักษะเชื่อม",       descTh: "ท่าโจมตีหลายครั้ง → โดน 5 ครั้งเสมอ" },
  "delta-stream":   { nameEn: "Delta Stream",    nameTh: "สายลมเดลต้า",       descTh: "ลดความอ่อนแอของ Flying" },
  "scrappy":        { nameEn: "Scrappy",         nameTh: "แข็งกร้าว",         descTh: "Normal/Fighting โดน Ghost ได้" },
  "drought":        { nameEn: "Drought",         nameTh: "แสงแดดแผดเผา",     descTh: "Fire ×1.5, Water ×0.5" },
  "drizzle":        { nameEn: "Drizzle",         nameTh: "ฝนโปรย",            descTh: "Water ×1.5, Fire ×0.5" },
  "trace":          { nameEn: "Trace",           nameTh: "เลียนแบบ",          descTh: "คัดลอก Ability ของเป้าหมาย (แสดงผล)" },
  "insomnia":       { nameEn: "Insomnia",        nameTh: "นอนไม่หลับ",        descTh: "ภูมิคุ้มกัน Sleep" },
  "inner-focus":    { nameEn: "Inner Focus",     nameTh: "จิตใจแน่วแน่",     descTh: "ภูมิคุ้มกัน Flinch" },
  "cloud-nine":     { nameEn: "Cloud Nine",      nameTh: "เมฆเก้า",           descTh: "ยกเลิกผลของสภาพอากาศ" },
  "analytic":       { nameEn: "Analytic",        nameTh: "วิเคราะห์",          descTh: "เคลื่อนไหวทีหลัง: ดาเมจ ×1.3" },
  "swift-swim":     { nameEn: "Swift Swim",      nameTh: "ว่ายน้ำเร็ว",         descTh: "Speed ×2 ขณะฝนตก" },
  "shell-armor":    { nameEn: "Shell Armor",     nameTh: "เกราะเปลือก",         descTh: "ป้องกันการโจมตีคริติคอล" },
  "filter":         { nameEn: "Filter",          nameTh: "กรอง",                descTh: "ลดดาเมจท่าที่ได้ผลดีมาก ×0.75" },
  "prankster":      { nameEn: "Prankster",       nameTh: "ตัวหลอก",             descTh: "ท่าสถานะได้ Priority +1" },
  "strong-jaw":     { nameEn: "Strong Jaw",      nameTh: "กรามเหล็ก",           descTh: "ท่ากัด ×1.5 พลังโจมตี" },
  "solar-power":    { nameEn: "Solar Power",     nameTh: "พลังแสงอาทิตย์",      descTh: "SpAtk ×1.5 ขณะแดดออก แต่เสีย HP ทุกเทิร์น" },
  "snow-warning":   { nameEn: "Snow Warning",    nameTh: "เตือนหิมะ",            descTh: "เรียกพายุหิมะเมื่อออกมา" },
  "healer":         { nameEn: "Healer",          nameTh: "นักรักษา",             descTh: "30% โอกาสรักษาสถานะของพันธมิตร" },
  "chlorophyll":    { nameEn: "Chlorophyll",    nameTh: "คลอโรฟิลล์",           descTh: "Speed ×2 ขณะแดดออก" },
  "reckless":       { nameEn: "Reckless",       nameTh: "บ้าระห่ำ",              descTh: "ท่าที่มี recoil ดาเมจ ×1.2" },
  "moxie":          { nameEn: "Moxie",          nameTh: "มอกซี่",               descTh: "Atk +1 หลังจาก KO คู่ต่อสู้" },
  "contrary":       { nameEn: "Contrary",       nameTh: "ตรงข้าม",              descTh: "การเปลี่ยน stat stage กลับทิศ" },
  "unburden":       { nameEn: "Unburden",       nameTh: "ปลดภาระ",              descTh: "Speed ×2 เมื่อสูญเสียไอเทม" },
  "soul-heart":     { nameEn: "Soul-Heart",     nameTh: "จิตวิญญาณ",            descTh: "SpAtk +1 ทุกครั้งที่โปเกมอนล้ม" },
};

// ─── Item data ────────────────────────────────────────────────────────────────

export const HELD_ITEMS: Record<string, { nameEn: string; nameTh: string; descTh: string }> = {
  "leftovers":        { nameEn: "Leftovers",       nameTh: "เศษอาหาร",           descTh: "+1/16 HP ทุกสิ้นเทิร์น" },
  "black-sludge":     { nameEn: "Black Sludge",    nameTh: "โคลนดำ",             descTh: "Poison: +1/16, อื่น: −1/8 HP/เทิร์น" },
  "life-orb":         { nameEn: "Life Orb",        nameTh: "ลูกแก้วชีวิต",       descTh: "ดาเมจ ×1.3, เสีย 10% HP ทุกครั้งที่โจมตี" },
  "choice-band":      { nameEn: "Choice Band",     nameTh: "เข็มขัดเลือก",       descTh: "Atk ×1.5, ล็อคท่า" },
  "choice-specs":     { nameEn: "Choice Specs",    nameTh: "แว่นตาเลือก",        descTh: "SpAtk ×1.5, ล็อคท่า" },
  "choice-scarf":     { nameEn: "Choice Scarf",    nameTh: "ผ้าพันคอเลือก",      descTh: "Speed ×1.5, ล็อคท่า" },
  "focus-sash":       { nameEn: "Focus Sash",      nameTh: "สายรัดโฟกัส",        descTh: "รอดน็อคเอาท์ครั้งแรกจาก HP เต็ม" },
  "sitrus-berry":     { nameEn: "Sitrus Berry",    nameTh: "ผลไม้ซิตรัส",        descTh: "ฟื้น 25% HP เมื่อ HP ≤50%" },
  "lum-berry":        { nameEn: "Lum Berry",       nameTh: "ผลไม้ลัม",           descTh: "รักษาสถานะครั้งเดียว" },
  "rocky-helmet":     { nameEn: "Rocky Helmet",    nameTh: "หมวกหิน",            descTh: "ถูกโจมตีสัมผัส: ผู้โจมตีเสีย 1/6 HP" },
  "assault-vest":     { nameEn: "Assault Vest",    nameTh: "เสื้อเกราะกั้น",     descTh: "SpDef ×1.5, ใช้ได้เฉพาะท่าโจมตี" },
  "eviolite":         { nameEn: "Eviolite",        nameTh: "อีโวไลต์",           descTh: "Def+SpDef ×1.5" },
  "shell-bell":       { nameEn: "Shell Bell",      nameTh: "กระดิ่งเปลือก",      descTh: "ฟื้น 1/8 ของดาเมจที่ทำ" },
  "flame-orb":        { nameEn: "Flame Orb",       nameTh: "ลูกแก้วเปลวไฟ",     descTh: "ถูกเผาหลังสิ้นเทิร์น" },
  "toxic-orb":        { nameEn: "Toxic Orb",       nameTh: "ลูกแก้วพิษ",         descTh: "ถูกวางพิษหลังสิ้นเทิร์น" },
  "weakness-policy":  { nameEn: "Weakness Policy", nameTh: "นโยบายจุดอ่อน",     descTh: "โดนท่า SE: +2 Atk+SpAtk" },
  "muscle-band":      { nameEn: "Muscle Band",     nameTh: "สายรัดกล้าม",        descTh: "ดาเมจกายภาพ ×1.1" },
  "wise-glasses":     { nameEn: "Wise Glasses",    nameTh: "แว่นตาปราชญ์",       descTh: "ดาเมจพิเศษ ×1.1" },
  "expert-belt":      { nameEn: "Expert Belt",     nameTh: "เข็มขัดผู้เชี่ยวชาญ", descTh: "ท่า SE: ดาเมจ ×1.2" },
  "air-balloon":      { nameEn: "Air Balloon",     nameTh: "บอลลูนลม",           descTh: "ภูมิคุ้มกัน Ground จนกว่าจะถูกโจมตี" },
};

// ─── Berry data ───────────────────────────────────────────────────────────────

export const BERRIES: Record<string, { nameTh: string; descTh: string }> = {
  // Healing berries
  "oran-berry":    { nameTh: "ผลไม้โอราน",   descTh: "ฟื้น 10 HP เมื่อ HP ≤50%" },
  "figy-berry":    { nameTh: "ผลไม้ฟิกกี้",  descTh: "ฟื้น 1/3 HP เมื่อ HP ≤25%" },
  "wiki-berry":    { nameTh: "ผลไม้วิกิ",    descTh: "ฟื้น 1/3 HP เมื่อ HP ≤25%" },
  "mago-berry":    { nameTh: "ผลไม้มาโก",    descTh: "ฟื้น 1/3 HP เมื่อ HP ≤25%" },
  "aguav-berry":   { nameTh: "ผลไม้อากวาฟ",  descTh: "ฟื้น 1/3 HP เมื่อ HP ≤25%" },
  "iapapa-berry":  { nameTh: "ผลไม้อาปาปา",  descTh: "ฟื้น 1/3 HP เมื่อ HP ≤25%" },
  // Status cure berries
  "cheri-berry":   { nameTh: "ผลไม้เชอรี่",  descTh: "รักษา Paralysis" },
  "chesto-berry":  { nameTh: "ผลไม้เชสโต",   descTh: "รักษา Sleep" },
  "pecha-berry":   { nameTh: "ผลไม้เพชา",    descTh: "รักษา Poison" },
  "rawst-berry":   { nameTh: "ผลไม้รอสต์",   descTh: "รักษา Burn" },
  "aspear-berry":  { nameTh: "ผลไม้แอสเพียร์", descTh: "รักษา Freeze" },
  // Stat-boost pinch berries (activate at ≤25% HP)
  "liechi-berry":  { nameTh: "ผลไม้ลิชี่",   descTh: "Atk +1 เมื่อ HP ≤25%" },
  "petaya-berry":  { nameTh: "ผลไม้เปตายา",  descTh: "SpAtk +1 เมื่อ HP ≤25%" },
  "salac-berry":   { nameTh: "ผลไม้ซาแลค",   descTh: "Speed +1 เมื่อ HP ≤25%" },
  "apicot-berry":  { nameTh: "ผลไม้แอปปิคอต", descTh: "SpDef +1 เมื่อ HP ≤25%" },
  "ganlon-berry":  { nameTh: "ผลไม้แกนลอน",  descTh: "Def +1 เมื่อ HP ≤25%" },
  "starf-berry":   { nameTh: "ผลไม้สตาร์ฟ",  descTh: "สถิติสุ่ม +2 เมื่อ HP ≤25%" },
  "micle-berry":   { nameTh: "ผลไม้ไมเคิล",  descTh: "แม่นยำ +1 เมื่อ HP ≤25%" },
  // Type-resist berries (halve SE damage of that type)
  "occa-berry":    { nameTh: "ผลไม้อ็อกก้า",   descTh: "ลดดาเมจ Fire ×½ (SE)" },
  "passho-berry":  { nameTh: "ผลไม้แพสโชว์",  descTh: "ลดดาเมจ Water ×½ (SE)" },
  "wacan-berry":   { nameTh: "ผลไม้วาแคน",    descTh: "ลดดาเมจ Electric ×½ (SE)" },
  "rindo-berry":   { nameTh: "ผลไม้รินโด",    descTh: "ลดดาเมจ Grass ×½ (SE)" },
  "yache-berry":   { nameTh: "ผลไม้ยาเชะ",    descTh: "ลดดาเมจ Ice ×½ (SE)" },
  "chople-berry":  { nameTh: "ผลไม้ชอปเปิล",  descTh: "ลดดาเมจ Fighting ×½ (SE)" },
  "kebia-berry":   { nameTh: "ผลไม้คีเบีย",   descTh: "ลดดาเมจ Poison ×½ (SE)" },
  "shuca-berry":   { nameTh: "ผลไม้ชูก้า",    descTh: "ลดดาเมจ Ground ×½ (SE)" },
  "coba-berry":    { nameTh: "ผลไม้โคบา",     descTh: "ลดดาเมจ Flying ×½ (SE)" },
  "payapa-berry":  { nameTh: "ผลไม้ปายาปา",   descTh: "ลดดาเมจ Psychic ×½ (SE)" },
  "tanga-berry":   { nameTh: "ผลไม้ตังก้า",   descTh: "ลดดาเมจ Bug ×½ (SE)" },
  "charti-berry":  { nameTh: "ผลไม้ชาร์ตี้",  descTh: "ลดดาเมจ Rock ×½ (SE)" },
  "kasib-berry":   { nameTh: "ผลไม้คาซีบ",    descTh: "ลดดาเมจ Ghost ×½ (SE)" },
  "haban-berry":   { nameTh: "ผลไม้ฮาบัน",    descTh: "ลดดาเมจ Dragon ×½ (SE)" },
  "colbur-berry":  { nameTh: "ผลไม้โคลเบอร์", descTh: "ลดดาเมจ Dark ×½ (SE)" },
  "babiri-berry":  { nameTh: "ผลไม้บาบิรี",   descTh: "ลดดาเมจ Steel ×½ (SE)" },
  "roseli-berry":  { nameTh: "ผลไม้โรเซลี",   descTh: "ลดดาเมจ Fairy ×½ (SE)" },
  "chilan-berry":  { nameTh: "ผลไม้ชิลัน",    descTh: "ลดดาเมจ Normal ×½" },
};

// Berry slug that resists each type (used in rollDamage)
const RESIST_BERRY_FOR: Partial<Record<PokemonTypeName, string>> = {
  fire: "occa-berry", water: "passho-berry", electric: "wacan-berry",
  grass: "rindo-berry", ice: "yache-berry", fighting: "chople-berry",
  poison: "kebia-berry", ground: "shuca-berry", flying: "coba-berry",
  psychic: "payapa-berry", bug: "tanga-berry", rock: "charti-berry",
  ghost: "kasib-berry", dragon: "haban-berry", dark: "colbur-berry",
  steel: "babiri-berry", fairy: "roseli-berry", normal: "chilan-berry",
};

// ─── Mega Evolution data ──────────────────────────────────────────────────────

export interface MegaFormData {
  nameEn: string; nameTh: string;
  types: PokemonTypeName[]; ability: string; spriteId: number;
  atk: number; def: number; spAtk: number; spDef: number; speed: number;
}

export const MEGA_STONE_ITEMS: Record<string, { nameTh: string; megaSlug: string }> = {
  "venusaurite":      { nameTh: "หินเวนูซาร์ไรต์",    megaSlug: "venusaur-mega" },
  "charizardite-x":   { nameTh: "หินชาริซาร์ดไรต์ X",  megaSlug: "charizard-mega-x" },
  "charizardite-y":   { nameTh: "หินชาริซาร์ดไรต์ Y",  megaSlug: "charizard-mega-y" },
  "blastoisinite":    { nameTh: "หินบลาสทัวส์ไนต์",   megaSlug: "blastoise-mega" },
  "alakazite":        { nameTh: "หินอาลาคาไซต์",      megaSlug: "alakazam-mega" },
  "gengarite":        { nameTh: "หินเกงการ์ไรต์",     megaSlug: "gengar-mega" },
  "kangaskhanite":    { nameTh: "หินแคงกัสคานไรต์",   megaSlug: "kangaskhan-mega" },
  "pinsirite":        { nameTh: "หินพินสิรไรต์",       megaSlug: "pinsir-mega" },
  "gyaradosite":      { nameTh: "หินกาย่าราดอสไซต์",  megaSlug: "gyarados-mega" },
  "aerodactylite":    { nameTh: "หินแอโรแดคทิลไรต์",  megaSlug: "aerodactyl-mega" },
  "mewtwonite-x":     { nameTh: "หินมิวทูไนต์ X",     megaSlug: "mewtwo-mega-x" },
  "mewtwonite-y":     { nameTh: "หินมิวทูไนต์ Y",     megaSlug: "mewtwo-mega-y" },
  "ampharosite":      { nameTh: "หินแอมฟาโรสไซต์",   megaSlug: "ampharos-mega" },
  "scizorite":        { nameTh: "หินไซซอร์ไรต์",      megaSlug: "scizor-mega" },
  "heracronite":      { nameTh: "หินเฮราครอนไนต์",    megaSlug: "heracross-mega" },
  "tyranitarite":     { nameTh: "หินไทรานิทาร์ไรต์",  megaSlug: "tyranitar-mega" },
  "blazikenite":      { nameTh: "หินเบลซิเคนไนต์",    megaSlug: "blaziken-mega" },
  "gardevoirite":     { nameTh: "หินการ์ดิวัวร์ไรต์",  megaSlug: "gardevoir-mega" },
  "absolite":         { nameTh: "หินแอปซอลไลต์",      megaSlug: "absol-mega" },
  "garchompite":      { nameTh: "หินการ์ชอมพ์ไพต์",   megaSlug: "garchomp-mega" },
  "lucarionite":      { nameTh: "หินลูคาริโอไนต์",     megaSlug: "lucario-mega" },
  "salamencite":      { nameTh: "หินซาลาเมนซ์ไซต์",   megaSlug: "salamence-mega" },
  "metagrossite":     { nameTh: "หินเมตากรอสไซต์",    megaSlug: "metagross-mega" },
  "rayquazite":       { nameTh: "หินเรควาซ่าไรต์",     megaSlug: "rayquaza-mega" },
  "lopunnite":        { nameTh: "หินโลปันนีไนต์",      megaSlug: "lopunny-mega" },
  // XY megas (missing)
  "houndoominite":    { nameTh: "หินเฮาน์ดูมไนต์",     megaSlug: "houndoom-mega" },
  "mawilite":         { nameTh: "หินมาวิลไลต์",         megaSlug: "mawile-mega" },
  "aggronite":        { nameTh: "หินแอกกรอนไนต์",       megaSlug: "aggron-mega" },
  "medichamite":      { nameTh: "หินเมดิแชมไรต์",       megaSlug: "medicham-mega" },
  "manectite":        { nameTh: "หินมาเนคไทต์",         megaSlug: "manectric-mega" },
  "banettite":        { nameTh: "หินบาเนตไทต์",         megaSlug: "banette-mega" },
  "glalitite":        { nameTh: "หินกลาลีไทต์",         megaSlug: "glalie-mega" },
  "abomasite":        { nameTh: "หินอาโบมาไซต์",        megaSlug: "abomasnow-mega" },
  // ORAS megas
  "beedrillite":      { nameTh: "หินบีดริลไลต์",        megaSlug: "beedrill-mega" },
  "pidgeotite":       { nameTh: "หินพิดจิออตไรต์",      megaSlug: "pidgeot-mega" },
  "slowbronite":      { nameTh: "หินสโลว์โบรไนต์",      megaSlug: "slowbro-mega" },
  "steelixite":       { nameTh: "หินสตีลิกซ์ไรต์",      megaSlug: "steelix-mega" },
  "sceptilite":       { nameTh: "หินเซปไทลไรต์",        megaSlug: "sceptile-mega" },
  "swampertite":      { nameTh: "หินสวอมเพิร์ทไรต์",    megaSlug: "swampert-mega" },
  "sablenite":        { nameTh: "หินเซบลีไนต์",         megaSlug: "sableye-mega" },
  "sharpedonite":     { nameTh: "หินชาร์พีโดไนต์",      megaSlug: "sharpedo-mega" },
  "cameruptite":      { nameTh: "หินแคเมรัปไทต์",       megaSlug: "camerupt-mega" },
  "altarianite":      { nameTh: "หินอัลทาเรียไนต์",     megaSlug: "altaria-mega" },
  "latiasite":        { nameTh: "หินลาติอัสไรต์",        megaSlug: "latias-mega" },
  "latiosite":        { nameTh: "หินลาติออสไรต์",        megaSlug: "latios-mega" },
  "galladite":        { nameTh: "หินกัลเลดไรต์",        megaSlug: "gallade-mega" },
  "diancite":         { nameTh: "หินไดแอนไซต์",         megaSlug: "diancie-mega" },
  "audinite":         { nameTh: "หินออดิโนไรต์",         megaSlug: "audino-mega" },
  // Legends Z-A megas
  "greninjite":       { nameTh: "หินเกรนินจาไรต์",       megaSlug: "greninja-mega" },
  "raichunite-x":     { nameTh: "หินไรชูไนต์ X",          megaSlug: "raichu-mega-x" },
  "raichunite-y":     { nameTh: "หินไรชูไนต์ Y",          megaSlug: "raichu-mega-y" },
  "clefablite":       { nameTh: "หินคลีฟฟาไบลต์",         megaSlug: "clefable-mega" },
  "victreebelite":    { nameTh: "หินวิคทรีเบไลต์",        megaSlug: "victreebel-mega" },
  "starminite":       { nameTh: "หินสตาร์มิไนต์",         megaSlug: "starmie-mega" },
  "dragoninite":      { nameTh: "หินดราโกไนต์ไนต์",       megaSlug: "dragonite-mega" },
  "meganiumite":      { nameTh: "หินเมกาเนียมไรต์",       megaSlug: "meganium-mega" },
  "feraligite":       { nameTh: "หินเฟรารีแกไรต์",        megaSlug: "feraligatr-mega" },
  "skarmorite":       { nameTh: "หินสกาเมอรีไรต์",        megaSlug: "skarmory-mega" },
  "chimechoite":      { nameTh: "หินชิเมโชไรต์",          megaSlug: "chimecho-mega" },
  "absolzite":        { nameTh: "หินแอปซอลไซต์ Z",        megaSlug: "absol-mega-z" },
  "staraptite":       { nameTh: "หินสตาแรปไทต์",          megaSlug: "staraptor-mega" },
  "garchompzite":     { nameTh: "หินการ์ชอมพ์ไซต์ Z",     megaSlug: "garchomp-mega-z" },
  "lucarionzite":     { nameTh: "หินลูคาริโอไนต์ Z",      megaSlug: "lucario-mega-z" },
  "froslassite":      { nameTh: "หินโฟรสแล็สไซต์",        megaSlug: "froslass-mega" },
  "heatranite":       { nameTh: "หินฮีทแรนไรต์",          megaSlug: "heatran-mega" },
  "darkraite":        { nameTh: "หินดาร์คไรต์",            megaSlug: "darkrai-mega" },
  "emboarite":        { nameTh: "หินเอ็มโบร์ไรต์",        megaSlug: "emboar-mega" },
  "excadrite":        { nameTh: "หินเอ็กซ์คาไดรต์",       megaSlug: "excadrill-mega" },
  "scolipite":        { nameTh: "หินสโคลิไพต์",            megaSlug: "scolipede-mega" },
  "scraftinite":      { nameTh: "หินสแครฟทินไรต์",        megaSlug: "scrafty-mega" },
  "eelektrossite":    { nameTh: "หินอีเล็กตรอสไซต์",       megaSlug: "eelektross-mega" },
  "chandelurite":     { nameTh: "หินแชนเดลูไรต์",          megaSlug: "chandelure-mega" },
  "golurkite":        { nameTh: "หินโกลเรอคไรต์",          megaSlug: "golurk-mega" },
  "chesnaughtite":    { nameTh: "หินเชสเนาท์ไรต์",         megaSlug: "chesnaught-mega" },
  "delphoxite":       { nameTh: "หินเดลฟอกซ์ไรต์",         megaSlug: "delphox-mega" },
  "pyroarite":        { nameTh: "หินไพโรอาร์ไรต์",         megaSlug: "pyroar-mega" },
  "floettite":        { nameTh: "หินโฟลเอตต์ไรต์",         megaSlug: "floette-mega" },
  "meowstite":        { nameTh: "หินมีออสทิคไรต์",          megaSlug: "meowstic-mega" },
  "malamarite":       { nameTh: "หินมาลาม่าไรต์",           megaSlug: "malamar-mega" },
  "barbaracite":      { nameTh: "หินบาร์บาร็อคไรต์",        megaSlug: "barbaracle-mega" },
  "dragalgite":       { nameTh: "หินดราแกลจ์ไรต์",          megaSlug: "dragalge-mega" },
  "hawluchanite":     { nameTh: "หินฮอว์ลูชาไนต์",          megaSlug: "hawlucha-mega" },
  "zygardite":        { nameTh: "หินไซการ์ดไรต์",            megaSlug: "zygarde-mega" },
  "crabominite":      { nameTh: "หินแคร็บโอมินไรต์",        megaSlug: "crabominable-mega" },
  "golisopodite":     { nameTh: "หินโกลิโซพอดไรต์",         megaSlug: "golisopod-mega" },
  "drampanite":       { nameTh: "หินดรัมปาไนต์",             megaSlug: "drampa-mega" },
  "magearite":        { nameTh: "หินเมเกียร์นาไรต์",         megaSlug: "magearna-mega" },
  "zeraorite":        { nameTh: "หินเซราโอร่าไรต์",           megaSlug: "zeraora-mega" },
  "falinksite":       { nameTh: "หินเฟลินกส์ไรต์",            megaSlug: "falinks-mega" },
  "scovillainite":    { nameTh: "หินสโควิลเลนไรต์",           megaSlug: "scovillain-mega" },
  "glimmorite":       { nameTh: "หินกลิมมอร่าไรต์",           megaSlug: "glimmora-mega" },
  "tatsugirite":      { nameTh: "หินทัตซึกิริไรต์",            megaSlug: "tatsugiri-mega" },
  "baxcalibrite":     { nameTh: "หินแบ็กซ์แคลิเบอร์ไรต์",    megaSlug: "baxcalibur-mega" },
};

export const MEGA_DATA: Record<string, MegaFormData> = {
  "venusaur-mega":     { nameEn: "Mega Venusaur",   nameTh: "เมก้า เฟรียซอร์",    types: ["grass","poison"],   ability: "thick-fat",      spriteId: 10033, atk: 100, def: 123, spAtk: 122, spDef: 120, speed: 80 },
  "charizard-mega-x":  { nameEn: "Mega Charizard X",nameTh: "เมก้า ชาริซาร์ด X",  types: ["fire","dragon"],    ability: "tough-claws",    spriteId: 10034, atk: 130, def: 111, spAtk: 130, spDef: 85,  speed: 100 },
  "charizard-mega-y":  { nameEn: "Mega Charizard Y",nameTh: "เมก้า ชาริซาร์ด Y",  types: ["fire","flying"],    ability: "drought",        spriteId: 10035, atk: 104, def: 78,  spAtk: 159, spDef: 115, speed: 100 },
  "blastoise-mega":    { nameEn: "Mega Blastoise",  nameTh: "เมก้า บลาสทัวส์",    types: ["water"],            ability: "mega-launcher",  spriteId: 10036, atk: 103, def: 120, spAtk: 135, spDef: 115, speed: 78 },
  "alakazam-mega":     { nameEn: "Mega Alakazam",   nameTh: "เมก้า อาลาคาแซม",    types: ["psychic"],          ability: "trace",          spriteId: 10037, atk: 50,  def: 65,  spAtk: 175, spDef: 95,  speed: 150 },
  "gengar-mega":       { nameEn: "Mega Gengar",     nameTh: "เมก้า เกงการ์",       types: ["ghost","poison"],   ability: "shadow-tag",     spriteId: 10038, atk: 65,  def: 80,  spAtk: 170, spDef: 95,  speed: 130 },
  "kangaskhan-mega":   { nameEn: "Mega Kangaskhan", nameTh: "เมก้า แคงกัสคาน",    types: ["normal"],           ability: "parental-bond",  spriteId: 10039, atk: 125, def: 100, spAtk: 60,  spDef: 100, speed: 100 },
  "pinsir-mega":       { nameEn: "Mega Pinsir",     nameTh: "เมก้า พินสิร์",       types: ["bug","flying"],     ability: "aerilate",       spriteId: 10040, atk: 155, def: 120, spAtk: 65,  spDef: 90,  speed: 105 },
  "gyarados-mega":     { nameEn: "Mega Gyarados",   nameTh: "เมก้า กาย่าราดอส",   types: ["water","dark"],     ability: "mold-breaker",   spriteId: 10041, atk: 155, def: 109, spAtk: 70,  spDef: 130, speed: 81 },
  "aerodactyl-mega":   { nameEn: "Mega Aerodactyl", nameTh: "เมก้า แอโรแดคทิล",   types: ["rock","flying"],    ability: "tough-claws",    spriteId: 10042, atk: 135, def: 85,  spAtk: 70,  spDef: 95,  speed: 150 },
  "mewtwo-mega-x":     { nameEn: "Mega Mewtwo X",   nameTh: "เมก้า มิวทู X",       types: ["psychic","fighting"],ability:"steadfast",      spriteId: 10043, atk: 190, def: 100, spAtk: 154, spDef: 100, speed: 130 },
  "mewtwo-mega-y":     { nameEn: "Mega Mewtwo Y",   nameTh: "เมก้า มิวทู Y",       types: ["psychic"],          ability: "insomnia",       spriteId: 10044, atk: 150, def: 70,  spAtk: 194, spDef: 120, speed: 140 },
  "ampharos-mega":     { nameEn: "Mega Ampharos",   nameTh: "เมก้า แอมฟาโรส",     types: ["electric","dragon"],ability: "mold-breaker",   spriteId: 10045, atk: 95,  def: 105, spAtk: 165, spDef: 110, speed: 45 },
  "scizor-mega":       { nameEn: "Mega Scizor",     nameTh: "เมก้า ไซซอร์",        types: ["bug","steel"],      ability: "technician",     spriteId: 10046, atk: 150, def: 140, spAtk: 65,  spDef: 100, speed: 75 },
  "heracross-mega":    { nameEn: "Mega Heracross",  nameTh: "เมก้า เฮราครอส",      types: ["bug","fighting"],   ability: "skill-link",     spriteId: 10047, atk: 185, def: 115, spAtk: 40,  spDef: 105, speed: 75 },
  "tyranitar-mega":    { nameEn: "Mega Tyranitar",  nameTh: "เมก้า ไทรานิทาร์",   types: ["rock","dark"],      ability: "sand-stream",    spriteId: 10049, atk: 164, def: 150, spAtk: 95,  spDef: 120, speed: 71 },
  "blaziken-mega":     { nameEn: "Mega Blaziken",   nameTh: "เมก้า เบลซิเคน",      types: ["fire","fighting"],  ability: "speed-boost",    spriteId: 10050, atk: 160, def: 80,  spAtk: 130, spDef: 80,  speed: 100 },
  "gardevoir-mega":    { nameEn: "Mega Gardevoir",  nameTh: "เมก้า การ์ดิวัวร์",   types: ["psychic","fairy"],  ability: "pixilate",       spriteId: 10051, atk: 85,  def: 65,  spAtk: 165, spDef: 135, speed: 100 },
  "absol-mega":        { nameEn: "Mega Absol",      nameTh: "เมก้า แอปซอล",        types: ["dark"],             ability: "magic-bounce",   spriteId: 10057, atk: 150, def: 60,  spAtk: 115, spDef: 60,  speed: 115 },
  "garchomp-mega":     { nameEn: "Mega Garchomp",   nameTh: "เมก้า การ์ชอมพ์",    types: ["dragon","ground"],  ability: "sand-force",     spriteId: 10058, atk: 170, def: 115, spAtk: 120, spDef: 95,  speed: 92 },
  "lucario-mega":      { nameEn: "Mega Lucario",    nameTh: "เมก้า ลูคาริโอ",      types: ["fighting","steel"], ability: "adaptability",   spriteId: 10059, atk: 145, def: 88,  spAtk: 140, spDef: 70,  speed: 112 },
  "salamence-mega":    { nameEn: "Mega Salamence",  nameTh: "เมก้า ซาลาเมนซ์",    types: ["dragon","flying"],  ability: "aerilate",       spriteId: 10087, atk: 145, def: 130, spAtk: 120, spDef: 90,  speed: 120 },
  "metagross-mega":    { nameEn: "Mega Metagross",  nameTh: "เมก้า เมตากรอส",     types: ["steel","psychic"],  ability: "tough-claws",    spriteId: 10088, atk: 145, def: 150, spAtk: 105, spDef: 110, speed: 110 },
  "rayquaza-mega":     { nameEn: "Mega Rayquaza",   nameTh: "เมก้า เรควาซ่า",      types: ["dragon","flying"],  ability: "delta-stream",   spriteId: 10090, atk: 180, def: 100, spAtk: 180, spDef: 100, speed: 115 },
  "lopunny-mega":      { nameEn: "Mega Lopunny",    nameTh: "เมก้า โลปันนี",        types: ["normal","fighting"],ability: "scrappy",        spriteId: 10073, atk: 136, def: 94,  spAtk: 54,  spDef: 96,  speed: 135 },
  // XY megas (missing)
  "houndoom-mega":    { nameEn: "Mega Houndoom",   nameTh: "เมก้า เฮาน์ดูม",      types: ["fire","dark"],      ability: "solar-power",    spriteId: 10048, atk: 90,  def: 52,  spAtk: 140, spDef: 95,  speed: 115 },
  "mawile-mega":      { nameEn: "Mega Mawile",     nameTh: "เมก้า มาวิล",          types: ["steel","fairy"],    ability: "huge-power",     spriteId: 10052, atk: 105, def: 125, spAtk: 55,  spDef: 95,  speed: 50 },
  "aggron-mega":      { nameEn: "Mega Aggron",     nameTh: "เมก้า แอกกรอน",       types: ["steel"],            ability: "filter",         spriteId: 10053, atk: 140, def: 230, spAtk: 60,  spDef: 80,  speed: 50 },
  "medicham-mega":    { nameEn: "Mega Medicham",   nameTh: "เมก้า เมดิแชม",        types: ["fighting","psychic"],ability:"pure-power",     spriteId: 10054, atk: 100, def: 85,  spAtk: 80,  spDef: 85,  speed: 100 },
  "manectric-mega":   { nameEn: "Mega Manectric",  nameTh: "เมก้า มาเนคทริค",     types: ["electric"],         ability: "intimidate",     spriteId: 10055, atk: 75,  def: 80,  spAtk: 135, spDef: 80,  speed: 135 },
  "banette-mega":     { nameEn: "Mega Banette",    nameTh: "เมก้า บาเนต",          types: ["ghost"],            ability: "prankster",      spriteId: 10056, atk: 165, def: 75,  spAtk: 93,  spDef: 83,  speed: 75 },
  "glalie-mega":      { nameEn: "Mega Glalie",     nameTh: "เมก้า กลาลี",          types: ["ice"],              ability: "refrigerate",    spriteId: 10071, atk: 120, def: 80,  spAtk: 120, spDef: 80,  speed: 100 },
  "abomasnow-mega":   { nameEn: "Mega Abomasnow",  nameTh: "เมก้า อาโบมาสโนว์",   types: ["grass","ice"],      ability: "snow-warning",   spriteId: 10060, atk: 132, def: 105, spAtk: 132, spDef: 105, speed: 30 },
  // ORAS megas
  "beedrill-mega":    { nameEn: "Mega Beedrill",   nameTh: "เมก้า บีดริล",         types: ["bug","poison"],     ability: "adaptability",   spriteId: 10067, atk: 150, def: 40,  spAtk: 15,  spDef: 80,  speed: 145 },
  "pidgeot-mega":     { nameEn: "Mega Pidgeot",    nameTh: "เมก้า พิดจิออต",       types: ["normal","flying"],  ability: "no-guard",       spriteId: 10069, atk: 80,  def: 80,  spAtk: 135, spDef: 80,  speed: 121 },
  "slowbro-mega":     { nameEn: "Mega Slowbro",    nameTh: "เมก้า สโลว์โบร",       types: ["water","psychic"],  ability: "shell-armor",    spriteId: 10070, atk: 75,  def: 180, spAtk: 130, spDef: 80,  speed: 30 },
  "steelix-mega":     { nameEn: "Mega Steelix",    nameTh: "เมก้า สตีลิกซ์",       types: ["steel","ground"],   ability: "sand-force",     spriteId: 10064, atk: 125, def: 230, spAtk: 55,  spDef: 65,  speed: 30 },
  "sceptile-mega":    { nameEn: "Mega Sceptile",   nameTh: "เมก้า เซปไทล์",        types: ["grass","dragon"],   ability: "lightning-rod",  spriteId: 10065, atk: 110, def: 75,  spAtk: 145, spDef: 85,  speed: 145 },
  "swampert-mega":    { nameEn: "Mega Swampert",   nameTh: "เมก้า สวอมเพิร์ท",    types: ["water","ground"],   ability: "swift-swim",     spriteId: 10066, atk: 150, def: 110, spAtk: 95,  spDef: 110, speed: 70 },
  "sableye-mega":     { nameEn: "Mega Sableye",    nameTh: "เมก้า เซบลี",          types: ["dark","ghost"],     ability: "magic-bounce",   spriteId: 10063, atk: 85,  def: 125, spAtk: 80,  spDef: 115, speed: 20 },
  "sharpedo-mega":    { nameEn: "Mega Sharpedo",   nameTh: "เมก้า ชาร์พีโด",      types: ["water","dark"],     ability: "strong-jaw",     spriteId: 10068, atk: 140, def: 70,  spAtk: 110, spDef: 65,  speed: 105 },
  "camerupt-mega":    { nameEn: "Mega Camerupt",   nameTh: "เมก้า แคเมรัปท์",     types: ["fire","ground"],    ability: "sheer-force",    spriteId: 10061, atk: 120, def: 100, spAtk: 145, spDef: 105, speed: 20 },
  "altaria-mega":     { nameEn: "Mega Altaria",    nameTh: "เมก้า อัลทาเรีย",     types: ["dragon","fairy"],   ability: "pixilate",       spriteId: 10062, atk: 110, def: 110, spAtk: 110, spDef: 105, speed: 80 },
  "latias-mega":      { nameEn: "Mega Latias",     nameTh: "เมก้า ลาติอัส",        types: ["dragon","psychic"], ability: "levitate",       spriteId: 10074, atk: 100, def: 120, spAtk: 140, spDef: 150, speed: 110 },
  "latios-mega":      { nameEn: "Mega Latios",     nameTh: "เมก้า ลาติออส",        types: ["dragon","psychic"], ability: "levitate",       spriteId: 10075, atk: 130, def: 100, spAtk: 160, spDef: 120, speed: 110 },
  "gallade-mega":     { nameEn: "Mega Gallade",    nameTh: "เมก้า กัลเลด",         types: ["psychic","fighting"],ability:"inner-focus",    spriteId: 10076, atk: 165, def: 95,  spAtk: 65,  spDef: 115, speed: 110 },
  "diancie-mega":     { nameEn: "Mega Diancie",    nameTh: "เมก้า ไดแอนซี",        types: ["rock","fairy"],     ability: "magic-bounce",   spriteId: 10077, atk: 160, def: 110, spAtk: 160, spDef: 110, speed: 110 },
  "audino-mega":      { nameEn: "Mega Audino",     nameTh: "เมก้า ออดิโน",         types: ["normal","fairy"],   ability: "healer",         spriteId: 10078, atk: 60,  def: 126, spAtk: 80,  spDef: 126, speed: 50 },
  // Legends Z-A megas
  "greninja-mega":      { nameEn: "Mega Greninja",      nameTh: "เมก้า เกรนินจา",       types: ["water","dark"],      ability: "protean",       spriteId: 10200, atk: 125, def: 77,  spAtk: 133, spDef: 81,  speed: 142 },
  "raichu-mega-x":      { nameEn: "Mega Raichu X",      nameTh: "เมก้า ไรชู X",          types: ["electric"],          ability: "huge-power",    spriteId: 10201, atk: 135, def: 95,  spAtk: 90,  spDef: 95,  speed: 110 },
  "raichu-mega-y":      { nameEn: "Mega Raichu Y",      nameTh: "เมก้า ไรชู Y",          types: ["electric"],          ability: "lightning-rod", spriteId: 10202, atk: 100, def: 55,  spAtk: 160, spDef: 80,  speed: 130 },
  "clefable-mega":      { nameEn: "Mega Clefable",      nameTh: "เมก้า คลีฟฟาเบิล",     types: ["fairy","flying"],    ability: "magic-guard",   spriteId: 10203, atk: 80,  def: 93,  spAtk: 135, spDef: 110, speed: 70 },
  "victreebel-mega":    { nameEn: "Mega Victreebel",    nameTh: "เมก้า วิคทรีเบล",       types: ["grass","poison"],    ability: "chlorophyll",   spriteId: 10204, atk: 125, def: 85,  spAtk: 135, spDef: 95,  speed: 70 },
  "starmie-mega":       { nameEn: "Mega Starmie",       nameTh: "เมก้า สตาร์มี",          types: ["water","psychic"],   ability: "analytic",      spriteId: 10205, atk: 140, def: 105, spAtk: 130, spDef: 105, speed: 120 },
  "dragonite-mega":     { nameEn: "Mega Dragonite",     nameTh: "เมก้า ดราโกไนต์",       types: ["dragon","flying"],   ability: "multiscale",    spriteId: 10206, atk: 124, def: 115, spAtk: 145, spDef: 125, speed: 100 },
  "meganium-mega":      { nameEn: "Mega Meganium",      nameTh: "เมก้า เมกาเนียม",       types: ["grass","fairy"],     ability: "natural-cure",  spriteId: 10207, atk: 92,  def: 115, spAtk: 143, spDef: 115, speed: 80 },
  "feraligatr-mega":    { nameEn: "Mega Feraligatr",    nameTh: "เมก้า เฟรารีแกเทอร์",   types: ["water","dragon"],    ability: "sheer-force",   spriteId: 10208, atk: 160, def: 125, spAtk: 89,  spDef: 93,  speed: 78 },
  "skarmory-mega":      { nameEn: "Mega Skarmory",      nameTh: "เมก้า สกาเมอรี่",        types: ["steel","flying"],    ability: "sturdy",        spriteId: 10209, atk: 140, def: 110, spAtk: 40,  spDef: 100, speed: 110 },
  "chimecho-mega":      { nameEn: "Mega Chimecho",      nameTh: "เมก้า ชิเมโช",           types: ["psychic","steel"],   ability: "levitate",      spriteId: 10210, atk: 50,  def: 110, spAtk: 135, spDef: 120, speed: 65 },
  "absol-mega-z":       { nameEn: "Mega Absol Z",       nameTh: "เมก้า แอปซอล Z",         types: ["dark","ghost"],      ability: "magic-bounce",  spriteId: 10211, atk: 154, def: 60,  spAtk: 75,  spDef: 60,  speed: 151 },
  "staraptor-mega":     { nameEn: "Mega Staraptor",     nameTh: "เมก้า สตาแรปเตอร์",      types: ["fighting","flying"], ability: "intimidate",    spriteId: 10212, atk: 140, def: 100, spAtk: 60,  spDef: 90,  speed: 110 },
  "garchomp-mega-z":    { nameEn: "Mega Garchomp Z",    nameTh: "เมก้า การ์ชอมพ์ Z",      types: ["dragon"],            ability: "sand-force",    spriteId: 10213, atk: 130, def: 85,  spAtk: 141, spDef: 85,  speed: 151 },
  "lucario-mega-z":     { nameEn: "Mega Lucario Z",     nameTh: "เมก้า ลูคาริโอ Z",       types: ["fighting","steel"],  ability: "adaptability",  spriteId: 10214, atk: 100, def: 70,  spAtk: 164, spDef: 70,  speed: 151 },
  "froslass-mega":      { nameEn: "Mega Froslass",      nameTh: "เมก้า โฟรสแล็ส",         types: ["ice","ghost"],       ability: "natural-cure",  spriteId: 10215, atk: 80,  def: 70,  spAtk: 140, spDef: 100, speed: 120 },
  "heatran-mega":       { nameEn: "Mega Heatran",       nameTh: "เมก้า ฮีทแรน",           types: ["fire","steel"],      ability: "flash-fire",    spriteId: 10216, atk: 120, def: 106, spAtk: 175, spDef: 141, speed: 67 },
  "darkrai-mega":       { nameEn: "Mega Darkrai",       nameTh: "เมก้า ดาร์คไร",          types: ["dark"],              ability: "pressure",      spriteId: 10217, atk: 120, def: 130, spAtk: 165, spDef: 130, speed: 85 },
  "emboar-mega":        { nameEn: "Mega Emboar",        nameTh: "เมก้า เอ็มโบร์",          types: ["fire","fighting"],   ability: "iron-fist",     spriteId: 10218, atk: 148, def: 75,  spAtk: 110, spDef: 110, speed: 75 },
  "excadrill-mega":     { nameEn: "Mega Excadrill",     nameTh: "เมก้า เอ็กซ์คาดริล",     types: ["ground","steel"],    ability: "sand-force",    spriteId: 10219, atk: 165, def: 100, spAtk: 65,  spDef: 65,  speed: 103 },
  "scolipede-mega":     { nameEn: "Mega Scolipede",     nameTh: "เมก้า สโคลิพีด",         types: ["bug","poison"],      ability: "speed-boost",   spriteId: 10220, atk: 140, def: 149, spAtk: 75,  spDef: 99,  speed: 62 },
  "scrafty-mega":       { nameEn: "Mega Scrafty",       nameTh: "เมก้า สแครฟตี้",         types: ["dark","fighting"],   ability: "mold-breaker",  spriteId: 10221, atk: 130, def: 135, spAtk: 55,  spDef: 135, speed: 68 },
  "eelektross-mega":    { nameEn: "Mega Eelektross",    nameTh: "เมก้า อีเล็กตรอส",       types: ["electric"],          ability: "levitate",      spriteId: 10222, atk: 145, def: 80,  spAtk: 135, spDef: 90,  speed: 80 },
  "chandelure-mega":    { nameEn: "Mega Chandelure",    nameTh: "เมก้า แชนเดลูร์",        types: ["ghost","fire"],      ability: "flash-fire",    spriteId: 10223, atk: 75,  def: 110, spAtk: 175, spDef: 110, speed: 90 },
  "golurk-mega":        { nameEn: "Mega Golurk",        nameTh: "เมก้า โกลเรอค",          types: ["ground","ghost"],    ability: "iron-fist",     spriteId: 10224, atk: 159, def: 105, spAtk: 70,  spDef: 105, speed: 55 },
  "chesnaught-mega":    { nameEn: "Mega Chesnaught",    nameTh: "เมก้า เชสเนาท์",         types: ["grass","fighting"],  ability: "tough-claws",   spriteId: 10225, atk: 137, def: 172, spAtk: 74,  spDef: 115, speed: 44 },
  "delphox-mega":       { nameEn: "Mega Delphox",       nameTh: "เมก้า เดลฟอกซ์",         types: ["fire","psychic"],    ability: "magic-guard",   spriteId: 10226, atk: 69,  def: 72,  spAtk: 159, spDef: 125, speed: 134 },
  "pyroar-mega":        { nameEn: "Mega Pyroar",        nameTh: "เมก้า ไพโรอาร์",         types: ["fire","normal"],     ability: "intimidate",    spriteId: 10227, atk: 88,  def: 92,  spAtk: 129, spDef: 86,  speed: 126 },
  "floette-mega":       { nameEn: "Mega Floette",       nameTh: "เมก้า โฟลเอตต์",         types: ["fairy"],             ability: "natural-cure",  spriteId: 10228, atk: 85,  def: 87,  spAtk: 155, spDef: 148, speed: 102 },
  "meowstic-mega":      { nameEn: "Mega Meowstic",      nameTh: "เมก้า มีออสทิค",          types: ["psychic"],           ability: "prankster",     spriteId: 10229, atk: 48,  def: 76,  spAtk: 143, spDef: 101, speed: 124 },
  "malamar-mega":       { nameEn: "Mega Malamar",       nameTh: "เมก้า มาลาม่า",           types: ["dark","psychic"],    ability: "analytic",      spriteId: 10230, atk: 102, def: 88,  spAtk: 98,  spDef: 120, speed: 88 },
  "barbaracle-mega":    { nameEn: "Mega Barbaracle",    nameTh: "เมก้า บาร์บาร็อคเคิล",   types: ["rock","fighting"],   ability: "tough-claws",   spriteId: 10231, atk: 140, def: 130, spAtk: 64,  spDef: 106, speed: 88 },
  "dragalge-mega":      { nameEn: "Mega Dragalge",      nameTh: "เมก้า ดราแกลจ์",          types: ["poison","dragon"],   ability: "adaptability",  spriteId: 10232, atk: 85,  def: 105, spAtk: 132, spDef: 163, speed: 44 },
  "hawlucha-mega":      { nameEn: "Mega Hawlucha",      nameTh: "เมก้า ฮอว์ลูชา",          types: ["fighting","flying"], ability: "no-guard",      spriteId: 10233, atk: 137, def: 100, spAtk: 74,  spDef: 93,  speed: 118 },
  "zygarde-mega":       { nameEn: "Mega Zygarde",       nameTh: "เมก้า ไซการ์ด",            types: ["dragon","ground"],   ability: "pressure",      spriteId: 10234, atk: 70,  def: 91,  spAtk: 150, spDef: 85,  speed: 100 },
  "crabominable-mega":  { nameEn: "Mega Crabominable",  nameTh: "เมก้า แคร็บโอมิเนเบิล",   types: ["fighting","ice"],    ability: "iron-fist",     spriteId: 10235, atk: 157, def: 122, spAtk: 62,  spDef: 107, speed: 33 },
  "golisopod-mega":     { nameEn: "Mega Golisopod",     nameTh: "เมก้า โกลิโซพอด",         types: ["bug","steel"],       ability: "tough-claws",   spriteId: 10236, atk: 150, def: 175, spAtk: 70,  spDef: 120, speed: 40 },
  "drampa-mega":        { nameEn: "Mega Drampa",        nameTh: "เมก้า ดรัมปา",             types: ["normal","dragon"],   ability: "sap-sipper",    spriteId: 10237, atk: 85,  def: 110, spAtk: 160, spDef: 116, speed: 36 },
  "magearna-mega":      { nameEn: "Mega Magearna",      nameTh: "เมก้า เมเกียร์นา",         types: ["steel","fairy"],     ability: "download",      spriteId: 10238, atk: 125, def: 115, spAtk: 170, spDef: 115, speed: 95 },
  "zeraora-mega":       { nameEn: "Mega Zeraora",       nameTh: "เมก้า เซราโอร่า",           types: ["electric"],          ability: "volt-absorb",   spriteId: 10239, atk: 157, def: 75,  spAtk: 147, spDef: 80,  speed: 153 },
  "falinks-mega":       { nameEn: "Mega Falinks",       nameTh: "เมก้า เฟลินกส์",            types: ["fighting"],          ability: "no-guard",      spriteId: 10240, atk: 135, def: 135, spAtk: 70,  spDef: 65,  speed: 100 },
  "scovillain-mega":    { nameEn: "Mega Scovillain",    nameTh: "เมก้า สโควิลเลน",           types: ["grass","fire"],      ability: "sheer-force",   spriteId: 10241, atk: 138, def: 85,  spAtk: 138, spDef: 85,  speed: 75 },
  "glimmora-mega":      { nameEn: "Mega Glimmora",      nameTh: "เมก้า กลิมมอร่า",           types: ["rock","poison"],     ability: "sturdy",        spriteId: 10242, atk: 90,  def: 105, spAtk: 150, spDef: 96,  speed: 101 },
  "tatsugiri-mega":     { nameEn: "Mega Tatsugiri",     nameTh: "เมก้า ทัตซึกิริ",            types: ["dragon","water"],    ability: "cloud-nine",    spriteId: 10243, atk: 65,  def: 90,  spAtk: 135, spDef: 125, speed: 92 },
  "baxcalibur-mega":    { nameEn: "Mega Baxcalibur",    nameTh: "เมก้า แบ็กซ์แคลิเบอร์",    types: ["dragon","ice"],      ability: "mold-breaker",  spriteId: 10244, atk: 175, def: 117, spAtk: 105, spDef: 101, speed: 87 },
};

// ─── Z-Crystal data ───────────────────────────────────────────────────────────

export const Z_CRYSTAL_ITEMS: Record<string, { nameTh: string; type: PokemonTypeName }> = {
  "normalium-z":   { nameTh: "คริสตัล Z ปกติ",     type: "normal" },
  "firium-z":      { nameTh: "คริสตัล Z ไฟ",       type: "fire" },
  "waterium-z":    { nameTh: "คริสตัล Z น้ำ",       type: "water" },
  "electrium-z":   { nameTh: "คริสตัล Z ไฟฟ้า",    type: "electric" },
  "grassium-z":    { nameTh: "คริสตัล Z หญ้า",      type: "grass" },
  "icium-z":       { nameTh: "คริสตัล Z น้ำแข็ง",  type: "ice" },
  "fightinium-z":  { nameTh: "คริสตัล Z ต่อสู้",    type: "fighting" },
  "poisonium-z":   { nameTh: "คริสตัล Z พิษ",       type: "poison" },
  "groundium-z":   { nameTh: "คริสตัล Z พื้นดิน",  type: "ground" },
  "flyinium-z":    { nameTh: "คริสตัล Z บิน",       type: "flying" },
  "psychium-z":    { nameTh: "คริสตัล Z จิตใจ",     type: "psychic" },
  "buginium-z":    { nameTh: "คริสตัล Z แมลง",      type: "bug" },
  "rockium-z":     { nameTh: "คริสตัล Z หิน",       type: "rock" },
  "ghostium-z":    { nameTh: "คริสตัล Z ผี",        type: "ghost" },
  "dragonium-z":   { nameTh: "คริสตัล Z มังกร",     type: "dragon" },
  "darkinium-z":   { nameTh: "คริสตัล Z มืด",       type: "dark" },
  "steelium-z":    { nameTh: "คริสตัล Z เหล็ก",     type: "steel" },
  "fairium-z":     { nameTh: "คริสตัล Z แฟรี่",     type: "fairy" },
};

// Pokemon that can Gigantamax
export const GMAX_POKEMON = new Set([
  "venusaur","charizard","blastoise","butterfree","pikachu","meowth","machamp","gengar",
  "kingler","lapras","eevee","snorlax","corviknight","orbeetle","drednaw","coalossal",
  "flapple","appletun","sandaconda","toxtricity","centiskorch","alcremie","grimmsnarl",
  "copperajah","duraludon","urshifu","melmetal","inteleon","rillaboom","cinderace",
]);

// ─── Z-Move / Dynamax helpers ─────────────────────────────────────────────────

export function calcZPower(basePower: number): number {
  if (basePower <= 55) return 100;
  if (basePower <= 65) return 120;
  if (basePower <= 75) return 140;
  if (basePower <= 85) return 160;
  if (basePower <= 95) return 175;
  if (basePower <= 100) return 180;
  if (basePower <= 110) return 185;
  if (basePower <= 120) return 190;
  if (basePower <= 130) return 195;
  return 200;
}

export function getDynamaxPower(basePower: number): number {
  if (!basePower) return 90;
  if (basePower <= 40) return 100;
  if (basePower <= 50) return 100;
  if (basePower <= 60) return 110;
  if (basePower <= 70) return 120;
  if (basePower <= 100) return 130;
  if (basePower <= 120) return 140;
  return 150;
}

export function getMaxMoveName(type: PokemonTypeName, isGmax: boolean, gmaxSlug?: string): string {
  if (isGmax && gmaxSlug) {
    const GMAX_NAMES: Partial<Record<string, string>> = {
      "venusaur": "G-Max Vine Lash","charizard": "G-Max Wildfire","blastoise": "G-Max Cannonade",
      "gengar": "G-Max Terror","pikachu": "G-Max Volt Crash","lapras": "G-Max Resonance",
      "snorlax": "G-Max Replenish","drednaw": "G-Max Stonesurge","coalossal": "G-Max Volcalith",
      "corviknight": "G-Max Wind Rage","rillaboom": "G-Max Drum Solo","cinderace": "G-Max Fireball",
      "inteleon": "G-Max Hydrosnipe","machamp": "G-Max Chi Strike","toxtricity": "G-Max Stun Shock",
    };
    const base = gmaxSlug.replace("-gmax","").replace("gmax-","");
    if (GMAX_NAMES[base]) return GMAX_NAMES[base]!;
  }
  const MAX_MOVES: Partial<Record<PokemonTypeName, string>> = {
    fire: "Max Flare", water: "Max Geyser", grass: "Max Overgrowth", electric: "Max Lightning",
    ice: "Max Hailstorm", fighting: "Max Knuckle", poison: "Max Ooze", ground: "Max Quake",
    flying: "Max Airstream", psychic: "Max Mindstorm", bug: "Max Flutterby", rock: "Max Rockfall",
    ghost: "Max Phantasm", dragon: "Max Wyrmwind", dark: "Max Darkness", steel: "Max Steelspike",
    fairy: "Max Starfall", normal: "Max Strike",
  };
  return MAX_MOVES[type] ?? "Max Move";
}

// ─── Core Types ───────────────────────────────────────────────────────────────

export type BattleStatus = "none" | "burn" | "paralysis" | "poison" | "sleep" | "freeze";
export type BattleCategory = "physical" | "special" | "status";
export type BattleMode = "single" | "double";

export interface SimMove {
  slug: string; nameEn: string; nameTh: string;
  type: PokemonTypeName; category: BattleCategory;
  power: number; accuracy: number; pp: number; priority: number;
  ailment: string; ailmentChance: number; drain: number; recoil: number;
  target: string;
}

export interface SimPokemon {
  uid: string; id: number; slug: string; nameEn: string; nameTh: string;
  types: PokemonTypeName[]; level: number;
  maxHp: number; currentHp: number;
  atk: number; def: number; spAtk: number; spDef: number; speed: number;
  stages: { atk: number; def: number; spAtk: number; spDef: number; speed: number; acc: number; eva: number };
  status: BattleStatus; statusTurns: number;
  moves: (SimMove & { currentPp: number })[];
  spriteUrl: string; backSpriteUrl: string;
  ability: string; heldItem: string | null;
  // Battle state flags
  choiceLockedMove: number | null;
  flashFireActive: boolean;
  sashUsed: boolean;
  weaknessPolicyUsed: boolean;
  airBalloonPopped: boolean;
  // Mega Evolution
  megaEvolved: boolean;
  megaFormSlug: string | null;
  // Dynamax / G-Max
  dynamaxTurnsLeft: number;
  baseMaxHp: number;
  dynamaxUsed: boolean;
  // Terastallization
  teraType: PokemonTypeName;
  teraActive: boolean;
  origTypes: PokemonTypeName[];
}

export interface BattleLogEntry {
  id: number; text: string; kind: "info" | "damage" | "status" | "heal" | "faint" | "result";
}

export interface BattleState {
  mode: BattleMode;
  playerTeam: SimPokemon[]; opponentTeam: SimPokemon[];
  playerActive: number[]; opponentActive: number[];
  turn: number; logSeed: number; winner: "player" | "opponent" | null;
  playerMegaUsed: boolean; opponentMegaUsed: boolean;
  playerTeraUsed: boolean; opponentTeraUsed: boolean;
  weather: WeatherName; weatherTurns: number;
}

export interface PlayerAction {
  activeSlot: number; moveIndex: number; targetSlot: number;
  switchTo?: number;
  useMega?: boolean;
  useZMove?: boolean;
  useDynamax?: boolean;
  useTera?: boolean;
}

export interface TurnResult { state: BattleState; log: BattleLogEntry[] }

// ─── Stat Calculation ─────────────────────────────────────────────────────────

export function simCalcHp(base: number): number {
  return Math.floor(((2 * base + 31 + 21) * 50) / 100 + 50 + 10);
}

export function simCalcStat(base: number): number {
  return Math.floor(Math.floor((2 * base + 31 + 21) * 50 / 100) + 5);
}

const STAGE_MULTS: Record<number, number> = {
  [-6]: 2/8, [-5]: 2/7, [-4]: 2/6, [-3]: 2/5, [-2]: 2/4, [-1]: 2/3,
  [0]: 1, [1]: 3/2, [2]: 2, [3]: 5/2, [4]: 3, [5]: 7/2, [6]: 4,
};
function withStage(stat: number, stage: number): number {
  return Math.floor(stat * (STAGE_MULTS[Math.max(-6, Math.min(6, stage))] ?? 1));
}

// ─── Build SimPokemon ─────────────────────────────────────────────────────────

export function buildSimPokemon(p: {
  uid: string; id: number; slug: string; nameEn: string; nameTh: string;
  types: PokemonTypeName[];
  baseStats: { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
  moves: SimMove[]; ability?: string; heldItem?: string | null;
  teraType?: PokemonTypeName;
}): SimPokemon {
  const maxHp = simCalcHp(p.baseStats.hp);
  return {
    uid: p.uid, id: p.id, slug: p.slug, nameEn: p.nameEn, nameTh: p.nameTh,
    types: [...p.types], level: 50,
    maxHp, currentHp: maxHp,
    atk: simCalcStat(p.baseStats.attack), def: simCalcStat(p.baseStats.defense),
    spAtk: simCalcStat(p.baseStats.specialAttack), spDef: simCalcStat(p.baseStats.specialDefense),
    speed: simCalcStat(p.baseStats.speed),
    stages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, acc: 0, eva: 0 },
    status: "none", statusTurns: 0,
    moves: p.moves.map(m => ({ ...m, currentPp: m.pp })),
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    backSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${p.id}.png`,
    ability: p.ability ?? "", heldItem: p.heldItem ?? null,
    choiceLockedMove: null, flashFireActive: false, sashUsed: false,
    weaknessPolicyUsed: false, airBalloonPopped: false,
    megaEvolved: false, megaFormSlug: null,
    dynamaxTurnsLeft: 0, baseMaxHp: 0, dynamaxUsed: false,
    teraType: p.teraType ?? p.types[0] ?? "normal",
    teraActive: false,
    origTypes: [...p.types],
  };
}

// ─── Mega Evolution ───────────────────────────────────────────────────────────

export function applyMegaEvolution(p: SimPokemon, megaSlug: string): void {
  const d = MEGA_DATA[megaSlug];
  if (!d) return;
  p.megaEvolved = true;
  p.megaFormSlug = megaSlug;
  p.nameEn = d.nameEn; p.nameTh = d.nameTh;
  p.types = d.types as PokemonTypeName[];
  p.ability = d.ability;
  p.atk = simCalcStat(d.atk); p.def = simCalcStat(d.def);
  p.spAtk = simCalcStat(d.spAtk); p.spDef = simCalcStat(d.spDef);
  p.speed = simCalcStat(d.speed);
  if (d.spriteId > 0) {
    p.spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.spriteId}.png`;
    p.backSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${d.spriteId}.png`;
  }
}

// ─── Type Effectiveness ───────────────────────────────────────────────────────

export function getSimEff(moveType: PokemonTypeName, defTypes: PokemonTypeName[]): number {
  if (defTypes.length === 1) return TYPE_CHART[moveType]?.[defTypes[0]] ?? 1;
  return getDualTypeDefenses(defTypes)[moveType] ?? 1;
}

function canApplyStatus(target: SimPokemon, s: BattleStatus): boolean {
  if (target.status !== "none") return false;
  if (s === "burn" && target.types.includes("fire")) return false;
  if (s === "paralysis" && target.types.includes("electric")) return false;
  if (s === "poison" && (target.types.includes("poison") || target.types.includes("steel"))) return false;
  if (s === "freeze" && target.types.includes("ice")) return false;
  if (s === "sleep" && (target.ability === "insomnia" || target.ability === "vital-spirit")) return false;
  return true;
}

// ─── Entry Effects ────────────────────────────────────────────────────────────

function applyEntry(
  incoming: SimPokemon, incomingSide: "p" | "o",
  pt: SimPokemon[], ot: SimPokemon[],
  playerActive: number[], opponentActive: number[],
  add: (text: string, kind?: BattleLogEntry["kind"]) => void,
  setWeather?: (w: WeatherName, turns: number) => void,
) {
  const oppTeam = incomingSide === "p" ? ot : pt;
  const oppActive = incomingSide === "p" ? opponentActive : playerActive;
  const name = incoming.nameTh || incoming.nameEn;
  if (incoming.ability === "intimidate") {
    for (const oi of oppActive) {
      const opp = oppTeam[oi];
      if (opp && opp.currentHp > 0) {
        opp.stages.atk = Math.max(-6, opp.stages.atk - 1);
        add(`😤 Intimidate ของ ${name} ลด Atk ของ ${opp.nameTh || opp.nameEn}!`, "status");
      }
    }
  }
  if (incoming.ability === "download") {
    const opp = oppTeam[oppActive[0]];
    if (opp) {
      if (opp.def < opp.spDef) { incoming.stages.atk = Math.min(6, incoming.stages.atk + 1); add(`💻 Download ของ ${name} เพิ่ม Atk!`, "status"); }
      else { incoming.stages.spAtk = Math.min(6, incoming.stages.spAtk + 1); add(`💻 Download ของ ${name} เพิ่ม SpAtk!`, "status"); }
    }
  }
  if (incoming.ability === "drought") {
    setWeather?.("sun", 5);
    add(`☀️ ${name} เรียกแสงแดดแผดเผา! (5 เทิร์น)`, "status");
  }
  if (incoming.ability === "drizzle") {
    setWeather?.("rain", 5);
    add(`🌧️ ${name} เรียกฝนโปรย! (5 เทิร์น)`, "status");
  }
  if (incoming.ability === "sand-stream") {
    setWeather?.("sand", 5);
    add(`🌪️ ${name} เรียกพายุทราย! (5 เทิร์น)`, "status");
  }
  if (incoming.ability === "snow-warning") {
    setWeather?.("hail", 5);
    add(`🌨️ ${name} เรียกพายุหิมะ! (5 เทิร์น)`, "status");
  }
}

export function applyTeamEntryEffects(state: BattleState): TurnResult {
  const pt = JSON.parse(JSON.stringify(state.playerTeam)) as SimPokemon[];
  const ot = JSON.parse(JSON.stringify(state.opponentTeam)) as SimPokemon[];
  const log: BattleLogEntry[] = [];
  let lid = state.logSeed;
  let weather = state.weather;
  let weatherTurns = state.weatherTurns;
  const add = (text: string, kind: BattleLogEntry["kind"] = "info") => log.push({ id: lid++, text, kind });
  const setWeather = (w: WeatherName, turns: number) => { weather = w; weatherTurns = turns; };
  for (const pi of state.playerActive) { const p = pt[pi]; if (p) applyEntry(p, "p", pt, ot, state.playerActive, state.opponentActive, add, setWeather); }
  for (const oi of state.opponentActive) { const o = ot[oi]; if (o) applyEntry(o, "o", pt, ot, state.playerActive, state.opponentActive, add, setWeather); }
  return { state: { ...state, playerTeam: pt, opponentTeam: ot, logSeed: lid, weather, weatherTurns }, log };
}

// ─── Damage Roll ──────────────────────────────────────────────────────────────

const PUNCH_MOVES = new Set(["ice-punch","fire-punch","thunder-punch","mach-punch","dynamic-punch","drain-punch","focus-punch","shadow-punch","hammer-arm","meteor-mash","power-up-punch","sucker-punch","sky-uppercut","comet-punch","bullet-punch","dizzy-punch","mega-punch"]);
const PULSE_MOVES = new Set(["water-pulse","aura-sphere","dark-pulse","dragon-pulse","origin-pulse","energy-ball","shadow-ball","sludge-bomb","electro-ball","focus-blast","flash-cannon"]);

interface DmgResult {
  damage: number; effectiveness: number; isCrit: boolean; missed: boolean;
  messages: string[]; weaknessPolicyTriggered: boolean;
}

function rollDamage(attacker: SimPokemon, defender: SimPokemon, move: SimMove, opts?: { ignoreAcc?: boolean; weather?: WeatherName }): DmgResult {
  if (move.category === "status" || !move.power)
    return { damage: 0, effectiveness: 1, isCrit: false, missed: false, messages: [], weaknessPolicyTriggered: false };

  const msgs: string[] = [];
  const defName = defender.nameTh || defender.nameEn;
  const ignoringAbility = attacker.ability === "mold-breaker";

  // ── ATE ability: convert Normal moves ──
  let moveType = move.type;
  let ateBoost = 1;
  if (move.type === "normal") {
    if (attacker.ability === "aerilate") { moveType = "flying"; ateBoost = 1.2; }
    else if (attacker.ability === "pixilate") { moveType = "fairy"; ateBoost = 1.2; }
    else if (attacker.ability === "refrigerate") { moveType = "ice"; ateBoost = 1.2; }
    else if (attacker.ability === "galvanize") { moveType = "electric"; ateBoost = 1.2; }
  }

  // ── Defender ability: type immunities ──
  if (!ignoringAbility) {
    if (defender.ability === "levitate" && moveType === "ground")
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`✨ ${defName} ลอยตัวหนีท่า Ground!`], weaknessPolicyTriggered: false };
    if (defender.ability === "flash-fire" && moveType === "fire") {
      defender.flashFireActive = true;
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🔥 Flash Fire ของ ${defName} ดูดซับ Fire!`], weaknessPolicyTriggered: false };
    }
    if ((defender.ability === "water-absorb" || defender.ability === "dry-skin") && moveType === "water") {
      const h = Math.max(1, Math.floor(defender.maxHp / 4));
      defender.currentHp = Math.min(defender.maxHp, defender.currentHp + h);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`💧 ${defName} ดูดซับ Water ฟื้น ${h} HP!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "volt-absorb" && moveType === "electric") {
      const h = Math.max(1, Math.floor(defender.maxHp / 4));
      defender.currentHp = Math.min(defender.maxHp, defender.currentHp + h);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`⚡ ${defName} ดูดซับ Electric ฟื้น ${h} HP!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "lightning-rod" && moveType === "electric") {
      defender.stages.spAtk = Math.min(6, defender.stages.spAtk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`⚡ Lightning Rod ของ ${defName} ดูดซับ! SpAtk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "storm-drain" && moveType === "water") {
      defender.stages.spAtk = Math.min(6, defender.stages.spAtk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`💧 Storm Drain ของ ${defName} ดูดซับ! SpAtk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
    if (defender.ability === "sap-sipper" && moveType === "grass") {
      defender.stages.atk = Math.min(6, defender.stages.atk + 1);
      return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🌿 Sap Sipper ของ ${defName} ดูดซับ! Atk เพิ่ม!`], weaknessPolicyTriggered: false };
    }
  }
  if (defender.heldItem === "air-balloon" && !defender.airBalloonPopped && moveType === "ground")
    return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: [`🎈 Air Balloon ของ ${defName} ป้องกัน Ground!`], weaknessPolicyTriggered: false };

  // Scrappy: Normal/Fighting hit Ghost
  const eff_raw = getSimEff(moveType, defender.types);
  let eff = eff_raw;
  if (eff === 0 && attacker.ability === "scrappy" && (moveType === "normal" || moveType === "fighting") && defender.types.includes("ghost")) eff = 1;

  // ── Accuracy ──
  const noGuard = attacker.ability === "no-guard" || defender.ability === "no-guard";
  if (!noGuard && !opts?.ignoreAcc && move.accuracy > 0) {
    let accMult = STAGE_MULTS[Math.max(-6, Math.min(6, attacker.stages.acc - defender.stages.eva))] ?? 1;
    if (attacker.ability === "hustle" && move.category === "physical") accMult *= 0.8;
    if (Math.random() * 100 >= move.accuracy * accMult)
      return { damage: 0, effectiveness: 1, isCrit: false, missed: true, messages: ["ปาไม่โดน!"], weaknessPolicyTriggered: false };
  }

  const isPhys = move.category === "physical";
  let rawAtk = isPhys ? attacker.atk : attacker.spAtk;
  let rawDef = isPhys ? defender.def : defender.spDef;
  const atkStage = isPhys ? attacker.stages.atk : attacker.stages.spAtk;
  const defStage = isPhys ? defender.stages.def : defender.stages.spDef;

  if ((attacker.ability === "huge-power" || attacker.ability === "pure-power") && isPhys) rawAtk = Math.floor(rawAtk * 2);
  if (attacker.ability === "hustle" && isPhys) rawAtk = Math.floor(rawAtk * 1.5);
  if (attacker.ability === "guts" && attacker.status !== "none" && isPhys) rawAtk = Math.floor(rawAtk * 1.5);
  if (!ignoringAbility) {
    if (defender.ability === "marvel-scale" && defender.status !== "none" && isPhys) rawDef = Math.floor(rawDef * 1.5);
  }
  if (defender.heldItem === "eviolite") rawDef = Math.floor(rawDef * 1.5);
  if (defender.heldItem === "assault-vest" && !isPhys) rawDef = Math.floor(rawDef * 1.5);

  const isCrit = Math.random() < 1 / 24;
  const finalAtk = withStage(rawAtk, isCrit ? Math.max(0, atkStage) : atkStage);
  const finalDef = withStage(rawDef, isCrit ? Math.min(0, defStage) : defStage);

  let dmg = Math.floor((Math.floor((2 * 50 / 5 + 2) * move.power * finalAtk / finalDef) / 50) + 2);

  // STAB
  const hasStab = attacker.types.includes(moveType) || (ateBoost > 1); // ATE counts as STAB
  const stabMult = hasStab ? (attacker.ability === "adaptability" ? 2 : 1.5) : 1;
  dmg = Math.floor(dmg * stabMult * ateBoost);

  // Wonder Guard
  if (!ignoringAbility && defender.ability === "wonder-guard" && eff < 2)
    return { damage: 0, effectiveness: eff, isCrit: false, missed: false, messages: [`🛡️ Wonder Guard ของ ${defName} ปัดป้อง!`], weaknessPolicyTriggered: false };

  if (eff === 0) return { damage: 0, effectiveness: 0, isCrit: false, missed: false, messages: ["ไม่ได้ผลเลย!"], weaknessPolicyTriggered: false };

  let effMult = eff;
  if (!ignoringAbility) {
    if (defender.ability === "thick-fat" && (moveType === "fire" || moveType === "ice")) effMult *= 0.5;
    if (defender.ability === "heatproof" && moveType === "fire") effMult *= 0.5;
    if (defender.ability === "dry-skin" && moveType === "fire") effMult *= 1.25;
    if (defender.ability === "delta-stream" && moveType !== "rock" && moveType !== "electric" && moveType !== "ice" && defender.types.includes("flying")) effMult = Math.min(effMult, 1);
  }
  // Weather effects on damage
  const weather = opts?.weather ?? "none";
  if (weather === "rain") {
    if (moveType === "water") effMult *= 1.5;
    else if (moveType === "fire") effMult *= 0.5;
  } else if (weather === "sun") {
    if (moveType === "fire") effMult *= 1.5;
    else if (moveType === "water") effMult *= 0.5;
  }
  // Sand Force boosts Rock/Ground/Steel in sand
  if (weather === "sand" && attacker.ability === "sand-force" && (moveType === "rock" || moveType === "ground" || moveType === "steel")) effMult *= 1.3;
  dmg = Math.floor(dmg * effMult);

  if (eff >= 4) msgs.push("ได้ผลอย่างมหาศาล!! ×4");
  else if (eff >= 2) msgs.push("ได้ผลดีมาก! ×2");
  else if (eff < 1) {
    msgs.push("ได้ผลน้อย...");
    if (attacker.ability === "tinted-lens") { dmg = Math.floor(dmg * 2); msgs.push(`🔍 Tinted Lens เพิ่มดาเมจ!`); }
  }

  if (!isCrit && attacker.status === "burn" && isPhys && attacker.ability !== "guts") dmg = Math.floor(dmg * 0.5);
  if (isCrit) { dmg = Math.floor(dmg * 1.5); msgs.push("โจมตีจุดอ่อน!"); }

  // Attacker ability boosts
  const atLowHp = attacker.currentHp <= Math.floor(attacker.maxHp / 3);
  if (attacker.ability === "blaze"    && moveType === "fire"    && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🔥 Blaze!"); }
  if (attacker.ability === "torrent"  && moveType === "water"   && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("💧 Torrent!"); }
  if (attacker.ability === "overgrow" && moveType === "grass"   && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🌿 Overgrow!"); }
  if (attacker.ability === "swarm"    && moveType === "bug"     && atLowHp) { dmg = Math.floor(dmg * 1.5); msgs.push("🐛 Swarm!"); }
  if (attacker.ability === "flash-fire" && moveType === "fire" && attacker.flashFireActive) { dmg = Math.floor(dmg * 1.5); msgs.push("🔥 Flash Fire!"); }
  if (attacker.ability === "technician" && move.power <= 60) dmg = Math.floor(dmg * 1.5);
  if (attacker.ability === "sheer-force" && move.ailmentChance > 0) dmg = Math.floor(dmg * 1.3);
  if (attacker.ability === "iron-fist" && PUNCH_MOVES.has(move.slug)) dmg = Math.floor(dmg * 1.2);
  if (attacker.ability === "tough-claws" && isPhys) dmg = Math.floor(dmg * 1.33);
  if (attacker.ability === "mega-launcher" && PULSE_MOVES.has(move.slug)) dmg = Math.floor(dmg * 1.5);
  if (attacker.ability === "analytic") dmg = Math.floor(dmg * 1.3);

  // Item boosts
  const atkItem = attacker.heldItem;
  if (atkItem === "life-orb") dmg = Math.floor(dmg * 1.3);
  if (atkItem === "choice-band" && isPhys) dmg = Math.floor(dmg * 1.5);
  if (atkItem === "choice-specs" && !isPhys) dmg = Math.floor(dmg * 1.5);
  if (atkItem === "muscle-band" && isPhys) dmg = Math.floor(dmg * 1.1);
  if (atkItem === "wise-glasses" && !isPhys) dmg = Math.floor(dmg * 1.1);
  if (atkItem === "expert-belt" && eff >= 2) dmg = Math.floor(dmg * 1.2);

  // ── Resist Berry: halves damage from matching type ──
  const resistBerrySlug = RESIST_BERRY_FOR[moveType];
  if (resistBerrySlug && defender.heldItem === resistBerrySlug && (eff >= 2 || moveType === "normal")) {
    dmg = Math.floor(dmg / 2);
    defender.heldItem = null;
    msgs.push(`🍇 ${defName} กิน ${BERRIES[resistBerrySlug]?.nameTh}! ลดดาเมจครึ่งหนึ่ง!`);
  }

  dmg = Math.floor(dmg * (Math.floor(Math.random() * 16) + 85) / 100);
  dmg = Math.max(1, dmg);

  if (!ignoringAbility && defender.ability === "multiscale" && defender.currentHp === defender.maxHp) {
    dmg = Math.floor(dmg / 2); msgs.push(`✨ Multiscale ของ ${defName} ลดดาเมจ!`);
  }
  if (defender.heldItem === "focus-sash" && !defender.sashUsed && defender.currentHp === defender.maxHp && dmg >= defender.currentHp) {
    dmg = defender.currentHp - 1; defender.sashUsed = true; msgs.push(`🧣 Focus Sash ของ ${defName} ป้องกัน!`);
  }
  if (!ignoringAbility && defender.ability === "sturdy" && defender.currentHp === defender.maxHp && dmg >= defender.currentHp) {
    dmg = defender.currentHp - 1; msgs.push(`💪 Sturdy ของ ${defName} ทนอยู่!`);
  }
  const weaknessPolicyTriggered = !!(defender.heldItem === "weakness-policy" && !defender.weaknessPolicyUsed && eff >= 2);
  if (defender.heldItem === "air-balloon" && !defender.airBalloonPopped && dmg > 0) {
    defender.airBalloonPopped = true; msgs.push(`🎈 Air Balloon ของ ${defName} แตก!`);
  }
  return { damage: dmg, effectiveness: eff, isCrit, missed: false, messages: msgs, weaknessPolicyTriggered };
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function aiPickAction(
  attacker: SimPokemon,
  targets: SimPokemon[],
  weather: WeatherName = "none",
): { moveIndex: number; targetIndex: number; useDynamax: boolean; useZMove: boolean; useTera: boolean } {
  const available = attacker.moves.map((m, i) => ({ m, i })).filter(x => x.m.currentPp > 0);
  if (attacker.choiceLockedMove !== null) {
    const mv = attacker.moves[attacker.choiceLockedMove];
    if (mv && mv.currentPp > 0) return { moveIndex: attacker.choiceLockedMove, targetIndex: 0, useDynamax: false, useZMove: false, useTera: false };
  }
  if (!available.length) return { moveIndex: 0, targetIndex: 0, useDynamax: false, useZMove: false, useTera: false };

  // Score each move against each target
  let best = { score: -1, mi: available[0].i, ti: 0 };
  for (const { m, i } of available) {
    for (let ti = 0; ti < targets.length; ti++) {
      if (targets[ti].currentHp <= 0) continue;
      const t = targets[ti];
      let eff = m.power ? getSimEff(m.type, t.types) : 0.3;
      if (t.ability === "wonder-guard" && eff < 2) eff = 0;
      if (t.ability === "levitate" && m.type === "ground") eff = 0;
      if ((t.ability === "water-absorb" || t.ability === "dry-skin") && m.type === "water") eff = 0;
      if ((t.ability === "volt-absorb" || t.ability === "lightning-rod") && m.type === "electric") eff = 0;
      if (t.ability === "flash-fire" && m.type === "fire") eff = 0;
      if (t.ability === "sap-sipper" && m.type === "grass") eff = 0;
      if (t.heldItem === "air-balloon" && !t.airBalloonPopped && m.type === "ground") eff = 0;
      const stab = attacker.types.includes(m.type) ? 1.5 : 1;
      // Weather bonus for AI awareness
      let weatherMult = 1;
      if (weather === "rain" && m.type === "water") weatherMult = 1.5;
      if (weather === "rain" && m.type === "fire") weatherMult = 0.5;
      if (weather === "sun" && m.type === "fire") weatherMult = 1.5;
      if (weather === "sun" && m.type === "water") weatherMult = 0.5;
      // Prefer finishing move if target is low HP
      const hpFactor = t.currentHp < t.maxHp * 0.3 ? 1.5 : 1;
      const score = (m.power || 5) * eff * stab * weatherMult * hpFactor * (0.85 + Math.random() * 0.3);
      if (score > best.score) best = { score, mi: i, ti };
    }
  }

  // Use Z-Move when we have SE hit
  const bestMove = attacker.moves[best.mi];
  const bestTarget = targets[best.ti];
  const zCrystalType = attacker.heldItem ? Z_CRYSTAL_ITEMS[attacker.heldItem]?.type : null;
  const zOk = !!(zCrystalType && bestMove?.type === zCrystalType && bestMove.power);
  const bestEff = bestMove && bestTarget ? getSimEff(bestMove.type, bestTarget.types) : 1;
  const shouldUseZ = zOk && (bestEff >= 2 || Math.random() < 0.3);

  // Use Dynamax when not yet used, at good HP, or opponent is nearly beaten
  const shouldDynamax = !attacker.dynamaxUsed && !attacker.megaEvolved &&
    (attacker.currentHp >= attacker.maxHp * 0.7 || (bestTarget && bestTarget.currentHp < bestTarget.maxHp * 0.5)) &&
    Math.random() < 0.5;

  // Use Tera when taking super effective hits or when it boosts STAB
  const shouldTera = !attacker.teraActive &&
    (bestEff >= 2 || !attacker.types.includes(attacker.teraType)) &&
    Math.random() < 0.4;

  return { moveIndex: best.mi, targetIndex: best.ti, useDynamax: shouldDynamax, useZMove: shouldUseZ, useTera: shouldTera };
}

// ─── Turn Processing ──────────────────────────────────────────────────────────

export function processTurn(state: BattleState, playerActions: PlayerAction[]): TurnResult {
  const pt = JSON.parse(JSON.stringify(state.playerTeam)) as SimPokemon[];
  const ot = JSON.parse(JSON.stringify(state.opponentTeam)) as SimPokemon[];
  const log: BattleLogEntry[] = [];
  let lid = state.logSeed;
  const add = (text: string, kind: BattleLogEntry["kind"] = "info") => log.push({ id: lid++, text, kind });

  let playerMegaUsed = state.playerMegaUsed;
  let opponentMegaUsed = state.opponentMegaUsed;
  let playerTeraUsed = state.playerTeraUsed;
  let opponentTeraUsed = state.opponentTeraUsed;
  let weather = state.weather;
  let weatherTurns = state.weatherTurns;
  const setWeather = (w: WeatherName, turns: number) => { weather = w; weatherTurns = turns; };

  type Act = { side: "p"|"o"; teamIdx: number; targetTeamIdx: number; moveIndex: number; priority: number; speed: number; useMega: boolean; useZMove: boolean; useDynamax: boolean; useTera: boolean; switchTo?: number };
  const allActs: Act[] = [];

  // Track active indices mutably so switch actions can update them before moves
  let newPlayerActive = [...state.playerActive];
  let newOpponentActive = [...state.opponentActive];

  for (const pa of playerActions) {
    const ti = state.playerActive[pa.activeSlot]; if (ti === undefined) continue;
    const pk = pt[ti]; if (!pk || pk.currentHp <= 0) continue;
    if (pa.switchTo !== undefined && pa.moveIndex < 0) {
      // Switch action: high priority, processes before moves
      allActs.push({ side: "p", teamIdx: ti, targetTeamIdx: 0, moveIndex: -1, priority: 7, speed: 9999, useMega: false, useZMove: false, useDynamax: false, useTera: false, switchTo: pa.switchTo });
      continue;
    }
    const effectiveMoveIdx = pk.choiceLockedMove !== null ? pk.choiceLockedMove : pa.moveIndex;
    const mv = pk.moves[effectiveMoveIdx];
    let spd = withStage(pk.speed, pk.stages.speed);
    if (pk.status === "paralysis" && pk.ability !== "quick-feet") spd = Math.floor(spd * 0.5);
    if (pk.ability === "quick-feet" && pk.status !== "none") spd = Math.floor(spd * 1.5);
    if (pk.heldItem === "choice-scarf") spd = Math.floor(spd * 1.5);
    if (pk.ability === "swift-swim" && weather === "rain") spd = Math.floor(spd * 2);
    if (pk.ability === "chlorophyll" && weather === "sun") spd = Math.floor(spd * 2);
    if (pk.ability === "sand-rush" && weather === "sand") spd = Math.floor(spd * 2);
    const useTera = !!pa.useTera && !playerTeraUsed;
    allActs.push({ side: "p", teamIdx: ti, targetTeamIdx: state.opponentActive[pa.targetSlot] ?? state.opponentActive[0], moveIndex: effectiveMoveIdx, priority: mv?.priority ?? 0, speed: spd, useMega: !!pa.useMega && !playerMegaUsed, useZMove: !!pa.useZMove, useDynamax: !!pa.useDynamax && !pk.dynamaxUsed, useTera });
  }

  for (const aiIdx of state.opponentActive) {
    const pk = ot[aiIdx]; if (!pk || pk.currentHp <= 0) continue;
    const targets = state.playerActive.map(i => pt[i]).filter(t => t.currentHp > 0);
    const { moveIndex, targetIndex, useDynamax, useZMove, useTera: aiTera } = aiPickAction(pk, targets, weather);
    const mv = pk.moves[moveIndex];
    let spd = withStage(pk.speed, pk.stages.speed);
    if (pk.status === "paralysis" && pk.ability !== "quick-feet") spd = Math.floor(spd * 0.5);
    if (pk.ability === "quick-feet" && pk.status !== "none") spd = Math.floor(spd * 1.5);
    if (pk.heldItem === "choice-scarf") spd = Math.floor(spd * 1.5);
    if (pk.ability === "swift-swim" && weather === "rain") spd = Math.floor(spd * 2);
    if (pk.ability === "chlorophyll" && weather === "sun") spd = Math.floor(spd * 2);
    if (pk.ability === "sand-rush" && weather === "sand") spd = Math.floor(spd * 2);
    const aiMega = !opponentMegaUsed && !!(pk.heldItem && MEGA_STONE_ITEMS[pk.heldItem]);
    const aiTeraOk = aiTera && !opponentTeraUsed && !pk.teraActive;
    allActs.push({ side: "o", teamIdx: aiIdx, targetTeamIdx: state.playerActive[targetIndex] ?? state.playerActive[0], moveIndex, priority: mv?.priority ?? 0, speed: spd, useMega: aiMega, useZMove, useDynamax: useDynamax && !pk.dynamaxUsed, useTera: aiTeraOk });
  }

  allActs.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (Math.abs(a.speed - b.speed) < 0.5) return Math.random() - 0.5;
    return b.speed - a.speed;
  });

  const STATUS_NAMES: Record<BattleStatus, string> = { none: "", burn: "ถูกเผา", paralysis: "เป็นอัมพาต", poison: "ถูกพิษ", sleep: "หลับ", freeze: "ถูกแช่แข็ง" };
  const STATUS_MAP: Record<string, BattleStatus> = { burn: "burn", paralysis: "paralysis", poison: "poison", sleep: "sleep", freeze: "freeze" };

  for (const act of allActs) {
    const atkTeam = act.side === "p" ? pt : ot;
    const defTeam = act.side === "p" ? ot : pt;

    // ── Switch action ──
    if (act.moveIndex < 0 && act.switchTo !== undefined) {
      const outPoke = atkTeam[act.teamIdx];
      const inPoke = atkTeam[act.switchTo];
      if (!inPoke || inPoke.currentHp <= 0) continue;
      const outName = outPoke?.nameTh || outPoke?.nameEn || "?";
      const inName = inPoke.nameTh || inPoke.nameEn;
      if (outPoke) add(`${outName} กลับเข้ามา!`, "info");
      add(`${inName} ออกมาต่อสู้!`, "info");
      const activeArr = act.side === "p" ? newPlayerActive : newOpponentActive;
      const slotIdx = activeArr.indexOf(act.teamIdx);
      if (slotIdx >= 0) activeArr[slotIdx] = act.switchTo;
      const oppActive = act.side === "p" ? newOpponentActive : newPlayerActive;
      applyEntry(inPoke, act.side, pt, ot, [...activeArr], [...oppActive], add, setWeather);
      continue;
    }

    const attacker = atkTeam[act.teamIdx];
    if (!attacker || attacker.currentHp <= 0) continue;

    // ── Mega Evolution ──
    if (act.useMega && !attacker.megaEvolved) {
      const stone = attacker.heldItem;
      if (stone && MEGA_STONE_ITEMS[stone]) {
        applyMegaEvolution(attacker, MEGA_STONE_ITEMS[stone].megaSlug);
        if (act.side === "p") playerMegaUsed = true; else opponentMegaUsed = true;
        add(`🔮 ${attacker.nameTh || attacker.nameEn} เมก้าอีโวลูชัน!`, "status");
      }
    }

    // ── Dynamax ──
    if (act.useDynamax && !attacker.dynamaxUsed && attacker.dynamaxTurnsLeft === 0) {
      attacker.baseMaxHp = attacker.maxHp;
      attacker.currentHp = Math.min(attacker.currentHp * 2, attacker.maxHp * 2);
      attacker.maxHp = attacker.maxHp * 2;
      attacker.dynamaxTurnsLeft = 3;
      attacker.dynamaxUsed = true;
      const isGMax = GMAX_POKEMON.has(attacker.slug);
      add(`🌟 ${attacker.nameTh || attacker.nameEn} ${isGMax ? "กิกะแมกซ์" : "ไดนาแมกซ์"}!`, "status");
    }

    // ── Terastallization ──
    if (act.useTera && !attacker.teraActive) {
      attacker.teraActive = true;
      attacker.types = [attacker.teraType];
      if (act.side === "p") playerTeraUsed = true; else opponentTeraUsed = true;
      const TERA_ICONS: Partial<Record<string, string>> = {
        fire: "🔥", water: "💧", grass: "🌿", electric: "⚡", ice: "❄️", fighting: "🥊",
        poison: "☠️", ground: "🌍", flying: "🦅", psychic: "🔮", bug: "🐛", rock: "🪨",
        ghost: "👻", dragon: "🐉", dark: "🌑", steel: "⚙️", fairy: "🌸", normal: "⭐",
      };
      const icon = TERA_ICONS[attacker.teraType] ?? "✨";
      add(`${icon} ${attacker.nameTh || attacker.nameEn} เทราสตอลไลเซชัน! กลายเป็นธาตุ ${attacker.teraType.toUpperCase()}!`, "status");
    }

    const mv = attacker.moves[act.moveIndex];
    if (!mv) continue;
    const an = attacker.nameTh || attacker.nameEn;

    if (attacker.heldItem === "assault-vest" && mv.category === "status") {
      add(`🦺 ${an} ถือ Assault Vest ไม่สามารถใช้ท่าสถานะ!`); continue;
    }
    if (attacker.status === "paralysis" && attacker.ability !== "quick-feet" && Math.random() < 0.25) {
      add(`⚡ ${an} เป็นอัมพาตเคลื่อนไหวไม่ได้!`, "status"); continue;
    }
    if (attacker.status === "sleep") {
      if (attacker.statusTurns <= 0) { attacker.status = "none"; add(`😴 ${an} ตื่นนอนแล้ว!`, "status"); }
      else { attacker.statusTurns--; add(`💤 ${an} กำลังหลับอยู่...`, "status"); continue; }
    }
    if (attacker.status === "freeze") {
      if (Math.random() < 0.2) { attacker.status = "none"; add(`🧊 ${an} ละลายจากน้ำแข็ง!`, "status"); }
      else { add(`🧊 ${an} ถูกแช่แข็งเคลื่อนไหวไม่ได้!`, "status"); continue; }
    }
    if (mv.currentPp <= 0) { add(`${an} หมด PP!`); continue; }
    mv.currentPp--;

    const target = defTeam[act.targetTeamIdx];
    if (target && target.ability === "pressure" && target.currentHp > 0) mv.currentPp = Math.max(0, mv.currentPp - 1);
    if (!target || target.currentHp <= 0) continue;
    const tn = target.nameTh || target.nameEn;

    // ── Build effective move (Dynamax / Z-Move overrides) ──
    let effectiveMove = { ...mv };
    let isZMove = false;
    let isDynamaxed = attacker.dynamaxTurnsLeft > 0;

    if (act.useZMove && attacker.heldItem && Z_CRYSTAL_ITEMS[attacker.heldItem]?.type === mv.type) {
      isZMove = true;
      if (mv.category !== "status") {
        effectiveMove = { ...mv, power: calcZPower(mv.power || 10), accuracy: 0 };
        attacker.heldItem = null; // consumed
        add(`💥 Z-${mv.nameTh && mv.nameTh !== mv.nameEn ? mv.nameTh : mv.nameEn}!`, "status");
      } else {
        // Z-Status: boost a stat
        attacker.heldItem = null;
        const boost: keyof typeof attacker.stages = attacker.atk >= attacker.spAtk ? "atk" : "spAtk";
        attacker.stages[boost] = Math.min(6, attacker.stages[boost] + 1);
        add(`💥 Z-${mv.nameTh && mv.nameTh !== mv.nameEn ? mv.nameTh : mv.nameEn}! ${an} เพิ่ม ${boost === "atk" ? "Atk" : "SpAtk"}!`, "status");
        continue;
      }
    }

    if (isDynamaxed && mv.category !== "status") {
      const isGMax = GMAX_POKEMON.has(attacker.slug);
      const maxName = getMaxMoveName(mv.type, isGMax, attacker.slug);
      effectiveMove = { ...mv, nameEn: maxName, nameTh: maxName, power: getDynamaxPower(mv.power), accuracy: 0, priority: 0 };
    }

    const displayName = effectiveMove.nameTh && effectiveMove.nameTh !== effectiveMove.nameEn ? effectiveMove.nameTh : effectiveMove.nameEn;
    add(`${an} ใช้ ${displayName}!`);

    // Magic Bounce: reflect status moves
    if (effectiveMove.category === "status") {
      if (!isZMove && target.ability === "magic-bounce") {
        add(`🪞 Magic Bounce ของ ${tn} สะท้อน ${displayName}!`, "status");
        // Apply status to attacker instead
        const s = STATUS_MAP[effectiveMove.ailment];
        if (s && canApplyStatus(attacker, s)) { attacker.status = s; if (s === "sleep") attacker.statusTurns = Math.floor(Math.random() * 3) + 2; add(`${an}${STATUS_NAMES[s]}!`, "status"); }
      } else {
        const s = STATUS_MAP[effectiveMove.ailment];
        if (s && canApplyStatus(target, s)) {
          target.status = s; if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2;
          add(`${tn}${STATUS_NAMES[s]}!`, "status");
        } else { add("ไม่มีผล!"); }
      }
      if (attacker.heldItem === "choice-band" || attacker.heldItem === "choice-specs" || attacker.heldItem === "choice-scarf") {
        if (attacker.choiceLockedMove === null) attacker.choiceLockedMove = act.moveIndex;
      }
      continue;
    }

    const { damage, effectiveness, isCrit, missed, messages, weaknessPolicyTriggered } = rollDamage(attacker, target, effectiveMove, { ignoreAcc: isZMove || isDynamaxed, weather });
    for (const m of messages) add(m, "status");
    if (missed) { add(`${an} พลาด!`); continue; }

    // Parental Bond: second hit
    const secondHit = attacker.ability === "parental-bond" && damage > 0 && !isZMove && !isDynamaxed;

    if (damage > 0) {
      const hpPct = Math.round((damage / target.maxHp) * 100);
      target.currentHp = Math.max(0, target.currentHp - damage);
      const critMark = isCrit ? " 💥 คริติคอล!" : "";
      add(`${tn} รับ ${damage} แดมเมจ (${hpPct}% HP)${critMark} [${target.currentHp}/${target.maxHp} HP]`, isCrit ? "status" : "damage");
    }

    if (secondHit && target.currentHp > 0) {
      const { damage: d2 } = rollDamage(attacker, target, { ...effectiveMove, power: Math.floor(effectiveMove.power * 0.25) }, { weather });
      if (d2 > 0) {
        const p2 = Math.round((d2 / target.maxHp) * 100);
        target.currentHp = Math.max(0, target.currentHp - d2);
        add(`${an} โจมตีครั้งที่สอง! ${tn} รับ ${d2} (${p2}%) [${target.currentHp}/${target.maxHp} HP]`, "damage");
      }
    }

    if (attacker.heldItem === "choice-band" || attacker.heldItem === "choice-specs" || attacker.heldItem === "choice-scarf") {
      if (attacker.choiceLockedMove === null) attacker.choiceLockedMove = act.moveIndex;
    }
    if (weaknessPolicyTriggered && damage > 0) {
      target.weaknessPolicyUsed = true; target.heldItem = null;
      target.stages.atk = Math.min(6, target.stages.atk + 2); target.stages.spAtk = Math.min(6, target.stages.spAtk + 2);
      add(`📜 Weakness Policy ของ ${tn} เพิ่ม Atk+SpAtk!`, "status");
    }
    if (attacker.heldItem === "shell-bell" && damage > 0) {
      const h = Math.max(1, Math.floor(damage / 8)); attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
      add(`🐚 ${an} ฟื้น ${h} HP จาก Shell Bell!`, "heal");
    }
    if (attacker.heldItem === "life-orb" && damage > 0 && attacker.ability !== "magic-guard") {
      const r = Math.max(1, Math.floor(attacker.maxHp / 10)); attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`💎 Life Orb ดูดพลัง ${an} ${r} HP!`, "damage");
      if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }
    if (target.heldItem === "rocky-helmet" && effectiveMove.category === "physical" && damage > 0 && attacker.ability !== "magic-guard") {
      const r = Math.max(1, Math.floor(attacker.maxHp / 6)); attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`⛏️ Rocky Helmet ของ ${tn} ทำอันตราย ${an} ${r} HP!`, "damage");
      if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }

    // Secondary ailment
    if (effectiveMove.ailment && effectiveMove.ailment !== "none" && effectiveMove.ailmentChance > 0 && attacker.ability !== "sheer-force" && !isZMove) {
      const chance = attacker.ability === "serene-grace" ? effectiveMove.ailmentChance * 2 : effectiveMove.ailmentChance;
      if (Math.random() * 100 < chance) {
        const s = STATUS_MAP[effectiveMove.ailment];
        if (s && canApplyStatus(target, s)) { target.status = s; if (s === "sleep") target.statusTurns = Math.floor(Math.random() * 3) + 2; add(`${tn}${STATUS_NAMES[s]}!`, "status"); }
      }
    }
    if (effectiveMove.drain > 0 && damage > 0) { const h = Math.max(1, Math.floor(damage * effectiveMove.drain / 100)); attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h); add(`${an} ดูดซับ ${h} HP!`, "heal"); }
    if (effectiveMove.recoil > 0 && damage > 0 && attacker.ability !== "magic-guard") {
      const r = Math.max(1, Math.floor(damage * effectiveMove.recoil / 100)); attacker.currentHp = Math.max(0, attacker.currentHp - r);
      add(`${an} รับดาเมจสะท้อน ${r}!`, "damage"); if (attacker.currentHp <= 0) add(`${an} หมดแรง!`, "faint");
    }
    if (target.currentHp <= 0) add(`${tn} หมดแรง!`, "faint");
  }

  // ── End-of-turn: Weather countdown + damage ──
  if (weather !== "none") {
    weatherTurns--;
    const WEATHER_ICONS: Record<WeatherName, string> = { none: "", rain: "🌧️", sun: "☀️", sand: "🌪️", hail: "🌨️" };
    const WEATHER_NAMES: Record<WeatherName, string> = { none: "", rain: "ฝน", sun: "แดดจัด", sand: "พายุทราย", hail: "พายุหิมะ" };
    if (weatherTurns <= 0) {
      add(`${WEATHER_ICONS[weather]} ${WEATHER_NAMES[weather]}สงบลงแล้ว`, "info");
      weather = "none";
    } else {
      add(`${WEATHER_ICONS[weather]} ${WEATHER_NAMES[weather]}ยังคงพัดต่อ... (${weatherTurns} เทิร์น)`, "info");
    }
    if (weather === "sand" || weather === "hail") {
      for (const p of [...pt, ...ot]) {
        if (p.currentHp <= 0) continue;
        const immune = weather === "sand"
          ? (p.types.includes("rock") || p.types.includes("steel") || p.types.includes("ground") || p.ability === "sand-veil" || p.ability === "sand-rush" || p.ability === "sand-force" || p.ability === "magic-guard")
          : (p.types.includes("ice") || p.ability === "ice-body" || p.ability === "snow-cloak" || p.ability === "magic-guard" || p.ability === "overcoat");
        if (!immune) {
          const d = Math.max(1, Math.floor(p.maxHp / 16));
          p.currentHp = Math.max(0, p.currentHp - d);
          const n = p.nameTh || p.nameEn;
          add(`${WEATHER_ICONS[weather]} ${n} รับ ${d} แดมเมจจาก${WEATHER_NAMES[weather]}!`, "status");
          if (p.currentHp <= 0) add(`${n} หมดแรง!`, "faint");
        }
      }
    }
    if (weather === "sun") {
      for (const p of [...pt, ...ot]) {
        if (p.currentHp <= 0) continue;
        if (p.ability === "solar-power") {
          const d = Math.max(1, Math.floor(p.maxHp / 8));
          p.currentHp = Math.max(0, p.currentHp - d);
          const n = p.nameTh || p.nameEn;
          add(`☀️ Solar Power ดูด HP ${n} ${d}!`, "status");
          if (p.currentHp <= 0) add(`${n} หมดแรง!`, "faint");
        }
        if (p.ability === "dry-skin") {
          const d = Math.max(1, Math.floor(p.maxHp / 8));
          p.currentHp = Math.max(0, p.currentHp - d);
          const n = p.nameTh || p.nameEn;
          add(`☀️ Dry Skin ดูด HP ${n} ${d}!`, "status");
          if (p.currentHp <= 0) add(`${n} หมดแรง!`, "faint");
        }
      }
    }
    if (weather === "rain") {
      for (const p of [...pt, ...ot]) {
        if (p.currentHp <= 0) continue;
        if (p.ability === "rain-dish" || p.ability === "dry-skin") {
          const h = Math.max(1, Math.floor(p.maxHp / 16));
          p.currentHp = Math.min(p.maxHp, p.currentHp + h);
          const n = p.nameTh || p.nameEn;
          add(`🌧️ ${p.ability === "dry-skin" ? "Dry Skin" : "Rain Dish"} ฟื้น ${n} ${h} HP!`, "heal");
        }
      }
    }
  }

  // ── End-of-turn: Dynamax countdown ──
  for (const p of [...pt, ...ot]) {
    if (p.dynamaxTurnsLeft > 0) {
      p.dynamaxTurnsLeft--;
      if (p.dynamaxTurnsLeft === 0 && p.baseMaxHp > 0) {
        const ratio = p.currentHp / p.maxHp;
        p.maxHp = p.baseMaxHp;
        p.currentHp = Math.max(1, Math.floor(ratio * p.maxHp));
        p.baseMaxHp = 0;
        add(`🌟 ${p.nameTh || p.nameEn} กลับสู่รูปร่างเดิม!`, "status");
      }
    }
  }

  // ── End-of-turn: status & items ──
  for (const p of [...pt, ...ot]) {
    if (p.currentHp <= 0) continue;
    const n = p.nameTh || p.nameEn;
    const magicGuard = p.ability === "magic-guard";
    if (p.status === "burn") {
      if (!magicGuard) { const d = Math.max(1, Math.floor(p.maxHp / 16)); p.currentHp = Math.max(0, p.currentHp - d); add(`🔥 ${n} รับ ${d} แดมเมจจากถูกเผา`, "status"); if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; } }
    } else if (p.status === "poison") {
      if (p.ability === "poison-heal") { const h = Math.max(1, Math.floor(p.maxHp / 8)); p.currentHp = Math.min(p.maxHp, p.currentHp + h); add(`💚 Poison Heal ของ ${n} ฟื้น ${h} HP!`, "heal"); }
      else if (!magicGuard) { const d = Math.max(1, Math.floor(p.maxHp / 8)); p.currentHp = Math.max(0, p.currentHp - d); add(`☠️ ${n} รับ ${d} แดมเมจจากพิษ`, "status"); if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; } }
    }
    if (p.currentHp <= 0) continue;
    if (p.ability === "speed-boost") { p.stages.speed = Math.min(6, p.stages.speed + 1); add(`⚡ Speed Boost ของ ${n} เพิ่ม Speed!`, "status"); }
    if (!p.heldItem) continue;
    if (p.heldItem === "leftovers") { const h = Math.max(1, Math.floor(p.maxHp / 16)); p.currentHp = Math.min(p.maxHp, p.currentHp + h); add(`🍃 ${n} ฟื้น ${h} HP จาก Leftovers!`, "heal"); }
    else if (p.heldItem === "black-sludge") {
      if (p.types.includes("poison")) { const h = Math.max(1, Math.floor(p.maxHp / 16)); p.currentHp = Math.min(p.maxHp, p.currentHp + h); add(`🖤 ${n} ฟื้น ${h} HP จาก Black Sludge!`, "heal"); }
      else if (!magicGuard) { const d = Math.max(1, Math.floor(p.maxHp / 8)); p.currentHp = Math.max(0, p.currentHp - d); add(`🖤 Black Sludge ทำอันตราย ${n} ${d} HP!`, "status"); if (p.currentHp <= 0) { add(`${n} หมดแรง!`, "faint"); continue; } }
    } else if (p.heldItem === "flame-orb") { if (canApplyStatus(p, "burn")) { p.status = "burn"; add(`🔥 Flame Orb เผา ${n}!`, "status"); } }
    else if (p.heldItem === "toxic-orb") { if (canApplyStatus(p, "poison")) { p.status = "poison"; add(`☠️ Toxic Orb วางพิษ ${n}!`, "status"); } }
    if (p.currentHp <= 0) continue;
    if (p.heldItem === "sitrus-berry" && p.currentHp <= Math.floor(p.maxHp / 2)) { const h = Math.max(1, Math.floor(p.maxHp / 4)); p.currentHp = Math.min(p.maxHp, p.currentHp + h); p.heldItem = null; add(`🍊 ${n} กินผลไม้ซิตรัส ฟื้น ${h} HP!`, "heal"); }
    if (p.heldItem === "lum-berry" && p.status !== "none") { p.status = "none"; p.statusTurns = 0; p.heldItem = null; add(`🫐 ${n} กินผลไม้ลัม หายจากสถานะ!`, "heal"); }

    // ── Extra berries ──────────────────────────────────────────────────────────
    if (!p.heldItem) continue;

    // Oran Berry: heal 10 HP at ≤50%
    if (p.heldItem === "oran-berry" && p.currentHp <= Math.floor(p.maxHp / 2)) {
      p.currentHp = Math.min(p.maxHp, p.currentHp + 10); p.heldItem = null;
      add(`🍇 ${n} กินผลไม้โอราน ฟื้น 10 HP!`, "heal");
    }

    // Pinch healing berries: heal 1/3 HP at ≤25%
    if (["figy-berry","wiki-berry","mago-berry","aguav-berry","iapapa-berry"].includes(p.heldItem!) && p.currentHp <= Math.floor(p.maxHp / 4)) {
      const h = Math.max(1, Math.floor(p.maxHp / 3)); p.currentHp = Math.min(p.maxHp, p.currentHp + h);
      const bname = BERRIES[p.heldItem!]?.nameTh ?? p.heldItem!; p.heldItem = null;
      add(`🍇 ${n} กิน${bname} ฟื้น ${h} HP!`, "heal");
    }

    // Status-cure berries
    const STATUS_CURE: Partial<Record<string, BattleStatus>> = {
      "cheri-berry": "paralysis", "chesto-berry": "sleep",
      "pecha-berry": "poison", "rawst-berry": "burn", "aspear-berry": "freeze",
    };
    if (p.heldItem && STATUS_CURE[p.heldItem] && p.status === STATUS_CURE[p.heldItem]) {
      const bname = BERRIES[p.heldItem]?.nameTh ?? p.heldItem; p.heldItem = null;
      p.status = "none"; p.statusTurns = 0;
      add(`🍇 ${n} กิน${bname} หายจากสถานะ!`, "heal");
    }

    // Pinch stat-boost berries at ≤25% HP
    if (!p.heldItem) continue;
    if (p.currentHp <= Math.floor(p.maxHp / 4)) {
      type StageKey = keyof typeof p.stages;
      const PINCH_STAT: Partial<Record<string, StageKey>> = {
        "liechi-berry": "atk", "petaya-berry": "spAtk", "salac-berry": "speed",
        "apicot-berry": "spDef", "ganlon-berry": "def",
      };
      if (PINCH_STAT[p.heldItem]) {
        const stat = PINCH_STAT[p.heldItem]!;
        p.stages[stat] = Math.min(6, p.stages[stat] + 1);
        const bname = BERRIES[p.heldItem]?.nameTh ?? p.heldItem; p.heldItem = null;
        add(`🍇 ${n} กิน${bname}! ${stat} เพิ่ม!`, "status");
      }
      if (p.heldItem === "starf-berry") {
        const stats: StageKey[] = ["atk","def","spAtk","spDef","speed"];
        const stat = stats[Math.floor(Math.random() * stats.length)];
        p.stages[stat] = Math.min(6, p.stages[stat] + 2);
        p.heldItem = null;
        add(`🍇 ${n} กินผลไม้สตาร์ฟ! ${stat} เพิ่มมาก!`, "status");
      }
      if (p.heldItem === "micle-berry") {
        p.stages.acc = Math.min(6, p.stages.acc + 1); p.heldItem = null;
        add(`🍇 ${n} กินผลไม้ไมเคิล! ความแม่นยำเพิ่ม!`, "status");
      }
    }
  }

  // ── Auto-switch fainted ──

  const updateActive = (team: SimPokemon[], active: number[], side: "p"|"o", otherActive: number[]): number[] =>
    active.map(ai => {
      if (team[ai].currentHp > 0) return ai;
      const next = team.findIndex((p, i) => p.currentHp > 0 && !active.includes(i));
      if (next >= 0) {
        add(`${team[next].nameTh || team[next].nameEn} ออกมาต่อสู้!`);
        applyEntry(team[next], side, pt, ot, side === "p" ? [next] : active, side === "p" ? otherActive : [next], add, setWeather);
        return next;
      }
      return ai;
    });

  newPlayerActive = updateActive(pt, newPlayerActive, "p", newOpponentActive);
  newOpponentActive = updateActive(ot, newOpponentActive, "o", newPlayerActive);

  const playerFainted = pt.every(p => p.currentHp <= 0);
  const opponentFainted = ot.every(p => p.currentHp <= 0);
  let winner: BattleState["winner"] = null;
  if (opponentFainted) { winner = "player"; add("คุณชนะการต่อสู้! 🎉", "result"); }
  else if (playerFainted) { winner = "opponent"; add("คุณพ่ายแพ้...", "result"); }

  return {
    log,
    state: { ...state, playerTeam: pt, opponentTeam: ot, playerActive: newPlayerActive, opponentActive: newOpponentActive, turn: state.turn + 1, logSeed: lid, winner, playerMegaUsed, opponentMegaUsed, playerTeraUsed, opponentTeraUsed, weather, weatherTurns },
  };
}
