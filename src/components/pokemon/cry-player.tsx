"use client";

import { Volume2 } from "lucide-react";

interface CryPlayerProps {
  cryUrl: string;
  pokemonName: string;
}

export function CryPlayer({ cryUrl, pokemonName }: CryPlayerProps) {
  function playCry() {
    const audio = new Audio(cryUrl);
    audio.play().catch(() => null);
  }

  return (
    <button
      onClick={playCry}
      className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <Volume2 className="h-4 w-4" />
      ฟังเสียง {pokemonName}
    </button>
  );
}
