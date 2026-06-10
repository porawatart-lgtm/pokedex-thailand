"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatStatName, formatStatNameTh, getStatBarColor } from "@/lib/utils";

interface StatBarProps {
  statName: string;
  value: number;
  maxValue?: number;
  showTh?: boolean;
  animated?: boolean;
  className?: string;
}

export function StatBar({
  statName,
  value,
  maxValue = 255,
  showTh = false,
  animated = true,
  className,
}: StatBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor = getStatBarColor(value);
  const label = showTh ? formatStatNameTh(statName) : formatStatName(statName);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animated]);

  const getTextColor = (v: number) => {
    if (v >= 150) return "text-purple-400";
    if (v >= 120) return "text-blue-400";
    if (v >= 90) return "text-green-400";
    if (v >= 60) return "text-yellow-400";
    if (v >= 30) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className={cn("grid grid-cols-[6rem_3rem_1fr] items-center gap-3", className)}>
      <span className="text-right text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm font-bold tabular-nums", getTextColor(value))}>
        {value}
      </span>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

interface StatSetProps {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total?: number;
  };
  showTh?: boolean;
  animated?: boolean;
  className?: string;
}

export function StatSet({ stats, showTh = false, animated = true, className }: StatSetProps) {
  const statEntries = [
    { key: "hp", value: stats.hp },
    { key: "attack", value: stats.attack },
    { key: "defense", value: stats.defense },
    { key: "specialAttack", value: stats.specialAttack },
    { key: "specialDefense", value: stats.specialDefense },
    { key: "speed", value: stats.speed },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {statEntries.map(({ key, value }) => (
        <StatBar
          key={key}
          statName={key}
          value={value}
          showTh={showTh}
          animated={animated}
        />
      ))}
      {stats.total !== undefined && (
        <div className="grid grid-cols-[6rem_3rem_1fr] items-center gap-3 border-t border-border pt-2">
          <span className="text-right text-sm font-semibold text-muted-foreground">
            {showTh ? "รวม" : "Total"}
          </span>
          <span className="text-right text-sm font-bold tabular-nums text-foreground">
            {stats.total}
          </span>
          <div />
        </div>
      )}
    </div>
  );
}
