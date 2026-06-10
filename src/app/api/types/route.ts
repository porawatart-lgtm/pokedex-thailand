import { NextResponse } from "next/server";
import { TYPE_CHART, TYPE_COLORS, TYPE_NAMES_TH, ALL_TYPES } from "@/lib/type-chart";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  const types = ALL_TYPES.map((type) => ({
    slug: type,
    nameEn: type.charAt(0).toUpperCase() + type.slice(1),
    nameTh: TYPE_NAMES_TH[type],
    color: TYPE_COLORS[type],
    effectiveness: TYPE_CHART[type],
  }));

  return NextResponse.json({ data: types });
}
