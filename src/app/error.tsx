"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <Image
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png"
          alt="Porygon error"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      <h1 className="text-3xl font-black mb-2">เกิดข้อผิดพลาด!</h1>
      <p className="text-muted-foreground max-w-md mb-2">
        {error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด"}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-8 font-mono">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          ลองอีกครั้ง
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:bg-secondary transition-all"
        >
          <Home className="h-4 w-4" />
          หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
