import { Suspense } from "react";
import { PokedexPageClient } from "./pokedex-client";

function LoadingGrid() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-9 w-64 rounded-lg bg-card animate-pulse mb-2" />
        <div className="h-4 w-96 rounded bg-card/60 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-card border border-border h-[200px]" />
        ))}
      </div>
    </div>
  );
}

export default function PokedexPage() {
  return (
    <Suspense fallback={<LoadingGrid />}>
      <PokedexPageClient />
    </Suspense>
  );
}
