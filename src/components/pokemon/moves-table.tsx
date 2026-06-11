"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import type { PokemonTypeName } from "@/types/pokemon";

interface BasicMove {
  id: number;
  slug: string;
  nameEn: string;
  learnMethod: string;
  levelLearnedAt: number | null;
}

interface MoveDetail {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  typeName: string | null;
  category: string | null;
}

export function MovesTable({ moves, total }: { moves: BasicMove[]; total: number }) {
  const [details, setDetails] = useState<Record<number, MoveDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const BATCH = 5;

    async function fetchAll() {
      const map: Record<number, MoveDetail> = {};

      for (let i = 0; i < moves.length; i += BATCH) {
        if (cancelled) break;
        const batch = moves.slice(i, i + BATCH);
        await Promise.all(
          batch.map(async (m) => {
            try {
              const res = await fetch(`https://pokeapi.co/api/v2/move/${m.id}`);
              if (!res.ok) return;
              const data = await res.json();
              map[m.id] = {
                power: data.power ?? null,
                accuracy: data.accuracy ?? null,
                pp: data.pp ?? null,
                typeName: data.type?.name ?? null,
                category: data.damage_class?.name ?? null,
              };
            } catch { /* skip */ }
          })
        );
        if (!cancelled) setDetails((prev) => ({ ...prev, ...map }));
      }

      if (!cancelled) setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [moves]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs uppercase">
            <th className="text-left pb-2 font-semibold">ท่า</th>
            <th className="text-left pb-2 font-semibold">Type</th>
            <th className="text-center pb-2 font-semibold">Cat</th>
            <th className="text-right pb-2 font-semibold">Pwr</th>
            <th className="text-right pb-2 font-semibold">Acc</th>
            <th className="text-right pb-2 font-semibold">PP</th>
            <th className="text-right pb-2 font-semibold">วิธี</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move) => {
            const d = details[move.id];
            return (
              <tr
                key={`${move.id}-${move.learnMethod}`}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-1.5 pr-2">
                  <Link
                    href={`/moves/${move.slug}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {move.nameEn}
                  </Link>
                </td>
                <td className="py-1.5 pr-2 min-w-[64px]">
                  {d?.typeName ? (
                    <TypeBadgeList types={[d.typeName as PokemonTypeName]} size="xs" />
                  ) : loading ? (
                    <span className="inline-block h-4 w-12 rounded bg-secondary animate-pulse" />
                  ) : null}
                </td>
                <td className="py-1.5 text-center pr-2">
                  {d ? (
                    <span className={cn(
                      "text-xs font-medium",
                      d.category === "physical" && "text-orange-400",
                      d.category === "special" && "text-blue-400",
                      d.category === "status" && "text-gray-400",
                    )}>
                      {d.category === "physical" ? "PHY" : d.category === "special" ? "SPC" : "STS"}
                    </span>
                  ) : loading ? (
                    <span className="inline-block h-3 w-8 rounded bg-secondary animate-pulse" />
                  ) : "—"}
                </td>
                <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                  {d ? (d.power ?? "—") : loading ? (
                    <span className="inline-block h-3 w-6 rounded bg-secondary animate-pulse" />
                  ) : "—"}
                </td>
                <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                  {d ? (d.accuracy ? `${d.accuracy}%` : "—") : loading ? (
                    <span className="inline-block h-3 w-8 rounded bg-secondary animate-pulse" />
                  ) : "—"}
                </td>
                <td className="py-1.5 text-right pr-2 font-mono text-muted-foreground">
                  {d ? (d.pp ?? "—") : loading ? (
                    <span className="inline-block h-3 w-6 rounded bg-secondary animate-pulse" />
                  ) : "—"}
                </td>
                <td className="py-1.5 text-right text-xs text-muted-foreground">
                  {move.learnMethod === "level-up"
                    ? `Lv.${move.levelLearnedAt ?? "?"}`
                    : move.learnMethod}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {total > 20 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          แสดง 20 ท่าแรก จากทั้งหมด {total} ท่า
        </p>
      )}
    </div>
  );
}
