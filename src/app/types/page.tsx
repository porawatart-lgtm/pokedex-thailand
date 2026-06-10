"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getTypeColor } from "@/lib/utils";
import {
  TYPE_CHART, ALL_TYPES, TYPE_NAMES_TH, TYPE_COLORS,
  getTypeEffectiveness, getDualTypeDefenses,
} from "@/lib/type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

// ─── Effectiveness cell ───────────────────────────────────────────────────────

function EffCell({ value, small = false }: { value: number; small?: boolean }) {
  const s = small ? "w-6 h-6 text-[9px]" : "w-7 h-7 text-[10px]";
  if (value === 0)    return <span className={cn(s, "flex items-center justify-center rounded font-bold bg-gray-800 text-gray-400")}>0</span>;
  if (value === 0.25) return <span className={cn(s, "flex items-center justify-center rounded font-bold bg-blue-900/60 text-blue-300")}>¼</span>;
  if (value === 0.5)  return <span className={cn(s, "flex items-center justify-center rounded font-bold bg-blue-700/30 text-blue-400")}>½</span>;
  if (value === 2)    return <span className={cn(s, "flex items-center justify-center rounded font-bold bg-orange-800/50 text-orange-300")}>2</span>;
  if (value === 4)    return <span className={cn(s, "flex items-center justify-center rounded font-bold bg-red-800/60 text-red-300")}>4</span>;
  return <span className={cn(s, "flex items-center justify-center rounded text-muted-foreground/25")}>—</span>;
}

// ─── Type Pill ────────────────────────────────────────────────────────────────

function TypePill({
  type, selected, onClick, size = "sm",
}: {
  type: PokemonTypeName;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const color = TYPE_COLORS[type];
  const label = TYPE_NAMES_TH[type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full font-bold text-white transition-all duration-150",
        size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
        selected ? "ring-2 ring-white/60 scale-105 shadow-lg" : "opacity-85 hover:opacity-100 hover:scale-105"
      )}
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  );
}

// ─── Type Detail Panel ────────────────────────────────────────────────────────

function TypeDetail({ type }: { type: PokemonTypeName }) {
  const color = TYPE_COLORS[type];

  // Offense: how effective is this type when attacking
  const offense = ALL_TYPES.map((def) => ({ type: def, val: TYPE_CHART[type][def] ?? 1 }));
  const superEff  = offense.filter((t) => t.val === 2);
  const notEff    = offense.filter((t) => t.val === 0.5);
  const noEffect  = offense.filter((t) => t.val === 0);

  // Defense: how effective are other types when attacking this type
  const defense = ALL_TYPES.map((atk) => ({ type: atk, val: TYPE_CHART[atk][type] ?? 1 }));
  const weakTo   = defense.filter((t) => t.val === 2);
  const resistTo = defense.filter((t) => t.val === 0.5);
  const immuneTo = defense.filter((t) => t.val === 0);

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border bg-card/60 p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="text-xl font-extrabold px-4 py-1.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {TYPE_NAMES_TH[type]}
        </span>
        <span className="text-sm text-muted-foreground capitalize">{type}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Offense */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            เมื่อโจมตี
          </h3>
          <div className="space-y-3">
            <Row label="ได้ผลดี 2×" types={superEff} color="text-orange-300" />
            <Row label="ได้ผลน้อย ½×" types={notEff}  color="text-blue-400" />
            <Row label="ไม่ได้ผล 0×" types={noEffect} color="text-gray-400" />
          </div>
        </div>

        {/* Defense */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            เมื่อรับโจมตี
          </h3>
          <div className="space-y-3">
            <Row label="อ่อนแอ 2×"    types={weakTo}   color="text-red-400" />
            <Row label="ต้านทาน ½×"   types={resistTo} color="text-blue-400" />
            <Row label="ภูมิคุ้มกัน 0×" types={immuneTo} color="text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({
  label,
  types,
  color,
}: {
  label: string;
  types: { type: PokemonTypeName }[];
  color: string;
}) {
  return (
    <div>
      <span className={cn("text-[10px] font-semibold", color)}>{label}</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {types.length === 0 ? (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        ) : (
          types.map(({ type }) => <TypePill key={type} type={type} />)
        )}
      </div>
    </div>
  );
}

// ─── Dual Type Defender ───────────────────────────────────────────────────────

function DualTypeCalc() {
  const [type1, setType1] = useState<PokemonTypeName | null>(null);
  const [type2, setType2] = useState<PokemonTypeName | null>(null);

  const selected = [type1, type2].filter(Boolean) as PokemonTypeName[];
  const defenses = selected.length ? getDualTypeDefenses(selected) : null;

  const groups = defenses
    ? {
        "0× (ภูมิคุ้มกัน)":   ALL_TYPES.filter((t) => defenses[t] === 0),
        "¼× (ต้านทานมาก)":    ALL_TYPES.filter((t) => defenses[t] === 0.25),
        "½× (ต้านทาน)":       ALL_TYPES.filter((t) => defenses[t] === 0.5),
        "2× (อ่อนแอ)":        ALL_TYPES.filter((t) => defenses[t] === 2),
        "4× (อ่อนแอมาก)":     ALL_TYPES.filter((t) => defenses[t] === 4),
      }
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="text-sm font-bold mb-4">คำนวณการรับดาเมจ (Dual Type)</h2>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => {
              if (type1 === t) { setType1(null); return; }
              if (type2 === t) { setType2(null); return; }
              if (!type1) { setType1(t); return; }
              if (!type2) { setType2(t); return; }
              setType1(t); setType2(null);
            }}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white transition-all",
              (type1 === t || type2 === t) ? "ring-2 ring-white/60 scale-110" : "opacity-70 hover:opacity-100"
            )}
            style={{ backgroundColor: TYPE_COLORS[t] }}
          >
            {TYPE_NAMES_TH[t]}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 mb-5 text-sm">
          <span className="text-muted-foreground">เลือก:</span>
          {selected.map((t) => (
            <TypePill key={t} type={t} size="md" />
          ))}
        </div>
      )}

      {groups && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(groups).map(([label, types]) =>
            types.length > 0 ? (
              <div key={label}>
                <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-1">
                  {types.map((t) => <TypePill key={t} type={t} />)}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {!selected.length && (
        <p className="text-sm text-muted-foreground/60">เลือกธาตุ 1-2 ธาตุเพื่อดูผลการต้านทาน</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TypeChartPage() {
  const [selected, setSelected] = useState<PokemonTypeName | null>(null);
  const [hoveredAtk, setHoveredAtk] = useState<PokemonTypeName | null>(null);
  const [hoveredDef, setHoveredDef] = useState<PokemonTypeName | null>(null);

  const select = (t: PokemonTypeName) => setSelected((prev) => (prev === t ? null : t));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">ตารางธาตุแพ้ชนะ</h1>
        <p className="text-muted-foreground text-sm">
          ตารางแสดงความสัมพันธ์ระหว่างธาตุทั้ง 18 ธาตุ — คลิกธาตุเพื่อดูรายละเอียด
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">ตำนาน:</span>
        {[
          { label: "4× ได้ผลดีมาก",   cls: "bg-red-800/60 text-red-300" },
          { label: "2× ได้ผลดี",       cls: "bg-orange-800/50 text-orange-300" },
          { label: "½× ได้ผลน้อย",    cls: "bg-blue-700/30 text-blue-400" },
          { label: "¼× ได้ผลน้อยมาก", cls: "bg-blue-900/60 text-blue-300" },
          { label: "0× ไม่ได้ผล",     cls: "bg-gray-800 text-gray-400" },
        ].map(({ label, cls }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold", cls)}>
              {label.split(" ")[0]}
            </span>
            {label.split(" ").slice(1).join(" ")}
          </span>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Chart */}
        <div className="overflow-auto rounded-2xl border border-border bg-card/30 p-3">
          <p className="text-[10px] text-muted-foreground mb-2 pl-20">
            ↑ ธาตุผู้รับโจมตี (Defending) &nbsp;|&nbsp; ธาตุผู้โจมตี (Attacking) →
          </p>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-20" />
                {ALL_TYPES.map((def) => (
                  <th
                    key={def}
                    className={cn(
                      "p-0.5 cursor-pointer transition-opacity",
                      hoveredDef && hoveredDef !== def && "opacity-30"
                    )}
                    onMouseEnter={() => setHoveredDef(def)}
                    onMouseLeave={() => setHoveredDef(null)}
                    onClick={() => select(def)}
                  >
                    <div
                      className="w-7 h-16 rounded flex items-end justify-center pb-1"
                      style={{ backgroundColor: `${TYPE_COLORS[def]}25` }}
                    >
                      <span
                        className="text-[9px] font-bold leading-none"
                        style={{
                          color: TYPE_COLORS[def],
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                        }}
                      >
                        {TYPE_NAMES_TH[def]}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TYPES.map((atk) => (
                <tr
                  key={atk}
                  className={cn(
                    "cursor-pointer transition-opacity",
                    hoveredAtk && hoveredAtk !== atk && "opacity-30"
                  )}
                  onMouseEnter={() => setHoveredAtk(atk)}
                  onMouseLeave={() => setHoveredAtk(null)}
                  onClick={() => select(atk)}
                >
                  <td className="p-0.5 pr-2">
                    <div
                      className={cn(
                        "h-7 px-2 rounded flex items-center justify-end text-[10px] font-bold whitespace-nowrap transition-all",
                        selected === atk ? "ring-1 ring-white/40" : ""
                      )}
                      style={{
                        backgroundColor: `${TYPE_COLORS[atk]}25`,
                        color: TYPE_COLORS[atk],
                      }}
                    >
                      {TYPE_NAMES_TH[atk]}
                    </div>
                  </td>
                  {ALL_TYPES.map((def) => (
                    <td
                      key={def}
                      className={cn(
                        "p-0.5",
                        (selected === atk || selected === def) && "bg-primary/5"
                      )}
                    >
                      <EffCell value={TYPE_CHART[atk][def] ?? 1} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Type detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <TypeDetail key={selected} type={selected} />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm"
              >
                คลิกธาตุในตารางเพื่อดูรายละเอียด
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dual type calc */}
          <DualTypeCalc />

          {/* All type cards */}
          <div className="rounded-2xl border border-border bg-card/30 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              ทุกธาตุ
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map((t) => (
                <TypePill
                  key={t}
                  type={t}
                  selected={selected === t}
                  onClick={() => select(t)}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
