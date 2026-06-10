import Link from "next/link";
import { Github, Heart } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Pokédex",
    titleTh: "โปเกเด็กซ์",
    links: [
      { label: "โปเกมอนทั้งหมด", href: "/pokedex" },
      { label: "ชายนี่เด็กซ์", href: "/shiny" },
      { label: "ลิฟวิ่งเด็กซ์", href: "/living-dex" },
    ],
  },
  {
    title: "Database",
    titleTh: "ฐานข้อมูล",
    links: [
      { label: "ท่าโจมตี", href: "/moves" },
      { label: "ความสามารถ", href: "/abilities" },
      { label: "ไอเทม", href: "/items" },
      { label: "เบอร์รี่", href: "/berries" },
    ],
  },
  {
    title: "Competitive",
    titleTh: "คอมเพทิทีฟ",
    links: [
      { label: "Team Builder", href: "/team-builder" },
      { label: "Damage Calculator", href: "/calc" },
      { label: "Tier List", href: "/competitive" },
      { label: "Battle Simulator", href: "/battle" },
    ],
  },
  {
    title: "AI & Community",
    titleTh: "AI & คอมมูนิตี้",
    links: [
      { label: "AI สร้างทีม", href: "/ai-team" },
      { label: "AI แชท", href: "/ai-chat" },
      { label: "คอมมูนิตี้", href: "/community" },
      { label: "Trainer Card", href: "/trainer-card" },
    ],
  },
];

const GENERATIONS = [
  { gen: 1, region: "Kanto" },
  { gen: 2, region: "Johto" },
  { gen: 3, region: "Hoenn" },
  { gen: 4, region: "Sinnoh" },
  { gen: 5, region: "Unova" },
  { gen: 6, region: "Kalos" },
  { gen: 7, region: "Alola" },
  { gen: 8, region: "Galar" },
  { gen: 9, region: "Paldea" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-8 w-8">
                  <circle cx="20" cy="20" r="19" fill="#CC0000" stroke="#fff" strokeWidth="2" />
                  <path d="M1 20h38" stroke="#fff" strokeWidth="2" />
                  <circle cx="20" cy="20" r="6" fill="#fff" stroke="#fff" strokeWidth="2" />
                  <circle cx="20" cy="20" r="4" fill="#CC0000" />
                  <circle cx="20" cy="20" r="2" fill="#fff" />
                </svg>
              </div>
              <span className="font-bold">
                <span className="text-poke-red">Pokédex</span>
                <span className="text-foreground"> Thailand</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              สารานุกรม Pokémon ที่ครบถ้วนที่สุดในประเทศไทย รองรับทุก Generation ทุก Form
            </p>

            {/* Generation Quick Links */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">ภูมิภาค</p>
              <div className="flex flex-wrap gap-1">
                {GENERATIONS.map(({ gen, region }) => (
                  <Link
                    key={gen}
                    href={`/pokedex?generation=${gen}`}
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
                  >
                    {region}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-3">{section.titleTh}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Pokémon and All Related Names are Trademarks of Nintendo, Game Freak & Creatures Inc.
            <br />
            This is a fan-made website and is not affiliated with Nintendo.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart className="h-3 w-3 fill-poke-red text-poke-red" /> in Thailand
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
