"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, ChevronDown, Sword, Book, Package,
  Shield, Users, Trophy, Zap, Bot, Star, Sparkles, Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GAMES, GEN_INFO, PLATFORM_GAMES } from "@/lib/games-data";

// Grouped by gen for mega-menu, only show gens 9–4
const MENU_GENS = [9, 8, 7, 6, 5, 4];

interface NavItem {
  label: string;
  labelTh: string;
  href?: string;
  icon: React.ElementType;
  isMegaMenu?: boolean;
  children?: Array<{
    label: string;
    labelTh: string;
    href: string;
    description?: string;
    descriptionTh?: string;
    icon: React.ElementType;
  }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Pokédex",
    labelTh: "โปเกเด็กซ์",
    href: "/pokedex",
    icon: Book,
    children: [
      { label: "All Pokemon", labelTh: "โปเกมอนทั้งหมด", href: "/pokedex", descriptionTh: "ทุก Generation ทุก Form", icon: Book },
      { label: "Special Forms", labelTh: "ร่างพิเศษ", href: "/forms", descriptionTh: "เมก้า, กิกะแมกซ์, อาโลล่า, กาล่า ฯลฯ", icon: Sparkles },
      { label: "Shiny Dex", labelTh: "ชายนี่เด็กซ์", href: "/shiny", descriptionTh: "เปรียบเทียบ Normal vs Shiny", icon: Star },
      { label: "Living Dex", labelTh: "ลิฟวิ่งเด็กซ์", href: "/living-dex", descriptionTh: "ติดตามโปเกมอนที่จับได้", icon: Shield },
    ],
  },
  // Games mega-menu — rendered separately
  {
    label: "Games",
    labelTh: "เกม",
    icon: Gamepad2,
    isMegaMenu: true,
  },
  {
    label: "Database",
    labelTh: "ฐานข้อมูล",
    icon: Package,
    children: [
      { label: "Type Chart", labelTh: "ตารางธาตุ", href: "/types", descriptionTh: "ธาตุแพ้ชนะทั้ง 18 ธาตุ", icon: Sparkles },
      { label: "Moves", labelTh: "ท่าโจมตี", href: "/moves", descriptionTh: "ท่าโจมตีทุกท่า", icon: Sword },
      { label: "Abilities", labelTh: "ความสามารถ", href: "/abilities", descriptionTh: "ความสามารถทุกอย่าง", icon: Zap },
      { label: "Items", labelTh: "ไอเทม", href: "/items", descriptionTh: "ไอเทมทุกชนิด", icon: Package },
      { label: "Berries", labelTh: "เบอร์รี่", href: "/berries", descriptionTh: "เบอร์รี่ทุกชนิด", icon: Star },
    ],
  },
  {
    label: "Competitive",
    labelTh: "คอมเพทิทีฟ",
    icon: Trophy,
    children: [
      { label: "Meta Rankings", labelTh: "Meta Rankings", href: "/meta", descriptionTh: "VGC, OU, GO BL, Champions — ทีมยอดนิยม", icon: Star },
      { label: "Tier List & Usage", labelTh: "Tier List & Usage", href: "/competitive", descriptionTh: "Smogon Stats อัปเดตรายเดือน", icon: Trophy },
      { label: "Team Builder", labelTh: "สร้างทีม", href: "/team-builder", descriptionTh: "สร้างและวิเคราะห์ทีม", icon: Users },
      { label: "Damage Calculator", labelTh: "คำนวณดาเมจ", href: "/calc", descriptionTh: "คำนวณดาเมจอย่างละเอียด", icon: Sword },
      { label: "Battle Simulator", labelTh: "จำลองการต่อสู้", href: "/battle", descriptionTh: "จำลองการต่อสู้", icon: Zap },
    ],
  },
  {
    label: "AI Features",
    labelTh: "AI",
    icon: Bot,
    children: [
      { label: "AI Team Builder", labelTh: "AI สร้างทีม", href: "/ai-team", descriptionTh: "ให้ AI สร้างทีมให้", icon: Bot },
      { label: "AI Chat", labelTh: "AI แชท", href: "/ai-chat", descriptionTh: "ถาม AI เรื่อง Pokémon", icon: Bot },
    ],
  },
  {
    label: "Community",
    labelTh: "คอมมูนิตี้",
    href: "/community",
    icon: Users,
  },
];

// ───────────────────────────────────────────
// Games Mega-Menu Component
// ───────────────────────────────────────────
function GamesMegaMenu({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[700px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card/98 backdrop-blur-md shadow-2xl shadow-black/40 p-5 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div>
              <p className="font-black text-sm">เลือกโดยเกม</p>
              <p className="text-[11px] text-muted-foreground">เลือกเกมที่คุณเล่นเพื่อดูข้อมูลที่เกี่ยวข้อง</p>
            </div>
            <Link
              href="/games"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {/* Gen columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {MENU_GENS.map((gen) => {
              const games = GAMES.filter((g) => g.gen === gen);
              if (games.length === 0) return null;
              const info = GEN_INFO[gen];
              return (
                <div key={gen}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Gen {gen} · {info?.years}
                  </p>
                  <div className="space-y-0.5">
                    {games.map((game) => (
                      <Link
                        key={game.slug}
                        href={`/games/${game.slug}`}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-secondary transition-colors group"
                      >
                        <span className="text-lg shrink-0">{game.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{game.nameTh}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{game.regionTh} · {game.platform}</p>
                        </div>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 opacity-70"
                          style={{ background: `${game.color1}25`, color: game.color1 }}
                        >
                          {game.nameShort}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer: older games */}
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground self-center mr-1">เกมเก่า:</span>
            {GAMES.filter((g) => g.gen <= 3).map((g) => (
              <Link
                key={g.slug}
                href={`/games/${g.slug}`}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <span>{g.icon}</span>
                {g.nameShort}
              </Link>
            ))}
          </div>

          {/* Platform games */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform & Spin-offs</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_GAMES.map((g) => (
                <Link
                  key={g.slug}
                  href={g.metaHref}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 transition-colors"
                  style={{ borderColor: `${g.color1}30` }}
                >
                  <span>{g.icon}</span>
                  <span className="font-semibold">{g.nameShort}</span>
                  <span className="text-muted-foreground">{g.platform}</span>
                </Link>
              ))}
              <Link
                href="/meta"
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold"
              >
                <Trophy className="h-3 w-3" />
                Meta Rankings →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ───────────────────────────────────────────
// Main Navbar
// ───────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setMegaOpen(false);
  }, [pathname]);

  const handleMegaEnter = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };
  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-card/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-8 w-8 group-hover:animate-spin-slow">
                  <circle cx="20" cy="20" r="19" fill="#CC0000" stroke="#fff" strokeWidth="2" />
                  <path d="M1 20h38" stroke="#fff" strokeWidth="2" />
                  <circle cx="20" cy="20" r="6" fill="#fff" stroke="#fff" strokeWidth="2" />
                  <circle cx="20" cy="20" r="4" fill="#CC0000" />
                  <circle cx="20" cy="20" r="2" fill="#fff" />
                </svg>
              </div>
              <span className="text-lg font-bold hidden sm:block">
                <span className="text-poke-red">Pokédex</span>
                <span className="text-foreground"> Thailand</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => {
                // Games mega-menu special case
                if (item.isMegaMenu) {
                  return (
                    <div
                      key={item.label}
                      ref={megaRef}
                      className="relative"
                      onMouseEnter={handleMegaEnter}
                      onMouseLeave={handleMegaLeave}
                    >
                      <button
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          megaOpen || pathname?.startsWith("/games")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Gamepad2 className="h-4 w-4" />
                        {item.labelTh}
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", megaOpen && "rotate-180")} />
                      </button>
                      <GamesMegaMenu open={megaOpen} />
                    </div>
                  );
                }

                // Regular nav items
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.href && !item.children ? (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          pathname?.startsWith(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.labelTh}
                      </Link>
                    ) : (
                      <button
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          activeDropdown === item.label
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.labelTh}
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", activeDropdown === item.label && "rotate-180")} />
                      </button>
                    )}

                    {/* Standard dropdown */}
                    <AnimatePresence>
                      {item.children && activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl shadow-black/30 p-2 z-50"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-start gap-3 rounded-lg p-2.5 transition-colors group",
                                pathname === child.href
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <child.icon className="h-4 w-4 mt-0.5 shrink-0" />
                              <div>
                                <div className="text-sm font-medium">{child.labelTh}</div>
                                {child.descriptionTh && (
                                  <div className="text-xs text-muted-foreground">{child.descriptionTh}</div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        window.location.href = `/pokedex?q=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="relative"
                  >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder='ค้นหาโปเกมอน, ท่า, ไอเทม... เช่น "โปเกมอนไฟสปีดเกิน 100"'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                      Enter
                    </kbd>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border bg-card/98 backdrop-blur-md lg:hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                {/* Games section on mobile */}
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Gamepad2 className="h-3.5 w-3.5" />
                    เกม
                  </div>
                  <Link
                    href="/games"
                    className="flex items-center gap-2.5 rounded-lg px-6 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Gamepad2 className="h-3.5 w-3.5" />
                    ดูทุกเกม
                  </Link>
                  {/* Show recent games */}
                  {GAMES.filter((g) => g.gen >= 7).map((g) => (
                    <Link
                      key={g.slug}
                      href={`/games/${g.slug}`}
                      className="flex items-center gap-2.5 rounded-lg px-6 py-2 text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <span>{g.icon}</span>
                      <span>{g.nameTh}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{g.platform}</span>
                    </Link>
                  ))}
                </div>

                {/* Other nav items */}
                {NAV_ITEMS.filter((i) => !i.isMegaMenu).map((item) => (
                  <div key={item.label}>
                    {item.href && !item.children ? (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.labelTh}
                      </Link>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <item.icon className="h-3.5 w-3.5" />
                          {item.labelTh}
                        </div>
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-6 py-2 text-sm transition-colors",
                              pathname === child.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <child.icon className="h-3.5 w-3.5" />
                            {child.labelTh}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16" />
    </>
  );
}
