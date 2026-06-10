import Link from "next/link";
import { Zap } from "lucide-react";

const FEATURED_ABILITIES = [
  { name: "Speed Boost", nameTh: "Speed Boost", effect: "เพิ่ม Speed ทุกเทิร์น", notable: ["Blaziken", "Sharpedo"] },
  { name: "Drought", nameTh: "Drought", effect: "ตั้งสภาพ Sunny Day เมื่อออกมา", notable: ["Ninetales", "Groudon"] },
  { name: "Drizzle", nameTh: "Drizzle", effect: "ตั้งสภาพ Rain Dance เมื่อออกมา", notable: ["Pelipper", "Kyogre"] },
  { name: "Intimidate", nameTh: "Intimidate", effect: "ลด Attack ฝ่ายตรงข้าม -1", notable: ["Salamence", "Gyarados"] },
  { name: "Levitate", nameTh: "Levitate", effect: "ภูมิคุ้มกัน Ground", notable: ["Gengar", "Rotom"] },
  { name: "Magic Guard", nameTh: "Magic Guard", effect: "ไม่รับดาเมจทางอ้อม", notable: ["Clefable", "Alakazam"] },
  { name: "Regenerator", nameTh: "Regenerator", effect: "ฟื้น HP 1/3 เมื่อสลับ", notable: ["Slowbro", "Tangrowth"] },
  { name: "Prankster", nameTh: "Prankster", effect: "ท่าสถานะมี Priority +1", notable: ["Klefki", "Sableye"] },
];

export default function AbilitiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-400" />
          ความสามารถ <span className="text-gradient">ทั้งหมด</span>
        </h1>
        <p className="text-muted-foreground">Abilities ทุกตัว พร้อมคำอธิบายภาษาไทย</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Abilities ยอดนิยมใน Competitive</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_ABILITIES.map((ab) => (
            <div key={ab.name} className="p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
              <p className="font-bold mb-1">{ab.name}</p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ab.effect}</p>
              <div className="flex flex-wrap gap-1">
                {ab.notable.map((n) => (
                  <Link
                    key={n}
                    href={`/pokedex/${n.toLowerCase()}`}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {n}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">ฐานข้อมูล Abilities กำลังถูกนำเข้า</p>
      </div>
    </div>
  );
}
