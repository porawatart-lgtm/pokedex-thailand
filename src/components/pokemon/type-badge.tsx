import { cn } from "@/lib/utils";
import { TYPE_COLORS, TYPE_NAMES_TH } from "@/lib/type-chart";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeBadgeProps {
  type: PokemonTypeName | string;
  size?: "xs" | "sm" | "md" | "lg";
  showTh?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function TypeBadge({ type, size = "sm", showTh = false, className }: TypeBadgeProps) {
  const color = TYPE_COLORS[type as PokemonTypeName] ?? "#888888";
  const nameTh = TYPE_NAMES_TH[type as PokemonTypeName];
  const label = showTh && nameTh ? nameTh : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold text-white uppercase tracking-wide shadow-sm",
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

interface TypeBadgeListProps {
  types: Array<PokemonTypeName | string>;
  size?: TypeBadgeProps["size"];
  showTh?: boolean;
  className?: string;
}

export function TypeBadgeList({ types, size, showTh, className }: TypeBadgeListProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {types.map((type) => (
        <TypeBadge key={type} type={type} size={size} showTh={showTh} />
      ))}
    </div>
  );
}
