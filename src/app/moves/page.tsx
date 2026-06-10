"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { TypeBadge, TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import { ALL_TYPES } from "@/lib/type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

interface MoveData {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  typeName: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  generation: number | null;
  shortEffect: string | null;
}

async function fetchMoves(params: { page: number; q?: string; type?: string; category?: string }) {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: "30",
    ...(params.q && { q: params.q }),
    ...(params.type && { type: params.type }),
    ...(params.category && { category: params.category }),
  });
  const res = await fetch(`/api/moves?${query}`);
  return res.json() as Promise<{
    data: MoveData[];
    meta: { total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }>;
}

const CATEGORIES = ["physical", "special", "status"];
const CATEGORY_COLORS = {
  physical: "text-orange-400",
  special: "text-blue-400",
  status: "text-gray-400",
};

export default function MovesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["moves", page, debouncedSearch, selectedType, selectedCategory],
    queryFn: () => fetchMoves({ page, q: debouncedSearch || undefined, type: selectedType || undefined, category: selectedCategory || undefined }),
    placeholderData: (prev) => prev,
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(undefined);
    setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          ท่าโจมตี <span className="text-gradient">ทั้งหมด</span>
        </h1>
        <p className="text-muted-foreground">
          ท่าโจมตีทุกท่า Generation 1-9 พร้อมข้อมูลครบถ้วน
          {data?.meta && <span> · {data.meta.total.toLocaleString()} ท่า</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาท่าโจมตี..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedType(""); setPage(1); }}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                !selectedType ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              ทุก Type
            </button>
            {ALL_TYPES.map((t) => (
              <button key={t} onClick={() => { setSelectedType(selectedType === t ? "" : t); setPage(1); }}>
                <TypeBadge
                  type={t}
                  size="xs"
                  showTh
                  className={cn("cursor-pointer transition-opacity", selectedType === t ? "ring-2 ring-white ring-offset-1 ring-offset-card" : "opacity-70 hover:opacity-100")}
                />
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5">
            <button
              onClick={() => { setSelectedCategory(""); setPage(1); }}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                !selectedCategory ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              ทุก Cat
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { setSelectedCategory(selectedCategory === c ? "" : c); setPage(1); }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                  selectedCategory === c
                    ? "bg-primary text-white border-primary"
                    : cn("border-border hover:border-primary/50", CATEGORY_COLORS[c as keyof typeof CATEGORY_COLORS])
                )}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">ท่า</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Power</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Acc</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">PP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Gen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Effect</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-secondary animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((move) => (
                    <tr key={move.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{move.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-sm">{move.nameTh ?? move.nameEn}</p>
                          {move.nameTh && <p className="text-xs text-muted-foreground">{move.nameEn}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {move.typeName && <TypeBadge type={move.typeName as PokemonTypeName} size="xs" showTh />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-xs font-bold",
                          move.category === "physical" ? "text-orange-400" :
                          move.category === "special" ? "text-blue-400" : "text-gray-400"
                        )}>
                          {move.category === "physical" ? "PHY" : move.category === "special" ? "SPC" : "STS"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{move.power ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{move.accuracy ? `${move.accuracy}%` : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{move.pp ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{move.generation ?? "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-muted-foreground max-w-xs truncate">{move.shortEffect ?? "—"}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!data.meta.hasPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            หน้า {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
