import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <Image
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
          alt="Psyduck confused"
          width={150}
          height={150}
          className="object-contain animate-float"
        />
        <div className="absolute inset-0 rounded-full blur-2xl bg-yellow-400/10 animate-pulse-slow" />
      </div>

      <h1 className="text-6xl font-black mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4 text-gradient">ไม่พบหน้าที่ต้องการ</h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        ดูเหมือน Psyduck จะงงงวยเหมือนกัน... หน้าที่คุณต้องการไม่มีอยู่
        หรืออาจถูกย้ายไปแล้ว
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
        <Link
          href="/pokedex"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:bg-secondary transition-all"
        >
          <Search className="h-4 w-4" />
          ค้นหาโปเกมอน
        </Link>
      </div>
    </div>
  );
}
