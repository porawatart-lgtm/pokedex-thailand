import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Bot, Sword, Users, Trophy, Star, Zap, Book } from "lucide-react";
import { TypeBadge } from "@/components/pokemon/type-badge";
import type { PokemonTypeName } from "@/types/pokemon";

const FEATURED_POKEMON = [
  { id: 6, name: "Charizard", nameTh: "ลิซาร์ดอน", types: ["fire", "flying"] },
  { id: 150, name: "Mewtwo", nameTh: "มิวทู", types: ["psychic"] },
  { id: 249, name: "Lugia", nameTh: "ลูเกีย", types: ["psychic", "flying"] },
  { id: 445, name: "Garchomp", nameTh: "กาชุมปุ", types: ["dragon", "ground"] },
  { id: 800, name: "Necrozma", nameTh: "เนโครซ์มา", types: ["psychic"] },
  { id: 1002, name: "Koraidon", nameTh: "โคไรดอน", types: ["fighting", "dragon"] },
];

const FEATURES = [
  {
    icon: Book,
    title: "โปเกเด็กซ์ครบถ้วน",
    description: "โปเกมอนทุกตัว Gen 1-9 พร้อมข้อมูล Stats, Moves, Abilities ครบ",
    href: "/pokedex",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
  },
  {
    icon: Sword,
    title: "ฐานข้อมูลท่าโจมตี",
    description: "ท่าโจมตีทุกท่า พร้อม Type, Power, Accuracy และคำอธิบายภาษาไทย",
    href: "/moves",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Users,
    title: "Team Builder",
    description: "สร้างทีม 6 ตัว วิเคราะห์ Weakness, Coverage และได้รับคำแนะนำ",
    href: "/team-builder",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Zap,
    title: "Damage Calculator",
    description: "คำนวณดาเมจอย่างละเอียด รองรับ Nature, EV, IV, Weather, Terrain",
    href: "/calc",
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Trophy,
    title: "Competitive Center",
    description: "Tier List, Usage Stats, Meta Analysis อ้างอิง Smogon University",
    href: "/competitive",
    color: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Bot,
    title: "AI Team Builder",
    description: "เลือกโปเกมอนตัวหนึ่ง ให้ AI สร้างทีมและอธิบายเหตุผลพร้อมกลยุทธ์",
    href: "/ai-team",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
];

const QUICK_TYPES: PokemonTypeName[] = [
  "fire", "water", "grass", "electric", "psychic", "dragon",
  "dark", "steel", "fairy", "ghost", "fighting", "ice",
];

const GENERATIONS = [
  { gen: 1, region: "Kanto", count: 151, color: "#EE8130" },
  { gen: 2, region: "Johto", count: 100, color: "#F7D02C" },
  { gen: 3, region: "Hoenn", count: 135, color: "#7AC74C" },
  { gen: 4, region: "Sinnoh", count: 107, color: "#6390F0" },
  { gen: 5, region: "Unova", count: 156, color: "#96D9D6" },
  { gen: 6, region: "Kalos", count: 72, color: "#F95587" },
  { gen: 7, region: "Alola", count: 88, color: "#A98FF3" },
  { gen: 8, region: "Galar", count: 96, color: "#B7B7CE" },
  { gen: 9, region: "Paldea", count: 120, color: "#D685AD" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        {/* Floating Pokemon silhouettes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FEATURED_POKEMON.map((p, i) => (
            <div
              key={p.id}
              className="absolute opacity-5 animate-float"
              style={{
                left: `${(i % 3) * 33 + 10}%`,
                top: `${Math.floor(i / 3) * 40 + 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                alt={p.name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Pokéball icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg viewBox="0 0 80 80" className="h-20 w-20 animate-spin-slow">
                <circle cx="40" cy="40" r="38" fill="#CC0000" stroke="#fff" strokeWidth="3" />
                <path d="M2 40h76" stroke="#fff" strokeWidth="3" />
                <circle cx="40" cy="40" r="12" fill="#fff" stroke="#fff" strokeWidth="3" />
                <circle cx="40" cy="40" r="8" fill="#CC0000" />
                <circle cx="40" cy="40" r="4" fill="#fff" />
              </svg>
              <div className="absolute inset-0 rounded-full animate-pulse-slow bg-poke-red/20 blur-xl" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            <span className="text-gradient">Pokédex</span>
            <br />
            <span className="text-foreground text-4xl sm:text-5xl lg:text-6xl">Thailand</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            สารานุกรม Pokémon ที่{" "}
            <span className="text-foreground font-semibold">ครบถ้วนที่สุดในประเทศไทย</span>
            <br />
            รองรับทุก Generation · ทุก Form · ทุก Move · พร้อม AI Team Builder
          </p>

          {/* Search Bar */}
          <form
            action="/pokedex"
            method="get"
            className="relative max-w-lg mx-auto mb-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              name="q"
              type="text"
              placeholder='ค้นหา... เช่น "Pikachu", "ไฟ", "132"'
              className="w-full rounded-2xl border border-border bg-card/80 backdrop-blur-sm pl-12 pr-16 py-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              ค้นหา
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Type Links */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {QUICK_TYPES.map((type) => (
              <Link key={type} href={`/pokedex?type=${type}`}>
                <TypeBadge type={type} size="sm" showTh className="cursor-pointer hover:scale-105 transition-transform" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pokedex"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Book className="h-4 w-4" />
              ดูโปเกเด็กซ์
            </Link>
            <Link
              href="/team-builder"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:bg-secondary transition-all hover:scale-105"
            >
              <Users className="h-4 w-4" />
              Team Builder
            </Link>
            <Link
              href="/ai-team"
              className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/10 text-primary px-6 py-3 font-semibold hover:bg-primary/20 transition-all hover:scale-105"
            >
              <Bot className="h-4 w-4" />
              AI สร้างทีม
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground animate-bounce">
          <div className="h-8 w-0.5 bg-gradient-to-b from-transparent to-muted-foreground rounded-full" />
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y border-border bg-card/50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-gradient">1025+</div>
              <div className="text-sm text-muted-foreground">โปเกมอน</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gradient">900+</div>
              <div className="text-sm text-muted-foreground">ท่าโจมตี</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gradient">9</div>
              <div className="text-sm text-muted-foreground">Generation</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gradient">18</div>
              <div className="text-sm text-muted-foreground">ประเภท</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pokemon */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black">โปเกมอนยอดนิยม</h2>
            <p className="text-muted-foreground text-sm mt-1">คลิกเพื่อดูข้อมูลโดยละเอียด</p>
          </div>
          <Link
            href="/pokedex"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_POKEMON.map((p) => (
            <Link key={p.id} href={`/pokedex/${p.name.toLowerCase()}`}>
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                  alt={p.name}
                  width={100}
                  height={100}
                  className="mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">#{String(p.id).padStart(4, "0")}</p>
                  <p className="font-bold text-sm">{p.nameTh}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t as PokemonTypeName} size="xs" showTh />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">ฟีเจอร์ครบครัน</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            รวมความสามารถจาก Bulbapedia, Pokémon Database, Marriland, Smogon และ Pokémon Showdown ไว้ในที่เดียว
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <div
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${feature.color} p-6 transition-all hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg`}
              >
                <feature.icon className={`h-8 w-8 mb-4 ${feature.iconColor}`} />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Generation Browser */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black mb-2">เลือกตาม Generation</h2>
            <p className="text-muted-foreground text-sm">คลิกเพื่อดูโปเกมอนในแต่ละ Generation</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {GENERATIONS.map(({ gen, region, count, color }) => (
              <Link key={gen} href={`/pokedex?generation=${gen}`}>
                <div
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: `${color}40` }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{ backgroundColor: color }}
                  >
                    {gen}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold">{region}</div>
                    <div className="text-[10px] text-muted-foreground">{count} ตัว</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Banner */}
      <section className="py-20 container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 text-center">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Star className="h-3.5 w-3.5 fill-current" />
              Powered by Claude AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              ให้ <span className="text-gradient">AI</span> สร้างทีมให้คุณ
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              เลือกโปเกมอน 1 ตัว แล้วปล่อยให้ AI วิเคราะห์และสร้างทีมที่สมดุลพร้อมอธิบายกลยุทธ์เป็นภาษาไทย
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/ai-team"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-bold text-white hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
              >
                <Bot className="h-5 w-5" />
                เริ่มใช้ AI Team Builder
              </Link>
              <Link
                href="/ai-chat"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold hover:bg-secondary transition-all"
              >
                ถาม AI เรื่อง Pokémon
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
