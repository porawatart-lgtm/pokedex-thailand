"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles, Zap, Globe, Sword } from "lucide-react";
import { TypeBadgeList } from "@/components/pokemon/type-badge";
import { cn } from "@/lib/utils";
import type { FormInfo, SpecialFormType, PokemonTypeName } from "@/types/pokemon";

// ─── Badge label + colour per form type ─────────────────────────────────────

const FORM_BADGE: Record<SpecialFormType, { label: string; labelTh: string; color: string }> = {
  "mega":       { label: "Mega",       labelTh: "เมก้า",       color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  "mega-x":     { label: "Mega X",     labelTh: "เมก้า X",     color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  "mega-y":     { label: "Mega Y",     labelTh: "เมก้า Y",     color: "bg-red-500/20 text-red-300 border-red-500/40" },
  "gigantamax": { label: "Gigantamax", labelTh: "กิกะแมกซ์",   color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  "alolan":     { label: "Alolan",     labelTh: "อาโลล่า",     color: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  "galarian":   { label: "Galarian",   labelTh: "กาล่า",       color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  "hisuian":    { label: "Hisuian",    labelTh: "ชิซุย",        color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  "paldean":    { label: "Paldean",    labelTh: "ปัลเดียน",    color: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  "shiny":      { label: "Shiny",      labelTh: "ชายนี่",      color: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40" },
  "other":      { label: "Form",       labelTh: "ร่างพิเศษ",   color: "bg-gray-500/20 text-gray-300 border-gray-500/40" },
};

function FormTypeIcon({ type }: { type: SpecialFormType }) {
  if (type === "mega" || type === "mega-x" || type === "mega-y")
    return <Zap className="h-3 w-3" />;
  if (type === "gigantamax") return <Sparkles className="h-3 w-3" />;
  if (type === "alolan" || type === "galarian" || type === "hisuian" || type === "paldean")
    return <Globe className="h-3 w-3" />;
  return <Sword className="h-3 w-3" />;
}

// ─── Shiny Toggle Button ─────────────────────────────────────────────────────

interface ShinyToggleProps {
  artworkUrl: string | null;
  artworkShinyUrl: string | null;
  name: string;
}

export function ShinyToggle({ artworkUrl, artworkShinyUrl, name }: ShinyToggleProps) {
  const [isShiny, setIsShiny] = useState(false);
  if (!artworkShinyUrl) return null;

  return (
    <button
      onClick={() => setIsShiny((v) => !v)}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
        isShiny
          ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
      title={isShiny ? "ดูร่างปกติ" : "ดูร่างชายนี่"}
    >
      <Sparkles className={cn("h-4 w-4", isShiny && "text-yellow-400")} />
      {isShiny ? "ร่างชายนี่ ✨" : "ดูชายนี่"}
    </button>
  );
}

// ─── Artwork with Shiny Switch ──────────────────────────────────────────────

interface PokemonArtworkProps {
  artworkUrl: string | null;
  artworkShinyUrl: string | null;
  name: string;
  size?: number;
}

export function PokemonArtworkSwitcher({
  artworkUrl, artworkShinyUrl, name, size = 280,
}: PokemonArtworkProps) {
  const [isShiny, setIsShiny] = useState(false);
  const src = isShiny && artworkShinyUrl ? artworkShinyUrl : artworkUrl;

  return (
    <div className="relative flex flex-col items-center gap-3">
      {src && (
        <Image
          src={src}
          alt={isShiny ? `${name} (Shiny)` : name}
          width={size}
          height={size}
          priority
          className="relative z-10 object-contain drop-shadow-2xl animate-float transition-opacity duration-300"
        />
      )}
      {artworkShinyUrl && (
        <button
          onClick={() => setIsShiny((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
            isShiny
              ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
              : "border-border bg-card/80 text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className={cn("h-3 w-3", isShiny && "text-yellow-400")} />
          {isShiny ? "ชายนี่ ✨" : "ดูชายนี่"}
        </button>
      )}
    </div>
  );
}

// ─── Form Card ────────────────────────────────────────────────────────────────

function FormCard({ form }: { form: FormInfo }) {
  const [isShiny, setIsShiny] = useState(false);
  const badge = FORM_BADGE[form.formType];
  const artSrc = isShiny && form.artworkShinyUrl ? form.artworkShinyUrl : form.artworkUrl;

  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-4 hover:border-primary/30 transition-all group">
      {/* Badge */}
      <div className="absolute top-3 left-3">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", badge.color)}>
          <FormTypeIcon type={form.formType} />
          {badge.labelTh}
        </span>
      </div>

      {/* Artwork */}
      <div className="flex justify-center pt-6 pb-2 relative">
        {artSrc ? (
          <Image
            src={artSrc}
            alt={form.formName}
            width={120}
            height={120}
            className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-[120px] h-[120px] flex items-center justify-center text-muted-foreground/30 text-4xl">
            ?
          </div>
        )}
        {form.artworkShinyUrl && (
          <button
            onClick={() => setIsShiny((v) => !v)}
            className={cn(
              "absolute bottom-0 right-0 rounded-full border p-1 text-[10px] transition-all",
              isShiny
                ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
                : "border-border bg-card text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
            title={isShiny ? "ปกติ" : "ชายนี่"}
          >
            <Sparkles className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-1.5">
        <p className="font-bold text-sm">{form.formNameTh}</p>
        <p className="text-xs text-muted-foreground">{form.formName}</p>
        <TypeBadgeList types={form.types as PokemonTypeName[]} size="xs" />
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{form.method}</p>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] border-t border-border mt-2">
          {[
            { k: "HP",  v: form.stats.hp },
            { k: "ATK", v: form.stats.attack },
            { k: "DEF", v: form.stats.defense },
            { k: "SPA", v: form.stats.specialAttack },
            { k: "SPD", v: form.stats.specialDefense },
            { k: "SPE", v: form.stats.speed },
          ].map(({ k, v }) => (
            <div key={k} className="text-center">
              <span className="text-muted-foreground">{k}</span>
              <br />
              <span className="font-bold tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <div className="text-xs font-bold text-primary pt-0.5">BST {form.stats.total}</div>
      </div>
    </div>
  );
}

// ─── Forms Section (exported) ────────────────────────────────────────────────

const FORM_ORDER: SpecialFormType[] = [
  "mega", "mega-x", "mega-y", "gigantamax",
  "alolan", "galarian", "hisuian", "paldean", "other",
];

interface PokemonFormsProps {
  forms: FormInfo[];
}

export function PokemonForms({ forms }: PokemonFormsProps) {
  const [activeFilter, setActiveFilter] = useState<SpecialFormType | "all">("all");
  if (forms.length === 0) return null;

  // Get present form types for filter tabs
  const presentTypes = [...new Set(forms.map((f) => f.formType))].sort(
    (a, b) => FORM_ORDER.indexOf(a) - FORM_ORDER.indexOf(b)
  );

  const filtered =
    activeFilter === "all"
      ? forms
      : forms.filter((f) => f.formType === activeFilter);

  return (
    <div>
      {/* Filter tabs */}
      {presentTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              activeFilter === "all"
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            ทั้งหมด ({forms.length})
          </button>
          {presentTypes.map((t) => {
            const badge = FORM_BADGE[t];
            return (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  activeFilter === t ? badge.color : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <FormTypeIcon type={t} />
                {badge.labelTh} ({forms.filter((f) => f.formType === t).length})
              </button>
            );
          })}
        </div>
      )}

      {/* Form cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((form) => (
          <FormCard key={form.slug} form={form} />
        ))}
      </div>
    </div>
  );
}
