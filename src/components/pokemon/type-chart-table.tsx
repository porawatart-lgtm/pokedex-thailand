"use client";

import { cn, getTypeColor } from "@/lib/utils";
import { TYPE_CHART, ALL_TYPES, TYPE_NAMES_TH } from "@/lib/type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeChartTableProps {
  className?: string;
  highlightTypes?: PokemonTypeName[];
  mode?: "full" | "attacking" | "defending";
}

function EffectivenessCell({ value }: { value: number }) {
  if (value === 0)
    return (
      <td className="text-center p-0.5">
        <span className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-gray-800 text-gray-400">
          0
        </span>
      </td>
    );
  if (value === 0.25)
    return (
      <td className="text-center p-0.5">
        <span className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-blue-900/50 text-blue-300">
          ¼
        </span>
      </td>
    );
  if (value === 0.5)
    return (
      <td className="text-center p-0.5">
        <span className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-blue-800/30 text-blue-400">
          ½
        </span>
      </td>
    );
  if (value === 2)
    return (
      <td className="text-center p-0.5">
        <span className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-orange-900/40 text-orange-300">
          2
        </span>
      </td>
    );
  if (value === 4)
    return (
      <td className="text-center p-0.5">
        <span className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-red-600 text-white ring-1 ring-red-400 shadow-sm shadow-red-900">
          4
        </span>
      </td>
    );
  return (
    <td className="text-center p-0.5">
      <span className="flex items-center justify-center w-7 h-7 rounded text-xs text-muted-foreground/40">
        1
      </span>
    </td>
  );
}

function TypeHeader({ type }: { type: PokemonTypeName }) {
  const color = getTypeColor(type);
  const nameTh = TYPE_NAMES_TH[type];

  return (
    <th className="p-0.5">
      <div
        className="w-7 h-16 rounded flex items-end justify-center pb-1"
        style={{ backgroundColor: `${color}30` }}
      >
        <span
          className="text-[9px] font-bold leading-none"
          style={{ color, writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {nameTh}
        </span>
      </div>
    </th>
  );
}

export function TypeChartTable({ className, highlightTypes = [], mode = "full" }: TypeChartTableProps) {
  return (
    <div className={cn("overflow-auto", className)}>
      <div className="min-w-max">
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <span>ตัวโจมตี →</span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-red-900/40 flex items-center justify-center text-red-300 font-bold text-[10px]">2</span>
            <span>ได้ผลดี</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-blue-800/30 flex items-center justify-center text-blue-400 font-bold text-[10px]">½</span>
            <span>ได้ผลน้อย</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-[10px]">0</span>
            <span>ไม่ได้ผล</span>
          </div>
        </div>
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-16 p-0.5">
                <div className="text-[9px] text-muted-foreground text-right pr-1">โจมตี ↓ / รับ →</div>
              </th>
              {ALL_TYPES.map((type) => (
                <TypeHeader key={type} type={type} />
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_TYPES.map((attackType) => {
              const isHighlighted = highlightTypes.includes(attackType);
              return (
                <tr
                  key={attackType}
                  className={cn(isHighlighted && "ring-1 ring-primary/50 bg-primary/5")}
                >
                  <td className="p-0.5 pr-2">
                    <div
                      className="h-7 px-2 rounded flex items-center justify-end text-[10px] font-bold whitespace-nowrap"
                      style={{ backgroundColor: `${getTypeColor(attackType)}25`, color: getTypeColor(attackType) }}
                    >
                      {TYPE_NAMES_TH[attackType]}
                    </div>
                  </td>
                  {ALL_TYPES.map((defendType) => (
                    <EffectivenessCell
                      key={defendType}
                      value={TYPE_CHART[attackType][defendType] ?? 1}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
