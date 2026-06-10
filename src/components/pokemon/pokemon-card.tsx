"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn, formatDexNumber, getTypeColor } from "@/lib/utils";
import { TypeBadgeList } from "./type-badge";
import type { PokemonListItem } from "@/types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonListItem;
  showStats?: boolean;
  variant?: "grid" | "list" | "compact";
  index?: number;
  className?: string;
  shiny?: boolean; // forced shiny from parent
}

export function PokemonCard({
  pokemon,
  showStats = false,
  variant = "grid",
  index = 0,
  className,
  shiny: forcedShiny,
}: PokemonCardProps) {
  const [imgError, setImgError] = useState(false);
  const [localShiny, setLocalShiny] = useState(false);
  const isShiny = forcedShiny ?? localShiny;

  const primaryType = pokemon.types[0];
  const typeColor = getTypeColor(primaryType ?? "normal");

  const imageUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
    : pokemon.sprites.officialArtwork ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.02, 0.3) }}
      >
        <Link href={`/pokedex/${pokemon.slug}`}>
          <div
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all",
              className
            )}
          >
            <div
              className="h-12 w-12 shrink-0 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${typeColor}20` }}
            >
              {!imgError ? (
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.nameEn}
                  width={48}
                  height={48}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-lg">?</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDexNumber(pokemon.dexNumber)}
                </span>
                <span className="font-semibold text-sm truncate">{pokemon.nameTh ?? pokemon.nameEn}</span>
                {pokemon.nameTh && (
                  <span className="text-xs text-muted-foreground hidden sm:block">{pokemon.nameEn}</span>
                )}
              </div>
              <TypeBadgeList types={pokemon.types} size="xs" className="mt-1" />
            </div>
            {showStats && (
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                <span>BST: <strong className="text-foreground">{pokemon.stats.total}</strong></span>
                <span>SPE: <strong className="text-foreground">{pokemon.stats.speed}</strong></span>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "compact") {
    const compactSprite = isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

    return (
      <Link href={`/pokedex/${pokemon.slug}`}>
        <div
          className={cn(
            "relative flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:border-primary/30 transition-all cursor-pointer",
            isShiny ? "border-yellow-400/50 shadow-sm shadow-yellow-400/20" : "border-border",
            className
          )}
        >
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDexNumber(pokemon.dexNumber)}
          </span>
          {!imgError ? (
            <Image
              src={compactSprite}
              alt={pokemon.nameEn}
              width={48}
              height={48}
              className={cn(isShiny && "drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]")}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-secondary" />
          )}
          <span className="text-xs font-medium text-center leading-tight">
            {pokemon.nameTh ?? pokemon.nameEn}
          </span>
          <TypeBadgeList types={pokemon.types} size="xs" />
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
      className={className}
    >
      <Link href={`/pokedex/${pokemon.slug}`}>
        <div
          className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg"
          style={{
            boxShadow: `0 0 0 0 ${typeColor}00`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${typeColor}20`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${typeColor}00`;
          }}
        >
          {/* Background gradient based on type */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at 70% 20%, ${typeColor}, transparent 60%)`,
            }}
          />

          {/* Pokéball decoration */}
          <div
            className="absolute -right-6 -top-6 h-20 w-20 rounded-full border-4 opacity-5"
            style={{ borderColor: typeColor }}
          />

          {/* Shiny toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setLocalShiny((v) => !v);
            }}
            className={cn(
              "absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all",
              isShiny
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", isShiny && "fill-current")} />
          </button>

          {/* Dex number */}
          <div className="absolute left-3 top-3 text-xs font-mono text-muted-foreground/60">
            {formatDexNumber(pokemon.dexNumber)}
          </div>

          {/* Pokemon Image */}
          <div className="relative flex items-center justify-center h-32 pt-4">
            {!imgError ? (
              <Image
                src={imageUrl}
                alt={pokemon.nameEn}
                width={96}
                height={96}
                className={cn(
                  "object-contain transition-all duration-300 group-hover:scale-110",
                  isShiny && "drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                )}
                onError={() => setImgError(true)}
                priority={index < 12}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-2xl">
                ?
              </div>
            )}
          </div>

          {/* Info */}
          <div className="relative p-3 pt-1">
            <h3 className="font-bold text-sm leading-tight">
              {pokemon.nameTh ?? pokemon.nameEn}
            </h3>
            {pokemon.nameTh && (
              <p className="text-xs text-muted-foreground">{pokemon.nameEn}</p>
            )}

            <TypeBadgeList types={pokemon.types} size="xs" className="mt-1.5" />

            {showStats && (
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                <div className="text-center">
                  <div className="text-muted-foreground">HP</div>
                  <div className="font-bold">{pokemon.stats.hp}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">ATK</div>
                  <div className="font-bold">{pokemon.stats.attack}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">SPE</div>
                  <div className="font-bold">{pokemon.stats.speed}</div>
                </div>
              </div>
            )}

            {!showStats && (
              <div className="mt-1.5 text-xs text-muted-foreground">
                BST: <span className="font-bold text-foreground">{pokemon.stats.total}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
