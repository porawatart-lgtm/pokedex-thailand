import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import type { PokemonTypeName, SpecialFormType } from "@/types/pokemon";

export const runtime = "nodejs";
export const revalidate = 3600;

// ─── Form category meta ──────────────────────────────────────────────────────

const FORM_CATEGORY: Record<string, SpecialFormType> = {
  "mega":   "mega",
  "mega-x": "mega-x",
  "mega-y": "mega-y",
  "primal": "mega",       // treat primal as mega-like
  "gmax":   "gigantamax",
  "alola":  "alolan",
  "galar":  "galarian",
  "hisui":  "hisuian",
  "paldea": "paldean",
};

const FORM_NAME_TH: Record<string, string> = {
  "mega":   "เมก้า",
  "mega-x": "เมก้า X",
  "mega-y": "เมก้า Y",
  "primal": "ไพรมอล",
  "gmax":   "กิกะแมกซ์",
  "alola":  "อาโลล่า",
  "galar":  "กาล่า",
  "hisui":  "ชิซุย",
  "paldea": "ปัลเดียน",
};

const FORM_METHOD_TH: Record<string, string> = {
  "mega":   "ใช้ Mega Stone ในสนามรบ",
  "mega-x": "ใช้ Mega Stone X ในสนามรบ",
  "mega-y": "ใช้ Mega Stone Y ในสนามรบ",
  "primal": "ใช้ Blue/Red Orb ในสนามรบ",
  "gmax":   "Dynamax ในสนามรบที่รองรับ Gigantamax",
  "alola":  "ร่างประจำภูมิภาค Alola",
  "galar":  "ร่างประจำภูมิภาค Galar",
  "hisui":  "ร่างประจำภูมิภาค Hisui",
  "paldea": "ร่างประจำภูมิภาค Paldea",
};

// ─── Sprite JSON shape ───────────────────────────────────────────────────────

interface FormSpritesJson {
  officialArtwork:      string | null;
  officialArtworkShiny: string | null;
  frontDefault:         string | null;
  types:                string[];
  stats: {
    hp: number; attack: number; defense: number;
    specialAttack: number; specialDefense: number; speed: number; total: number;
  };
}

// ─── Response type ────────────────────────────────────────────────────────────

export interface FormItem {
  id:           number;
  pokemonId:    number;
  baseSlug:     string;
  baseNameEn:   string;
  baseNameTh:   string | null;
  baseDexNumber:number;
  formKey:      string;              // "mega" | "mega-x" | "alola" …
  formCategory: SpecialFormType;
  formNameEn:   string;              // "Mega Charizard X"
  formNameTh:   string;              // "เมก้า ชาริซาร์ด X"
  method:       string;
  isMega:       boolean;
  isGmax:       boolean;
  isBattleOnly: boolean;
  artwork:      string | null;
  artworkShiny: string | null;
  sprite:       string | null;
  types:        PokemonTypeName[];
  stats: {
    hp: number; attack: number; defense: number;
    specialAttack: number; specialDefense: number; speed: number; total: number;
  };
  flavorText:   string | null;
  generation:   number;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const q        = (searchParams.get("q") ?? "").trim().toLowerCase();
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "60"), 200);
  const offset   = (page - 1) * limit;

  try {
    // Build where for PokemonForm
    const where: Record<string, unknown> = {};
    if (category !== "all") {
      // "mega" tab includes mega, mega-x, mega-y, primal
      const megaForms = ["mega", "mega-x", "mega-y", "primal"];
      const formNames =
        category === "mega"
          ? megaForms
          : Object.entries(FORM_CATEGORY)
              .filter(([, cat]) => cat === category)
              .map(([k]) => k);
      if (formNames.length) where.formName = { in: formNames };
    }

    const allForms = await db.pokemonForm.findMany({
      where,
      include: {
        pokemon: {
          select: {
            id:        true,
            slug:      true,
            nameEn:    true,
            nameTh:    true,
            dexNumber: true,
            generation:true,
            flavorTexts: {
              where:   { language: "en" },
              orderBy: { id: "desc" },
              take:    1,
              select:  { flavorText: true },
            },
          },
        },
      },
      orderBy: [{ pokemon: { dexNumber: "asc" } }, { formName: "asc" }],
    });

    // Filter by search query
    let filtered = allForms;
    if (q) {
      filtered = allForms.filter((f) => {
        const base = f.pokemon;
        return (
          base.nameEn.toLowerCase().includes(q) ||
          (base.nameTh?.toLowerCase().includes(q) ?? false) ||
          f.formName.includes(q)
        );
      });
    }

    const total = filtered.length;
    const page_items = filtered.slice(offset, offset + limit);

    const data: FormItem[] = page_items
      .filter((f) => FORM_CATEGORY[f.formName])
      .map((f) => {
        const spr = (f.sprites ?? {}) as Partial<FormSpritesJson>;
        const stats = spr.stats ?? { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, total: 0 };
        const types = (spr.types ?? []) as PokemonTypeName[];
        const base  = f.pokemon;

        const formKey = f.formName;
        const cat     = FORM_CATEGORY[formKey] ?? "other";
        const thLabel = FORM_NAME_TH[formKey] ?? formKey;
        const method  = FORM_METHOD_TH[formKey] ?? "ร่างพิเศษ";

        const baseNameEn = base.nameEn;
        const formNameEn = formKey.startsWith("mega-")
          ? `Mega ${baseNameEn} ${formKey.slice(5).toUpperCase()}`
          : formKey === "primal"
          ? `Primal ${baseNameEn}`
          : formKey === "gmax"
          ? `Gigantamax ${baseNameEn}`
          : `${baseNameEn} (${thLabel})`;

        const baseDisplay = base.nameTh ?? base.nameEn;
        const formNameTh = formKey.startsWith("mega-")
          ? `เมก้า ${baseDisplay} ${formKey.slice(5).toUpperCase()}`
          : formKey === "primal"
          ? `ไพรมอล ${baseDisplay}`
          : formKey === "gmax"
          ? `กิกะแมกซ์ ${baseDisplay}`
          : `${baseDisplay} ฟอร์ม${thLabel}`;

        return {
          id:            f.id,
          pokemonId:     base.id,
          baseSlug:      base.slug,
          baseNameEn:    base.nameEn,
          baseNameTh:    base.nameTh,
          baseDexNumber: base.dexNumber,
          formKey,
          formCategory:  cat,
          formNameEn,
          formNameTh,
          method,
          isMega:       f.isMega,
          isGmax:       f.isGmax,
          isBattleOnly: f.isBattleOnly,
          artwork:      spr.officialArtwork ?? null,
          artworkShiny: spr.officialArtworkShiny ?? null,
          sprite:       spr.frontDefault ?? null,
          types,
          stats,
          flavorText:   base.flavorTexts[0]?.flavorText ?? null,
          generation:   base.generation,
        };
      });

    // Category counts across ALL forms (no pagination)
    const countRaw = await db.pokemonForm.groupBy({
      by: ["formName"],
      _count: { id: true },
      where: { formName: { in: Object.keys(FORM_CATEGORY) } },
    });

    const MEGA_FORMS = new Set(["mega", "mega-x", "mega-y", "primal"]);
    const categoryCounts: Record<string, number> = {};
    for (const row of countRaw) {
      const cat = MEGA_FORMS.has(row.formName) ? "mega" : (FORM_CATEGORY[row.formName] ?? null);
      if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + row._count.id;
    }

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext:    offset + limit < total,
        hasPrev:    page > 1,
      },
      categoryCounts,
    });
  } catch (err) {
    console.error("Forms API error:", err);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
